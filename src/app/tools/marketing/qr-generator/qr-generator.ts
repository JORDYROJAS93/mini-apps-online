import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-qr-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './qr-generator.html',
  styleUrl: './qr-generator.css',
})
export class QrGeneratorComponent {
  texto: string = '';
  qrImage: string = '';

  async generarQR() {
    if (this.texto) {
      try {
        this.qrImage = await QRCode.toDataURL(this.texto, {
          width: 300,
          margin: 2,
          color: { dark: '#2563eb' } // Azul para combinar con tu web
        });
      } catch (err) {
        console.error(err);
      }
    }
  }

  descargarQR() {
    const link = document.createElement('a');
    link.href = this.qrImage;
    link.download = 'mi-codigo-qr.png';
    link.click();
  }
}