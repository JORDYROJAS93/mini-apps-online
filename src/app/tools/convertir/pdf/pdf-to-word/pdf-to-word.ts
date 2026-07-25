import { Component, OnInit, ViewChild, ElementRef, signal, effect, Inject, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { PdfToWordService } from '../../../../services/pdf-to-word.service';

@Component({
  selector: 'app-pdf-to-word',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pdf-to-word.html',
  styleUrls: ['./pdf-to-word.css'],
  encapsulation: ViewEncapsulation.None
})
export class PdfToWordComponent implements OnInit {
  @ViewChild('fileDropZone') dropZoneRef!: ElementRef;
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  
  readonly isDragging = signal(false);
  private isBrowser: boolean;

  constructor(
    private titleService: Title,
    private metaService: Meta,
    public readonly converterService: PdfToWordService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Ejecuta el scroll automático solo cuando se verifique el estado exitoso
    effect(() => {
      if (this.converterService.isSuccess()) {
        setTimeout(() => {
          if (this.isBrowser) {
            document.querySelector('.success-box')?.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }, 100);
      }
    });
  }

  ngOnInit(): void {
    this.titleService.setTitle('Convertidor de PDF a Word Gratis y Online - 100% Editable');
    this.metaService.updateTag({ 
      name: 'description', 
      content: 'Convierte tus archivos PDF a documentos Word editables (.docx) directamente en tu navegador. Gratis, privado, local y sin límites.' 
    });
    
    if (this.isBrowser) {
      this.setupDragAndDrop();
    }
  }

  private setupDragAndDrop() {
    const prevent = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    window.addEventListener('dragover', prevent);
    window.addEventListener('drop', prevent);

    const zone = this.dropZoneRef?.nativeElement;
    if (!zone) return;

    zone.addEventListener('dragenter', (e: DragEvent) => { prevent(e); this.isDragging.set(true); });
    zone.addEventListener('dragleave', (e: DragEvent) => { if (e.target === zone) this.isDragging.set(false); });
    zone.addEventListener('dragover', prevent);
    zone.addEventListener('drop', (e: DragEvent) => {
      prevent(e); this.isDragging.set(false);
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
    this.converterService.convertPdfToWord(file);
  }

  resetConverter(): void {
    this.converterService.reset();
    setTimeout(() => this.dropZoneRef?.nativeElement?.focus(), 100);
  }

  // Getters requeridos por el HTML original
  get state() { return this.converterService.state(); }
  get errorMessage() { return this.converterService.errorMessage(); }
  get progress() { return this.converterService.progress(); }
  get fileName() { return this.converterService.fileName(); }
  get isProcessing() { return this.converterService.isProcessing(); }
}