import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { subscribeOnce } from '../../../../core/utils/subscribeExtensions';
import { Card } from '../../../common/models/card';
import { TradeCardsRemovalRefusal } from '../../models/trade-cards-removal';
import { TradeProposal } from '../../models/trade-proposal';
import { TradeProposalService } from '../../services/trade-proposal/trade-proposal.service';

// "Remove these cards from my lists" on a Trade: lists its cards one by one, all checked. Validating
// takes the checked cards I give out of my doubles list and the checked cards I receive out of every
// wantlist of mine holding them, and marks the step done even when nothing is checked.
// The dialog closes with true once the server has done it.
@Component({
  selector: 'app-remove-trade-cards-dialog',
  imports: [MatButtonModule, MatCheckboxModule, MatDialogModule],
  templateUrl: './remove-trade-cards-dialog.component.html',
  styleUrl: './remove-trade-cards-dialog.component.scss',
})
export class RemoveTradeCardsDialogComponent {
  readonly trade = inject<TradeProposal>(MAT_DIALOG_DATA);
  private readonly dialogRef =
    inject<MatDialogRef<RemoveTradeCardsDialogComponent, boolean>>(MatDialogRef);
  private readonly tradeProposalService = inject(TradeProposalService);

  readonly givenCardIds = signal(
    new Set(this.trade.givenCards.map((card) => card.id))
  );
  readonly receivedCardIds = signal(
    new Set(this.trade.receivedCards.map((card) => card.id))
  );
  readonly removing = signal(false);
  readonly refusal = signal<TradeCardsRemovalRefusal | null>(null);

  toggleGiven(card: Card) {
    this.givenCardIds.update((ids) => toggle(ids, card.id));
  }

  toggleReceived(card: Card) {
    this.receivedCardIds.update((ids) => toggle(ids, card.id));
  }

  remove() {
    if (this.removing()) return;
    this.removing.set(true);
    this.refusal.set(null);
    subscribeOnce(
      this.tradeProposalService.removeCards(this.trade.id, {
        givenCards: [...this.givenCardIds()],
        receivedCards: [...this.receivedCardIds()],
      }),
      () => this.dialogRef.close(true),
      (refusal) => {
        this.removing.set(false);
        this.refusal.set(refusal as TradeCardsRemovalRefusal);
      }
    );
  }
}

function toggle(ids: Set<string>, id: string): Set<string> {
  const toggled = new Set(ids);
  if (toggled.has(id)) toggled.delete(id);
  else toggled.add(id);
  return toggled;
}
