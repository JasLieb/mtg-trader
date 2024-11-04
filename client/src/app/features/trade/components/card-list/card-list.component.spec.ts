import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardListComponent } from './card-list.component';
import { Card } from '../../../common/models/card';

describe('CardListComponent', () => {
  let component: CardListComponent;
  let fixture: ComponentFixture<CardListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardListComponent);
    component = fixture.componentInstance;
  });

  function initInput() {
    fixture.componentRef.setInput('cards', [
      { id: 'toto', name: 'toto' } as Card,
    ]);
    fixture.detectChanges();
  }

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have displayed cards when input is setted', () => {
    initInput();

    const firstCard = fixture.nativeElement.querySelector('.card-name');
    expect(firstCard.textContent).toBe('toto');
  });
});
