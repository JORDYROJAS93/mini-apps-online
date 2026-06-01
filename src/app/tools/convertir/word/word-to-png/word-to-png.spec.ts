import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordToPng } from './word-to-png';

describe('WordToPng', () => {
  let component: WordToPng;
  let fixture: ComponentFixture<WordToPng>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordToPng],
    }).compileComponents();

    fixture = TestBed.createComponent(WordToPng);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
