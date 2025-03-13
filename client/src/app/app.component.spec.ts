import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthService } from './core/services/auth/auth.service';
import { NavigationService } from './core/services/navigation/navigation.service';

describe('AppComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let navService: jasmine.SpyObj<NavigationService>;
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
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
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      imports: [AppComponent, NoopAnimationsModule],
    }).compileComponents();
  });

  function initFixture(usrToken?: string, currentRoute?: string) {
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    authService.connectedUserToken$ = of(usrToken ?? '');

    navService = TestBed.inject(
      NavigationService
    ) as jasmine.SpyObj<NavigationService>;
    navService.currentRoute$ = of(currentRoute ?? '');

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create the app', () => {
    initFixture('usr-token');

    expect(component).toBeTruthy();
  });

  it(`should have the 'MTG Trader' title`, () => {
    initFixture('usr-token');

    expect(component.title).toEqual('MTG Trader');
  });

  it('should have nav bar when user is connected', () => {
    initFixture('usr-token');

    expect(component.isConnected()).toBeTrue();
  });

  it('should resume navigation when user is connected', () => {
    initFixture('usr-token');

    expect(navService.resumeLastRoute).toHaveBeenCalled();
  });

  it('should navigate to user home component when user is not connected', () => {
    initFixture();

    expect(navService.navigateAuth).toHaveBeenCalled();
  });
});
