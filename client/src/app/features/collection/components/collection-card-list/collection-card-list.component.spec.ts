import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Card } from '../../../common/models/card';
import { CollectionCardListComponent } from './collection-card-list.component';

describe('CollectionCardListComponent', () => {
  let component: CollectionCardListComponent;
  let fixture: ComponentFixture<CollectionCardListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionCardListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionCardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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

  it('should have card list component displayed when input is setted', (done) => {
    initInput();

    fixture.whenStable().then(() => {
      const firstCard = fixture.nativeElement.querySelector(
        '.collection-card-name'
      );
      expect(firstCard.textContent.trim()).toBe('toto');
      done();
    });
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
