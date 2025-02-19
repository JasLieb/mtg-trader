import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  authUrl = '/auth';
  doublesUrl = '/doubles';
  tradeUrl = '/trade';
  wantlistsUrl = '/wantlists';

  private currentRouteBehavior = new Subject<string>();
  currentRoute$ = this.currentRouteBehavior.asObservable();

  constructor(private router: Router) {}

  navigateAuth() {
    this.navigate(this.authUrl, false);
  }

  navigateTrade() {
    this.navigate(this.tradeUrl);
  }

  navigateWantlists() {
    this.navigate(this.wantlistsUrl);
  }

  navigateDoubles() {
    this.navigate(this.doublesUrl);
  }

  resumeLastRoute() {
    const lastRoute = window.localStorage.getItem('last-route');
    this.navigate(
      lastRoute && lastRoute !== '' ? lastRoute : this.wantlistsUrl
    );
  }

  private navigate(route: string, shouldSave = true) {
    this.router.navigate([route]).then(() => {
      if(shouldSave) {
        window.localStorage.setItem(
          'last-route',
          route
        );
      }
      this.currentRouteBehavior.next(route);
    });
  }
}
