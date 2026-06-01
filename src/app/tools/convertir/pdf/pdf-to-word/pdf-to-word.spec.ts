import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfToWord } from './pdf-to-word';

describe('PdfToWord', () => {
  let component: PdfToWord;
  let fixture: ComponentFixture<PdfToWord>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfToWord],
    }).compileComponents();

    fixture = TestBed.createComponent(PdfToWord);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
