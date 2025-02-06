import { Component, computed, OnDestroy, OnInit, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './core/services/auth/auth.service';
import { NavigationService } from './core/services/navigation/navigation.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        MatSidenavModule,
        MatListModule,
        MatButtonModule,
        MatIconModule,
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  private unsubscribe = new Subject();

  title = 'MTG Trader';
  currentRoute: Signal<string>;
  isTradeTab: Signal<boolean>;
  isWantlistsTab: Signal<boolean>;
  isDoublesTab: Signal<boolean>;
  isConnected: Signal<boolean>;

  constructor(
    private authService: AuthService,
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
  }

  ngOnInit(): void {
    this.authService.isConnected$
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((isConnected) => {
        if (isConnected) this.resumeNavigation();
        else this.navigateAuth();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next(null);
    this.unsubscribe.complete();
  }

  isSmallScreen(): boolean {
    return window.innerWidth < 480;
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
