import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-code-minimizer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './code-minimizer.html',
  styleUrl: './code-minimizer.css',
})
export class CodeMinimizerComponent {
  codigoInput: string = '';
  codigoOutput: string = '';
  tipoCodigo: 'css' | 'js' = 'css';
  stats = {
    originalSize: 0,
    minifiedSize: 0,
    ahorro: 0
  };
  copiado: boolean = false;

  procesarCodigo() {
    this.copiado = false;
    if (!this.codigoInput.trim()) {
      this.codigoOutput = '';
      this.resetStats();
      return;
    }

    let minificado = this.codigoInput;

    if (this.tipoCodigo === 'css') {
      minificado = this.minificarCSS(minificado);
    } else {
      minificado = this.minificarJS(minificado);
    }

    this.codigoOutput = minificado;
    this.calcularEstadisticas();
  }

  private minificarCSS(css: string): string {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Eliminar comentarios
      .replace(/\s+([{}繊,;:>+~=^$*|(臨])/g, '$1') // Eliminar espacios antes de caracteres clave
      .replace(/([{}繊,;:>+~=^$*|(臨])\s+/g, '$1') // Eliminar espacios después de caracteres clave
      .replace(/\s+/g, ' ') // Colapsar múltiples espacios
      .trim();
  }

  private minificarJS(js: string): string {
    return js
      .replace(/\/\*[\s\S]*?\*\//g, '') // Eliminar comentarios multi-línea
      .replace(/\/\/.*/g, '') // Eliminar comentarios de una sola línea
      .replace(/\s+/g, ' ') // Colapsar espacios y saltos de línea
      .replace(/\s*([=+\-*/%&|^!<>?:;.,{}()\[\]])\s*/g, '$1') // Eliminar espacios alrededor de operadores
      .trim();
  }

  calcularEstadisticas() {
    const orig = new Blob([this.codigoInput]).size;
    const min = new Blob([this.codigoOutput]).size;
    
    this.stats.originalSize = orig;
    this.stats.minifiedSize = min;
    this.stats.ahorro = orig > 0 ? Math.round(((orig - min) / orig) * 100) : 0;
  }

  cambiarTipo(tipo: 'css' | 'js') {
    this.tipoCodigo = tipo;
    this.procesarCodigo();
  }

  copiarAlPortapapeles() {
    if (!this.codigoOutput) return;
    navigator.clipboard.writeText(this.codigoOutput).then(() => {
      this.copiado = true;
      setTimeout(() => this.copiado = false, 2000);
    });
  }

  resetStats() {
    this.stats = { originalSize: 0, minifiedSize: 0, ahorro: 0 };
  }

  limpiar() {
    this.codigoInput = '';
    this.codigoOutput = '';
    this.copiado = false;
    this.resetStats();
  }
}
