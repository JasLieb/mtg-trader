import { AfterContentInit, Component, signal } from '@angular/core';
import { TradeService } from '../../services/trade/trade.service';
import { UserDoubles } from '../../models/user-doubles';
import { TradeCardListComponent } from '../trade-card-list/trade-card-list.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { subscribeOne } from '../../../../core/utils/subscribeExtensions';

@Component({
  selector: 'app-trade-home',
  standalone: true,
  imports: [TradeCardListComponent, MatExpansionModule, MatButtonModule],
  templateUrl: './trade-home.component.html',
  styleUrl: './trade-home.component.scss',
})
export class TradeHomeComponent implements AfterContentInit {
  users = signal<UserDoubles[]>([]);

  constructor(private tradeService: TradeService) {}

  ngAfterContentInit(): void {
    subscribeOne(
      this.tradeService.find(),
      (users) => this.users.set(users)
    );
  }
}
