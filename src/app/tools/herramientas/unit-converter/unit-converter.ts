import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';

interface UnidadesDiccionario {
  [key: string]: { [unidad: string]: number };
}

@Component({
  selector: 'app-unit-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './unit-converter.html',
  styleUrls: ['./unit-converter.css'], 
})
export class UnitConverterComponent  implements OnInit {
  categorias = ['Longitud', 'Peso / Masa', 'Temperatura'];
  categoriaSeleccionada = 'Longitud';

  // Más de 10 unidades populares por categoría
  unidadesPorCategoria: { [key: string]: string[] } = {
    Longitud: [
      'Metros (m)', 'Kilómetros (km)', 'Centímetros (cm)', 'Milímetros (mm)', 
      'Millas (mi)', 'Yardas (yd)', 'Pies (ft)', 'Pulgadas (in)', 'Millas Náuticas (NM)'
    ],
    'Peso / Masa': [
      'Kilogramos (kg)', 'Gramos (g)', 'Miligramos (mg)', 'Libras (lb)', 
      'Onzas (oz)', 'Toneladas Métricas (t)', 'Quilates (ct)'
    ],
    Temperatura: ['Celsius (°C)', 'Fahrenheit (°F)', 'Kelvin (K)']
  };

  unidadOrigen = 'Metros (m)';
  unidadDestino = 'Centímetros (cm)';
  valorOrigen: number = 1;
  valorDestino: number = 100;

  // Valor exacto de cada unidad traducido a una UNIDAD BASE (Metro para longitud, Gramo para peso)
  factores: UnidadesDiccionario = {
    Longitud: {
      'Metros (m)': 1,
      'Kilómetros (km)': 1000,
      'Centímetros (cm)': 0.01,
      'Milímetros (mm)': 0.001,
      'Millas (mi)': 1609.344,
      'Yardas (yd)': 0.9144,
      'Pies (ft)': 0.3048,
      'Pulgadas (in)': 0.0254,
      'Millas Náuticas (NM)': 1852
    },
    'Peso / Masa': {
      'Gramos (g)': 1,
      'Kilogramos (kg)': 1000,
      'Miligramos (mg)': 0.001,
      'Libras (lb)': 453.59237,
      'Onzas (oz)': 28.349523,
      'Toneladas Métricas (t)': 1000000,
      'Quilates (ct)': 0.2
    }
  };

  constructor(private TitleService: Title, private metaService: Meta) {
    this.convertir();
  }

  ngOnInit() {
    this.TitleService.setTitle('Convertidor de Unidades - Mini Apps Online');
    this.metaService.updateTag({ name: 'description', content: 'Convertidor de Unidades - Mini Apps Online' });
  }

  onCategoriaChange() {
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

    if (this.categoriaSeleccionada === 'Temperatura') {
      this.valorDestino = this.convertirTemperatura(this.valorOrigen, this.unidadOrigen, this.unidadDestino);
      return;
    }

    // Convertir de Origen a la unidad Base, luego de la Base a la unidad Destino
    const valorEnBase = this.valorOrigen * this.factores[this.categoriaSeleccionada][this.unidadOrigen];
    const resultado = valorEnBase / this.factores[this.categoriaSeleccionada][this.unidadDestino];
    
    // Redondeo inteligente a 6 decimales para evitar flotantes extraños en JS
    this.valorDestino = Math.round(resultado * 1000000) / 1000000;
  }

  private convertirTemperatura(valor: number, de: string, a: string): number {
    let celsius = 0;

    if (de.includes('°C')) celsius = valor;
    else if (de.includes('°F')) celsius = (valor - 32) * 5 / 9;
    else if (de.includes('K')) celsius = valor - 273.15;

    let resultado = 0;
    if (a.includes('°C')) resultado = celsius;
    else if (a.includes('°F')) resultado = (celsius * 9 / 5) + 32;
    else if (a.includes('K')) resultado = celsius + 273.15;

    return Math.round(resultado * 100) / 100;
  }


  intercambiarUnidades() {
  // 1. Guardar temporalmente los valores actuales de Origen
  const unidadTemporal = this.unidadOrigen;
  const valorTemporal = this.valorOrigen;

  // 2. Intercambiar las unidades
  this.unidadOrigen = this.unidadDestino;
  this.unidadDestino = unidadTemporal;

  // 3. Pasar el resultado calculado al campo de entrada original
  // Esto hace que si tenías 1°C = 33.8°F, al invertir ponga 33.8°F en el input "Desde"
  this.valorOrigen = this.valorDestino;

  // 4. Volver a ejecutar la conversión matemática para actualizar el cuadro azul
  this.convertir();
}


}