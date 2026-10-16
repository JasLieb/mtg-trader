import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { NavigationService } from '../../../../core/services/navigation/navigation.service';
import { makeCard } from '../../../common/models/card';
import { TradeProposal } from '../../models/trade-proposal';
import { ChatService } from '../../services/chat/chat.service';
import { TradeProposalService } from '../../services/trade-proposal/trade-proposal.service';
import { ProposalsHomeComponent } from './proposals-home.component';

describe('ProposalsHomeComponent value of each side', () => {
  let fixture: ComponentFixture<ProposalsHomeComponent>;
  let proposals: BehaviorSubject<TradeProposal[]>;

  const sentToBob: TradeProposal = {
    id: 'p1',
    isSent: true,
    otherUserId: 'bob',
    otherUserName: 'bob@mail',
    givenCards: [
      makeCard('sol-ring', 'Sol Ring', '', '', 1.2),
      makeCard('thoughtseize', 'Thoughtseize', '', '', 12),
    ],
    receivedCards: [makeCard('ragavan', 'Ragavan', '', '', 45.5)],
    state: 'Pending',
    sentAt: '2026-10-16T09:30:00Z',
  };

  beforeEach(async () => {
    proposals = new BehaviorSubject<TradeProposal[]>([]);
    const tradeProposalService = jasmine.createSpyObj(
      'TradeProposalService',
      ['refresh'],
      { proposals$: proposals.asObservable() }
    );

    await TestBed.configureTestingModule({
      providers: [
        { provide: TradeProposalService, useValue: tradeProposalService },
        { provide: ChatService, useValue: jasmine.createSpyObj('ChatService', ['initChat']) },
        {
          provide: NavigationService,
          useValue: jasmine.createSpyObj('NavigationService', ['navigateChat']),
        },
      ],
      imports: [ProposalsHomeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProposalsHomeComponent);
    fixture.detectChanges();
  });

  function texts(selector: string): string[] {
    return Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll(selector)
    ).map((element) => element.textContent?.trim().replace(/\s+/g, ' ') ?? '');
  }

  it('should show the euro total of the cards given and received by each proposal', () => {
    proposals.next([
      sentToBob,
      {
        ...sentToBob,
        id: 'p2',
        givenCards: [makeCard('counterspell', 'Counterspell', '', '', 0.8)],
      },
    ]);
    fixture.detectChanges();

    expect(texts('.proposal-given-total')).toEqual([
      'Total : 13.20 €',
      'Total : 0.80 €',
    ]);
    expect(texts('.proposal-received-total')).toEqual([
      'Total : 45.50 €',
      'Total : 45.50 €',
    ]);
  });

  // Scenario 11 of the spec.
  it('should flag a card without a Scryfall price in the total of its side', () => {
    proposals.next([
      {
        ...sentToBob,
        receivedCards: [
          ...sentToBob.receivedCards,
          makeCard('brainstorm', 'Brainstorm', '', '', null),
        ],
      },
    ]);
    fixture.detectChanges();

    expect(texts('.proposal-received-total')).toEqual([
      'Total : 45.50 € + 1 card without a price (Brainstorm)',
    ]);
    expect(texts('.proposal-given-total')).toEqual(['Total : 13.20 €']);
  });
});
