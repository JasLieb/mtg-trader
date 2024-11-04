import { Component, EventEmitter, input, Input, Output, signal } from '@angular/core';
import { Card } from '../../../common/models/card';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [],
  templateUrl: './card-list.component.html',
  styleUrl: './card-list.component.scss',
})
export class CardListComponent {
  cards = input<Card[]>([]);
}
