import { AfterContentInit, Component, signal } from '@angular/core';
import { TradeService } from '../../services/trade/trade.service';
import { TradeableResponse } from '../../models/tradeable-response';
import { TradeCardListComponent } from '../trade-card-list/trade-card-list.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { subscribeOnce } from '../../../../core/utils/subscribeExtensions';
import { UserTrader } from '../../models/user-trader';

@Component({
    selector: 'app-trade-home',
    imports: [TradeCardListComponent, MatExpansionModule, MatButtonModule],
    templateUrl: './trade-home.component.html',
    styleUrl: './trade-home.component.scss'
})
export class TradeHomeComponent implements AfterContentInit {
  users = signal<UserTrader[]>([]);

  constructor(private tradeService: TradeService) {}

  ngAfterContentInit(): void {
    subscribeOnce(
      this.tradeService.find(),
      (users) => this.users.set(users)
    );
  }
}
