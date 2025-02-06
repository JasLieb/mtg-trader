import { Component, EventEmitter, input, Input, Output, signal } from '@angular/core';
import { Card } from '../../../common/models/card';

@Component({
    selector: 'app-trade-card-list',
    imports: [],
    templateUrl: './trade-card-list.component.html',
    styleUrl: './trade-card-list.component.scss'
})
export class TradeCardListComponent {
  cards = input<Card[]>([]);
}
