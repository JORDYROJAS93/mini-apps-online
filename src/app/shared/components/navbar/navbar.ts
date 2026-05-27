import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive,  } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ RouterLinkActive, RouterLink, ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent {
  menuAbierto: boolean = false;
  
  // Guarda el nombre de la categoría móvil abierta ('finanzas', 'marketing', etc.)
  // Si es null, todas las categorías están cerradas.
  categoriaActiva: string | null = null;

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
    // Al cerrar el menú completo, limpiamos también las categorías abiertas
    if (!this.menuAbierto) {
      this.categoriaActiva = null;
    }
  }

  cerrarMenu() {
    this.menuAbierto = false;
    this.categoriaActiva = null;
  }

  // Lógica del Acordeón móvil
  toggleCategoria(categoria: string) {
    if (this.categoriaActiva === categoria) {
      this.categoriaActiva = null; // Si hace clic en la misma, se cierra
    } else {
      this.categoriaActiva = categoria; // Abre la nueva y cierra la anterior automáticamente
    }
  }

}
