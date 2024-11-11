import { Component, signal, Signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './core/services/auth/auth.service';

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
  isTradeTab: WritableSignal<boolean>;
  isWantlists: WritableSignal<boolean>;
  isDoubles: WritableSignal<boolean>;
  isConnected: Signal<boolean>;

  constructor(authService: AuthService, private router: Router) {
    this.isConnected = toSignal(authService.isConnected$, {
      initialValue: false,
    });
    this.isWantlists = signal(false);
    this.isDoubles = signal(false);
    this.isTradeTab = signal(false);

    authService.isConnected$.subscribe((isConnected) => {
      if (isConnected) this.navigateWantlists();
      else this.navigateAuth();
    });
  }

  private navigateAuth() {
    this.router.navigate(['/auth']);
    this.isTradeTab.set(false);
    this.isWantlists.set(false);
    this.isDoubles.set(false);
  }

  navigateMyCollection() {
    this.router.navigate(['/collection']).then(() => {
      this.isWantlists.set(false);
      this.isDoubles.set(false);
      this.isTradeTab.set(false);
    });
  }

  navigateTrade() {
    this.router.navigate(['/trade']).then(() => {
      this.isWantlists.set(false);
      this.isDoubles.set(false);
      this.isTradeTab.set(true);
    });
  }

  navigateWantlists() {
    this.router.navigate(['/wantlists']).then(() => {
      this.isTradeTab.set(false);
      this.isDoubles.set(false);
      this.isWantlists.set(true);
    });
  }

  navigateDoubles() {
    this.router.navigate(['/doubles']).then(() => {
      this.isTradeTab.set(false);
      this.isWantlists.set(false);
      this.isDoubles.set(true);
    });
  }
}
