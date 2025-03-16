import { Component, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { subscribeOnce } from '../../../../core/utils/subscribeExtensions';
import { Card } from '../../../common/models/card';
import { ModifySetDialogComponent } from '../modify-set-dialog/modify-set-dialog.component';

@Component({
  selector: 'app-collection-card-list',
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './collection-card-list.component.html',
  styleUrl: './collection-card-list.component.scss',
})
export class CollectionCardListComponent {
  readonly dialog = inject(MatDialog);
  cards = input<Card[]>([]);

  onDeletedCard = output<Card>();
  onUpdateSet = output<{ base: Card; update: Card }>();

  openDialog(card: Card) {
    var dialogRef = this.dialog.open(ModifySetDialogComponent, {
      data: card,
      closeOnNavigation: true,
      disableClose: true,
    });
    subscribeOnce(dialogRef.afterClosed(), (result) => {
      if (result) this.onUpdateSet.emit({ base: card, update: result });
    });
  }

  deleteCard(card: Card) {
    this.onDeletedCard.emit(card);
  }
}
