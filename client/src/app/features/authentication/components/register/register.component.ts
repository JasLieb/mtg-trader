import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { subscribeOnce } from '../../../../core/utils/subscribeExtensions';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
    selector: 'app-register',
    imports: [ReactiveFormsModule, FormsModule, MatInputModule, MatButtonModule],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.form = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  register() {
    const val = this.form.value;

    if (val.email) {
      this.authService.register(val.email, val.password);
    }
  }
}
