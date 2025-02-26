import { AfterContentInit, Component, signal } from '@angular/core';
import { TradeService } from '../../services/trade/trade.service';
import { TradeCardListComponent } from '../trade-card-list/trade-card-list.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { subscribeOnce } from '../../../../core/utils/subscribeExtensions';
import { NavigationService } from '../../../../core/services/navigation/navigation.service';
import { UserTrader } from '../../models/user-trader';
import { ChatService } from '../../services/chat/chat.service';

@Component({
  selector: 'app-trade-home',
  imports: [TradeCardListComponent, MatExpansionModule, MatButtonModule],
  templateUrl: './trade-home.component.html',
  styleUrl: './trade-home.component.scss',
})
export class TradeHomeComponent implements AfterContentInit {
  users = signal<UserTrader[]>([]);

  constructor(
    private chatService: ChatService,
    private tradeService: TradeService,
    private navigationService: NavigationService
  ) {}

  ngAfterContentInit(): void {
    subscribeOnce(this.tradeService.find(), (users) => this.users.set(users));
  }

  startChat(recipient: UserTrader) {
    this.chatService.initChat(recipient);
    this.navigationService.navigateChat(recipient.id);
  }
}
