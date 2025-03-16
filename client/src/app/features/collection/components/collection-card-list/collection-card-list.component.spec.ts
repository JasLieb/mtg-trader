import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { makeCard } from '../../../common/models/card';
import { ModifySetDialogComponent } from '../modify-set-dialog/modify-set-dialog.component';
import { CollectionCardListComponent } from './collection-card-list.component';

describe('CollectionCardListComponent', () => {
  let component: CollectionCardListComponent;
  let fixture: ComponentFixture<CollectionCardListComponent>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  const expectedBaseCard = makeCard('toto', 'toto', '', '', 0, 'totoSet', '', [
    { id: 'toto', set_name: 'totoSet', set_id: 'totoSet' },
    { id: 'titi', set_name: 'titiSet', set_id: 'titiSet' },
  ]);
  const expectedModifiedSet = {
    id: 'titi',
    set_name: 'titiSet',
    set_id: 'titiSet',
  };

  beforeEach(async () => {
    dialogSpy = jasmine.createSpyObj({
      open: jasmine.createSpyObj({
        afterClosed: of(expectedModifiedSet),
      }),
    }) as jasmine.SpyObj<MatDialog>;

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: MatDialog,
          useValue: dialogSpy,
        },
      ],
      imports: [CollectionCardListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionCardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function initInput() {
    fixture.componentRef.setInput('cards', [expectedBaseCard]);
    fixture.detectChanges();
  }

  function initOutput() {
    spyOn(component.onDeletedCard, 'emit');
    spyOn(component.onUpdateSet, 'emit');
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

  it('should have modify set button', () => {
    initInput();
    initOutput();

    const modifySetButton = fixture.nativeElement.querySelectorAll('button')[0];
    expect(modifySetButton.textContent).toBe('Modify set');
  });

  it('should open dialog with expected card when modify set button is clicked', () => {
    initInput();
    initOutput();

    fixture.nativeElement.querySelectorAll('button')[0].click();

    expect(dialogSpy.open).toHaveBeenCalledWith(ModifySetDialogComponent, {
      data: expectedBaseCard,
    });
  });

  it('should emit card from new set when modify set dialog is over with result', () => {
    initInput();
    initOutput();

    component.openDialog(expectedBaseCard);

    expect(component.onUpdateSet.emit).toHaveBeenCalledWith({
      baseCard: expectedBaseCard,
      updatedSet: expectedModifiedSet,
    });
  });

  it('should have delete card button', () => {
    initInput();
    initOutput();

    const deleteButton = fixture.nativeElement.querySelectorAll('button')[1];
    expect(deleteButton.textContent).toBe('Delete');
  });

  it('should emit delete card when delete button is clicked', () => {
    initInput();
    initOutput();

    fixture.nativeElement.querySelectorAll('button')[1].click();

    expect(component.onDeletedCard.emit).toHaveBeenCalledWith(expectedBaseCard);
  });
});
