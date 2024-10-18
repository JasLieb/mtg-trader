import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardListComponent } from './card-list.component';
import { Card } from '../../models/card';

describe('CardListComponent', () => {
  let component: CardListComponent;
  let fixture: ComponentFixture<CardListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('cards', [
      { id: 'toto', name: 'toto' } as Card,
    ]);
    spyOn(component.onDeletedCard, 'emit');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have displayed cards', () => {
    const firstCard = fixture.nativeElement.querySelector('.card-name');
    expect(firstCard.textContent).toBe('toto');
  });

  it('should have delete card button', () => {
    const deleteButton = fixture.nativeElement.querySelector('button');
    expect(deleteButton.textContent).toBe('Delete');
  });

  it('should emit delete card when delete button is clicked', () => {
    fixture.nativeElement.querySelector('button').click();
    expect(component.onDeletedCard.emit).toHaveBeenCalledWith({
      id: 'toto',
      name: 'toto',
    } as Card);
  });
});
