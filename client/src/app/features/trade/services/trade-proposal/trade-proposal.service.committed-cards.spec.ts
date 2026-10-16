import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { CardService } from '../../../common/services/card/card.service';
import { CommittedCards, CommittedCardsResponse } from '../../models/committed-cards';
import { TradeProposal } from '../../models/trade-proposal';
import { TradeProposalService } from './trade-proposal.service';

describe('TradeProposalService reading Committed Cards', () => {
  let service: TradeProposalService;
  let httpTestingController: HttpTestingController;
  let cardService: jasmine.SpyObj<CardService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: CardService,
          useValue: jasmine.createSpyObj('CardService', ['fetch']),
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    cardService = TestBed.inject(CardService) as jasmine.SpyObj<CardService>;
    service = TestBed.inject(TradeProposalService);
  });

  afterEach(() => httpTestingController.verify());

  function expectGet(path: string) {
    return httpTestingController.expectOne(
      (r) => r.method === 'GET' && r.url.endsWith(`api/trade-proposals/${path}`)
    );
  }

  function valueOf(committed: Observable<CommittedCards>): () => CommittedCards | undefined {
    let value: CommittedCards | undefined;
    committed.subscribe((cards) => (value = cards));
    return () => value;
  }

  // Scenario 4 of the spec, seen by Alice.
  it('should return who each of my committed cards is committed with', () => {
    const committed = valueOf(service.fetchCommittedCards());
    expectGet('committed-cards').flush({
      committedCards: [
        { cardId: 'sol-ring', committedWith: ['Bob'] },
        { cardId: 'thoughtseize', committedWith: ['Bob', 'Carol'] },
      ],
    } as CommittedCardsResponse);

    expect(committed()).toEqual(
      new Map([
        ['sol-ring', ['Bob']],
        ['thoughtseize', ['Bob', 'Carol']],
      ])
    );
    expect(cardService.fetch).not.toHaveBeenCalled();
  });

  // Scenario 9 of the spec, seen by Bob before he accepts.
  it('should ask about the cards I give in the proposal I am about to accept', () => {
    const committed = valueOf(service.fetchCommittedCardsIn('p 1'));
    expectGet('p%201/committed-cards').flush({
      committedCards: [{ cardId: 'ragavan', committedWith: ['Alice'] }],
    } as CommittedCardsResponse);

    expect(committed()).toEqual(new Map([['ragavan', ['Alice']]]));
  });

  for (const [name, fetch, path] of [
    ['my committed cards', (s: TradeProposalService) => s.fetchCommittedCards(), 'committed-cards'],
    [
      'the committed cards of a proposal',
      (s: TradeProposalService) => s.fetchCommittedCardsIn('p1'),
      'p1/committed-cards',
    ],
  ] as const) {
    it(`should report no committed card when the server can't tell ${name}`, () => {
      spyOn(console, 'error');

      const committed = valueOf(fetch(service));
      expectGet(path).flush('Trade proposal not found', { status: 404, statusText: 'Not Found' });

      expect(committed()).toEqual(new Map());
    });
  }

  it("should not touch the user's proposals", () => {
    let published: TradeProposal[] | undefined;
    service.proposals$.subscribe((proposals) => (published = proposals));

    service.fetchCommittedCards().subscribe();
    expectGet('committed-cards').flush({
      committedCards: [{ cardId: 'sol-ring', committedWith: ['Bob'] }],
    } as CommittedCardsResponse);

    expect(published).toEqual([]);
  });
});
