import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { makeCard } from '../../../common/models/card';
import { CardService } from '../../../common/services/card/card.service';
import {
  TradeProposal,
  TradeProposalMin,
  TradeProposalsResponse,
} from '../../models/trade-proposal';
import {
  MissingCardsResponse,
  TradeProposalRefusal,
} from '../../models/trade-proposal-action';
import { TradeProposalService } from './trade-proposal.service';

describe('TradeProposalService actions', () => {
  let service: TradeProposalService;
  let httpTestingController: HttpTestingController;

  const received: TradeProposalMin = {
    id: 'p1',
    isSent: false,
    otherUserId: 'alice',
    otherUserName: 'alice@mail',
    givenCards: ['ragavan'],
    receivedCards: ['sol-ring'],
    state: 'Pending',
    sentAt: '2026-10-16T09:30:00Z',
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
  });

  afterEach(() => httpTestingController.verify());

  function expectAction(path: string) {
    const req = httpTestingController.expectOne(
      (r) => r.method === 'POST' && r.url.endsWith(`api/trade-proposals/${path}`)
    );
    expect(req.request.body).toBeNull();
    return req;
  }

  function refusalOf(action: Observable<TradeProposal[]>): () => TradeProposalRefusal | undefined {
    let refusal: TradeProposalRefusal | undefined;
    action.subscribe({ error: (error) => (refusal = error) });
    return () => refusal;
  }

  for (const [action, call] of [
    ['accept', (s: TradeProposalService) => s.accept('p1')],
    ['decline', (s: TradeProposalService) => s.decline('p1')],
    ['withdraw', (s: TradeProposalService) => s.withdraw('p1')],
  ] as const) {
    it(`should post ${action} and publish the proposals sent back`, () => {
      let published: TradeProposal[] = [];
      service.proposals$.subscribe((proposals) => (published = proposals));

      call(service).subscribe();
      expectAction(`p1/${action}`).flush({
        proposals: [{ ...received, state: 'Accepted' }],
      } as TradeProposalsResponse);

      expect(published.map((p) => [p.id, p.state])).toEqual([['p1', 'Accepted']]);
    });
  }

  it('should fail with the missing cards when the acceptance is refused for them', () => {
    let published = false;
    service.proposals$.subscribe((proposals) => (published = proposals.length > 0));

    const refusal = refusalOf(service.accept('p1'));
    expectAction('p1/accept').flush(
      { missingCards: ['sol-ring'] } as MissingCardsResponse,
      { status: 422, statusText: 'Unprocessable Entity' }
    );

    expect(refusal()).toEqual({ reason: 'missing-cards', missingCards: ['sol-ring'] });
    expect(published).toBeFalse();
  });

  it('should fail and reload the proposals when the proposal is no longer pending', () => {
    let published: TradeProposal[] = [];
    service.proposals$.subscribe((proposals) => (published = proposals));

    const refusal = refusalOf(service.accept('p1'));
    expectAction('p1/accept').flush('This trade proposal is no longer pending', {
      status: 409,
      statusText: 'Conflict',
    });

    expect(refusal()).toEqual({ reason: 'not-pending' });
    httpTestingController
      .expectOne((r) => r.method === 'GET' && r.url.endsWith('api/trade-proposals'))
      .flush({ proposals: [{ ...received, state: 'Withdrawn' }] } as TradeProposalsResponse);
    expect(published.map((p) => p.state)).toEqual(['Withdrawn']);
  });

  it('should fail without reloading when the user may not take the action', () => {
    const refusal = refusalOf(service.withdraw('p1'));
    expectAction('p1/withdraw').flush(null, { status: 403, statusText: 'Forbidden' });

    expect(refusal()).toEqual({ reason: 'failed' });
    httpTestingController.expectNone((r) => r.method === 'GET');
  });
});
