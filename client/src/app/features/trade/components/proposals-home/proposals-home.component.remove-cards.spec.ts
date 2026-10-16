import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { NavigationService } from '../../../../core/services/navigation/navigation.service';
import { makeCard } from '../../../common/models/card';
import { TradeProposal, TradeProposalState } from '../../models/trade-proposal';
import { ChatService } from '../../services/chat/chat.service';
import { TradeProposalService } from '../../services/trade-proposal/trade-proposal.service';
import { RemoveTradeCardsDialogComponent } from '../remove-trade-cards-dialog/remove-trade-cards-dialog.component';
import { ProposalsHomeComponent } from './proposals-home.component';

describe('ProposalsHomeComponent removing the cards of a trade', () => {
  let fixture: ComponentFixture<ProposalsHomeComponent>;
  let proposals: BehaviorSubject<TradeProposal[]>;
  let dialog: jasmine.SpyObj<MatDialog>;

  // Scenarios 1 and 9 of the spec, seen by Alice: Bob accepted her Sol Ring and Thoughtseize for his Ragavan.
  const tradeWithBob: TradeProposal = {
    id: 'p1',
    isSent: true,
    otherUserId: 'bob',
    otherUserName: 'bob@mail',
    givenCards: [
      makeCard('sol-ring', 'Sol Ring'),
      makeCard('thoughtseize', 'Thoughtseize'),
    ],
    receivedCards: [makeCard('ragavan', 'Ragavan')],
    state: 'Accepted',
    sentAt: '2026-10-16T09:30:00Z',
    hasRemovedCards: false,
  };
  // The same Trade, seen by Bob.
  const tradeWithAlice: TradeProposal = {
    ...tradeWithBob,
    isSent: false,
    otherUserId: 'alice',
    otherUserName: 'alice@mail',
    givenCards: tradeWithBob.receivedCards,
    receivedCards: tradeWithBob.givenCards,
  };

  beforeEach(async () => {
    proposals = new BehaviorSubject<TradeProposal[]>([]);
    dialog = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: TradeProposalService,
          useValue: jasmine.createSpyObj('TradeProposalService', ['refresh'], {
            proposals$: proposals.asObservable(),
          }),
        },
        { provide: ChatService, useValue: jasmine.createSpyObj('ChatService', ['initChat']) },
        {
          provide: NavigationService,
          useValue: jasmine.createSpyObj('NavigationService', ['navigateChat']),
        },
        { provide: MatDialog, useValue: dialog },
      ],
      imports: [ProposalsHomeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProposalsHomeComponent);
    fixture.detectChanges();
  });

  function show(...shown: TradeProposal[]) {
    proposals.next(shown);
    fixture.detectChanges();
  }

  function removeButtons(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.proposal-remove-cards'));
  }

  it('should offer each user of a trade to remove its cards from their lists', () => {
    show(tradeWithBob, { ...tradeWithAlice, id: 'p2' });

    expect(removeButtons().map((button) => button.textContent?.trim())).toEqual([
      'Remove these cards from my lists',
      'Remove these cards from my lists',
    ]);
  });

  // Scenario 10 of the spec: once Alice has done the step, the button disappears for her.
  it('should not offer the step again once the user has done it', () => {
    show({ ...tradeWithBob, hasRemovedCards: true });

    expect(removeButtons()).toEqual([]);
  });

  for (const state of ['Pending', 'Declined', 'Withdrawn'] as TradeProposalState[]) {
    it(`should not offer the step on a ${state} proposal`, () => {
      show({ ...tradeWithBob, state }, { ...tradeWithAlice, id: 'p2', state });

      expect(removeButtons()).toEqual([]);
    });
  }

  it('should open the step for the trade when the button is clicked', () => {
    show(tradeWithBob);

    removeButtons()[0].click();

    expect(dialog.open).toHaveBeenCalledOnceWith(RemoveTradeCardsDialogComponent, {
      data: tradeWithBob,
    });
  });
});
