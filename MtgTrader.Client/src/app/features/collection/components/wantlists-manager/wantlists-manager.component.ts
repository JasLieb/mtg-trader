import { Component, Signal } from '@angular/core';
import { Wantlist } from '../../models/wantlist';
import { WantlistService } from '../../services/wantlist/wantlist.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { WantlistComponent } from '../wantlist/wantlist.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-wantlists-manager',
  standalone: true,
  imports: [WantlistComponent, ReactiveFormsModule],
  templateUrl: './wantlists-manager.component.html',
  styleUrl: './wantlists-manager.component.scss',
})
export class WantlistsManagerComponent {
  wantlists: Signal<Wantlist[]>;

  wantlistNameControl: FormControl;

  constructor(private wantlistService: WantlistService) {
    this.wantlistNameControl = new FormControl('');
    this.wantlists = toSignal(wantlistService.wantlists$, { initialValue: [] });
  }

  addWantlist() {
    this.wantlistService.create(this.wantlistNameControl.value);
  }
}
