import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from './core/services/auth/auth.service';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NavigationService } from './core/services/navigation/navigation.service';

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
    ]);

    await TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: NavigationService, useValue: navSpy },
      ],
      imports: [AppComponent, HttpClientTestingModule, NoopAnimationsModule],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    navService = TestBed.inject(
      NavigationService
    ) as jasmine.SpyObj<NavigationService>;
  });

  it('should create the app', () => {
    authService.isConnected$ = of(true);
    navService.currentRoute$ = of('');
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'MTG Trader' title`, () => {
    authService.isConnected$ = of(true);
    navService.currentRoute$ = of('');
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('MTG Trader');
  });

  it('should have nav bar when user is connected', () => {
    authService.isConnected$ = of(true);
    navService.currentRoute$ = of('');
    const fixture = TestBed.createComponent(AppComponent);

    fixture.detectChanges();

    const nav = fixture.nativeElement.querySelector('.app-nav-bar');
    expect(nav).toBeTruthy();

    const navElements = fixture.nativeElement.querySelectorAll('.app-nav-item');
    expect(navElements.length).toBe(3);
    expect(navElements[0].innerText).toBe('Wantlists');
    expect(navElements[1].innerText).toBe('Doubles');
    expect(navElements[2].innerText).toBe('Trade');
  });

  it('should resume navigation when user is connected', () => {
    authService.isConnected$ = of(true);
    navService.currentRoute$ = of('');
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(navService.resumeLastRoute).toHaveBeenCalled();
  });

  it('should navigate to Wantlists when My collection wantlists item is clicked', () => {
    authService.isConnected$ = of(true);
    navService.currentRoute$ = of('');
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    navService.currentRoute$ = of(navService.wantlistsUrl);
    fixture.nativeElement.querySelectorAll('.app-nav-item')[0].click();

    fixture.detectChanges();

    expect(navService.navigateWantlists).toHaveBeenCalled();
  });

  it('should navigate to Trade when Trade nav item is clicked', () => {
    authService.isConnected$ = of(true);
    navService.currentRoute$ = of('');
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    fixture.nativeElement.querySelectorAll('.app-nav-item')[2].click();

    expect(navService.navigateTrade).toHaveBeenCalled();
  });

  it('should navigate to user home component when user is not connected', () => {
    navService.currentRoute$ = of('');
    authService.isConnected$ = of(false);
    const fixture = TestBed.createComponent(AppComponent);

    fixture.detectChanges();

    expect(navService.navigateAuth).toHaveBeenCalled();
  });

  it('should have wantlist underlined when is wantlists url', () => {
    navService.currentRoute$ = of(navService.wantlistsUrl);
    authService.isConnected$ = of(true);
    const fixture = TestBed.createComponent(AppComponent);

    fixture.detectChanges();

    const wantlistItem = fixture.nativeElement.querySelector('.app-a-selected');

    expect(fixture.componentInstance.isWantlistsTab()).toBeTrue();
    expect(wantlistItem.innerText).toBe('Wantlists');
  });

  it('should have doubles underlined when is doubles url', () => {
    authService.isConnected$ = of(true);
    navService.currentRoute$ = of(navService.doublesUrl);
    const fixture = TestBed.createComponent(AppComponent);

    fixture.detectChanges();

    expect(fixture.componentInstance.isDoublesTab()).toBeTrue();
  });

  it('should have trade underlined when is trade url', () => {
    navService.currentRoute$ = of(navService.tradeUrl);
    authService.isConnected$ = of(true);
    const fixture = TestBed.createComponent(AppComponent);

    fixture.detectChanges();

    expect(fixture.componentInstance.isTradeTab()).toBeTrue();
  });
});
