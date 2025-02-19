import { TestBed } from '@angular/core/testing';

import { TradeService } from './trade.service';
import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest,
} from '@angular/common/http/testing';
import { Card } from '../../../common/models/card';
import { CardService } from '../../../common/services/card/card.service';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';

describe('TradeService', () => {
  let service: TradeService;
  let httpTestingController: HttpTestingController;
  let cardService: jasmine.SpyObj<CardService>;

  beforeEach(() => {
    const cardSpy = jasmine.createSpyObj('CardService', ['fetch']);

    TestBed.configureTestingModule({
      providers: [
        { provide: CardService, useValue: cardSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    cardService = TestBed.inject(CardService) as jasmine.SpyObj<CardService>;
    cardService.fetch.and.callFake(() => of({ id: 'card' } as Card));
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

  it('should fetch doubles and wanted cards when receive trade response', () => {
    service.find().subscribe();
    const request = httpTestingController.match(
      (request) => request.url == 'api/trade'
    )[0];

    flushRequest200(request);

    expect(cardService.fetch.calls.count()).toBe(2);
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

    flushRequest200(request);
  });
});

function flushRequest200(request: TestRequest) {
  request.flush(
    {
      users: [
        {
          id: 'toto',
          name: 'jas',
          doubles: ['card'],
          wanted: ['card'],
        },
      ],
    },
    { status: 200, statusText: 'ok' }
  );
}
