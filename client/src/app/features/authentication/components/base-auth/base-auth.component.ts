import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { AuthResponse } from '../../../../core/models/auth-response';
import { subscribeOnce } from '../../../../core/utils/subscribeExtensions';

@Component({
  selector: 'app-base-auth',
  imports: [FormsModule],
  templateUrl: './base-auth.component.html',
  styleUrl: './base-auth.component.scss',
})
export class BaseAuthComponent implements OnInit {
  private _snackBar = inject(MatSnackBar);
  form: FormGroup = new FormGroup({});
  isLoading = signal(false);

  constructor() {}

  ngOnInit(): void {
    this.isLoading.set(false);
  }

  handleSubmit(request: Observable<AuthResponse>, errorMessage: string) {
    this._snackBar.dismiss();
    this.isLoading.set(true);
    subscribeOnce(
      request,
      () => {
        this.isLoading.set(false);
      },
      () => {
        this.isLoading.set(false);
        this._snackBar.open(errorMessage, 'Close', { duration: 5000 });
      }
    );
  }

  protected initForm(formGroup: FormGroup) {
    this.form = formGroup;
  }
}
