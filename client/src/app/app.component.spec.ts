import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NavigationService } from './core/services/navigation/navigation.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './core/services/auth/auth.service';

describe('AppComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let navService: jasmine.SpyObj<NavigationService>;

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
        provideHttpClientTesting()
      ],
      imports: [AppComponent, NoopAnimationsModule],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    navService = TestBed.inject(
      NavigationService
    ) as jasmine.SpyObj<NavigationService>;
  });

  it('should create the app', () => {
    authService.connectedUserToken$ = of('usr-token');
    navService.currentRoute$ = of('');
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'MTG Trader' title`, () => {
    authService.connectedUserToken$ = of('usr-token');
    navService.currentRoute$ = of('');
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('MTG Trader');
  });

  it('should have nav bar when user is connected', () => {
    authService.connectedUserToken$ = of('usr-token');
    navService.currentRoute$ = of('');
    const fixture = TestBed.createComponent(AppComponent);

    fixture.detectChanges();

    const nav = fixture.nativeElement.querySelector('.app-nav-bar');
    expect(nav).toBeTruthy();

    const navElements = fixture.nativeElement.querySelectorAll('.app-nav-item');
    expect(navElements.length).toBe(4);
    expect(navElements[0].innerText).toBe('Wantlists');
    expect(navElements[1].innerText).toBe('Doubles');
    expect(navElements[2].innerText).toBe('Trade');
    expect(navElements[3].innerText).toBe('Chat');
  });

  it('should resume navigation when user is connected', () => {
    authService.connectedUserToken$ = of('usr-token');
    navService.currentRoute$ = of('');
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(navService.resumeLastRoute).toHaveBeenCalled();
  });

  it('should navigate to Wantlists when My collection wantlists item is clicked', () => {
    authService.connectedUserToken$ = of('usr-token');
    navService.currentRoute$ = of('');
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    navService.currentRoute$ = of(navService.wantlistsUrl);
    fixture.nativeElement.querySelectorAll('.app-nav-item')[0].click();

    fixture.detectChanges();

    expect(navService.navigateWantlists).toHaveBeenCalled();
  });

  it('should navigate to Trade when Trade nav item is clicked', () => {
    authService.connectedUserToken$ = of('usr-token');
    navService.currentRoute$ = of('');
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    fixture.nativeElement.querySelectorAll('.app-nav-item')[2].click();

    expect(navService.navigateTrade).toHaveBeenCalled();
  });

  it('should navigate to chat home component when Chat tab is clicked', () => {
    authService.connectedUserToken$ = of('usr-token');
    navService.currentRoute$ = of('');
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    fixture.nativeElement.querySelectorAll('.app-nav-item')[3].click();

    expect(navService.navigateChat).toHaveBeenCalled();
  });

  it('should navigate to user home component when user is not connected', () => {
    navService.currentRoute$ = of('');
    authService.connectedUserToken$ = of('');
    const fixture = TestBed.createComponent(AppComponent);

    fixture.detectChanges();

    expect(navService.navigateAuth).toHaveBeenCalled();
  });

  it('should have wantlist underlined when is wantlists url', () => {
    navService.currentRoute$ = of(navService.wantlistsUrl);
    authService.connectedUserToken$ = of('usr-token');
    const fixture = TestBed.createComponent(AppComponent);

    fixture.detectChanges();

    const wantlistItem = fixture.nativeElement.querySelector('.app-a-selected');

    expect(fixture.componentInstance.isWantlistsTab()).toBeTrue();
    expect(wantlistItem.innerText).toBe('Wantlists');
  });

  it('should have doubles underlined when is doubles url', () => {
    authService.connectedUserToken$ = of('usr-token');
    navService.currentRoute$ = of(navService.doublesUrl);
    const fixture = TestBed.createComponent(AppComponent);

    fixture.detectChanges();

    expect(fixture.componentInstance.isDoublesTab()).toBeTrue();
  });

  it('should have trade underlined when is trade url', () => {
    navService.currentRoute$ = of(navService.tradeUrl);
    authService.connectedUserToken$ = of('usr-token');
    const fixture = TestBed.createComponent(AppComponent);

    fixture.detectChanges();

    expect(fixture.componentInstance.isTradeTab()).toBeTrue();
  });

  it('should have chat underlined when is chat url', () => {
    navService.currentRoute$ = of(navService.chatUrl);
    authService.connectedUserToken$ = of('usr-token');
    const fixture = TestBed.createComponent(AppComponent);

    fixture.detectChanges();

    expect(fixture.componentInstance.isChatTab()).toBeTrue();
  });
});
