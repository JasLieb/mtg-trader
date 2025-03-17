import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Card } from '../../../common/models/card';
import { TradeCardListComponent } from './trade-card-list.component';

describe('TradeCardListComponent', () => {
  let component: TradeCardListComponent;
  let fixture: ComponentFixture<TradeCardListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradeCardListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TradeCardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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

    const firstCard = fixture.nativeElement.querySelector('.app-card');
    expect(firstCard.textContent.trim()).toBe('toto');
  });
});
