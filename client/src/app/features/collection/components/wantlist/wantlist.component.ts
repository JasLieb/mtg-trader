import { Component, computed, input, Input, OnInit } from '@angular/core';
import { WantlistService } from '../../services/wantlist/wantlist.service';
import { Wantlist } from '../../models/wantlist';
import { CardSearcherComponent } from '../card-searcher/card-searcher.component';
import { Card } from '../../../common/models/card';
import { CollectionCardListComponent } from '../collection-card-list/collection-card-list.component';

@Component({
    selector: 'app-wantlist',
    imports: [CollectionCardListComponent, CardSearcherComponent],
    templateUrl: './wantlist.component.html',
    styleUrl: './wantlist.component.scss'
})
export class WantlistComponent {
  wantlist = input<Wantlist>();
  name = computed(() => this.wantlist()?.name);

  constructor(private wantlistService: WantlistService) {}

  addCardToWantlist(card: Card) {
    const wantlist = this.wantlist();
    if (wantlist?.id != undefined) {
      const updatedCards = [...(wantlist?.cards ?? []), card];
      this.updateWantlist({
        id: wantlist?.id,
        name: wantlist?.name,
        cards: updatedCards,
      } as Wantlist);
    }
  }

  deleteCard(card: Card) {
    const wantlist = this.wantlist();
    if (wantlist) {
      this.updateWantlist({
        id: wantlist.id,
        name: wantlist.name,
        cards: wantlist.cards.filter((c) => c.id !== card.id),
      });
    }
  }

  private updateWantlist(wantlist: Wantlist) {
    this.wantlistService.updateWantlist(wantlist);
  }
}
