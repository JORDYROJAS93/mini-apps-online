import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive,  } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ RouterLinkActive, RouterLink, ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent {}
