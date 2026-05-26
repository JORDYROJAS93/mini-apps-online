import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-igv',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './igv.html',
  styleUrl: './igv.css',
})
export class IgvComponent {
  monto: number = 0;
  igv: number = 0;
  total: number = 0;

  calcular() {
    this.igv = this.monto * 0.18;
    this.total = this.monto + this.igv;
  }
}