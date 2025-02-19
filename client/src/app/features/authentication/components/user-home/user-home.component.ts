import { Component, signal } from '@angular/core';
import { LoginComponent } from "../login/login.component";
import { RegisterComponent } from "../register/register.component";
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [LoginComponent, RegisterComponent, MatTabsModule],
  templateUrl: './user-home.component.html',
  styleUrl: './user-home.component.scss'
})
export class UserHomeComponent {
}
