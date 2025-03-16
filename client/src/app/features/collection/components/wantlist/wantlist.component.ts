import { Component, computed, input } from '@angular/core';
import { Card } from '../../../common/models/card';
import { Wantlist } from '../../models/wantlist';
import { WantlistService } from '../../services/wantlist/wantlist.service';
import { CardSearcherComponent } from '../card-searcher/card-searcher.component';
import { CollectionCardListComponent } from '../collection-card-list/collection-card-list.component';

@Component({
  selector: 'app-wantlist',
  imports: [CollectionCardListComponent, CardSearcherComponent],
  templateUrl: './wantlist.component.html',
  styleUrl: './wantlist.component.scss',
})
export class WantlistComponent {
  wantlist = input<Wantlist>();
  name = computed(() => this.wantlist()?.name);

  constructor(private wantlistService: WantlistService) {}

  addCardToWantlist(card: Card) {
    this.doIfWantlist((wantlist: Wantlist) => {
      const updatedCards = [...(wantlist.cards ?? []), card];
      this.updateWantlist({
        id: wantlist.id,
        name: wantlist.name,
        cards: updatedCards,
      } as Wantlist);
    });
  }

  updateCardSet(event: { baseCard: Card; updatedCard: Card }) {
    this.doIfWantlist((wantlist: Wantlist) => {
      const updatedCards: Card[] = wantlist.cards.map((card) =>
        card.id == event.baseCard.id ? event.updatedCard : card
      );
      this.updateWantlist({
        id: wantlist.id,
        name: wantlist.name,
        cards: updatedCards,
      } as Wantlist);
    });
  }

  deleteCard(card: Card) {
    this.doIfWantlist((wantlist: Wantlist) => {
      this.updateWantlist({
        id: wantlist.id,
        name: wantlist.name,
        cards: wantlist.cards.filter((c) => c.id !== card.id),
      });
    });
  }

  private doIfWantlist(action: (wantlist: Wantlist) => void) {
    const wantlist = this.wantlist();
    if (wantlist) action(wantlist);
  }

  private updateWantlist(wantlist: Wantlist) {
    this.wantlistService.updateWantlist(wantlist);
  }
}
