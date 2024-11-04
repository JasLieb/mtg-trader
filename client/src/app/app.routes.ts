import { Routes } from '@angular/router';
import { UserHomeComponent } from './features/authentication/components/user-home/user-home.component';
import { TradeHomeComponent } from './features/trade/components/trade-home/trade-home.component';
import { CollectionDisplayerComponent } from './features/collection/components/collection-displayer/collection-displayer.component';

export const routes: Routes = [
  { path: 'auth', component: UserHomeComponent },
  { path: 'trade', component: TradeHomeComponent },
  { path: 'collection', component: CollectionDisplayerComponent }
];
