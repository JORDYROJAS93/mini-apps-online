import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as QRCode from 'qrcode';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-qr-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './qr-generator.html',
  styleUrl: './qr-generator.css',
})
export class QrGeneratorComponent implements OnInit {
  texto: string = '';
  qrImage: string = '';

  constructor(private TitleService: Title, private metaService: Meta) { }

  ngOnInit() {
    this.TitleService.setTitle('Generador de Códigos QR - Mini Apps Online');
    this.metaService.updateTag({ name: 'description', content: 'Generador de Códigos QR - Mini Apps Online' });
  }

  async generarQR() {
    if (!this.texto.trim()) {
      this.qrImage = '';
      return;
    }

    try {
      // Se genera con alta definición y vuelve al azul de la marca (#2563eb)
      this.qrImage = await QRCode.toDataURL(this.texto, {
        width: 400,
        margin: 1,
        scale: 4,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#2563eb',   /* Azul Premium Original */
          light: '#ffffff'   /* Fondo Blanco Extrapuro */
        }
      });
    } catch (err) {
      console.error('Error al generar el código QR:', err);
    }
  }

  limpiarTexto() {
    this.texto = '';
    this.qrImage = '';
  }

  descargarQR() {
    if (!this.qrImage) return;
    
    const link = document.createElement('a');
    link.href = this.qrImage;
    link.download = `qr-miniapps-${Date.now()}.png`;
    link.click();
  }
}