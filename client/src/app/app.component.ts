import { Component, computed, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './core/services/auth/auth.service';
import { NavigationService } from './core/services/navigation/navigation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'MTG Trader';
  currentRoute: Signal<string>;
  isTradeTab: Signal<boolean>;
  isWantlistsTab: Signal<boolean>;
  isDoublesTab: Signal<boolean>;
  isConnected: Signal<boolean>;

  constructor(
    authService: AuthService,
    private navigationService: NavigationService
  ) {
    this.isConnected = toSignal(authService.isConnected$, {
      initialValue: false,
    });
    this.currentRoute = toSignal(navigationService.currentRoute$, {
      initialValue: '',
    });
    this.isWantlistsTab = computed(
      () => this.currentRoute() === navigationService.wantlistsUrl
    );
    this.isDoublesTab = computed(
      () => this.currentRoute() === navigationService.doublesUrl
    );
    this.isTradeTab = computed(
      () => this.currentRoute() === navigationService.tradeUrl
    );

    authService.isConnected$.subscribe((isConnected) => {
      if (isConnected) this.resumeNavigation();
      else this.navigateAuth();
    });
  }

  private navigateAuth() {
    this.navigationService.navigateAuth();
  }

  private resumeNavigation() {
    this.navigationService.resumeLastRoute();
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
}
