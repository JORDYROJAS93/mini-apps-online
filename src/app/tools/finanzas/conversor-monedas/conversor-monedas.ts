import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-conversor-monedas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './conversor-monedas.html',
  styleUrl: './conversor-monedas.css',
})
export class ConversorMonedasComponent implements OnInit {
  monto: number = 1;
  monedaOrigen: string = 'USD';
  monedaDestino: string = 'PEN'; // Por defecto a Soles peruanos
  resultado: number | null = null;

  // Lista de monedas soportadas
  monedas = [
    { codigo: 'USD', nombre: 'Dólar Estadounidense (USD)' },
    { codigo: 'EUR', nombre: 'Euro (EUR)' },
    { codigo: 'PEN', nombre: 'Sol Peruano (PEN)' },
    { codigo: 'ARS', nombre: 'Peso Argentino (ARS)' },
    { codigo: 'CLP', nombre: 'Peso Chileno (CLP)' },
    { codigo: 'MXN', nombre: 'Peso Mexicano (MXN)' },
    { codigo: 'COP', nombre: 'Peso Colombiano (COP)' }
  ];

  // Tasas de cambio estáticas de referencia (Base: 1 USD)
  // Nota: Lo ideal a futuro es jalar esto de un `HttpClient` hacia ExchangeRate-API
  tasasCambio: { [key: string]: number } = {
    USD: 1.0,
    EUR: 0.92,
    PEN: 3.74,
    ARS: 890.0,
    CLP: 910.0,
    MXN: 16.70,
    COP: 3850.0
  };

  constructor(private TitleService: Title,
    private metaService: Meta,) {
    
    this.calcularConversion();
  }

  ngOnInit() {
    this.TitleService.setTitle('Conversor de Monedas - Mini Apps Online');
    this.metaService.updateTag({ name: 'description', content: 'Conversor de Monedas - Mini Apps Online' });
  }

  calcularConversion() {
    if (!this.monto || this.monto <= 0) {
      this.resultado = 0;
      return;
    }

    // Convertir el monto de la moneda origen a la base (USD)
    const montoEnUSD = this.monto / this.tasasCambio[this.monedaOrigen];
    
    // Convertir de la base (USD) a la moneda destino
    this.resultado = montoEnUSD * this.tasasCambio[this.monedaDestino];
  }

  // Intercambiar las monedas de origen y destino rápidamente
  invertirMonedas() {
    const temp = this.monedaOrigen;
    this.monedaOrigen = this.monedaDestino;
    this.monedaDestino = temp;
    this.calcularConversion();
  }
}

