import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-soporte',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './soporte.html',
  styleUrl: './soporte.css',
})
export class SoporteComponent {
  // Objeto para capturar los datos del formulario
  formData = {
    userName: '',
    userEmail: '',
    issueType: '',
    supportMessage: ''
  };

  formEnviado = false;

  onSubmit() {
    // Aquí es donde en el futuro conectarías con tu backend o servicio de email (Formspree, EmailJS, etc.)
    console.log('Datos recibidos de soporte:', this.formData);
    
    // Activamos la pantalla/mensaje de éxito
    this.formEnviado = true;

    // Opcional: Limpiar el formulario después de enviar
    this.formData = {
      userName: '',
      userEmail: '',
      issueType: '',
      supportMessage: ''
    };
  }
}