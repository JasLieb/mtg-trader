import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Card, makeCard } from '../../../common/models/card';
import { CardService } from '../../../common/services/card/card.service';
import { PartnerDoublesResponse } from '../../models/partner-doubles-response';
import { TradeProposal } from '../../models/trade-proposal';
import { TradeProposalService } from './trade-proposal.service';

describe("TradeProposalService reading a Trade partner's doubles", () => {
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
    cardService.fetch.and.callFake((id: string) => of(makeCard(id, id)));
    service = TestBed.inject(TradeProposalService);
  });

  afterEach(() => httpTestingController.verify());

  function expectPartnerDoublesRequest(partnerId: string) {
    return httpTestingController.expectOne(
      (request) =>
        request.method === 'GET' &&
        request.url.endsWith(`api/trade-proposals/partners/${partnerId}/doubles`)
    );
  }

  it("should return the partner's doubles with their Scryfall cards", () => {
    let doubles: Card[] | undefined;

    service.fetchPartnerDoubles('bob').subscribe((cards) => (doubles = cards));
    expectPartnerDoublesRequest('bob').flush({
      cards: ['ragavan', 'brainstorm'],
    } as PartnerDoublesResponse);

    expect(doubles).toEqual([
      makeCard('ragavan', 'ragavan'),
      makeCard('brainstorm', 'brainstorm'),
    ]);
  });

  it('should leave out a card Scryfall could not load', () => {
    cardService.fetch.and.callFake((id: string) =>
      of(id === 'brainstorm' ? undefined : makeCard(id, id))
    );
    let doubles: Card[] | undefined;

    service.fetchPartnerDoubles('bob').subscribe((cards) => (doubles = cards));
    expectPartnerDoublesRequest('bob').flush({
      cards: ['ragavan', 'brainstorm'],
    } as PartnerDoublesResponse);

    expect(doubles?.map((card) => card.id)).toEqual(['ragavan']);
  });

  it('should return no card without asking Scryfall when the partner has no doubles', () => {
    let doubles: Card[] | undefined;

    service.fetchPartnerDoubles('bob').subscribe((cards) => (doubles = cards));
    expectPartnerDoublesRequest('bob').flush({ cards: [] } as PartnerDoublesResponse);

    expect(doubles).toEqual([]);
    expect(cardService.fetch).not.toHaveBeenCalled();
  });

  it('should return no card when the server refuses the list of a user who is not a Trade partner', () => {
    spyOn(console, 'error');
    let doubles: Card[] | undefined;

    service.fetchPartnerDoubles('dave').subscribe((cards) => (doubles = cards));
    expectPartnerDoublesRequest('dave').flush('Doubles list not found', {
      status: 404,
      statusText: 'Not Found',
    });

    expect(doubles).toEqual([]);
    expect(cardService.fetch).not.toHaveBeenCalled();
  });

  it("should not touch the user's proposals", () => {
    let published: TradeProposal[] | undefined;
    service.proposals$.subscribe((proposals) => (published = proposals));

    service.fetchPartnerDoubles('bob').subscribe();
    expectPartnerDoublesRequest('bob').flush({ cards: ['ragavan'] } as PartnerDoublesResponse);

    expect(published).toEqual([]);
  });
});
