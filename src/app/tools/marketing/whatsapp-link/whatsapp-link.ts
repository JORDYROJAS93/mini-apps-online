import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-whatsapp-link',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './whatsapp-link.html',
  styleUrl: './whatsapp-link.css',
})
export class WhatsappLink implements OnInit {
  telefono: string = '';
  mensaje: string = '';
  enlaceGenerado: string = '';
  copiado: boolean = false; // Estado para manejar el feedback visual del botón

  constructor(private TitleService: Title, private metaService: Meta) { }

  ngOnInit() {
    this.TitleService.setTitle('Generador de Enlaces de WhatsApp - Mini Apps Online');
    this.metaService.updateTag({ name: 'description', content: 'Generador de Enlaces de WhatsApp - Mini Apps Online' });
  }

  generarLink() {
    // Quitamos los espacios antes y después
    const telefonoTrimmed = this.telefono.trim();

    if (telefonoTrimmed) {
      // Limpiamos de forma estricta cualquier símbolo indebido
      const numLimpiado = telefonoTrimmed.replace(/\D/g, '');
      
      if (numLimpiado) {
        const mensajeCodificado = encodeURIComponent(this.mensaje);
        this.enlaceGenerado = `https://wa.me/${numLimpiado}?text=${mensajeCodificado}`;
        return;
      }
    }
    
    this.enlaceGenerado = '';
  }

  limpiarCampo(campo: 'telefono' | 'mensaje') {
    if (campo === 'telefono') {
      this.telefono = '';
    } else {
      this.mensaje = '';
    }
    this.generarLink();
  }

  copiarEnlace() {
    if (!this.enlaceGenerado || this.copiado) return;

    navigator.clipboard.writeText(this.enlaceGenerado).then(() => {
      // Activamos el estado de copiado
      this.copiado = true;

      // Revierte el estado del botón tras 2.5 segundos de forma automática
      setTimeout(() => {
        this.copiado = false;
      }, 2500);
    }).catch(err => {
      console.error('Error al copiar el enlace:', err);
    });
  }
}