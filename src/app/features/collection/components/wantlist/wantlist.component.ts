import { Component, Input, OnInit } from '@angular/core';
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
export class WantlistComponent implements OnInit {
  @Input()
  wantlist: Wantlist | undefined = undefined;

  constructor(private wantlistService: WantlistService) {}

  ngOnInit(): void {
    // this.wantlist = this.wantlistService.getWantlist('test');
  }

  onAddCardToWantlist(card: Card) {
    if (this.wantlist != undefined) {
      const updatedCards = [...this.wantlist.cards, card];
      this.wantlistService.updateWantlist({
        id: this.wantlist.id,
        name: this.wantlist.name,
        cards: updatedCards,
      } as Wantlist);
    }
  }
}
