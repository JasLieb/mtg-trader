import { Component } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { LoaderComponent } from '../../../common/components/loader/loader.component';
import { BaseAuthComponent } from '../base-auth/base-auth.component';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    FormsModule,
    MatInputModule,
    LoaderComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent extends BaseAuthComponent {
  constructor(fb: FormBuilder, private authService: AuthService) {
    super();
    this.initForm(
      fb.group({
        email: ['', Validators.required],
        password: ['', Validators.required],
      })
    );
  }

  login() {
    const val = this.form.value;

    if (val.email !== '') {
      this.handleSubmit(
        this.authService.login(val.email, val.password),
        'Unable to login, check your credentials and try again!'
      );
    }
  }
}
