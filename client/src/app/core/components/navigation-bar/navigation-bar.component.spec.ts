import { ComponentFixture, TestBed } from '@angular/core/testing';

import { of } from 'rxjs';
import { Routes } from '../../models/routesEnum';
import { AuthService } from '../../services/auth/auth.service';
import { NavigationService } from '../../services/navigation/navigation.service';
import { NavigationBarComponent } from './navigation-bar.component';

describe('NavigationBarComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let navService: jasmine.SpyObj<NavigationService>;
  let component: NavigationBarComponent;
  let fixture: ComponentFixture<NavigationBarComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('NavigationService', ['disconnect']);
    const navSpy = jasmine.createSpyObj('NavigationService', [
      'resumeLastRoute',
      'navigateAuth',
      'navigateTrade',
      'navigateWantlists',
      'navigateDoubles',
      'navigateChat',
    ]);
    await TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: NavigationService, useValue: navSpy },
      ],
      imports: [NavigationBarComponent],
    }).compileComponents();
  });

  function initFixture(currentRoute?: string) {
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    authService.connectedUserToken$ = of('usr-token');

    navService = TestBed.inject(
      NavigationService
    ) as jasmine.SpyObj<NavigationService>;
    navService.currentRoute$ = of(currentRoute ?? '');

    fixture = TestBed.createComponent(NavigationBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should be created', () => {
    initFixture();

    expect(component).toBeTruthy();
  });

  it('should navigate to Wantlists when My collection wantlists item is clicked', () => {
    initFixture();

    component.navigateWantlists();

    expect(navService.navigateWantlists).toHaveBeenCalled();
  });

  it('should navigate to Trade when Trade nav item is clicked', () => {
    initFixture();

    component.navigateTrade();

    expect(navService.navigateTrade).toHaveBeenCalled();
  });

  it('should navigate to chat home component when Chat tab is clicked', () => {
    initFixture();

    component.navigateChat();

    expect(navService.navigateChat).toHaveBeenCalled();
  });

  it('should have wantlist underlined when is wantlists url', () => {
    initFixture(Routes.WantlistsUrl);

    expect(component.isWantlistsTab()).toBeTrue();
  });

  it('should have doubles underlined when is doubles url', () => {
    initFixture(Routes.DoublesUrl);

    expect(fixture.componentInstance.isDoublesTab()).toBeTrue();
  });

  it('should have trade underlined when is trade url', () => {
    initFixture(Routes.TradeUrl);

    expect(fixture.componentInstance.isTradeTab()).toBeTrue();
  });

  it('should have chat underlined when is chat url', () => {
    initFixture(Routes.ChatUrl);

    expect(fixture.componentInstance.isChatTab()).toBeTrue();
  });

  it('should disconnect user when disconnect button is clicked', () => {
    initFixture();

    component.disconnectUser();

    expect(authService.disconnect).toHaveBeenCalled();
  });
});
