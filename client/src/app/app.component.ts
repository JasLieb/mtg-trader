import { Component, signal, Signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'MTG Trader';
  isCollectionTab: WritableSignal<boolean>;
  isTradeTab: WritableSignal<boolean>;
  isConnected: Signal<boolean>;

  constructor(authService: AuthService, private router: Router) {
    this.isConnected = toSignal(authService.isConnected$, {
      initialValue: false,
    });
    this.isCollectionTab = signal(false);
    this.isTradeTab = signal(false);

    authService.isConnected$.subscribe((isConnected) => {
      if (isConnected) this.navigateMyCollection();
      else this.navigateAuth();
    });
  }

  private navigateAuth() {
    this.router.navigate(['/auth']);
    this.isCollectionTab.set(false);
    this.isTradeTab.set(false);
  }

  navigateMyCollection() {
    this.router.navigate(['/collection']).then(() => {
      this.isCollectionTab.set(true);
      this.isTradeTab.set(false);
    });
  }

  navigateTrade() {
    this.router.navigate(['/trade']).then(() => {
      this.isCollectionTab.set(false);
      this.isTradeTab.set(true);
    });
  }

}
