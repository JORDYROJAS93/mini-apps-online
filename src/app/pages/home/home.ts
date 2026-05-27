import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {

  // 2. Inyéctalo en tu constructor
  constructor(private router: Router) {}

  // 3. Añade esta función mágica que forzará la navegación al hacer clic
  irA(ruta: string): void {
    this.router.navigate([ruta]);
  }
}
