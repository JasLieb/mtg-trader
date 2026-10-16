import { DatePipe } from '@angular/common';
import { Component, inject, signal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { NavigationService } from '../../../../core/services/navigation/navigation.service';
import { subscribeOnce } from '../../../../core/utils/subscribeExtensions';
import { canRemoveCards } from '../../models/trade-cards-removal';
import { TradeProposal } from '../../models/trade-proposal';
import {
  canAnswer,
  canWithdraw,
  isTrade,
  TradeProposalRefusal,
} from '../../models/trade-proposal-action';
import { EuroTotalPipe } from '../../pipes/euro-total.pipe';
import { ChatService } from '../../services/chat/chat.service';
import { TradeProposalService } from '../../services/trade-proposal/trade-proposal.service';
import { RemoveTradeCardsDialogComponent } from '../remove-trade-cards-dialog/remove-trade-cards-dialog.component';
import { TradeCardListComponent } from '../trade-card-list/trade-card-list.component';

@Component({
  selector: 'app-proposals-home',
  imports: [
    DatePipe,
    EuroTotalPipe,
    MatButtonModule,
    MatCardModule,
    TradeCardListComponent,
  ],
  templateUrl: './proposals-home.component.html',
  styleUrl: './proposals-home.component.scss',
})
export class ProposalsHomeComponent {
  private readonly chatService = inject(ChatService);
  private readonly navigationService = inject(NavigationService);

  proposals: Signal<TradeProposal[]>;

  constructor(tradeProposalService: TradeProposalService) {
    this.proposals = toSignal(tradeProposalService.proposals$, {
      initialValue: [],
    });
    tradeProposalService.refresh();
  }

  // Only the actions the user may take are offered, and one action is sent at a time.
  readonly canAnswer = canAnswer;
  readonly canWithdraw = canWithdraw;
  readonly isTrade = isTrade;
  private readonly tradeProposalService = inject(TradeProposalService);
  readonly actingOn = signal<string | null>(null);
  private readonly refusals = signal<ReadonlyMap<string, TradeProposalRefusal>>(
    new Map()
  );

  accept(proposal: TradeProposal) {
    this.act(proposal, (id) => this.tradeProposalService.accept(id));
  }

  decline(proposal: TradeProposal) {
    this.act(proposal, (id) => this.tradeProposalService.decline(id));
  }

  withdraw(proposal: TradeProposal) {
    this.act(proposal, (id) => this.tradeProposalService.withdraw(id));
  }

  refusalOf(proposal: TradeProposal): TradeProposalRefusal | undefined {
    return this.refusals().get(proposal.id);
  }

  // The names of the cards that made the acceptance fail, taken from the proposal itself.
  missingCardNames(proposal: TradeProposal): string {
    const refusal = this.refusalOf(proposal);
    if (refusal?.reason !== 'missing-cards') return '';
    const cards = [...proposal.givenCards, ...proposal.receivedCards];
    return refusal.missingCards
      .map((id) => cards.find((card) => card.id === id)?.name ?? id)
      .join(', ');
  }

  // Opens the conversation with the other User the way the Trade page's "Send a message" does.
  // The chat reminds the cards of this proposal when there is no conversation yet.
  openChat(proposal: TradeProposal) {
    this.chatService.initChat({
      id: proposal.otherUserId,
      name: proposal.otherUserName,
      doubles: proposal.receivedCards,
      wanted: proposal.givenCards,
    });
    this.navigationService.navigateChat(proposal.otherUserId);
  }

  // Each User of a Trade removes its cards from their own lists, once. The dialog sends the step
  // itself, and TradeProposalService then publishes the proposals where it shows as done.
  readonly canRemoveCards = canRemoveCards;
  private readonly dialog = inject(MatDialog);

  removeCards(trade: TradeProposal) {
    this.dialog.open<RemoveTradeCardsDialogComponent, TradeProposal, boolean>(
      RemoveTradeCardsDialogComponent,
      { data: trade }
    );
  }

  private act(
    proposal: TradeProposal,
    action: (proposalId: string) => Observable<TradeProposal[]>
  ) {
    if (this.actingOn() !== null) return;
    this.actingOn.set(proposal.id);
    this.setRefusal(proposal.id, undefined);
    subscribeOnce(
      action(proposal.id),
      () => this.actingOn.set(null),
      (refusal) => {
        this.actingOn.set(null);
        this.setRefusal(proposal.id, refusal as TradeProposalRefusal);
      }
    );
  }

  private setRefusal(proposalId: string, refusal: TradeProposalRefusal | undefined) {
    this.refusals.update((refusals) => {
      const updated = new Map(refusals);
      if (refusal) updated.set(proposalId, refusal);
      else updated.delete(proposalId);
      return updated;
    });
  }
}
