import { Routes } from '@angular/router';
import { TerminosUsoComponent } from './pages/terminos-uso/terminos-uso';
import { PrivacidadComponent } from './pages/privacidad/privacidad';
import { SugerirAppComponent } from './pages/sugerir-app/sugerir-app';
import { SoporteComponent } from './pages/soporte/soporte';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent),
    title: 'Inicio'
  },
  {
    path: 'igv',
    loadComponent: () => import('./tools/finanzas/igv/igv').then(m => m.IgvComponent),
    title: 'Calculadora de IGV'
  },
  {
    path: 'honorarios',
    loadComponent: () => import('./tools/finanzas/honorarios/honorarios').then(m => m.HonorariosComponent),
    title: 'Calculadora de Honorarios'
  },
  {
    path: 'qr-generator',
    loadComponent: () => import('./tools/marketing/qr-generator/qr-generator').then(m => m.QrGeneratorComponent),
    title: 'Generador de QR'
  },
  {
    path: 'whatsapp-link',
    loadComponent: () => import('./tools/marketing/whatsapp-link/whatsapp-link').then(m => m.WhatsappLink),
    title: 'Generador de enlace WhatsApp'
  },
  {
    path: 'password-gen',
    loadComponent: () => import('./tools/herramientas/password-gen/password-gen').then(m => m.PasswordGenComponent),
    title: 'Generador de Password'
  },
  //counter-text
  {path: 'counter-text', loadComponent: () => import('./tools/herramientas/counter-text/counter-text').then(m => m.CounterTextComponent), title: 'Contador de caracteres'},
  //de word a html
  {path: 'word-a-html', loadComponent: () => import('./tools/herramientas/word-a-html/word-a-html').then(m => m.WordAHtmlComponent), title: 'Convertidor de Word a HTML'},
  
  // Conversor de monedas
  {
    path: 'conversor-monedas',
    loadComponent: () => import('./tools/finanzas/conversor-monedas/conversor-monedas').then(m => m.ConversorMonedasComponent),
    title: 'Conversor de Monedas'
  },
  // Calculadora de préstamos
  {
    path: 'loan-calculator',
    loadComponent: () => import('./tools/finanzas/loan-calculator/loan-calculator').then(m => m.LoanCalculatorComponent),
    title: 'Calculadora de Préstamos'
  },
  // Conversor de unidades
  {
    path: 'conversor-unidades',
    loadComponent: () => import('./tools/herramientas/unit-converter/unit-converter').then(m => m.UnitConverterComponent),
    title: 'Conversor de Unidades'
  },
  // Formateador de JSON
  {
    path: 'json-formatter',
    loadComponent: () => import('./tools/devs/json-formatter/json-formatter').then(m => m.JsonFormatterComponent),
    title: 'Formateador de JSON'
  },
  // Minificador de código
  {
    path: 'code-minimizer',
    loadComponent: () => import('./tools/devs/code-minimizer/code-minimizer').then(m => m.CodeMinimizerComponent),
    title: 'Minificador de Código'
  },
  // Extractor de colores
  {
    path: 'color-extractor',
    loadComponent: () => import('./tools/devs/color-extractor/color-extractor').then(m => m.ColorExtractorComponent),
    title: 'Extractor de Colores'
  },

  { path: 'terminos-de-uso', component: TerminosUsoComponent },
  { path: 'politica-de-privacidad', component: PrivacidadComponent },
  { path: 'sugerir-app', component: SugerirAppComponent },
  { path: 'soporte', component: SoporteComponent },

  { path: '**', redirectTo: '' }
];
