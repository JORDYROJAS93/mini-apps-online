import { Injectable, signal, computed } from '@angular/core';
import { Document, Packer, Paragraph, TextRun, ImageRun } from 'docx';

export type ConversionState = 'idle' | 'processing' | 'success' | 'error';
export type ConversionErrorCode = 'invalid_format' | 'file_too_large' | 'conversion_failed' | 'no_content';

@Injectable({ providedIn: 'root' })
export class PdfToWordService {
  readonly state = signal<ConversionState>('idle');
  readonly error = signal<ConversionErrorCode | null>(null);
  readonly progress = signal(0);
  readonly fileName = signal('');

  readonly isProcessing = computed(() => this.state() === 'processing');
  readonly isSuccess = computed(() => this.state() === 'success');
  readonly hasError = computed(() => this.state() === 'error');
  
  readonly errorMessage = computed(() => {
    const code = this.error();
    if (!code) return '';
    const messages: Record<ConversionErrorCode, string> = {
      invalid_format: 'Solo se permiten archivos PDF.',
      file_too_large: 'El archivo supera el límite de 50MB.',
      conversion_failed: 'Error al procesar el PDF. Puede estar dañado o protegido.',
      no_content: 'El PDF no contiene texto extraíble.',
    };
    return messages[code];
  });

  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024;

  validateFile(file: File): ConversionErrorCode | null {
    if (!file.name.endsWith('.pdf')) return 'invalid_format';
    if (file.size > this.MAX_FILE_SIZE) return 'file_too_large';
    return null;
  }

  reset() {
    this.state.set('idle');
    this.error.set(null);
    this.progress.set(0);
    this.fileName.set('');
  }

  setError(code: ConversionErrorCode | null) {
    this.error.set(code);
    if (code) this.state.set('error');
  }

  async convertPdfToWord(file: File): Promise<void> {
    this.reset();
    this.fileName.set(file.name);
    this.state.set('processing');

    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.mjs';

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;

      const docChildren: any[] = [];

      for (let i = 1; i <= totalPages; i++) {
        this.progress.set(Math.round((i / totalPages) * 100));
        const page = await pdf.getPage(i);

        // --- CAPA 1: EXTRACCIÓN REAL DE IMÁGENES INCRUSTADAS ---
        try {
          const operatorList = await page.getOperatorList();
          
          // Buscamos los índices de los objetos gráficos mapeados en la hoja
          for (let j = 0; j < operatorList.fnArray.length; j++) {
            if (operatorList.fnArray[j] === pdfjsLib.OPS.paintXObject) {
              const objName = operatorList.argsArray[j][0];
              
              // Envoltura en promesa para obligar a JavaScript a esperar la extracción del bitmap
              const imgBuffer = await new Promise<ArrayBuffer | null>((resolve) => {
                page.objs.get(objName, async (imgObj: any) => {
                  if (imgObj && imgObj.bitmap) {
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = imgObj.width;
                    tempCanvas.height = imgObj.height;
                    const tempCtx = tempCanvas.getContext('2d');
                    
                    if (tempCtx) {
                      tempCtx.putImageData(imgObj, 0, 0);
                      const imgUrl = tempCanvas.toDataURL('image/jpeg', 0.85);
                      const imgRes = await fetch(imgUrl);
                      const buffer = await imgRes.arrayBuffer();
                      tempCanvas.remove();
                      resolve(buffer);
                      return;
                    }
                  }
                  resolve(null);
                });
              });

              // Si la imagen existe y se procesó el buffer, se inserta en el Word
              if (imgBuffer) {
                docChildren.push(
                  new Paragraph({
                    children: [
                      new ImageRun({
                        data: imgBuffer,
                        type: "jpg",
                        transformation: {
                          width: 400,
                          height: 250
                        }
                      })
                    ],
                    spacing: { before: 200, after: 200 },
                    alignment: 'center'
                  })
                );
              }
            }
          }
        } catch (imgErr) {
          console.warn(`No se pudieron procesar elementos gráficos en pág ${i}:`, imgErr);
        }

        // --- CAPA 2: EXTRACCIÓN DE TEXTO FLUIDO Y EDITABLE ---
        const textContent = await page.getTextContent();
        let lastY = -1;
        let currentParagraphRuns: TextRun[] = [];

        for (const item of textContent.items as any[]) {
          if (!item.str || item.str.trim().length === 0) continue;

          const currentY = item.transform[5];
          const fontSize = Math.round(item.transform[0]);
          const fontName = (item.fontName || '').toLowerCase();
          
          const isBold = fontName.includes('bold') || fontName.includes('gothic') || fontSize > 12;
          const isItalic = fontName.includes('italic') || fontName.includes('oblique');

          // Si detectamos un cambio de línea vertical, cerramos el párrafo actual y creamos uno nuevo
          if (lastY !== -1 && Math.abs(currentY - lastY) > 12) {
            if (currentParagraphRuns.length > 0) {
              docChildren.push(
                new Paragraph({
                  children: currentParagraphRuns,
                  spacing: { after: 120 }
                })
              );
              currentParagraphRuns = [];
            }
          }

          currentParagraphRuns.push(
            new TextRun({
              text: item.str + (item.hasSpace ? ' ' : ''),
              size: Math.max(18, Math.min(fontSize * 2, 28)), // Escala adaptada para visualizadores de Word
              bold: isBold,
              italics: isItalic,
              font: 'Arial'
            })
          );

          lastY = currentY;
        }

        // Insertar el texto remanente del bucle
        if (currentParagraphRuns.length > 0) {
          docChildren.push(
            new Paragraph({
              children: currentParagraphRuns,
              spacing: { after: 200 }
            })
          );
        }
      }

      if (docChildren.length === 0) {
        this.setError('no_content');
        return;
      }

      // --- CAPA 3: EMPAQUETADO GENERAL DEL DOCUMENTO ---
      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
            }
          },
          children: docChildren
        }]
      });

      const wordOutputBlob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(wordOutputBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name.replace('.pdf', '.docx');
      link.click();
      URL.revokeObjectURL(url);

      this.state.set('success');
      this.progress.set(100);
    } catch (err) {
      console.error('Error crítico en conversión:', err);
      this.setError('conversion_failed');
    }
  }
}