import { Component, OnInit, OnDestroy, ViewChild, ElementRef, effect, signal, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WordPdfService, ConversionState, ConversionResult } from '../../../../services/word-pdf.service';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-word-to-pdf',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './word-to-pdf.html',
  styleUrls: ['./word-to-pdf.css']
})
export class WordToPdfComponent implements OnInit, AfterViewInit, OnDestroy {
  
  @ViewChild('fileDropZone') dropZoneRef!: ElementRef;
  readonly isDragging = signal(false);
  
  private mammothEngine: any = null;
  private html2pdfEngine: any = null;
  private isBrowser: boolean; // Flag de seguridad para SSR

  constructor(
    private titleService: Title,
    private metaService: Meta,
    public readonly converterService: WordPdfService,
    @Inject(PLATFORM_ID) private platformId: Object // Inyección para detectar entorno
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    effect((onCleanup) => {
      if (this.converterService.isSuccess()) {
        const timeoutId = setTimeout(() => {
          document.querySelector('.success-box-layout')?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
        
        onCleanup(() => clearTimeout(timeoutId));
      }
    });
  }

  ngOnInit() {
    // Solo cargamos librerías si estamos en el navegador
    if (this.isBrowser) {
      this.loadConversionLibraries();
    }
    // SEO: Configuramos título y meta descripción
    this.titleService.setTitle('Convertidor de Word a PDF - Mini Apps Online');
    this.metaService.updateTag({ name: 'description', content: 'Convierte tus archivos de Word a PDF de forma rápida y sencilla. ¡Prueba nuestro convertidor en línea ahora!' });
  }

  // CORRECCIÓN CLAVE 2: Mover Drag&Drop aquí para asegurar que @ViewChild ya exista en el DOM
  ngAfterViewInit() {
    if (this.isBrowser) {
      this.setupDragAndDrop();
    }
  }

  openFilePicker(): void {
    if (!this.isBrowser) return;
    const input = document.getElementById('pdfFileInput') as HTMLInputElement | null;
    input?.click();
  }

  // CORRECCIÓN CLAVE 1: Proteger el destructor para que Node.js no busque "window"
  ngOnDestroy() {
    if (this.isBrowser) {
      window.removeEventListener('dragover', this.preventDragDefaults);
      window.removeEventListener('drop', this.preventDragDefaults);
    }
  }

  private async loadConversionLibraries() {
    try {
      const [mammothMod, html2pdfMod] = await Promise.all([
        import('mammoth'),
        import('html2pdf.js')
      ]);
      
      this.mammothEngine = mammothMod.default || mammothMod;
      this.html2pdfEngine = html2pdfMod.default || html2pdfMod;
    } catch (error) {
      console.error('Error loading libraries:', error);
      this.converterService.setError('libraries_not_loaded');
    }
  }

  private setupDragAndDrop() {
    if (!this.isBrowser) return;

    window.addEventListener('dragover', this.preventDragDefaults);
    window.addEventListener('drop', this.preventDragDefaults);

    const zone = this.dropZoneRef?.nativeElement;
    if (!zone) return;

    zone.addEventListener('dragenter', (e: DragEvent) => {
      this.preventDragDefaults(e);
      this.isDragging.set(true);
    });
    
    zone.addEventListener('dragleave', (e: DragEvent) => {
      this.preventDragDefaults(e);
      if (e.target === zone) this.isDragging.set(false);
    });
    
    zone.addEventListener('dragover', this.preventDragDefaults);
    
    zone.addEventListener('drop', (e: DragEvent) => {
      this.preventDragDefaults(e);
      this.isDragging.set(false);
      const file = e.dataTransfer?.files[0];
      if (file) this.handleFileSelection(file);
    });
  }

  private preventDragDefaults = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  onFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.handleFileSelection(file);
    input.value = ''; 
  }

  handleFileSelection(file: File) {
    const errorCode = this.converterService.validateFile(file);
    if (errorCode) {
      this.converterService.setError(errorCode);
      return;
    }

    this.converterService.reset();
    this.converterService.fileName.set(file.name);
    this.converterService.state.set('processing');

    const reader = new FileReader();
    reader.onload = (e) => this.convertWordToPdf(e.target?.result as ArrayBuffer, file.name);
    reader.onerror = () => {
      this.converterService.setError('conversion_failed');
    };
    reader.readAsArrayBuffer(file);
  }

  private async convertWordToPdf(arrayBuffer: ArrayBuffer, originalName: string) {
    if (!this.mammothEngine || !this.html2pdfEngine) {
      this.converterService.setError('libraries_not_loaded');
      return;
    }

    try {
  this.converterService.progress.set(25);
  const { value: htmlContent } = await this.mammothEngine.convertToHtml({ arrayBuffer });
  
  this.converterService.progress.set(50);
  const cleanHtml = this.sanitizeHtmlForPdf(htmlContent);
  
  // 🔽 AÑADE ESTAS LÍNEAS AQUÍ: Inyectamos el HTML directo en tu contenedor físico oculto
  const contenedorHtml = document.querySelector('.documento-word-renderizado');
  if (contenedorHtml) {
    contenedorHtml.innerHTML = cleanHtml;
  }

  this.converterService.progress.set(75);
  // Pasamos la ejecución al generador
  await this.generateAndDownloadPdf(originalName); 
  
  this.converterService.progress.set(100);
  this.converterService.result.set({
    originalName,
    pdfName: this.converterService.formatFileName(originalName),
    size: arrayBuffer.byteLength,
    timestamp: Date.now()
  });
  this.converterService.state.set('success');
  
} catch (error) {
      console.error('Conversion error:', error);
      this.converterService.setError('conversion_failed');
    } finally {
      setTimeout(() => {
        if (this.converterService.progress() === 100 && this.converterService.state() !== 'success') {
          this.converterService.progress.set(0);
        }
      }, 500);
    }
  }

  // CORRECCIÓN CLAVE 3: Retornamos solo el innerHTML limpio, no el outerHTML deformado
  private sanitizeHtmlForPdf(html: string): string {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    temp.querySelectorAll('*').forEach(el => {
      const element = el as HTMLElement;
      const essentialStyles = ['font-weight', 'font-style', 'text-decoration'];
      Array.from(element.style).forEach(prop => {
        if (!essentialStyles.includes(prop)) {
          element.style.removeProperty(prop);
        }
      });
      if (element.tagName === 'IMG') {
  element.setAttribute('style', 'max-width:100%;height:auto;display:block;margin:1rem auto;');
  // Le añadimos una clase de control si fuera necesario, o lo dejamos limpio para el CSS global
}
    });
    
    return temp.innerHTML;
  }

  private generateAndDownloadPdf(fileName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const pdfEjecutable = this.resolvePdfEngine();
    if (!pdfEjecutable) {
      reject(new Error('PDF engine not available'));
      return;
    }

    // Capturamos el elemento real que ya tiene el HTML incrustado y tus estilos CSS aplicados
    const renderElement = document.querySelector('.documento-word-renderizado') as HTMLElement;
    
    if (!renderElement || !renderElement.innerHTML) {
      reject(new Error('Render element content is empty'));
      return;
    }

    // Dentro de generateAndDownloadPdf()...
const options = {
  margin: [15, 15, 15, 15] as [number, number, number, number],
  filename: this.converterService.formatFileName(fileName),
  image: { type: 'jpeg', quality: 0.98 } as const,
  html2canvas: { 
    scale: 2, 
    useCORS: true, 
    logging: false,
    letterRendering: true,
    scrollY: 0
  },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
  // 🔽 CONFIGURACIÓN ÓPTIMA: Usa 'avoid-all' para buscar automáticamente elementos grandes como imágenes
  pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
};

    // Ejecutamos html2pdf directamente sobre el contenedor del DOM
    pdfEjecutable()
      .from(renderElement)
      .set(options)
      .save()
      .then(() => {
        // Al terminar con éxito, vaciamos el contenedor para la próxima conversión
        renderElement.innerHTML = '';
        resolve();
      })
      .catch((error: any) => {
        // Si falla, también vaciamos por seguridad
        renderElement.innerHTML = '';
        reject(error);
      });
  });
}

  private resolvePdfEngine(): any {
    if (typeof this.html2pdfEngine === 'function') return this.html2pdfEngine;
    if (this.html2pdfEngine?.default && typeof this.html2pdfEngine.default === 'function') {
      return this.html2pdfEngine.default;
    }
    return (window as any).html2pdf;
  }

  resetConverter() {
    this.converterService.reset();
    setTimeout(() => {
      this.dropZoneRef?.nativeElement?.focus();
    }, 100);
  }

  get state(): ConversionState { return this.converterService.state(); }
  get progress(): number { return this.converterService.progress(); }
  get fileName(): string { return this.converterService.fileName(); }
  get result(): ConversionResult | null { return this.converterService.result(); }
}