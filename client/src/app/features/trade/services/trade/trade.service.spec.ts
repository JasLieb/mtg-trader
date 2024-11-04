import { TestBed } from '@angular/core/testing';

import { TradeService } from './trade.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Card } from '../../../common/models/card';
import { CardService } from '../../../common/services/card/card.service';
import { of } from 'rxjs';

describe('TradeService', () => {
  let service: TradeService;
  let httpTestingController: HttpTestingController;
  let cardService: jasmine.SpyObj<CardService>;

  beforeEach(() => {
    const cardSpy = jasmine.createSpyObj('CardService', ['fetch']);

    TestBed.configureTestingModule({
      providers: [{ provide: CardService, useValue: cardSpy }],
      imports: [HttpClientTestingModule],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    cardService = TestBed.inject(CardService) as jasmine.SpyObj<CardService>;
    cardService.fetch.and.callFake(() =>
      of({ id: 'card' } as Card)
    );
    service = TestBed.inject(TradeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request get call trade when find', () => {
    service.find().subscribe();
    const request = httpTestingController.match(
      (request) => request.url == 'api/trade'
    )[0];
    expect(request.request.method).toBe('GET');
  });

  it('should fetch card when receive trade response', () => {
    service.find().subscribe();
    const request = httpTestingController.match(
      (request) => request.url == 'api/trade'
    )[0];

    request.flush(
      {
        users: [
          {
            id: 'toto',
            name: 'jas',
            doubles: {
              id: 'toto_doubles',
              name: 'doubles',
              cardIds: ['card'],
            },
          },
        ],
      },
      { status: 200, statusText: 'ok' }
    );

    expect(cardService.fetch.calls.count()).toBe(1);
    expect(cardService.fetch).toHaveBeenCalledWith('card');
  });

  it('should parse user double when receive trade response', (done) => {
    service.find().subscribe((response) => {
      expect(response.length).toBe(1);
      expect(response[0].id).toBe('toto');
      expect(response[0].name).toBe('jas');
      expect(response[0].doubles).toEqual([{ id: 'card' }] as Card[]);
      done();
    });
    const request = httpTestingController.expectOne('api/trade');

    request.flush(
      {
        users: [
          {
            id: 'toto',
            name: 'jas',
            doubles: {
              id: 'toto_doubles',
              name: 'doubles',
              cardIds: ['card'],
            },
          },
        ],
      },
      { status: 200, statusText: 'ok' }
    );
  });
});
