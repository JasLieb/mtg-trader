import { CommonModule } from '@angular/common';
import { Component, computed, Signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { filter } from 'rxjs';
import { TradeProposalService } from '../../../features/trade/services/trade-proposal/trade-proposal.service';
import { Routes } from '../../models/routesEnum';
import { AuthService } from '../../services/auth/auth.service';
import { NavigationService } from '../../services/navigation/navigation.service';

@Component({
  selector: 'app-navigation-bar',
  imports: [CommonModule, MatListModule, MatButtonModule],
  templateUrl: './navigation-bar.component.html',
  styleUrl: './navigation-bar.component.scss',
})
export class NavigationBarComponent {
  currentRoute: Signal<string>;
  isTradeTab: Signal<boolean>;
  isProposalsTab: Signal<boolean>;
  isChatTab: Signal<boolean>;
  isWantlistsTab: Signal<boolean>;
  isDoublesTab: Signal<boolean>;
  pendingReceivedProposals: Signal<number>;

  constructor(
    private authService: AuthService,
    private navigationService: NavigationService,
    tradeProposalService: TradeProposalService
  ) {
    this.currentRoute = toSignal(navigationService.currentRoute$, {
      initialValue: '',
    });
    this.isWantlistsTab = computed(
      () => this.currentRoute() === Routes.WantlistsUrl
    );
    this.isDoublesTab = computed(
      () => this.currentRoute() === Routes.DoublesUrl
    );
    this.isTradeTab = computed(() => this.currentRoute() === Routes.TradeUrl);
    this.isProposalsTab = computed(
      () => this.currentRoute() === Routes.ProposalsUrl
    );
    this.isChatTab = computed(() => this.currentRoute() === Routes.ChatUrl);

    this.pendingReceivedProposals = toSignal(
      tradeProposalService.pendingReceivedCount$,
      { initialValue: 0 }
    );
    // No real time: the count is reloaded on every navigation, including the one that
    // resumes the last route when the app loads. The auth route means nobody is connected.
    navigationService.currentRoute$
      .pipe(
        filter((route) => route !== Routes.AuthUrl),
        takeUntilDestroyed()
      )
      .subscribe(() => tradeProposalService.refreshPendingReceivedCount());
  }

  navigateTrade() {
    this.navigationService.navigateTrade();
  }

  navigateProposals() {
    this.navigationService.navigateProposals();
  }

  navigateWantlists() {
    this.navigationService.navigateWantlists();
  }

  navigateDoubles() {
    this.navigationService.navigateDoubles();
  }

  navigateChat() {
    this.navigationService.navigateChat();
  }

  disconnectUser() {
    this.authService.disconnect();
  }
}
