import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { subscribeOnce } from '../../../../core/utils/subscribeExtensions';
import { Card } from '../../../common/models/card';
import { UserTrader } from '../../models/user-trader';
import { EuroTotalPipe } from '../../pipes/euro-total.pipe';
import { TradeProposalService } from '../../services/trade-proposal/trade-proposal.service';

// Composes a Trade proposal to a Trade partner, starting from the whole Trade match.
// The dialog closes with true once the proposal is sent.
@Component({
  selector: 'app-trade-proposal-dialog',
  imports: [EuroTotalPipe, MatButtonModule, MatCheckboxModule, MatDialogModule],
  templateUrl: './trade-proposal-dialog.component.html',
  styleUrl: './trade-proposal-dialog.component.scss',
})
export class TradeProposalDialogComponent {
  readonly partner = inject<UserTrader>(MAT_DIALOG_DATA);
  private readonly dialogRef =
    inject<MatDialogRef<TradeProposalDialogComponent, boolean>>(MatDialogRef);
  private readonly tradeProposalService = inject(TradeProposalService);

  readonly receivedCardIds = signal(
    new Set(this.partner.doubles.map((card) => card.id))
  );
  readonly givenCardIds = signal(
    new Set(this.partner.wanted.map((card) => card.id))
  );
  readonly sending = signal(false);
  readonly sendFailed = signal(false);
  readonly hasBothSides = computed(
    () => this.receivedCardIds().size > 0 && this.givenCardIds().size > 0
  );

  // Every card the form has offered, by id. Toggling a card records it, so the totals price
  // whatever is checked, including cards from outside the Trade match.
  private readonly offeredCards = new Map(
    [...this.partner.doubles, ...this.partner.wanted].map(
      (card) => [card.id, card] as const
    )
  );
  readonly checkedReceivedCards = computed(() =>
    this.offered(this.receivedCardIds())
  );
  readonly checkedGivenCards = computed(() =>
    this.offered(this.givenCardIds())
  );

  toggleReceived(card: Card) {
    this.offeredCards.set(card.id, card);
    this.receivedCardIds.update((ids) => toggle(ids, card.id));
  }

  toggleGiven(card: Card) {
    this.offeredCards.set(card.id, card);
    this.givenCardIds.update((ids) => toggle(ids, card.id));
  }

  send() {
    if (!this.hasBothSides() || this.sending()) return;
    this.sending.set(true);
    this.sendFailed.set(false);
    subscribeOnce(
      this.tradeProposalService.send({
        recipientId: this.partner.id,
        givenCards: [...this.givenCardIds()],
        receivedCards: [...this.receivedCardIds()],
      }),
      () => this.dialogRef.close(true),
      () => {
        this.sending.set(false);
        this.sendFailed.set(true);
      }
    );
  }

  private offered(ids: Set<string>): Card[] {
    return [...ids].flatMap((id) => this.offeredCards.get(id) ?? []);
  }
}

function toggle(ids: Set<string>, id: string): Set<string> {
  const toggled = new Set(ids);
  if (toggled.has(id)) toggled.delete(id);
  else toggled.add(id);
  return toggled;
}
