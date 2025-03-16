import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { makeCard } from '../../../common/models/card';
import { ModifySetDialogComponent } from './modify-set-dialog.component';

describe('ModifySetDialogComponent', () => {
  let component: ModifySetDialogComponent;
  let fixture: ComponentFixture<ModifySetDialogComponent>;
  const expectedBaseCard = makeCard('toto', 'toto', '', '', 0, 'totoSet', '', [
    { id: 'toto', set_name: 'totoSet', set_id: 'totoSet' },
    { id: 'titi', set_name: 'titiSet', set_id: 'titiSet' },
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: expectedBaseCard,
        },
        {
          provide: MatDialogRef,
          useValue: jasmine.createSpyObj('MatDialogRef', ['close']),
        },
      ],
      imports: [ModifySetDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModifySetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should select base card set when is created', () => {
    expect(component.selectedSet.value).toBe(expectedBaseCard.sets[0]);
  });

  it('should return selected set when update button is clicked', () => {
    component.selectedSet.setValue(expectedBaseCard.sets[1]);

    component.updateSet();

    expect(component.dialogRef.close).toHaveBeenCalledWith(
      expectedBaseCard.sets[1]
    );
  });
});
