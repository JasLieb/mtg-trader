import { Component, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { WantlistComponent } from './features/collection/components/wantlist/wantlist.component';
import { CollectionDisplayerComponent } from './features/collection/components/collection-displayer/collection-displayer.component';
import { AuthService } from './core/services/auth/auth.service';
import { UserHomeComponent } from "./features/authentication/components/user-home/user-home.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    WantlistComponent,
    CollectionDisplayerComponent,
    UserHomeComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'MTG Trader';
  isConnected: Signal<boolean>;

  constructor(private authService: AuthService) {
    this.isConnected = toSignal(authService.isConnected$, {
      initialValue: false,
    });
  }
}
