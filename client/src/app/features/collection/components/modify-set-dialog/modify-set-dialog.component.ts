import { Component, Inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { Card, CardSet } from '../../../common/models/card';
@Component({
  selector: 'app-modify-set-dialog',
  imports: [FormsModule, ReactiveFormsModule, MatSelectModule, MatButtonModule],
  templateUrl: './modify-set-dialog.component.html',
  styleUrl: './modify-set-dialog.component.scss',
})
export class ModifySetDialogComponent {
  selectedSet: FormControl<CardSet | null>;

  constructor(
    public dialogRef: MatDialogRef<ModifySetDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public baseCard: Card
  ) {
    this.selectedSet = new FormControl(
      baseCard.sets.find((s) => s.id === baseCard.id) ?? baseCard.sets[0]
    );
  }

  updateSet() {
    if (this.selectedSet.value) this.dialogRef.close(this.selectedSet.value);
  }
}
