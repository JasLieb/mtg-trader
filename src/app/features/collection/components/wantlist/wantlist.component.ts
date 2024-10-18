import { Component, computed, input, Input, OnInit } from '@angular/core';
import { CardListComponent } from '../card-list/card-list.component';
import { WantlistService } from '../../services/wantlist/wantlist.service';
import { Wantlist } from '../../models/wantlist';
import { CardSearcherComponent } from '../card-searcher/card-searcher.component';
import { Card } from '../../models/card';

@Component({
  selector: 'app-wantlist',
  standalone: true,
  imports: [CardListComponent, CardSearcherComponent],
  templateUrl: './wantlist.component.html',
  styleUrl: './wantlist.component.scss',
})
export class WantlistComponent {
  wantlist = input({} as Wantlist);
  name = computed(() => this.wantlist().name);

  constructor(private wantlistService: WantlistService) {}

  deleteWantlist() {
    this.wantlistService.delete(this.wantlist().id);
  }

  addCardToWantlist(card: Card) {
    if (this.wantlist() != undefined) {
      const updatedCards = [...this.wantlist().cards, card];
      this.updateWantlist({
        id: this.wantlist().id,
        name: this.wantlist().name,
        cards: updatedCards,
      } as Wantlist);
    }
  }

  deleteCard(card: Card) {
    if (this.wantlist != undefined) {
      this.updateWantlist({
        id: this.wantlist().id,
        name: this.wantlist().name,
        cards: this.wantlist().cards.filter(c => c.id !== card.id),
      } as Wantlist);
    }
  }

  private updateWantlist(wantlist: Wantlist) {
    this.wantlistService.updateWantlist(wantlist);
  }
}
