import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-igv',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './igv.html',
  styleUrl: './igv.css',
})
export class IgvComponent implements OnInit {
  monto: number = 0;
  igv: number = 0;
  total: number = 0;

  constructor(
    private TitleService: Title,
    private metaService: Meta,
  ) { }

  ngOnInit() {
    this.TitleService.setTitle('Calculadora de IGV - Mini Apps Online');
    this.metaService.updateTag({ name: 'description', content: 'Calculadora de IGV - Mini Apps Online' });
  }

  calcular() {
    this.igv = this.monto * 0.18;
    this.total = this.monto + this.igv;
  }
}