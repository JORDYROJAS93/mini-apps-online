import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-honorarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './honorarios.html',
  styleUrl: './honorarios.css',
})
export class HonorariosComponent implements OnInit {
  montoBruto: number | null = null;
  retencionPorcentaje: number = 8; // Por defecto 8% (común en Perú y otros países)
  
  // Resultados
  montoRetencion: number = 0;
  montoNeto: number = 0;

  constructor(
    private TitleService: Title,
    private metaService: Meta,
  
  ) {}

  ngOnInit() {
    this.TitleService.setTitle('Calculadora de Honorarios - Mini Apps Online');
    this.metaService.updateTag({ name: 'description', content: 'Calculadora de Honorarios - Mini Apps Online' });
  }

  calcular() {
    if (this.montoBruto && this.montoBruto > 0) {
      this.montoRetencion = this.montoBruto * (this.retencionPorcentaje / 100);
      this.montoNeto = this.montoBruto - this.montoRetencion;
    } else {
      this.montoRetencion = 0;
      this.montoNeto = 0;
    }
  }
}