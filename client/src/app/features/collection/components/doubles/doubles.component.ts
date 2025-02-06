import { Component, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Wantlist } from '../../models/wantlist';
import { WantlistService } from '../../services/wantlist/wantlist.service';
import { WantlistComponent } from '../wantlist/wantlist.component';

@Component({
    selector: 'app-collection-displayer',
    imports: [WantlistComponent],
    templateUrl: './doubles.component.html',
    styleUrl: './doubles.component.scss'
})
export class DoublesComponent {
  doubles: Signal<Wantlist>;

  constructor(wantlistService: WantlistService) {
    this.doubles = toSignal(wantlistService.doubles$, {
      initialValue: {} as Wantlist,
    });
  }
}
