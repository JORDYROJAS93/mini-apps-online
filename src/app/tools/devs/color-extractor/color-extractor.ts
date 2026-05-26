import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-color-extractor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './color-extractor.html',
  styleUrl: './color-extractor.css',
})
export class ColorExtractorComponent {
  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  imageSrc: string | null = null;
  colorSeleccionadoHex: string = '#3b82f6';
  colorSeleccionadoRgb: string = 'rgb(59, 130, 246)';
  paletaSugerida: string[] = [];
  copiado: boolean = false;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imageSrc = e.target.result;
      this.inicializarCanvas();
    };
    reader.readAsDataURL(file);
  }

  inicializarCanvas() {
    setTimeout(() => {
      const img = new Image();
      img.src = this.imageSrc!;
      img.onload = () => {
        const canvas = this.canvasRef.nativeElement;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        this.generarPaletaAutomatica(ctx, canvas.width, canvas.height);
      };
    }, 100);
  }

  obtenerColorPixel(event: MouseEvent) {
    if (!this.imageSrc) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;

    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    
    this.actualizarColores(pixelData[0], pixelData[1], pixelData[2]);
  }

  // CAMBIO CLAVE: Ahora es público para que el HTML pueda usarlo sin errores
  actualizarColores(r: number, g: number, b: number) {
    this.colorSeleccionadoRgb = `rgb(${r}, ${g}, ${b})`;
    this.colorSeleccionadoHex = '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  // NUEVO MÉTODO: Permite hacer clic en la paleta y recuperar tanto el HEX como el RGB real
  seleccionarColorDePaleta(hex: string) {
    this.colorSeleccionadoHex = hex;
    
    // Convertimos el HEX (#RRGGBB) a canales enteros RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    this.colorSeleccionadoRgb = `rgb(${r}, ${g}, ${b})`;
  }

  generarPaletaAutomatica(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.paletaSugerida = [];
    const puntos = [0.2, 0.4, 0.5, 0.6, 0.8];
    
    puntos.forEach(p => {
      const x = width * p;
      const y = height * p;
      const data = ctx.getImageData(x, y, 1, 1).data;
      
      const hex = '#' + [data[0], data[1], data[2]].map(item => {
        const h = item.toString(16);
        return h.length === 1 ? '0' + h : h;
      }).join('');
      
      if (!this.paletaSugerida.includes(hex)) {
        this.paletaSugerida.push(hex);
      }
    });
  }

  copiarTexto(texto: string) {
    navigator.clipboard.writeText(texto).then(() => {
      this.copiado = true;
      setTimeout(() => this.copiado = false, 1500);
    });
  }
}