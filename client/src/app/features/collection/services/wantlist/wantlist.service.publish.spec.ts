import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { makeCard } from '../../../common/models/card';
import { CardService } from '../../../common/services/card/card.service';
import { Wantlist } from '../../models/wantlist';
import { WantlistService } from './wantlist.service';

describe('WantlistService publishing a response from elsewhere', () => {
  let service: WantlistService;
  let httpTestingController: HttpTestingController;

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
    service = TestBed.inject(WantlistService);
    // The wantlists loaded when the service is created.
    httpTestingController.expectOne((r) => r.method === 'GET').flush({ wantlists: [] });
  });

  afterEach(() => httpTestingController.verify());

  // The lists Alice is left with in scenario 10 of the spec, as the step after a Trade answers them.
  it('should rebuild the wantlists and the doubles from the response, without a request', () => {
    let wantlists: Wantlist[] = [];
    let doubles: Wantlist | undefined;
    service.wantlists$.subscribe((published) => (wantlists = published));
    service.doubles$.subscribe((published) => (doubles = published));

    service.publish({
      wantlists: [
        { id: 'alice_doubles', name: 'doubles', cards: ['sol-ring', 'counterspell'] },
        { id: 'alice-wl', name: 'modern', cards: ['lightning-bolt'] },
      ],
    });

    expect(wantlists.map((wl) => [wl.id, wl.cards.map((card) => card.id)])).toEqual([
      ['alice-wl', ['lightning-bolt']],
    ]);
    expect(doubles?.id).toBe('alice_doubles');
    expect(doubles?.cards.map((card) => card.id)).toEqual(['sol-ring', 'counterspell']);
    httpTestingController.expectNone(() => true);
  });
});
