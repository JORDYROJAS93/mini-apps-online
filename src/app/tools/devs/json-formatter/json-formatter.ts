import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-json-formatter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './json-formatter.html',
  styleUrl: './json-formatter.css',
})
export class JsonFormatterComponent {
  jsonInput: string = '';
  jsonOutput: string = '';
  errorMensaje: string | null = null;
  esValido: boolean | null = null;
  copiado: boolean = false;

  procesarJson(identacion: number = 2) {
    this.errorMensaje = null;
    this.copiado = false;

    if (!this.jsonInput.trim()) {
      this.jsonOutput = '';
      this.esValido = null;
      return;
    }

    try {
      // Intentar parsear el string de entrada
      const objetoParseado = JSON.parse(this.jsonInput);
      
      // Si es exitoso, formatear con la indentación elegida (2 o 4 espacios)
      this.jsonOutput = JSON.stringify(objetoParseado, null, identacion);
      this.esValido = true;
    } catch (error: any) {
      this.esValido = false;
      this.jsonOutput = '';
      // Capturar el mensaje de error nativo del navegador
      this.errorMensaje = error.message;
    }
  }

  minificarJson() {
    this.errorMensaje = null;
    this.copiado = false;

    if (!this.jsonInput.trim()) return;

    try {
      const objetoParseado = JSON.parse(this.jsonInput);
      // Espaciado cero para remover saltos de línea y espacios innecesarios
      this.jsonOutput = JSON.stringify(objetoParseado);
      this.esValido = true;
    } catch (error: any) {
      this.esValido = false;
      this.jsonOutput = '';
      this.errorMensaje = error.message;
    }
  }

  copiarAlPortapapeles() {
    if (!this.jsonOutput) return;
    
    navigator.clipboard.writeText(this.jsonOutput).then(() => {
      this.copiado = true;
      setTimeout(() => this.copiado = false, 2000);
    });
  }

  limpiar() {
    this.jsonInput = '';
    this.jsonOutput = '';
    this.esValido = null;
    this.errorMensaje = null;
    this.copiado = false;
  }
}
