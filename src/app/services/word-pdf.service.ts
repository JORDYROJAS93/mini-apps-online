import { Injectable, signal, computed } from '@angular/core';

// ✅ 1. TIPOS EXPORTADOS (sin null en el union de keys)
export type ConversionState = 'idle' | 'selecting' | 'processing' | 'converting' | 'success' | 'error';

// ✅ Código de error válido (para usar como key de objeto)
export type ConversionErrorCode = 
  | 'invalid_format' 
  | 'file_too_large' 
  | 'conversion_failed' 
  | 'libraries_not_loaded';

// ✅ El signal puede ser null O un código válido
export type ConversionErrorValue = ConversionErrorCode | null;

export interface ConversionResult {
  originalName: string;
  pdfName: string;
  size: number;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class WordPdfService {
  // ===== ESTADO CON SIGNALS =====
  readonly state = signal<ConversionState>('idle');
  readonly error = signal<ConversionErrorValue>(null);
  readonly progress = signal(0);
  readonly result = signal<ConversionResult | null>(null);
  readonly fileName = signal('');
  
  // ===== COMPUTED SELECTORS (exportados para el componente) =====
  readonly isProcessing = computed(() => 
    ['processing', 'converting'].includes(this.state())
  );
  
  readonly isSuccess = computed(() => this.state() === 'success');
  
  readonly hasError = computed(() => this.state() === 'error');
  
  // ✅ 2. ERROR MESSAGE COMO COMPUTED (no como método)
  readonly errorMessage = computed(() => {
    const code = this.error();
    if (!code) return '';
    return this.ERROR_MESSAGES[code];
  });

  // ===== CONFIGURACIÓN PRIVADA =====
  private readonly MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
  private readonly ALLOWED_EXTENSION = '.docx';

  // ✅ 3. RECORD SOLO CON KEYS VÁLIDAS (sin null)
  private readonly ERROR_MESSAGES: Record<ConversionErrorCode, string> = {
    invalid_format: 'Solo se permiten archivos Word (.docx). Por favor, selecciona otro archivo.',
    file_too_large: 'El archivo supera el límite de 15MB. Intenta con un documento más pequeño.',
    conversion_failed: 'No pudimos procesar el documento. Verifica que no esté protegido o corrupto.',
    libraries_not_loaded: 'Las herramientas de conversión aún se están preparando. Intenta en unos segundos.'
  };

  // ===== MÉTODOS PÚBLICOS =====
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

  // Setter seguro para errores
  setError(code: ConversionErrorCode | null) {
    this.error.set(code);
    if (code) {
      this.state.set('error');
    }
  }
}