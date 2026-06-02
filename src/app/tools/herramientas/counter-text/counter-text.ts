import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-counter-text',
  imports: [CommonModule, FormsModule],
  templateUrl: './counter-text.html',
  styleUrl: './counter-text.css',
})
export class CounterTextComponent implements OnInit {



  texto: string = '';

  constructor(
    private TitleService: Title,
    private metaService: Meta,
  ) {}

  ngOnInit() {
    this.TitleService.setTitle('Contador de Texto - Mini Apps Online');
    this.metaService.updateTag({ name: 'description', content: 'Contador de Texto - Mini Apps Online' });
  }

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
