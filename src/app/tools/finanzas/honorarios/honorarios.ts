import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-honorarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './honorarios.html',
  styleUrl: './honorarios.css',
})
export class HonorariosComponent {
  montoBruto: number | null = null;
  retencionPorcentaje: number = 8; // Por defecto 8% (común en Perú y otros países)
  
  // Resultados
  montoRetencion: number = 0;
  montoNeto: number = 0;

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