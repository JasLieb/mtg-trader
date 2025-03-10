import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { CardService } from './card.service';

describe('CardService', () => {
  let service: CardService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(CardService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send GET request when search card', () => {
    service.search('anything').subscribe();

    httpTestingController.expectOne(
      'https://api.scryfall.com/cards/search?q="anything"',
      'URL to scryfall endpoint to search some cards from a query'
    );
  });

  it('should parse scryfall cards when receive search response', (done) => {
    service.search('anything').subscribe((cards) => {
      expect(cards).toEqual([
        {
          id: 'anythingId',
          name: 'anything',
          uri: 'uncredible uri',
          image_uri: 'uncredible image uri',
        },
        {
          id: 'anythingElseId',
          name: 'anythingElse',
          uri: 'uncredible uri',
          image_uri: 'uncredible image uri',
        },
      ]);
      done();
    });

    const req = httpTestingController.expectOne(
      'https://api.scryfall.com/cards/search?q="anything"',
      'URL to scryfall endpoint to search some cards from a query'
    );

    req.flush(
      {
        data: [
          {
            id: 'anythingId',
            name: 'anything',
            scryfall_uri: 'uncredible uri',
            image_uris: {
              normal: 'uncredible image uri',
            },
          },
          {
            id: 'anythingElseId',
            name: 'anythingElse',
            scryfall_uri: 'uncredible uri',
            card_faces: [{ illustration_id: 'uncredible image uri' }],
          },
        ],
      },
      { status: 200, statusText: 'ok' }
    );
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

    httpTestingController.expectOne(
      'https://api.scryfall.com/cards/anything',
      'URL to scryfall endpoint to fetch card from an id'
    );
  });

  it('should parse scryfall card when receive fetch response', (done) => {
    service.fetch('anything').subscribe((card) => {
      expect(card).toEqual({
        id: 'anythingId',
        name: 'anything',
        uri: 'uncredible uri',
        image_uri: 'uncredible image uri',
      });
      done();
    });

    const req = httpTestingController.expectOne(
      'https://api.scryfall.com/cards/anything',
      'URL to scryfall endpoint to fetch card from an id'
    );

    req.flush(
      {
        id: 'anythingId',
        name: 'anything',
        scryfall_uri: 'uncredible uri',
        image_uris: {
          normal: 'uncredible image uri',
        },
      },
      { status: 200, statusText: 'ok' }
    );
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

    req.flush(
      {},
      { status: 500, statusText: 'error' }
    );
  });
});
