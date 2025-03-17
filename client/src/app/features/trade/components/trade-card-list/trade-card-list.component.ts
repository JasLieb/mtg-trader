import { Component, EventEmitter, input, Input, Output, signal } from '@angular/core';
import { Card } from '../../../common/models/card';
import { CardComponent } from "../../../common/components/card/card.component";

@Component({
    selector: 'app-trade-card-list',
    imports: [CardComponent],
    templateUrl: './trade-card-list.component.html',
    styleUrl: './trade-card-list.component.scss'
})
export class TradeCardListComponent {
  cards = input<Card[]>([]);
}
