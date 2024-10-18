import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from './features/authentication/services/auth/auth.service';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    await TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authSpy }],
      imports: [AppComponent, HttpClientTestingModule],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
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

  it('should have collection displayer', () => {
    authService.isConnected$ = of(true);
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const collection = fixture.nativeElement.querySelector(
      'app-collection-displayer'
    );
    expect(collection).toBeTruthy();
  });

  it('should display login component when user is not connected', () => {
    authService.isConnected$ = of(false);
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const login = fixture.nativeElement.querySelector('app-login');
    expect(login).toBeTruthy();
  });
});
