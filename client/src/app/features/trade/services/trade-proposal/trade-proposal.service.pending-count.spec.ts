import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { makeCard } from '../../../common/models/card';
import { CardService } from '../../../common/services/card/card.service';
import {
  TradeProposalMin,
  TradeProposalState,
  TradeProposalsResponse,
} from '../../models/trade-proposal';
import { TradeProposalService } from './trade-proposal.service';

describe('TradeProposalService pending received count', () => {
  let service: TradeProposalService;
  let httpTestingController: HttpTestingController;
  let cardService: jasmine.SpyObj<CardService>;
  let count: number;

  // Seen from Bob: Alice sent him Sol Ring against Ragavan.
  const receivedFromAlice: TradeProposalMin = {
    id: 'p1',
    isSent: false,
    otherUserId: 'alice',
    otherUserName: 'alice@mail',
    givenCards: ['ragavan'],
    receivedCards: ['sol-ring'],
    state: 'Pending',
    sentAt: '2026-10-16T09:30:00Z',
    hasRemovedCards: false,
  };

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
    cardService.fetch.and.callFake((id: string) => of(makeCard(id, id)));
    service = TestBed.inject(TradeProposalService);
    service.pendingReceivedCount$.subscribe((value) => (count = value));
  });

  afterEach(() => httpTestingController.verify());

  function answerGet(proposals: TradeProposalMin[]) {
    httpTestingController
      .expectOne(
        (request) =>
          request.method === 'GET' &&
          request.url.endsWith('api/trade-proposals')
      )
      .flush({ proposals } as TradeProposalsResponse);
  }

  it('should count nothing before the proposals are loaded', () => {
    expect(count).toBe(0);
  });

  it('should count the received proposals still pending when the count is refreshed', () => {
    service.refreshPendingReceivedCount();
    answerGet([receivedFromAlice, { ...receivedFromAlice, id: 'p2' }]);

    expect(count).toBe(2);
  });

  it('should not load any card from Scryfall to refresh the count', () => {
    service.refreshPendingReceivedCount();
    answerGet([receivedFromAlice]);

    expect(cardService.fetch).not.toHaveBeenCalled();
  });

  it('should not count the pending proposals the user sent', () => {
    service.refreshPendingReceivedCount();
    answerGet([{ ...receivedFromAlice, isSent: true }]);

    expect(count).toBe(0);
  });

  it('should not count a received proposal the server reports in any other state, expired included', () => {
    // The counter relies on the state the server reports, Expired included.
    const otherStates: TradeProposalState[] = [
      'Accepted',
      'Declined',
      'Withdrawn',
      'Expired',
    ];

    service.refreshPendingReceivedCount();
    answerGet(
      otherStates.map((state, i) => ({ ...receivedFromAlice, id: `p${i}`, state }))
    );

    expect(count).toBe(0);
  });

  it('should go back to 0 once the received proposal is no longer pending', () => {
    service.refresh();
    answerGet([receivedFromAlice]);
    expect(count).toBe(1);

    service.refresh();
    answerGet([{ ...receivedFromAlice, state: 'Declined' }]);

    expect(count).toBe(0);
  });

  it('should follow the proposals a mutation sends back', () => {
    service.refreshPendingReceivedCount();
    answerGet([receivedFromAlice]);

    service
      .send({ recipientId: 'carol', givenCards: ['ragavan'], receivedCards: ['brainstorm'] })
      .subscribe();
    httpTestingController
      .expectOne((r) => r.method === 'POST' && r.url.endsWith('api/trade-proposals'))
      .flush({
        proposals: [
          { ...receivedFromAlice, state: 'Accepted' },
          { ...receivedFromAlice, id: 'p2', isSent: true, otherUserId: 'carol' },
        ],
      } as TradeProposalsResponse);

    expect(count).toBe(0);
  });

  it('should keep the last count when the refresh fails', () => {
    spyOn(console, 'error');
    service.refreshPendingReceivedCount();
    answerGet([receivedFromAlice]);

    service.refreshPendingReceivedCount();
    httpTestingController
      .expectOne((r) => r.method === 'GET')
      .flush('boom', { status: 500, statusText: 'Server Error' });

    expect(count).toBe(1);
    expect(console.error).toHaveBeenCalled();
  });
});
