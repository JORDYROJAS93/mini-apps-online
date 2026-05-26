import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-gen',
  imports: [CommonModule, FormsModule],
  templateUrl: './password-gen.html',
  styleUrl: './password-gen.css',
})
export class PasswordGenComponent {
  password = '';
  largo = 16;
  
  // Opciones de configuración
  includeUpper = true;
  includeLower = true;
  includeNumbers = true;
  includeSymbols = true;

  constructor() { this.generar(); }

  generar() {
    const sets = {
      upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lower: "abcdefghijklmnopqrstuvwxyz",
      numbers: "0123456789",
      symbols: "!@#$%^&*()_+"
    };

    let charset = "";
    if (this.includeUpper) charset += sets.upper;
    if (this.includeLower) charset += sets.lower;
    if (this.includeNumbers) charset += sets.numbers;
    if (this.includeSymbols) charset += sets.symbols;

    // Validación por si el usuario desmarca todo
    if (charset === "") {
      this.password = "Selecciona una opción";
      return;
    }

    let retVal = "";
    for (let i = 0; i < this.largo; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    this.password = retVal;
  }

  copiar() {
    navigator.clipboard.writeText(this.password);
    // Podrías usar un toast aquí en vez de alert
  }
}
