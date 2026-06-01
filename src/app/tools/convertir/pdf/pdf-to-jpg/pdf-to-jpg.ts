import { Component, OnInit, ViewChild, ElementRef, signal, effect, Inject, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

import JSZip from 'jszip';
import { PageImage, PdfToJpgService } from '../../../../services/pdf-to-jpg.service';

@Component({
  selector: 'app-pdf-to-jpg',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pdf-to-jpg.html',
  styleUrls: ['./pdf-to-jpg.css'],
  encapsulation: ViewEncapsulation.None
})
export class PdfToJpgComponent implements OnInit {
  @ViewChild('fileDropZone') dropZoneRef!: ElementRef;
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  
  readonly isDragging = signal(false);
  readonly quality = signal(1.5); // Escala de resolución
  readonly selectedImage = signal<PageImage | null>(null);
  readonly viewMode = signal<'grid' | 'preview'>('grid');
  // Guardamos si es navegador de forma local en el componente
  private isBrowser: boolean;

  constructor(
    public readonly converterService: PdfToJpgService,
    @Inject(PLATFORM_ID) private platformId: Object // 👈 Inyectamos el ID de la plataforma
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId); // 👈 Evaluamos si es el cliente

    effect(() => {
      if (this.converterService.isSuccess()) {
        setTimeout(() => {
          if (this.isBrowser) { // 👈 Protegemos también el scroll con efectos del DOM
            document.querySelector('.success-section')?.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }, 100);
      }
    });
  }

  ngOnInit() {
      if (this.isBrowser) 
    this.setupDragAndDrop();
  }

  private setupDragAndDrop() {
    const prevent = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    window.addEventListener('dragover', prevent);
    window.addEventListener('drop', prevent);

    const zone = this.dropZoneRef?.nativeElement;
    if (!zone) return;

    zone.addEventListener('dragenter', (e: DragEvent) => {
      prevent(e);
      this.isDragging.set(true);
    });

    zone.addEventListener('dragleave', (e: DragEvent) => {
      if (e.target === zone) this.isDragging.set(false);
    });

    zone.addEventListener('dragover', prevent);

    zone.addEventListener('drop', (e: DragEvent) => {
      prevent(e);
      this.isDragging.set(false);
      const file = e.dataTransfer?.files[0];
      if (file) this.handleFile(file);
    });
  }

  triggerFileInput(): void {
    this.fileInputRef?.nativeElement?.click();
  }

  onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.handleFile(file);
    input.value = '';
  }

  handleFile(file: File): void {
    const errorCode = this.converterService.validateFile(file);
    if (errorCode) {
      this.converterService.setError(errorCode);
      return;
    }
    this.converterService.convertPdfToJpg(file, this.quality());
  }

  downloadImage(image: PageImage, index: number): void {
    const link = document.createElement('a');
    link.href = image.dataUrl;
    link.download = `${this.converterService.result()?.originalName}_pagina_${index + 1}.jpg`;
    link.click();
  }

  async downloadAllAsZip(): Promise<void> {
    const result = this.converterService.result();
    if (!result) return;

    const zip = new JSZip();
    const folder = zip.folder(result.originalName);

    result.images.forEach((img, index) => {
      const base64Data = img.dataUrl.split(',')[1];
      folder?.file(`pagina_${index + 1}.jpg`, base64Data, { base64: true });
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `${result.originalName}.zip`;
    link.click();
  }

  downloadAllIndividual(): void {
    const result = this.converterService.result();
    if (!result) return;

    result.images.forEach((img, index) => {
      setTimeout(() => this.downloadImage(img, index), index * 200);
    });
  }

  resetConverter(): void {
    this.converterService.reset();
    this.selectedImage.set(null);
    setTimeout(() => {
      this.dropZoneRef?.nativeElement?.focus();
    }, 100);
  }

  // Getters para el template
  get state() { return this.converterService.state(); }
  get errorMessage() { return this.converterService.errorMessage(); }
  get progress() { return this.converterService.progress(); }
  get fileName() { return this.converterService.fileName(); }
  get result() { return this.converterService.result(); }
  get isProcessing() { return this.converterService.isProcessing(); }
  get currentPage() { return this.converterService.currentPage(); }
}