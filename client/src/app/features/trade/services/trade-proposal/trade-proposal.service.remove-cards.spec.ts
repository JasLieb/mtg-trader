import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { WantlistService } from '../../../collection/services/wantlist/wantlist.service';
import { makeCard } from '../../../common/models/card';
import { CardService } from '../../../common/services/card/card.service';
import {
  TradeCardsRemovalRefusal,
  TradeCardsRemovedResponse,
} from '../../models/trade-cards-removal';
import {
  TradeProposal,
  TradeProposalMin,
  TradeProposalsResponse,
} from '../../models/trade-proposal';
import { TradeProposalService } from './trade-proposal.service';

describe('TradeProposalService removing the cards of a trade', () => {
  let service: TradeProposalService;
  let httpTestingController: HttpTestingController;
  let wantlistService: jasmine.SpyObj<WantlistService>;

  // Scenarios 1 and 9 of the spec, seen by Alice: Bob accepted her Sol Ring and Thoughtseize for his Ragavan.
  const tradeWithBob: TradeProposalMin = {
    id: 'p1',
    isSent: true,
    otherUserId: 'bob',
    otherUserName: 'bob@mail',
    givenCards: ['sol-ring', 'thoughtseize'],
    receivedCards: ['ragavan'],
    state: 'Accepted',
    sentAt: '2026-10-16T09:30:00Z',
    hasRemovedCards: false,
  };
  // Scenario 10: Alice kept Sol Ring.
  const removed: TradeCardsRemovedResponse = {
    wantlists: [
      { id: 'alice_doubles', name: 'doubles', cards: ['sol-ring', 'counterspell'] },
      { id: 'alice-wl', name: 'modern', cards: ['lightning-bolt'] },
    ],
    proposals: [{ ...tradeWithBob, hasRemovedCards: true }],
  };

  beforeEach(() => {
    wantlistService = jasmine.createSpyObj('WantlistService', ['publish']);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: CardService,
          useValue: jasmine.createSpyObj('CardService', ['fetch']),
        },
        { provide: WantlistService, useValue: wantlistService },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    const cardService = TestBed.inject(CardService) as jasmine.SpyObj<CardService>;
    cardService.fetch.and.callFake((id: string) => of(makeCard(id, id)));
    service = TestBed.inject(TradeProposalService);
  });

  afterEach(() => httpTestingController.verify());

  function expectRemoval() {
    return httpTestingController.expectOne(
      (r) => r.method === 'POST' && r.url.endsWith('api/trade-proposals/p1/remove-cards')
    );
  }

  function refusalOf(): () => TradeCardsRemovalRefusal | undefined {
    let refusal: TradeCardsRemovalRefusal | undefined;
    service
      .removeCards('p1', { givenCards: [], receivedCards: [] })
      .subscribe({ error: (error) => (refusal = error) });
    return () => refusal;
  }

  it('should post the checked cards of each side', () => {
    service
      .removeCards('p1', { givenCards: ['thoughtseize'], receivedCards: ['ragavan'] })
      .subscribe();

    const req = expectRemoval();
    expect(req.request.body).toEqual({
      givenCards: ['thoughtseize'],
      receivedCards: ['ragavan'],
    });
    req.flush(removed);
  });

  it('should hand the refreshed lists to the wantlist service', () => {
    service.removeCards('p1', { givenCards: ['thoughtseize'], receivedCards: ['ragavan'] }).subscribe();

    expectRemoval().flush(removed);

    expect(wantlistService.publish).toHaveBeenCalledOnceWith({ wantlists: removed.wantlists });
  });

  it('should publish the proposals sent back, where the step is done', () => {
    let published: TradeProposal[] = [];
    service.proposals$.subscribe((proposals) => (published = proposals));

    service.removeCards('p1', { givenCards: ['thoughtseize'], receivedCards: ['ragavan'] }).subscribe();
    expectRemoval().flush(removed);

    expect(published.map((p) => [p.id, p.hasRemovedCards])).toEqual([['p1', true]]);
    expect(published[0].givenCards.map((card) => card.id)).toEqual(['sol-ring', 'thoughtseize']);
  });

  it('should fail and reload the proposals when the trade changed since it was loaded', () => {
    let published: TradeProposal[] = [];
    service.proposals$.subscribe((proposals) => (published = proposals));

    const refusal = refusalOf();
    expectRemoval().flush('The cards of this trade were already removed from your lists', {
      status: 409,
      statusText: 'Conflict',
    });

    expect(refusal()).toEqual({ reason: 'not-available' });
    expect(wantlistService.publish).not.toHaveBeenCalled();
    httpTestingController
      .expectOne((r) => r.method === 'GET' && r.url.endsWith('api/trade-proposals'))
      .flush({
        proposals: [{ ...tradeWithBob, hasRemovedCards: true }],
      } as TradeProposalsResponse);
    expect(published.map((p) => p.hasRemovedCards)).toEqual([true]);
  });

  it('should fail without reloading when the cards are refused', () => {
    const refusal = refusalOf();
    expectRemoval().flush('These cards are not part of this trade', {
      status: 400,
      statusText: 'Bad Request',
    });

    expect(refusal()).toEqual({ reason: 'failed' });
    expect(wantlistService.publish).not.toHaveBeenCalled();
    httpTestingController.expectNone((r) => r.method === 'GET');
  });
});
