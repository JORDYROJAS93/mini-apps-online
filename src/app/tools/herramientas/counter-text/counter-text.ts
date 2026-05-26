import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-counter-text',
  imports: [CommonModule, FormsModule],
  templateUrl: './counter-text.html',
  styleUrl: './counter-text.css',
})
export class CounterTextComponent {

  texto: string = '';

  contarPalabras() {
    return this.texto ? this.texto.trim().split(/\s+/).length : 0;
  }

  contarLineas() {
    return this.texto ? this.texto.split(/\n/).filter(line => line.length > 0).length : 0;
  }

  leerTiempo() {
    const palabras = this.contarPalabras();
    return Math.ceil(palabras / 200); // Promedio de 200 palabras por minuto
  }
}
