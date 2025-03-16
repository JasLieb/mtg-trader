import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { delay, Observable, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['register']);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
        provideHttpClientTesting(),
      ],
      imports: [RegisterComponent, NoopAnimationsModule],
    });
  });

  function initFixture(fakeCall: () => Observable<any>) {
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    authService.register.and.callFake(fakeCall);

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    initFixture(() => of({ usrToken: 'token' }));

    expect(component).toBeTruthy();
  });

  it('should have register form', () => {
    initFixture(() => of({ usrToken: 'token' }));

    const inputs = fixture.nativeElement.querySelectorAll('input');
    expect(inputs.length).toBe(2);
    expect(inputs[0].name).toBe('email');
    expect(inputs[1].name).toBe('password');
  });

  it('should try register when register button is clicked', () => {
    initFixture(() => of({ usrToken: 'token' }));
    component.form.controls['email'].setValue('xyz@test.com');
    component.form.controls['password'].setValue('123456');

    const registerButton = fixture.nativeElement.querySelector('button');
    registerButton.click();

    expect(authService.register.calls.count()).toBe(1);
  });

  it('should have visible loader when register button is clicked', () => {
    initFixture(() => of({ usrToken: 'token' }).pipe(delay(100)));
    component.form.controls['email'].setValue('xyz@test.com');
    component.form.controls['password'].setValue('123456');

    component.register();

    expect(component.isLoading()).toBeTrue();
  });
});
