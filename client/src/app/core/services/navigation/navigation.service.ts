import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Routes } from '../../models/routesEnum';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private currentRouteBehavior = new Subject<string>();
  currentRoute$ = this.currentRouteBehavior.asObservable();

  constructor(private router: Router) {}

  navigateAuth() {
    this.navigate(Routes.AuthUrl, false);
  }

  navigateTrade() {
    this.navigate(Routes.TradeUrl);
  }

  navigateWantlists() {
    this.navigate(Routes.WantlistsUrl);
  }

  navigateDoubles() {
    this.navigate(Routes.DoublesUrl);
  }

  navigateChat(recipientId?: string) {
    if (recipientId) {
      this.router.navigate([Routes.ChatUrl, recipientId]).then(() => {
        this.onNavigationSuccess(Routes.ChatUrl, true);
      });
      return;
    }
    this.navigate(Routes.ChatUrl);
  }

  resumeLastRoute() {
    const lastRoute = window.localStorage.getItem('last-route');
    this.navigate(
      lastRoute && lastRoute !== '' ? lastRoute : Routes.WantlistsUrl
    );
  }

  private navigate(route: string, shouldSave = true) {
    this.router.navigate([route]).then(() => {
      this.onNavigationSuccess(route, shouldSave);
    });
  }

  private onNavigationSuccess(route: string, shouldSave: boolean) {
    if (shouldSave) {
      window.localStorage.setItem('last-route', route);
    }
    this.currentRouteBehavior.next(route);
  }
}
