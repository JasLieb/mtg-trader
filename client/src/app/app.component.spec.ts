import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from './core/services/auth/auth.service';
import { of } from 'rxjs';
import { Router, RouterModule } from '@angular/router';

describe('AppComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy }
      ],
      imports: [
        AppComponent,
        HttpClientTestingModule,
        RouterModule.forRoot([]),
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
  });

  it('should create the app', () => {
    authService.isConnected$ = of(true);
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'MTG Trader' title`, () => {
    authService.isConnected$ = of(true);
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('MTG Trader');
  });

  it('should have nav bar when user is connected', () => {
    authService.isConnected$ = of(true);
    const fixture = TestBed.createComponent(AppComponent);

    fixture.detectChanges();

    const nav = fixture.nativeElement.querySelector('.app-nav-bar');
    expect(nav).toBeTruthy();

    const navElements = fixture.nativeElement.querySelectorAll('.app-nav-item');
    expect(navElements.length).toBe(2);
    expect(navElements[0].innerText).toBe('My collection');
    expect(navElements[1].innerText).toBe('Trade');
  });

  it('should navigate to MyCollection displayer when user is connected', () => {
    authService.isConnected$ = of(true);
    const fixture = TestBed.createComponent(AppComponent);

    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/collection']);
  });

  it('should navigate to MyCollection displayer when My collection item is clicked', () => {
    authService.isConnected$ = of(true);
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    fixture.nativeElement.querySelectorAll('.app-nav-item')[0].click();
    expect(router.navigate).toHaveBeenCalledTimes(2);
    expect(router.navigate).toHaveBeenCalledWith(['/collection']);
  });

  it('should navigate to Trade when Trade nav item is clicked', () => {
    authService.isConnected$ = of(true);
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    fixture.nativeElement.querySelectorAll('.app-nav-item')[1].click();
    expect(router.navigate).toHaveBeenCalledWith(['/trade']);
  });


  it('should navigate to user home component when user is not connected', () => {
    authService.isConnected$ = of(false);
    const fixture = TestBed.createComponent(AppComponent);

    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/auth']);
  });

});
