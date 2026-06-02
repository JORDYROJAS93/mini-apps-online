import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-pdf-to-word',
  imports: [],
  templateUrl: './pdf-to-word.html',
  styleUrl: './pdf-to-word.css',
})
export class PdfToWordComponent implements OnInit {

  constructor(
    private TitleService: Title,
    private metaService: Meta,
  ) { }

  ngOnInit(): void {
    this.TitleService.setTitle('Convertir PDF a Word - Mini Apps Online');
    this.metaService.updateTag({ name: 'description', content: 'Convertir PDF a Word - Mini Apps Online' });
  }

}
