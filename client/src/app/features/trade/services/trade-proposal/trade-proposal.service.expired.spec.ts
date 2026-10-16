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
  TradeProposal,
  TradeProposalMin,
  TradeProposalsResponse,
} from '../../models/trade-proposal';
import { TradeProposalService } from './trade-proposal.service';

// Expiry is decided by the server only: the proposals and the menu counter follow the state it reports.
describe('TradeProposalService expired proposals', () => {
  let service: TradeProposalService;
  let httpTestingController: HttpTestingController;
  let count: number;
  let published: TradeProposal[];

  // Seen from Bob: Alice sent him Sol Ring against Ragavan.
  const receivedFromAlice: TradeProposalMin = {
    id: 'p1',
    isSent: false,
    otherUserId: 'alice',
    otherUserName: 'alice@mail',
    givenCards: ['ragavan'],
    receivedCards: ['sol-ring'],
    state: 'Pending',
    sentAt: '2026-10-09T09:30:00Z',
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
    const cardService = TestBed.inject(CardService) as jasmine.SpyObj<CardService>;
    cardService.fetch.and.callFake((id: string) => of(makeCard(id, id)));
    service = TestBed.inject(TradeProposalService);
    service.pendingReceivedCount$.subscribe((value) => (count = value));
    service.proposals$.subscribe((proposals) => (published = proposals));
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

  // Scenario 6 of the spec: Bob's page was loaded before the proposal expired.
  it('should publish the proposal expired and stop counting it once the server refuses its acceptance and reports it Expired', () => {
    service.refresh();
    answerGet([receivedFromAlice]);
    expect(count).toBe(1);

    service.accept('p1').subscribe({ error: () => undefined });
    httpTestingController
      .expectOne((r) => r.method === 'POST' && r.url.endsWith('api/trade-proposals/p1/accept'))
      .flush('This trade proposal is no longer pending', { status: 409, statusText: 'Conflict' });
    answerGet([{ ...receivedFromAlice, state: 'Expired' }]);

    expect(published.map((p) => [p.id, p.state])).toEqual([['p1', 'Expired']]);
    expect(count).toBe(0);
  });

  it('should count a received proposal the server still reports as pending, however long ago it was sent', () => {
    service.refreshPendingReceivedCount();
    answerGet([{ ...receivedFromAlice, sentAt: '2020-01-01T00:00:00Z' }]);

    expect(count).toBe(1);
  });
});
