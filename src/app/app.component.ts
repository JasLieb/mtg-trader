import { Component, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { WantlistComponent } from "./features/collection/components/wantlist/wantlist.component";
import { WantlistService } from './features/collection/services/wantlist/wantlist.service';
import { Wantlist } from './features/collection/models/wantlist';
import { CollectionDisplayerComponent } from "./features/collection/components/collection-displayer/collection-displayer.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, WantlistComponent, CollectionDisplayerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'MTG Trader';
}
