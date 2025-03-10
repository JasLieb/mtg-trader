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
import { LoaderComponent } from "../../../common/components/loader/loader.component";

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, FormsModule, MatInputModule, MatButtonModule, LoaderComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent extends BaseAuthComponent {
  constructor(fb: FormBuilder, private authService: AuthService) {
    super(
      fb.group({
        email: ['', Validators.required],
        password: ['', Validators.required],
      })
    );
  }

  register() {
    const val = this.form.value;

    if (val.email !== '') {
      this.handleSubmit(
        this.authService.register(val.email, val.password)
      );
    }
  }
}
