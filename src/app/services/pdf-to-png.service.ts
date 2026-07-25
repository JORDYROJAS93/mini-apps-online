import { Injectable, signal, computed, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ConversionState = 'idle' | 'processing' | 'success' | 'error';
export type ConversionErrorCode = 'invalid_format' | 'file_too_large' | 'conversion_failed' | 'no_pages';

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
export class PdfToPngService {
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
    conversion_failed: 'No pudimos procesar el PDF. Verifica que no esté corrupto.',
    no_pages: 'El PDF no contiene páginas válidas.',
  };

  private pdfjsEngine: any = null;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.initPdfEngine();
    }
  }

  private async initPdfEngine(): Promise<boolean> {
    if (this.pdfjsEngine) return true;
    try {
      const pdfjsLib = await import('pdfjs-dist');
      
      // CORREGIDO: Apuntamos directo al archivo físico local
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.mjs';

      this.pdfjsEngine = pdfjsLib;
      return true;
    } catch (e) {
      console.error('Error inicializando motor PDF.js local:', e);
      return false;
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

  async convertPdfToPng(file: File, quality: number = 1.5): Promise<void> {
    if (!this.isBrowser) return;

    this.reset();
    this.fileName.set(file.name);
    this.state.set('processing');

    const engineReady = await this.initPdfEngine();
    if (!engineReady || !this.pdfjsEngine) {
      this.setError('conversion_failed');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
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

        if (!context) throw new Error('No canvas context');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvas: canvas,
          viewport: viewport,
        }).promise;

        const dataUrl = canvas.toDataURL('image/png');

        images.push({
          pageNumber: pageNum,
          dataUrl,
          width: canvas.width,
          height: canvas.height,
        });

        canvas.remove();
      }

      this.result.set({
        originalName: file.name.replace('.pdf', ''),
        images,
        totalPages,
        timestamp: Date.now(),
      });

      this.state.set('success');
      this.progress.set(100);
    } catch (error) {
      console.error('PDF to PNG error:', error);
      this.setError('conversion_failed');
    }
  }
}