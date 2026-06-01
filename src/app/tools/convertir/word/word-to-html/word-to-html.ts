import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-word-to-html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './word-to-html.html',
  styleUrls: ['./word-to-html.css']
})
export class WordToHtmlComponent implements OnInit {
  nombreArchivo: string = '';
  htmlResultado: string = '';
  cargando: boolean = false;
  errorMensaje: string = '';
  copiadoStatus: boolean = false;
  mammothEngine: any = null;
  esNavegador: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef // Nos ayuda a forzar el rediseño de la vista en Angular
  ) {
    this.esNavegador = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.esNavegador) {
      this.inicializarMammoth();
    }
  }

  // Importación dinámica local y segura para evitar problemas con SSR e internet
  async inicializarMammoth() {
    try {
      const mammothModule = await import('mammoth');
      // En el navegador, mammoth puede venir estructurado en .default o directo
      this.mammothEngine = mammothModule.default || mammothModule;
      console.log('Motor de conversión cargado localmente con éxito.');
    } catch (error) {
      console.error('Error cargando la librería Mammoth:', error);
      this.errorMensaje = 'No se pudo cargar el motor de conversión interno.';
    }
  }

  onFileChange(event: any) {
    if (!this.esNavegador) return;

    const archivo = event.target.files[0];
    if (!archivo) return;

    if (!archivo.name.endsWith('.docx')) {
      this.errorMensaje = 'Por favor, selecciona un archivo válido con extensión .docx';
      this.nombreArchivo = '';
      this.htmlResultado = '';
      return;
    }

    if (!this.mammothEngine) {
      this.errorMensaje = 'El motor de conversión se está preparando. Vuelve a subir el archivo en un instante.';
      return;
    }

    this.errorMensaje = '';
    this.nombreArchivo = archivo.name;
    this.cargando = true;
    this.htmlResultado = '';
    this.cdr.detectChanges(); // Le avisa a Angular que muestre el spinner de carga

    const reader = new FileReader();

    reader.onload = (e: any) => {
      const arrayBuffer = e.target.result;
      
      // Buscamos la función de conversión correcta dentro del módulo importado
      const convertidor = this.mammothEngine.convertToHtml || this.mammothEngine;

      convertidor({ arrayBuffer: arrayBuffer })
        .then((resultado: any) => {
          this.htmlResultado = resultado.value;
          this.cargando = false;
          this.cdr.detectChanges(); // Forzamos a Angular a pintar los resultados en pantalla
        })
        .catch((err: any) => {
          console.error(err);
          this.errorMensaje = 'Error al estructurar el HTML. Comprueba que el archivo no esté protegido.';
          this.cargando = false;
          this.cdr.detectChanges();
        });
    };

    reader.readAsArrayBuffer(archivo);
  }

  copiarAlPortapapeles() {
    if (!this.esNavegador || !this.htmlResultado) return;
    
    navigator.clipboard.writeText(this.htmlResultado).then(() => {
      this.copiadoStatus = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.copiadoStatus = false;
        this.cdr.detectChanges();
      }, 2000);
    });
  }

  limpiar() {
    this.nombreArchivo = '';
    this.htmlResultado = '';
    this.errorMensaje = '';
    this.cdr.detectChanges();
  }
}