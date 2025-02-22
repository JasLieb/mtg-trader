import { Routes } from '@angular/router';
import { UserHomeComponent } from './features/authentication/components/user-home/user-home.component';
import { TradeHomeComponent } from './features/trade/components/trade-home/trade-home.component';
import { DoublesComponent } from './features/collection/components/doubles/doubles.component';
import { WantlistsManagerComponent } from './features/collection/components/wantlists-manager/wantlists-manager.component';
import { ChatHomeComponent } from './features/trade/components/chat-home/chat-home.component';

export const routes: Routes = [
  { path: 'auth', component: UserHomeComponent },
  { path: 'trade', component: TradeHomeComponent },
  { path: 'wantlists', component: WantlistsManagerComponent },
  { path: 'doubles', component: DoublesComponent },
  { path: 'chat', component: ChatHomeComponent },
  { path: 'chat/:recipientId', component: ChatHomeComponent },
];
