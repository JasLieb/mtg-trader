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

describe('TradeProposalService', () => {
  let service: TradeProposalService;
  let httpTestingController: HttpTestingController;
  let cardService: jasmine.SpyObj<CardService>;

  const proposal: TradeProposalMin = {
    id: 'p1',
    isSent: true,
    otherUserId: 'bob',
    otherUserName: 'bob@mail',
    givenCards: ['sol-ring'],
    receivedCards: ['ragavan'],
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
  });

  afterEach(() => httpTestingController.verify());

  it('should not request proposals until refreshed', () => {
    httpTestingController.expectNone(() => true);
  });

  it('should publish proposals with their cards when refreshed', () => {
    let published: TradeProposal[] = [];
    service.proposals$.subscribe((proposals) => (published = proposals));

    service.refresh();
    const req = httpTestingController.expectOne(
      (request) =>
        request.method === 'GET' && request.url.endsWith('api/trade-proposals')
    );
    req.flush({ proposals: [proposal] } as TradeProposalsResponse);

    expect(published).toEqual([
      {
        ...proposal,
        givenCards: [makeCard('sol-ring', 'sol-ring')],
        receivedCards: [makeCard('ragavan', 'ragavan')],
      },
    ]);
  });

  it('should post the proposal and publish the proposals sent back when send', () => {
    let published: TradeProposal[] = [];
    service.proposals$.subscribe((proposals) => (published = proposals));
    const request = {
      recipientId: 'bob',
      givenCards: ['sol-ring'],
      receivedCards: ['ragavan'],
    };

    service.send(request).subscribe();
    const req = httpTestingController.expectOne(
      (r) => r.method === 'POST' && r.url.endsWith('api/trade-proposals')
    );
    expect(req.request.body).toEqual(request);
    req.flush({ proposals: [proposal] } as TradeProposalsResponse);

    expect(published.map((p) => p.id)).toEqual(['p1']);
  });

  it('should skip a card Scryfall could not load instead of dropping the proposal', () => {
    cardService.fetch.and.callFake((id: string) =>
      of(id === 'ragavan' ? undefined : makeCard(id, id))
    );
    let published: TradeProposal[] = [];
    service.proposals$.subscribe((proposals) => (published = proposals));

    service.refresh();
    httpTestingController
      .expectOne((r) => r.method === 'GET')
      .flush({ proposals: [proposal] } as TradeProposalsResponse);

    expect(published.length).toBe(1);
    expect(published[0].givenCards.map((c) => c.id)).toEqual(['sol-ring']);
    expect(published[0].receivedCards).toEqual([]);
  });

  it('should publish proposals without fetching cards when there are none', () => {
    service.refresh();
    httpTestingController
      .expectOne((r) => r.method === 'GET')
      .flush({ proposals: [] } as TradeProposalsResponse);

    expect(cardService.fetch).not.toHaveBeenCalled();
  });
});
