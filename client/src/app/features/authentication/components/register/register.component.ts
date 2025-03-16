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
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    LoaderComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent extends BaseAuthComponent {
  constructor(fb: FormBuilder, private authService: AuthService) {
    super();
    this.initForm(
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
        this.authService.register(val.email, val.password),
        'Unable to register'
      );
    }
  }
}
