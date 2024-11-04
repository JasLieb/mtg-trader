import { Component, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'MTG Trader';
  isConnected: Signal<boolean>;

  constructor(authService: AuthService, private router: Router) {
    this.isConnected = toSignal(authService.isConnected$, {
      initialValue: false,
    });
    authService.isConnected$.subscribe((isConnected) => {
      if (isConnected) this.navigateMyCollection();
      else router.navigate(['/auth']);
    });
  }

  navigateMyCollection() {
    this.router.navigate(['/collection']);
  }

  navigateTrade() {
    this.router.navigate(['/trade']);
  }
}
