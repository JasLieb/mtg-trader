import { DatePipe } from '@angular/common';
import { Component, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { TradeProposal } from '../../models/trade-proposal';
import { EuroTotalPipe } from '../../pipes/euro-total.pipe';
import { TradeProposalService } from '../../services/trade-proposal/trade-proposal.service';
import { TradeCardListComponent } from '../trade-card-list/trade-card-list.component';

@Component({
  selector: 'app-proposals-home',
  imports: [DatePipe, EuroTotalPipe, MatCardModule, TradeCardListComponent],
  templateUrl: './proposals-home.component.html',
  styleUrl: './proposals-home.component.scss',
})
export class ProposalsHomeComponent {
  proposals: Signal<TradeProposal[]>;

  constructor(tradeProposalService: TradeProposalService) {
    this.proposals = toSignal(tradeProposalService.proposals$, {
      initialValue: [],
    });
    tradeProposalService.refresh();
  }
}
