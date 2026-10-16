import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Card } from '../../models/card';
import { CardService } from './card.service';

describe('CardService prices', () => {
  let service: CardService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CardService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  // Fetches a card whose Scryfall answer has these finishes and prices.
  function fetchPriced(
    finishes: string[],
    prices: { eur: string | null; eur_foil: string | null }
  ): Card | undefined {
    let fetched: Card | undefined;
    service.fetch('sol-ring').subscribe((card) => (fetched = card));
    httpTestingController
      .expectOne('https://api.scryfall.com/cards/sol-ring')
      .flush({
        id: 'sol-ring',
        name: 'Sol Ring',
        scryfall_uri: 'uri',
        image_uris: { normal: 'image' },
        set: 'c21',
        finishes,
        prices,
      });
    httpTestingController
      .expectOne(
        'https://api.scryfall.com/cards/search?unique=prints&q=!%22Sol Ring%22'
      )
      .flush({ data: [] });
    return fetched;
  }

  it('should price a card at its non-foil euro price', () => {
    const card = fetchPriced(['nonfoil', 'foil'], { eur: '1.20', eur_foil: '6.50' });

    expect(card?.price).toBe(1.2);
  });

  it('should leave the price empty, not 0 nor the foil price, when Scryfall has no non-foil price', () => {
    const card = fetchPriced(['nonfoil', 'foil'], { eur: null, eur_foil: '6.50' });

    expect(card?.price).toBeNull();
  });

  it('should price a printing made only in foil at its foil price', () => {
    const card = fetchPriced(['foil'], { eur: null, eur_foil: '6.50' });

    expect(card?.price).toBe(6.5);
  });
});
