import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WantlistComponent } from "./features/collection/components/wantlist/wantlist.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, WantlistComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'MTG Trader';
}
