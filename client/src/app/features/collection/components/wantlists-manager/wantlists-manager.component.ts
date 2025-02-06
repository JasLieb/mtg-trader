import { Component, Signal } from '@angular/core';
import { Wantlist } from '../../models/wantlist';
import { WantlistService } from '../../services/wantlist/wantlist.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { WantlistComponent } from '../wantlist/wantlist.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
    selector: 'app-wantlists-manager',
    imports: [
        WantlistComponent,
        ReactiveFormsModule,
        MatInputModule,
        MatButtonModule,
        MatExpansionModule,
    ],
    templateUrl: './wantlists-manager.component.html',
    styleUrl: './wantlists-manager.component.scss'
})
export class WantlistsManagerComponent {
  wantlists: Signal<Wantlist[]>;

  wantlistNameControl: FormControl;

  constructor(private wantlistService: WantlistService) {
    this.wantlistNameControl = new FormControl('');
    this.wantlists = toSignal(wantlistService.wantlists$, { initialValue: [] });
  }

  addWantlist() {
    if (
      this.wantlistNameControl.value &&
      this.wantlistNameControl.value.length > 0
    ) {
      this.wantlistService.create(this.wantlistNameControl.value);
    }
  }

  deleteWantlist(wantlistId: string) {
    this.wantlistService.delete(wantlistId);
  }
}
