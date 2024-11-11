import { Component, computed, input, Input, OnInit } from '@angular/core';
import { WantlistService } from '../../services/wantlist/wantlist.service';
import { Wantlist } from '../../models/wantlist';
import { CardSearcherComponent } from '../card-searcher/card-searcher.component';
import { Card } from '../../../common/models/card';
import { CollectionCardListComponent } from '../collection-card-list/collection-card-list.component';

@Component({
  selector: 'app-wantlist',
  standalone: true,
  imports: [CollectionCardListComponent, CardSearcherComponent],
  templateUrl: './wantlist.component.html',
  styleUrl: './wantlist.component.scss',
})
export class WantlistComponent {
  wantlist = input({} as Wantlist);
  name = computed(() => this.wantlist().name);

  constructor(private wantlistService: WantlistService) {}

  addCardToWantlist(card: Card) {
    if (this.wantlist().id != undefined) {
      const updatedCards = [...(this.wantlist().cards ?? []), card];
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
        cards: this.wantlist().cards.filter((c) => c.id !== card.id),
      } as Wantlist);
    }
  }

  private updateWantlist(wantlist: Wantlist) {
    this.wantlistService.updateWantlist(wantlist);
  }
}
