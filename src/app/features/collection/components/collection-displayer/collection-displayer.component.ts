import { Component, signal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Wantlist } from '../../models/wantlist';
import { WantlistService } from '../../services/wantlist/wantlist.service';
import { WantlistComponent } from "../wantlist/wantlist.component";

@Component({
  selector: 'app-collection-displayer',
  standalone: true,
  imports: [WantlistComponent],
  templateUrl: './collection-displayer.component.html',
  styleUrl: './collection-displayer.component.scss'
})
export class CollectionDisplayerComponent {
  areWantlistsDisplayed = signal(true);
  wantlists: Signal<Wantlist[]>;
  doubles: Signal<Wantlist>;

  constructor(wantlistService: WantlistService) {
    this.wantlists = toSignal(wantlistService.wantlists$, {initialValue: []});
    this.doubles = toSignal(wantlistService.doubles$, {initialValue: {} as Wantlist});
  }

  showWantlists() {
    this.areWantlistsDisplayed.set(true);
  }

  showDoubles() {
    this.areWantlistsDisplayed.set(false);
  }
}
