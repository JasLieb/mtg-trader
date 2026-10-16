import { ComponentFixture, TestBed } from '@angular/core/testing';

import { makeCard } from '../../models/card';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the price in euros with two decimals', () => {
    fixture.componentRef.setInput('card', makeCard('id', 'Sol Ring', '', '', 1.2));
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.app-card-price').textContent
    ).toContain('(1.20€)');
  });

  it('should show no price when Scryfall has none', () => {
    fixture.componentRef.setInput('card', makeCard('id', 'Sol Ring', '', '', null));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.app-card-price')).toBeNull();
  });
});
