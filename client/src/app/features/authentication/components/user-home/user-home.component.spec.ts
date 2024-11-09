import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserHomeComponent } from './user-home.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

describe('UserHomeComponent', () => {
  let component: UserHomeComponent;
  let fixture: ComponentFixture<UserHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UserHomeComponent,
        HttpClientTestingModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display login component when following tab is selected', (done) => {
    fixture.whenStable().then(() => {
      const tab = fixture.nativeElement.querySelectorAll('button')[0];
      expect(tab).toBeTruthy();

      tab.click();
      fixture.detectChanges();

      const register = fixture.nativeElement.querySelector('app-login');
      expect(register).toBeTruthy();
      done();
    });
  });

  it('should display register component when following tab is selected', (done) => {
    fixture.whenStable().then(() => {
      const tab = fixture.nativeElement.querySelectorAll('button')[1];
      expect(tab).toBeTruthy();

      tab.click();
      fixture.detectChanges();

      const register = fixture.debugElement.queryAll(By.css('app-register'));
      expect(register).toBeTruthy();
      done();
    });
  });
});
