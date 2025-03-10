import { Component, OnInit, signal } from '@angular/core';
import { FormsModule, FormGroup } from '@angular/forms';
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
  form: FormGroup;
  isLoading = signal(false);

  constructor(formGroupModel: FormGroup) {
    this.form = formGroupModel;
  }

  ngOnInit(): void {
    this.isLoading.set(false);
  }

  handleSubmit(request: Observable<AuthResponse>) {
    this.isLoading.set(true);
    subscribeOnce(
      request,
      () => {
        this.isLoading.set(false);
      },
      () => {
        this.isLoading.set(false);
      }
    );
  }
}
