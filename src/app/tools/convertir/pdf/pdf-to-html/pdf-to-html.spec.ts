import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfToHtml } from './pdf-to-html';

describe('PdfToHtml', () => {
  let component: PdfToHtml;
  let fixture: ComponentFixture<PdfToHtml>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfToHtml],
    }).compileComponents();

    fixture = TestBed.createComponent(PdfToHtml);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
