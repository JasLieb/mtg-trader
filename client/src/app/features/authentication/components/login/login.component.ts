import { Component } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { BaseAuthComponent } from '../base-auth/base-auth.component';
import { subscribeOnce } from '../../../../core/utils/subscribeExtensions';
import { delay } from 'rxjs';
import { LoaderComponent } from "../../../common/components/loader/loader.component";

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatButtonModule, FormsModule, MatInputModule, LoaderComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent extends BaseAuthComponent {
  constructor(fb: FormBuilder, private authService: AuthService) {
    super(
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
        this.authService.login(val.email, val.password)
      );
    }
  }
}
