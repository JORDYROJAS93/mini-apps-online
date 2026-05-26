import { Component, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuillModule, QuillModules } from 'ngx-quill';
import * as mammoth from 'mammoth';

@Component({
  selector: 'app-word-a-html',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule],
  templateUrl: './word-a-html.html',
  styleUrls: ['./word-a-html.css']
})
export class WordAHtmlComponent {
  // VARIABLE 1: Solo para el Editor Visual
  visualContent: string = '';
  
  // VARIABLE 2: Solo para el Editor de Código
  codeContent: string = '';

  isLoading: boolean = false;
  wordCount: number = 0;
  charCount: number = 0;
  
  quillEditorRef: any;

  constructor(private cdr: ChangeDetectorRef) {}

  editorModules: QuillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image', 'video'],
      ['clean']
    ]
  };

  @ViewChild('fileInput') fileInput!: ElementRef;

  onEditorCreated(quill: any) {
    this.quillEditorRef = quill;
    this.updateStats();
  }

  // 1. Cuando escribes en el VISUAL (Quill)
  onContentChanged(event: any) {
    // Solo actuamos si el cambio viene del usuario ('user'), no del sistema ('api')
    if (event.source === 'user') {
      // Limpiamos el HTML y lo mandamos al editor de código
      this.codeContent = this.cleanHtml(event.html);
      this.updateStats();
    }
  }

  // 2. Cuando escribes en el CÓDIGO (Textarea)
  // Usamos (input) en el HTML, esto solo se dispara cuando TÚ escribes, no cuando se actualiza por código
  onCodeChange() {
    // Actualizamos la variable del visual
    this.visualContent = this.codeContent;
    
    // Forzamos a Quill a renderizar el nuevo HTML
    if (this.quillEditorRef) {
      this.quillEditorRef.clipboard.dangerouslyPasteHTML(this.codeContent);
    }
  }

  // Función para limpiar el código (quita &nbsp; y espacios raros)
  cleanHtml(html: string): string {
    if (!html) return '';
    return html
      .replace(/&nbsp;/g, ' ')       // Convierte &nbsp; a espacio normal
      .replace(/\s+/g, ' ')          // Múltiples espacios a uno solo
      .replace(/>\s+</g, '><')       // Quita espacios entre etiquetas
      .replace(/<p><\/p>/g, '')      // Quita párrafos vacíos
      .trim();
  }

    async onFileSelected(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  this.isLoading = true;
  // Forzar detección de cambios ANTES de empezar
  this.cdr.detectChanges();

  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    
    const clean = this.cleanHtml(result.value);
    this.codeContent = clean;
    this.visualContent = clean;
    this.updateStats();
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error al convertir');
  } finally {
    this.isLoading = false;
    // Forzar detección de cambios DESPUÉS de terminar
    this.cdr.detectChanges();
  }
}

  updateStats() {
    // Calculamos stats basados en el contenido limpio
    const text = this.codeContent.replace(/<[^>]*>/g, '');
    this.wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    this.charCount = text.length;
  }

  insertImage() {
    const url = prompt('Ingresa la URL DIRECTA de la imagen (debe terminar en .jpg o .png):');
    if (url && this.quillEditorRef) {
      const range = this.quillEditorRef.getSelection(true);
      const index = range ? range.index : this.quillEditorRef.getLength();
      
      this.quillEditorRef.insertEmbed(index, 'image', url, 'user');
      this.quillEditorRef.setSelection(index + 1, 'user');
      
      // Sincronizamos manualmente después de insertar
      setTimeout(() => {
        this.codeContent = this.cleanHtml(this.quillEditorRef.root.innerHTML);
        this.visualContent = this.codeContent; // Mantener sincronizados
        this.updateStats();
      }, 100);
    }
  }

  insertVideo() {
    const url = prompt('Ingresa la URL de YouTube:');
    if (url && this.quillEditorRef) {
      const videoId = this.extractYouTubeId(url);
      if (videoId) {
        const range = this.quillEditorRef.getSelection(true);
        const index = range ? range.index : this.quillEditorRef.getLength();
        
        const videoHtml = `
          <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 15px 0;">
            <iframe src="https://www.youtube.com/embed/${videoId}" 
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
                    allowfullscreen>
            </iframe>
          </div>`;
        
        this.quillEditorRef.clipboard.dangerouslyPasteHTML(index, videoHtml);
        setTimeout(() => {
          this.codeContent = this.cleanHtml(this.quillEditorRef.root.innerHTML);
          this.visualContent = this.codeContent;
          this.updateStats();
        }, 100);
      } else {
        alert('URL de YouTube no válida');
      }
    }
  }

  private extractYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  async copiarAlPortapapeles() {
    try {
      await navigator.clipboard.writeText(this.codeContent);
      this.showMessage('¡HTML copiado!');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = this.codeContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showMessage('¡HTML copiado!');
    }
  }

  limpiarEditor() {
    if (confirm('¿Limpiar todo?')) {
      this.visualContent = '';
      this.codeContent = '';
      this.wordCount = 0;
      this.charCount = 0;
      if (this.quillEditorRef) {
        this.quillEditorRef.setContents([], 'api');
      }
    }
  }

  descargarHTML() {
    const blob = new Blob([this.codeContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documento-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  private showMessage(message: string) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `position: fixed; bottom: 20px; right: 20px; background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; font-weight: 600; z-index: 9999;`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  getLineNumbersArray(): number[] {
    const lines = this.codeContent.split('\n').length || 1;
    return Array(Math.min(lines, 100)).fill(0);
  }
}