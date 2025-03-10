import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseAuthComponent } from './base-auth.component';
import { delay, of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('BaseAuthComponent', () => {
  const mockSnackbarMock = jasmine.createSpyObj(['open']);
  let component: BaseAuthComponent;
  let fixture: ComponentFixture<BaseAuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{ provide: MatSnackBar, useValue: mockSnackbarMock }],
      imports: [BaseAuthComponent, NoopAnimationsModule, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(BaseAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have isLoading true when handle submit ongoing', () => {
    component.handleSubmit(of({ usrToken: 'token' }).pipe(delay(100)), '');

    expect(component.isLoading()).toBeTrue();
  });

  it('should have isLoading false when handle submit over', () => {
    component.handleSubmit(of({ usrToken: 'token' }), '');

    expect(component.isLoading()).toBeFalse();
  });

  it('should have isLoading false when handle submit error', () => {
    component.handleSubmit(throwError(() => new Error('error')), '');

    expect(component.isLoading()).toBeFalse();
  });

  it('should display snackbar when handle submit error', () => {
    component.handleSubmit(throwError(() => new Error('error')), 'An error occurred');

    expect(mockSnackbarMock.open).toHaveBeenCalledWith('An error occurred', 'Close');
  });
});
