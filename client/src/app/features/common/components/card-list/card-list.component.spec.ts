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
  });

  function initInput() {
    fixture.componentRef.setInput('cards', [
      { id: 'toto', name: 'toto' } as Card,
    ]);
    fixture.detectChanges();
  }

  function initOutput() {
    spyOn(component.onDeletedCard, 'emit');
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

  it('should not have delete card button when output is not setted', () => {
    initInput();

    const deleteButton = fixture.nativeElement.querySelector('button');
    expect(deleteButton).toBeNull();
  });

  it('should have delete card button when output is setted', () => {
    initInput();
    initOutput();

    const deleteButton = fixture.nativeElement.querySelector('button');
    expect(deleteButton.textContent).toBe('Delete');
  });

  it('should emit delete card when delete button is clicked', () => {
    initInput();
    initOutput();

    fixture.nativeElement.querySelector('button').click();

    expect(component.onDeletedCard.emit).toHaveBeenCalledWith({
      id: 'toto',
      name: 'toto',
    } as Card);
  });
});
