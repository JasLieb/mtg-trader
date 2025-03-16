import { Component, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { subscribeOnce } from '../../../../core/utils/subscribeExtensions';
import { Card, CardSet } from '../../../common/models/card';
import { CardService } from '../../../common/services/card/card.service';
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
  onUpdateCard = output<{ baseCard: Card; updatedCard: Card }>();

  constructor(private cardService: CardService) {}

  openDialog(baseCard: Card) {
    const dialogRef = this.dialog.open<ModifySetDialogComponent, Card, CardSet>(
      ModifySetDialogComponent,
      {
        data: baseCard,
      }
    );
    subscribeOnce(dialogRef.afterClosed(), (result) => {
      if (result && baseCard.id !== result.card_id) {
        subscribeOnce(this.cardService.fetch(result.card_id), (updatedCard) => {
          if (updatedCard) this.onUpdateCard.emit({ baseCard, updatedCard });
        });
      }
    });
  }

  deleteCard(card: Card) {
    this.onDeletedCard.emit(card);
  }
}
