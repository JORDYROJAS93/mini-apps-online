import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordToJpg } from './word-to-jpg';

describe('WordToJpg', () => {
  let component: WordToJpg;
  let fixture: ComponentFixture<WordToJpg>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordToJpg],
    }).compileComponents();

    fixture = TestBed.createComponent(WordToJpg);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
