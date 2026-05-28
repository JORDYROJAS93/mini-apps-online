import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sugerir-app',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sugerir-app.html',
  styleUrl: './sugerir-app.css',
})
export class SugerirAppComponent {
  // Inicializamos el objeto con los mismos nombres del formulario
  formData = {
    appName: '',
    appCategory: '',
    appDescription: '',
    userEmail: ''
  };

  formEnviado = false;

  onSubmit() {
    // 1. Imprimimos los datos reales en la consola
    console.log('Sugerencia enviada con éxito:', this.formData);
    
    // 2. Activamos la vista de éxito en la pantalla
    this.formEnviado = true;

    // 3. Limpiamos los campos del formulario de inmediato
    this.formData = {
      appName: '',
      appCategory: '',
      appDescription: '',
      userEmail: ''
    };
  }
}
