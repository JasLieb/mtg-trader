import { CommonModule } from '@angular/common';
import { Component, computed, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
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
  isChatTab: Signal<boolean>;
  isWantlistsTab: Signal<boolean>;
  isDoublesTab: Signal<boolean>;

  constructor(
    private authService: AuthService,
    private navigationService: NavigationService
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
    this.isChatTab = computed(() => this.currentRoute() === Routes.ChatUrl);
  }

  navigateTrade() {
    this.navigationService.navigateTrade();
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
