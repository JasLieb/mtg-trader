import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { subscribeOnce } from '../../../../core/utils/subscribeExtensions';
import { WantlistService } from '../../../collection/services/wantlist/wantlist.service';
import { Card } from '../../../common/models/card';
import {
  CommittedCards,
  committedCardWarnings,
} from '../../models/committed-cards';
import { UserTrader } from '../../models/user-trader';
import { EuroTotalPipe } from '../../pipes/euro-total.pipe';
import { TradeProposalService } from '../../services/trade-proposal/trade-proposal.service';
import { CommittedCardsWarningComponent } from '../committed-cards-warning/committed-cards-warning.component';

// Composes a Trade proposal to a Trade partner, starting from the whole Trade match.
// The dialog closes with true once the proposal is sent.
@Component({
  selector: 'app-trade-proposal-dialog',
  imports: [
    CommittedCardsWarningComponent,
    EuroTotalPipe,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
  ],
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

  // Each side lists the Trade match first, pre-checked, then the other cards of that side's
  // Doubles list, unchecked, so that the value of the trade can be balanced.
  private readonly partnerDoubles = toSignal(
    this.tradeProposalService.fetchPartnerDoubles(this.partner.id),
    { initialValue: [] }
  );
  private readonly myDoubles = toSignal(inject(WantlistService).doubles$);
  readonly receivedCards = computed(() =>
    withOtherDoubles(this.partner.doubles, this.partnerDoubles())
  );
  readonly givenCards = computed(() =>
    withOtherDoubles(this.partner.wanted, this.myDoubles()?.cards ?? [])
  );
  // The checked cards of each side, which the totals price.
  readonly checkedReceivedCards = computed(() =>
    this.receivedCards().filter((card) => this.receivedCardIds().has(card.id))
  );
  readonly checkedGivenCards = computed(() =>
    this.givenCards().filter((card) => this.givenCardIds().has(card.id))
  );

  // Before sending, I am warned about the checked cards I give that are already committed elsewhere,
  // inside the Trade match or not. The server says which cards are committed; the warning follows the
  // boxes from there, and blocks nothing.
  private readonly committedCards = toSignal(
    this.tradeProposalService.fetchCommittedCards(),
    { initialValue: new Map() as CommittedCards }
  );
  readonly committedWarnings = computed(() =>
    committedCardWarnings(this.checkedGivenCards(), this.committedCards())
  );

  toggleReceived(card: Card) {
    this.receivedCardIds.update((ids) => toggle(ids, card.id));
  }

  toggleGiven(card: Card) {
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
}

function toggle(ids: Set<string>, id: string): Set<string> {
  const toggled = new Set(ids);
  if (toggled.has(id)) toggled.delete(id);
  else toggled.add(id);
  return toggled;
}

// The Trade match cards, followed by the cards of the Doubles list that are not in it, each card once.
// A card Scryfall could not load is left out.
function withOtherDoubles(
  tradeMatch: Card[],
  doubles: (Card | undefined)[]
): Card[] {
  const listedIds = new Set(tradeMatch.map((card) => card.id));
  const others: Card[] = [];
  for (const card of doubles) {
    if (!card || listedIds.has(card.id)) continue;
    listedIds.add(card.id);
    others.push(card);
  }
  return [...tradeMatch, ...others];
}
