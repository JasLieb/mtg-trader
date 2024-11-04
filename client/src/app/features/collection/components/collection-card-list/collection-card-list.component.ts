import { Component, EventEmitter, input, Output } from '@angular/core';
import { Card } from '../../../common/models/card';
import { CardListComponent } from '../../../trade/components/card-list/card-list.component';

@Component({
  selector: 'app-collection-card-list',
  standalone: true,
  imports: [],
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
