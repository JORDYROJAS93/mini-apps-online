import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-whatsapp-link',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './whatsapp-link.html',
  styleUrl: './whatsapp-link.css',
})
export class WhatsappLink {
  telefono: string = '';
  mensaje: string = '';
  enlaceGenerado: string = '';

  generarLink() {
    if (this.telefono) {
      // Limpiamos el número de espacios, guiones o símbolos +
      const numLimpiado = this.telefono.replace(/\D/g, '');
      const mensajeCodificado = encodeURIComponent(this.mensaje);
      this.enlaceGenerado = `https://wa.me/${numLimpiado}?text=${mensajeCodificado}`;
    } else {
      this.enlaceGenerado = '';
    }
  }

  copiarEnlace() {
    if (this.enlaceGenerado) {
      navigator.clipboard.writeText(this.enlaceGenerado);
      alert('¡Enlace copiado al portapapeles!');
    }
  }
}