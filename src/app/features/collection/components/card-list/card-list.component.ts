import { Component, EventEmitter, input, Input, Output, signal } from '@angular/core';
import { Card } from '../../models/card';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [],
  templateUrl: './card-list.component.html',
  styleUrl: './card-list.component.scss',
})
export class CardListComponent {
  cards = input<Card[]>([]);

  @Output()
  onDeletedCard = new EventEmitter<Card>();

  deleteCard(card: Card) {
    this.onDeletedCard.emit(card);
  }
}
