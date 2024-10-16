import { Component, OnInit } from '@angular/core';
import { CardListComponent } from "../card-list/card-list.component";
import { WantlistService } from '../../services/wantlist/wantlist.service';
import { Wantlist } from '../../models/wantlist';
import { CardSearcherComponent } from '../card-searcher/card-searcher.component';

@Component({
  selector: 'app-wantlist',
  standalone: true,
  imports: [CardListComponent, CardSearcherComponent],
  templateUrl: './wantlist.component.html',
  styleUrl: './wantlist.component.scss'
})
export class WantlistComponent implements OnInit {
  wantlist: Wantlist | undefined = undefined;

  constructor(
    private wantlistService: WantlistService
  ) {}

  ngOnInit(): void {
    this.wantlist = this.wantlistService.getWantlist('test');
  }

}
