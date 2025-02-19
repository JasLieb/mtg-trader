import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserHomeComponent } from './user-home.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

describe('UserHomeComponent', () => {
  let component: UserHomeComponent;
  let fixture: ComponentFixture<UserHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
      imports: [UserHomeComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(UserHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have login tab visible', () => {
    const loginTab = fixture.nativeElement.querySelector('app-login');
    expect(loginTab).toBeTruthy();
    const registerTab = fixture.nativeElement.querySelector('app-register');
    expect(registerTab).toBeNull();
  });
});
