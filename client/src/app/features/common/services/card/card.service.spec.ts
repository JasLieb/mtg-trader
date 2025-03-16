import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';
import { makeCard } from '../../models/card';
import { CardService } from './card.service';

describe('CardService', () => {
  let service: CardService;
  let httpTestingController: HttpTestingController;

  const expectedACard = makeCard(
    'anythingId',
    'anything',
    'uncredible uri',
    'uncredible image uri',
    0,
    'anythingSet',
    'https://svgs.scryfall.io/sets/anythingSet.svg',
    [{ id: 'anythingId', set_name: 'anythingSet', set_id: 'anythingSet' }]
  );

  const aCardResponse = {
    id: 'anythingId',
    name: 'anything',
    scryfall_uri: 'uncredible uri',
    image_uris: {
      normal: 'uncredible image uri',
    },
    prices: {
      eur: 0,
    },
    set: 'anythingSet',
  };
  const anotherCardResponse = {
    id: 'anythingElseId',
    name: 'anythingElse',
    scryfall_uri: 'uncredible uri',
    image_uris: {
      normal: 'uncredible image uri',
    },
    prices: {
      eur: 0,
    },
    set: 'anythingSet',
  };
  const setsResponse = {
    data: [
      { id: 'anythingId', set_name: 'anythingSet', set_id: 'anythingSet' },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CardService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send GET request when search card', () => {
    service.search('anything').subscribe();

    var req = httpTestingController.expectOne(
      'https://api.scryfall.com/cards/search?q="anything"',
      'URL to scryfall endpoint to search some cards from a query'
    );

    expect(req.request.method).toEqual('GET');
  });

  it('should send sets GET request foreach cards when receive search response', () => {
    service.search('anything').subscribe();

    const expectedSearchReq = httpTestingController.expectOne(
      'https://api.scryfall.com/cards/search?q="anything"',
      'URL to scryfall endpoint to search some cards from a query'
    );

    expectedSearchReq.flush(
      {
        data: [aCardResponse, anotherCardResponse],
      },
      { status: 200, statusText: 'ok' }
    );

    const reqSets = httpTestingController.match((req) =>
      req.urlWithParams.startsWith(
        'https://api.scryfall.com/cards/search?unique=prints&q=!%22'
      )
    );
    expect(reqSets.length).toEqual(2);
  });

  it('should return parsed scryfall cards with sets when receive search sets responses', (done) => {
    service.search('anything').subscribe((cards) => {
      expect(cards).toEqual([expectedACard]);
      done();
    });

    let req = httpTestingController.expectOne(
      'https://api.scryfall.com/cards/search?q="anything"',
      'URL to scryfall endpoint to search some cards from a query'
    );

    req.flush(
      {
        data: [aCardResponse],
      },
      { status: 200, statusText: 'ok' }
    );

    req = httpTestingController.expectOne(
      'https://api.scryfall.com/cards/search?unique=prints&q=!%22anything%22',
      'URL to scryfall endpoint to search sets from a query'
    );

    req.flush(setsResponse, { status: 200, statusText: 'ok' });
  });

  it('should return empty cards when receive search error response', (done) => {
    service.search('anything').subscribe((cards) => {
      expect(cards).toEqual([]);
      done();
    });

    const req = httpTestingController.expectOne(
      'https://api.scryfall.com/cards/search?q="anything"',
      'URL to scryfall endpoint to search some cards from a query'
    );

    req.flush({}, { status: 500, statusText: 'error' });
  });

  it('should send GET request when fetch card', () => {
    service.fetch('anything').subscribe();

    const req = httpTestingController.expectOne(
      'https://api.scryfall.com/cards/anything',
      'URL to scryfall endpoint to fetch card from an id'
    );

    expect(req.request.method).toEqual('GET');
  });

  it('should send sets GET request when receive fetch response', () => {
    service.fetch('anything').subscribe();

    const req = httpTestingController.expectOne(
      'https://api.scryfall.com/cards/anything',
      'URL to scryfall endpoint to fetch card from an id'
    );

    req.flush(aCardResponse, { status: 200, statusText: 'ok' });

    const reqSets = httpTestingController.expectOne(
      'https://api.scryfall.com/cards/search?unique=prints&q=!%22anything%22',
      'URL to scryfall endpoint to fetch sets from a card name'
    );

    expect(reqSets.request.method).toEqual('GET');
  });

  it('should parse scryfall card with associated sets when receive fetch sets response', (done) => {
    service.fetch('anything').subscribe((card) => {
      expect(card).toEqual(expectedACard);
      done();
    });

    const req = httpTestingController.expectOne(
      'https://api.scryfall.com/cards/anything',
      'URL to scryfall endpoint to fetch card from an id'
    );

    req.flush(aCardResponse, { status: 200, statusText: 'ok' });

    const reqSets = httpTestingController.expectOne(
      'https://api.scryfall.com/cards/search?unique=prints&q=!%22anything%22',
      'URL to scryfall endpoint to fetch sets from a card name'
    );

    reqSets.flush(setsResponse, { status: 200, statusText: 'ok' });
  });

  it('should return undefined card when receive fetch error response', (done) => {
    service.fetch('anything').subscribe((card) => {
      expect(card).toEqual(undefined);
      done();
    });

    const req = httpTestingController.expectOne(
      'https://api.scryfall.com/cards/anything',
      'URL to scryfall endpoint to fetch card from an id'
    );

    req.flush({}, { status: 500, statusText: 'error' });
  });
});
