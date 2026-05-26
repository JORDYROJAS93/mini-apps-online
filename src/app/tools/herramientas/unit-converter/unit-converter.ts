import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';


interface UnidadesDiccionario {
  [key: string]: { [unidad: string]: number };
}

@Component({
  selector: 'app-unit-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './unit-converter.html',
  styleUrl: './unit-converter.css',
})
export class UnitConverterComponent {
  categorias = ['Longitud', 'Peso', 'Temperatura'];
  categoriaSeleccionada = 'Longitud';

  // Unidades disponibles por categoría
  unidadesPorCategoria: { [key: string]: string[] } = {
    Longitud: ['Metros (m)', 'Kilómetros (km)', 'Millas (mi)', 'Pies (ft)', 'Pulgadas (in)'],
    Peso: ['Kilogramos (kg)', 'Gramos (g)', 'Libras (lb)', 'Onzas (oz)'],
    Temperatura: ['Celsius (°C)', 'Fahrenheit (°F)', 'Kelvin (K)']
  };

  unidadOrigen = 'Metros (m)';
  unidadDestino = 'Kilómetros (km)';
  valorOrigen: number = 1;
  valorDestino: number = 0.001;

  // Factores de conversión usando una unidad base (m para longitud, kg para peso)
  factores: UnidadesDiccionario = {
    Longitud: {
      'Metros (m)': 1,
      'Kilómetros (km)': 1000,
      'Millas (mi)': 1609.34,
      'Pies (ft)': 0.3048,
      'Pulgadas (in)': 0.0254
    },
    Peso: {
      'Kilogramos (kg)': 1,
      'Gramos (g)': 0.001,
      'Libras (lb)': 0.453592,
      'Onzas (oz)': 0.0283495
    }
  };

  constructor() {
    this.convertir();
  }

  onCategoriaChange() {
    // Actualizar unidades por defecto al cambiar de categoría
    const lista = this.unidadesPorCategoria[this.categoriaSeleccionada];
    this.unidadOrigen = lista[0];
    this.unidadDestino = lista[1];
    this.convertir();
  }

  convertir() {
    if (this.valorOrigen === null || this.valorOrigen === undefined) {
      this.valorDestino = 0;
      return;
    }

    // Caso especial: Temperatura (no usa factores multiplicativos simples)
    if (this.categoriaSeleccionada === 'Temperatura') {
      this.valorDestino = this.convertirTemperatura(this.valorOrigen, this.unidadOrigen, this.unidadDestino);
      return;
    }

    // Caso general: Longitud y Peso usando la unidad base
    const enBase = this.valorOrigen * this.factores[this.categoriaSeleccionada][this.unidadOrigen];
    const resultado = enBase / this.factores[this.categoriaSeleccionada][this.unidadDestino];
    
    // Redondear a 6 decimales para evitar problemas de coma flotante en JS
    this.valorDestino = Math.round(resultado * 1000000) / 1000000;
  }

  private convertirTemperatura(valor: number, de: string, a: string): number {
    let celsius = 0;

    // Convertir origen a Celsius
    if (de.includes('°C')) celsius = valor;
    else if (de.includes('°F')) celsius = (valor - 32) * 5 / 9;
    else if (de.includes('K')) celsius = valor - 273.15;

    // Convertir Celsius a destino
    let resultado = 0;
    if (a.includes('°C')) resultado = celsius;
    else if (a.includes('°F')) resultado = (celsius * 9 / 5) + 32;
    else if (a.includes('K')) resultado = celsius + 273.15;

    return Math.round(resultado * 100) / 100;
  }
}
