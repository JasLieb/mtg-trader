import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardListComponent } from './card-list.component';
import { Card } from '../../models/card';

describe('CardListComponent', () => {
  let component: CardListComponent;
  let fixture: ComponentFixture<CardListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have displayed cards', () => {
    component.cards = [{id: 'toto', name: 'toto'} as Card];
    fixture.detectChanges();
    const firstCard = fixture.nativeElement.querySelector('li');
    expect(firstCard.textContent).toBe('toto');
  });
});
