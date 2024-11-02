import { TestBed } from '@angular/core/testing';

import { WantlistService } from './wantlist.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CardService } from '../card/card.service';
import { Card } from '../../models/card';
import { of } from 'rxjs';

describe('WantlistService', () => {
  let service: WantlistService;
  let httpTestingController: HttpTestingController;
  let cardService: jasmine.SpyObj<CardService>;
  let localStore: any;

  beforeEach(() => {
    const cardSpy = jasmine.createSpyObj('CardService', ['fetch']);

    localStore = {};

    spyOn(window.localStorage, 'getItem').and.callFake((key) =>
      key in localStore ? localStore[key] : null
    );
    spyOn(window.localStorage, 'setItem').and.callFake(
      (key, value) => (localStore[key] = value + '')
    );
    spyOn(window.localStorage, 'clear').and.callFake(() => (localStore = {}));

    TestBed.configureTestingModule({
      providers: [{ provide: CardService, useValue: cardSpy }],
      imports: [HttpClientTestingModule],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    cardService = TestBed.inject(CardService) as jasmine.SpyObj<CardService>;
    cardService.fetch.and.callFake(() =>
      of({ id: '', name: '', uri: '', image_uri: '' } as Card)
    );
    service = TestBed.inject(WantlistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request get call when created', () => {
    const reqs = httpTestingController.match((request) =>
      request.method.includes('GET')
    );
    expect(reqs).toHaveSize(1);
    expect(reqs[0].request.body).toBeNull();
  });

  it('should update wantlists$ when receive wantlists response', (done) => {
    const req = httpTestingController.match((request) =>
      request.method.includes('GET')
    )[0];

    req.flush(
      [
        {
          id: 'dbf588d9-2b35-4fd0-8776-37e6e6da9f5d',
          name: 'string',
          cardIds: ['0000419b-0bba-4488-8f7a-6194544ce91e'],
        },
      ],
      { status: 200, statusText: 'ok' }
    );

    service.wantlists$.subscribe((wls) => {
      expect(wls.length).toBe(1);
      done();
    });
  });

  it('should request put call when update wantlist', () => {
    service.updateWantlist({ id: 'updated', name: 'wl', cards: [] });

    const reqs = httpTestingController.match((request) =>
      request.method.includes('PUT')
    );
    expect(reqs).toHaveSize(1);
    expect(reqs[0].request.body).toEqual({ wantlistId: 'updated', cards: [] });
  });

  it('should request post call when create wantlist', () => {
    service.create('toto');

    const reqs = httpTestingController.match((request) =>
      request.method.includes('POST')
    );
    expect(reqs).toHaveSize(1);
    expect(reqs[0].request.body).toEqual({ wantlistName: 'toto' });
  });

  it('should request delete call when delete wantlist', () => {
    service.delete('toto');

    const reqs = httpTestingController.match((request) =>
      request.method.includes('DELETE')
    );
    expect(reqs).toHaveSize(1);
    expect(reqs[0].request.urlWithParams).toContain('wantlist?wantlistId=toto');
  });
});
