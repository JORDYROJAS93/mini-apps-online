import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfToTxt } from './pdf-to-txt';

describe('PdfToTxt', () => {
  let component: PdfToTxt;
  let fixture: ComponentFixture<PdfToTxt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfToTxt],
    }).compileComponents();

    fixture = TestBed.createComponent(PdfToTxt);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
