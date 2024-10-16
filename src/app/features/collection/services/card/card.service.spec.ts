import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { CardService } from './card.service';

describe('CardService', () => {
  let service: CardService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [ HttpClientTestingModule ]});
    service = TestBed.inject(CardService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('search should call httpClient', () => {
    service.search('anything').subscribe();

    httpTestingController.expectOne(
      'https://api.scryfall.com/cards/search?q="anything"',
      'URL to scryfall endpoint to search some cards from a query'
    );
    expect().nothing();
  });
});
