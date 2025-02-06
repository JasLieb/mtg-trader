import { Component, EventEmitter, input, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Card } from '../../../common/models/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-collection-card-list',
    imports: [MatCardModule, MatButtonModule],
    templateUrl: './collection-card-list.component.html',
    styleUrl: './collection-card-list.component.scss'
})
export class CollectionCardListComponent {
  cards = input<Card[]>([]);

  @Output()
  onDeletedCard = new EventEmitter<Card>();

  deleteCard(card: Card) {
    this.onDeletedCard.emit(card);
  }
}
