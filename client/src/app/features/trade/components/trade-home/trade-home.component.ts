import { AfterContentInit, Component, signal } from '@angular/core';
import { TradeService } from '../../services/trade/trade.service';
import { UserDoubles } from '../../models/user-doubles';
import { CardListComponent } from '../card-list/card-list.component';

@Component({
  selector: 'app-trade-home',
  standalone: true,
  imports: [CardListComponent],
  templateUrl: './trade-home.component.html',
  styleUrl: './trade-home.component.scss',
})
export class TradeHomeComponent implements AfterContentInit {
  users = signal<UserDoubles[]>([]);

  constructor(private tradeService: TradeService) {}

  ngAfterContentInit(): void {
    this.tradeService.find().subscribe((users) => this.users.set(users));
  }
}
