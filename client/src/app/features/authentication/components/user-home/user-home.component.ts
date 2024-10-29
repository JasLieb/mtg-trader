import { Component, signal } from '@angular/core';
import { LoginComponent } from "../login/login.component";
import { RegisterComponent } from "../register/register.component";

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [LoginComponent, RegisterComponent],
  templateUrl: './user-home.component.html',
  styleUrl: './user-home.component.scss'
})
export class UserHomeComponent {
  isLoginMode = signal(true);

  showLogin() {
    this.isLoginMode.set(true);
  }

  showRegister() {
    this.isLoginMode.set(false);
  }
}
