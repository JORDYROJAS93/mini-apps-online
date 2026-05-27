import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CronogramaItem {
  mes: number;
  cuota: number;
  capital: number;
  interes: number;
  saldo: number;
}

@Component({
  selector: 'app-loan-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loan-calculator.html',
  styleUrls: ['./loan-calculator.css']
})
export class LoanCalculatorComponent implements OnInit {
  
  // === VALORES POR DEFECTO ===
  private readonly MONTO_DEFECTO = 5000;
  private readonly TASA_DEFECTO = 14.5;
  private readonly PLAZO_DEFECTO = 24;

  // === ESTADO DEL FORMULARIO ===
  montoFormateado: string = '5,000';
  tasaAnual: number = this.TASA_DEFECTO;
  plazo: number = this.PLAZO_DEFECTO;

  // === RESULTADOS ===
  cuotaMensual: number = 0;
  totalInteres: number = 0;
  totalPago: number = 0;
  totalCapital: number = 0;
  cronograma: CronogramaItem[] = [];

  ngOnInit(): void {
    this.calcular();
  }

  // ================================
  // === INPUT DE MONTO (CORREGIDO) ===
  // ================================
  
  onMontoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    // 1. Obtener valor limpio: solo números y punto decimal
    let raw = input.value.replace(/[^0-9.]/g, '');
    
    // 2. Si está vacío, limpiar y salir
    if (!raw) {
      this.montoFormateado = '';
      this.calcular();
      return;
    }
    
    // 3. Separar parte entera y decimal
    const parts = raw.split('.');
    let entera = parts[0] || '0';
    let decimal = parts[1] || '';
    
    // 4. Limitar a 2 decimales
    if (decimal.length > 2) {
      decimal = decimal.slice(0, 2);
    }
    
    // 5. Convertir entera a número y formatear con comas (formato Perú)
    const numEntera = parseInt(entera, 10) || 0;
    const enteraFormateada = new Intl.NumberFormat('es-PE').format(numEntera);
    
    // 6. Reconstruir valor final
    this.montoFormateado = decimal ? `${enteraFormateada}.${decimal}` : enteraFormateada;
    
    // 7. Recalcular
    this.calcular();
  }

  // Cuando pierde el foco, validamos y corregimos si es necesario
  onMontoBlur(): void {
    const monto = this.obtenerMontoLimpio();
    if (!monto || monto <= 0) {
      this.montoFormateado = new Intl.NumberFormat('es-PE').format(this.MONTO_DEFECTO);
    }
    this.calcular();
  }

  // Helper: obtiene el monto como número puro (sin comas)
  private obtenerMontoLimpio(): number {
    const limpio = this.montoFormateado.replace(/[^0-9.]/g, '');
    return parseFloat(limpio) || 0;
  }

  // ================================
  // === STEPPERS PARA TASA Y PLAZO ===
  // ================================

  ajustarTasa(cambio: number): void {
  this.tasaAnual = Math.min(100, Math.max(0.01, this.tasaAnual + cambio));
  this.calcular();
}

ajustarPlazo(cambio: number): void {
  this.plazo = Math.min(360, Math.max(1, this.plazo + cambio));
  this.calcular();
}

  // ================================
  // === CÁLCULO PRINCIPAL ===
  // ================================

  calcular(): void {
    const monto = this.obtenerMontoLimpio();

    // Validar parámetros
    if (monto <= 0 || this.tasaAnual <= 0 || this.plazo <= 0) {
      this.limpiarResultados();
      return;
    }

    // TEA → TEM (Tasa Efectiva Mensual)
    const tasaMensual = Math.pow(1 + this.tasaAnual / 100, 1 / 12) - 1;
    
    // Fórmula amortización francesa
    const factor = Math.pow(1 + tasaMensual, this.plazo);
    const cuota = (monto * tasaMensual * factor) / (factor - 1);
    
    // Generar cronograma
    let saldo = monto;
    let totalInteres = 0;
    const cronograma: CronogramaItem[] = [];

    for (let mes = 1; mes <= this.plazo; mes++) {
      const interes = saldo * tasaMensual;
      const capital = cuota - interes;
      saldo = Math.max(0, saldo - capital);
      totalInteres += interes;

      cronograma.push({
        mes,
        cuota: Math.round(cuota * 100) / 100,
        capital: Math.round(capital * 100) / 100,
        interes: Math.round(interes * 100) / 100,
        saldo: Math.round(saldo * 100) / 100
      });
    }

    // Actualizar estado
    this.cuotaMensual = Math.round(cuota * 100) / 100;
    this.totalInteres = Math.round(totalInteres * 100) / 100;
    this.totalCapital = monto;
    this.totalPago = Math.round((monto + totalInteres) * 100) / 100;
    this.cronograma = cronograma;
  }

  private limpiarResultados(): void {
    this.cuotaMensual = 0;
    this.totalInteres = 0;
    this.totalPago = 0;
    this.totalCapital = 0;
    this.cronograma = [];
  }

  // ================================
  // === UTILIDADES PARA LA UI ===
  // ================================

  calcularPorcentajeInteres(): string {
    if (this.totalPago === 0) return '0';
    return ((this.totalInteres / this.totalPago) * 100).toFixed(1);
  }

  porcentajeCapital(): number {
    if (this.totalPago === 0) return 0;
    return (this.totalCapital / this.totalPago) * 100;
  }

  porcentajeInteres(): number {
    return 100 - this.porcentajeCapital();
  }

  resetearFormulario(): void {
    this.montoFormateado = new Intl.NumberFormat('es-PE').format(this.MONTO_DEFECTO);
    this.tasaAnual = this.TASA_DEFECTO;
    this.plazo = this.PLAZO_DEFECTO;
    this.calcular();
  }

  exportarCSV(): void {
    if (this.cronograma.length === 0) return;

    const headers = ['Mes,Cuota,Capital,Interes,Saldo'];
    const rows = this.cronograma.map(item => 
      `${item.mes},${item.cuota.toFixed(2)},${item.capital.toFixed(2)},${item.interes.toFixed(2)},${item.saldo.toFixed(2)}`
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cronograma-${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  }
 
 
  
}