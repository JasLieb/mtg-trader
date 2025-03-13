import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { NavigationBarComponent } from './core/components/navigation-bar/navigation-bar.component';
import { AuthService } from './core/services/auth/auth.service';
import { NavigationService } from './core/services/navigation/navigation.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    NavigationBarComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  private unsubscribe = new Subject();

  today = new Date();
  title = 'MTG Trader';
  isConnected: Signal<boolean>;

  constructor(
    private authService: AuthService,
    private navigationService: NavigationService
  ) {
    this.isConnected = toSignal(
      this.getIsConnectedStream(authService.connectedUserToken$),
      {
        initialValue: false,
      }
    );
  }

  ngOnInit(): void {
    this.authService.connectedUserToken$
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

  private getIsConnectedStream(
    connectedUser$: Observable<string>
  ): Observable<boolean> {
    return connectedUser$.pipe(
      map((connectedUser) => !!connectedUser && connectedUser.length > 0)
    );
  }
}
