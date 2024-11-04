import { Routes } from '@angular/router';
import { WantlistsManagerComponent } from './features/collection/components/wantlists-manager/wantlists-manager.component';
import { UserHomeComponent } from './features/authentication/components/user-home/user-home.component';
import { TradeHomeComponent } from './features/trade/components/trade-home/trade-home.component';

export const routes: Routes = [
  { path: 'auth', component: UserHomeComponent },
  { path: 'trade', component: TradeHomeComponent },
  { path: 'wantlists', component: WantlistsManagerComponent }
];
