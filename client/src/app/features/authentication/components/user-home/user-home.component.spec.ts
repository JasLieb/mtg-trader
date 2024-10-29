import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserHomeComponent } from './user-home.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('UserHomeComponent', () => {
  let component: UserHomeComponent;
  let fixture: ComponentFixture<UserHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserHomeComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display login component when following tab is selected', () => {
    const tab = fixture.nativeElement.querySelectorAll('.user-home-tab')[0];
    expect(tab).toBeTruthy();

    tab.click();
    fixture.detectChanges();

    const register = fixture.nativeElement.querySelector('app-login');
    expect(register).toBeTruthy();
  });

  it('should display register component when following tab is selected', () => {
    const tab = fixture.nativeElement.querySelectorAll('.user-home-tab')[1];
    expect(tab).toBeTruthy();

    tab.click();
    fixture.detectChanges();

    const register = fixture.nativeElement.querySelector('app-register');
    expect(register).toBeTruthy();
  });
});
