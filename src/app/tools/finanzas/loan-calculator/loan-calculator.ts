import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-loan-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loan-calculator.html',
  styleUrl: './loan-calculator.css',
})
export class LoanCalculatorComponent {
  monto: number = 10000;
  tasaAnual: number = 12;
  plazo: number = 12; // meses
  
  cuotaMensual: number = 0;
  totalPago: number = 0;
  totalInteres: number = 0;
  cronograma: any[] = [];

  constructor() {
    this.calcular();
  }

  calcular() {
    const tasaMensual = (this.tasaAnual / 100) / 12;
    const n = this.plazo;

    // Fórmula: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1 ]
    if (tasaMensual > 0) {
      this.cuotaMensual = this.monto * (tasaMensual * Math.pow(1 + tasaMensual, n)) / (Math.pow(1 + tasaMensual, n) - 1);
    } else {
      this.cuotaMensual = this.monto / n;
    }

    this.totalPago = this.cuotaMensual * n;
    this.totalInteres = this.totalPago - this.monto;
    this.generarTabla(tasaMensual);
  }

  generarTabla(tasaMensual: number) {
    this.cronograma = [];
    let saldo = this.monto;

    for (let i = 1; i <= this.plazo; i++) {
      const interesMes = saldo * tasaMensual;
      const capitalMes = this.cuotaMensual - interesMes;
      saldo -= capitalMes;

      this.cronograma.push({
        mes: i,
        cuota: this.cuotaMensual,
        capital: capitalMes,
        interes: interesMes,
        saldo: Math.max(0, saldo)
      });
    }
  }
}
