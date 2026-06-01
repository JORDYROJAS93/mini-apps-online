import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordToTxt } from './word-to-txt';

describe('WordToTxt', () => {
  let component: WordToTxt;
  let fixture: ComponentFixture<WordToTxt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordToTxt],
    }).compileComponents();

    fixture = TestBed.createComponent(WordToTxt);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
