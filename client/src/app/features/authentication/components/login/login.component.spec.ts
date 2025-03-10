import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { delay, Observable, of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    await TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      imports: [LoginComponent, NoopAnimationsModule],
    }).compileComponents();
  });

  function initFixture(fakeCall: () => Observable<any>) {
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    authService.login.and.callFake(fakeCall);

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should be created', () => {
    initFixture(() => of({ usrToken: 'token' }));

    expect(component).toBeTruthy();
  });

  it('should have login form', () => {
    initFixture(() => of({ usrToken: 'token' }));

    const inputs = fixture.nativeElement.querySelectorAll('input');
    expect(inputs.length).toBe(2);
    expect(inputs[0].name).toBe('email');
    expect(inputs[1].name).toBe('password');
  });

  it('should try login when login button is clicked', () => {
    initFixture(() => of({ usrToken: 'token' }));
    component.form.controls['email'].setValue('xyz@test.com');
    component.form.controls['password'].setValue('123456');

    const loginButton = fixture.nativeElement.querySelector('button');
    loginButton.click();

    expect(authService.login.calls.count()).toBe(1);
  });

  it('should have visible loader when login button is clicked', () => {
    initFixture(() => of({ usrToken: 'token' }).pipe(delay(100)));
    component.form.controls['email'].setValue('xyz@test.com');
    component.form.controls['password'].setValue('123456');

    component.login();

    expect(component.isLoading()).toBeTrue();
  });
});
