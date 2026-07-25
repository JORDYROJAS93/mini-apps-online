import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// 1. Dejamos los códigos de error limpios (sin el null)
export type ConversionErrorCode = 'invalid_format' | 'file_too_large' | 'conversion_failed' | 'libraries_not_loaded';
export type ConversionState = 'idle' | 'selecting' | 'processing' | 'converting' | 'success' | 'error';

export interface ConversionResult {
  originalName: string;
  pdfName: string;
  size: number;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class WordPdfService {
  // 2. Aquí le decimos a la señal que puede ser un código de error O null
  readonly state = signal<ConversionState>('idle');
  readonly error = signal<ConversionErrorCode | null>(null);
  readonly progress = signal(0); // 0-100
  readonly result = signal<ConversionResult | null>(null);
  readonly fileName = signal('');
  
  readonly isProcessing = computed(() => ['processing', 'converting'].includes(this.state()));
  readonly isSuccess = computed(() => this.state() === 'success');
  readonly hasError = computed(() => this.state() === 'error');
  readonly errorMessage = computed(() => this.getErrorMessage());

  private readonly MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
  private readonly ALLOWED_EXTENSION = '.docx';

  validateFile(file: File): ConversionErrorCode | null {
    if (!file.name.endsWith(this.ALLOWED_EXTENSION)) return 'invalid_format';
    if (file.size > this.MAX_FILE_SIZE) return 'file_too_large';
    return null;
  }

  formatFileName(name: string): string {
    return name.replace(this.ALLOWED_EXTENSION, '.pdf');
  }

  reset() {
    this.state.set('idle');
    this.error.set(null);
    this.progress.set(0);
    this.result.set(null);
    this.fileName.set('');
  }

  // CORREGIDO: Añadida la llave de cierre que faltaba aquí abajo
  setError(code: ConversionErrorCode | null) {
    this.error.set(code);
    if (code) {
      this.state.set('error');
    }
  } // 👈 ¡Esta es la llave que faltaba!

  // 3. Corregimos el mapeo de mensajes sin usar null como propiedad
  getErrorMessage(): string {
    const code = this.error();
    if (!code) return ''; // Si es null, devolvemos un string vacío de inmediato

    const messages: Record<ConversionErrorCode, string> = {
      invalid_format: 'Solo se permiten archivos Word (.docx). Por favor, selecciona otro archivo.',
      file_too_large: 'El archivo supera el límite de 15MB. Intenta con un documento más pequeño.',
      conversion_failed: 'No pudimos procesar el documento. Verifica que no esté protegido o corrupto.',
      libraries_not_loaded: 'Las herramientas de conversión aún se están preparando. Intenta en unos segundos.'
    };
    
    return messages[code];
  }
}