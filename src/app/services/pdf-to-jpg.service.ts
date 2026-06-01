import { Injectable, signal, computed, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Mantenemos los tipos normales
export type ConversionState = 'idle' | 'processing' | 'success' | 'error';
export type ConversionErrorCode = 
  | 'invalid_format' 
  | 'file_too_large' 
  | 'conversion_failed' 
  | 'no_pages';

export interface PageImage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

export interface ConversionResult {
  originalName: string;
  images: PageImage[];
  totalPages: number;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class PdfToJpgService {
  readonly state = signal<ConversionState>('idle');
  readonly error = signal<ConversionErrorCode | null>(null);
  readonly progress = signal(0);
  readonly result = signal<ConversionResult | null>(null);
  readonly fileName = signal('');
  readonly currentPage = signal(0);
  
  readonly isProcessing = computed(() => this.state() === 'processing');
  readonly isSuccess = computed(() => this.state() === 'success');
  readonly hasError = computed(() => this.state() === 'error');
  
  readonly errorMessage = computed(() => {
    const code = this.error();
    if (!code) return '';
    return this.ERROR_MESSAGES[code];
  });

  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly ERROR_MESSAGES: Record<ConversionErrorCode, string> = {
    invalid_format: 'Solo se permiten archivos PDF. Por favor, selecciona otro archivo.',
    file_too_large: 'El archivo supera el límite de 50MB.',
    conversion_failed: 'No pudimos procesar el PDF. Verifica que no esté corrupto o protegido.',
    no_pages: 'El PDF no contiene páginas válidas.'
  };

  private pdfjsEngine: any = null;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    // Si estamos en el cliente, precargamos el motor para que esté listo de inmediato
    if (this.isBrowser) {
      this.initPdfEngine();
    }
  }

  // Carga e inyecta dinámicamente PDF.js burlando el SSR de Node
 private async initPdfEngine(): Promise<boolean> {
  if (this.pdfjsEngine) return true;
  try {
    const pdfjs = await import('pdfjs-dist');
    
    // 1. Cargamos el contenido del worker como un String crudo usando el prefijo ?raw de Vite
    // @ts-ignore
    const pdfjsWorkerContent = await import('pdfjs-dist/build/pdf.worker.mjs?raw');
    
    // 2. Creamos un Blob local en el navegador del usuario conteniendo el código del Worker
    const blob = new Blob([pdfjsWorkerContent.default], { type: 'text/javascript' });
    
    // 3. Generamos una URL en memoria de tu propio localhost
    pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
    
    this.pdfjsEngine = pdfjs;
    return true;
  } catch (e) {
    console.error('Error inicializando motor PDF.js de forma local:', e);
    
    // Fallback de emergencia si el compilador se pone estricto con el ?raw
    try {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = './assets/pdf.worker.min.mjs'; // O dejar que use el fake worker interno
      this.pdfjsEngine = pdfjs;
      return true;
    } catch (innerError) {
      return false;
    }
  }
}




  validateFile(file: File): ConversionErrorCode | null {
    if (!file.name.endsWith('.pdf')) return 'invalid_format';
    if (file.size > this.MAX_FILE_SIZE) return 'file_too_large';
    return null;
  }

  reset() {
    this.state.set('idle');
    this.error.set(null);
    this.progress.set(0);
    this.result.set(null);
    this.fileName.set('');
    this.currentPage.set(0);
  }

  setError(code: ConversionErrorCode | null) {
    this.error.set(code);
    if (code) this.state.set('error');
  }

  async convertPdfToJpg(file: File, quality: number = 1.5): Promise<void> {
    if (!this.isBrowser) return;

    this.reset();
    this.fileName.set(file.name);
    this.state.set('processing');

    // Asegurarnos de que el motor se cargue de forma segura antes de operar
    const engineReady = await this.initPdfEngine();
    if (!engineReady || !this.pdfjsEngine) {
      this.setError('conversion_failed');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      // 🔽 USAMOS LA INSTANCIA DINÁMICA: this.pdfjsEngine en lugar de pdfjsLib
      const pdf = await this.pdfjsEngine.getDocument({ data: arrayBuffer }).promise;
      
      const totalPages = pdf.numPages;
      if (totalPages === 0) {
        this.setError('no_pages');
        return;
      }

      const images: PageImage[] = [];

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        this.currentPage.set(pageNum);
        this.progress.set(Math.round((pageNum / totalPages) * 100));

        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: quality });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('No se pudo obtener el contexto del canvas');
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Fondo blanco (para PDFs con transparencia)
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // 🔽 TU RECIENTE CORRECCIÓN: 'canvas' en vez de 'canvasContext'
        await page.render({
          canvas: canvas,
          viewport: viewport
        }).promise;

        // Convertir canvas a JPG
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        
        images.push({
          pageNumber: pageNum,
          dataUrl,
          width: canvas.width,
          height: canvas.height
        });

        canvas.remove();
      }

      this.result.set({
        originalName: file.name.replace('.pdf', ''),
        images,
        totalPages,
        timestamp: Date.now()
      });

      this.state.set('success');
      this.progress.set(100);

    } catch (error) {
      console.error('PDF conversion error:', error);
      this.setError('conversion_failed');
    }
  }
}