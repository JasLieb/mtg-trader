import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { Wantlist } from '../../../collection/models/wantlist';
import { WantlistService } from '../../../collection/services/wantlist/wantlist.service';
import { makeCard } from '../../../common/models/card';
import { CardService } from '../../../common/services/card/card.service';
import { PartnerDoublesResponse } from '../../models/partner-doubles-response';
import { TradeProposalsResponse } from '../../models/trade-proposal';
import { UserTrader } from '../../models/user-trader';
import { TradeProposalDialogComponent } from './trade-proposal-dialog.component';

describe('TradeProposalDialogComponent value of each side', () => {
  let fixture: ComponentFixture<TradeProposalDialogComponent>;
  let httpTestingController: HttpTestingController;

  const ragavan = makeCard('ragavan', 'Ragavan', '', '', 45.5);
  const brainstorm = makeCard('brainstorm', 'Brainstorm', '', '', null);
  const solRing = makeCard('sol-ring', 'Sol Ring', '', '', 1.2);
  const counterspell = makeCard('counterspell', 'Counterspell', '', '', 0.8);
  const thoughtseize = makeCard('thoughtseize', 'Thoughtseize', '', '', 12);

  // Bob holds the Ragavan Alice wants and wants her Sol Ring and Counterspell.
  const bob: UserTrader = {
    id: 'bob',
    name: 'Bob',
    doubles: [ragavan],
    wanted: [solRing, counterspell],
  };

  // Alice's Doubles list: the Trade match, plus Thoughtseize, which is outside it.
  const aliceDoubles = {
    id: 'alice_doubles',
    name: 'doubles',
    cards: [solRing, counterspell, thoughtseize],
  } as Wantlist;

  // The real TradeProposalService runs, so the request it posts can be inspected.
  async function initFixture(partner: UserTrader) {
    await TestBed.configureTestingModule({
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: partner },
        {
          provide: MatDialogRef,
          useValue: jasmine.createSpyObj('MatDialogRef', ['close']),
        },
        {
          provide: CardService,
          useValue: jasmine.createSpyObj('CardService', ['fetch']),
        },
        { provide: WantlistService, useValue: { doubles$: of(aliceDoubles) } },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      imports: [TradeProposalDialogComponent, NoopAnimationsModule],
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(TradeProposalDialogComponent);
    // The partner's other doubles play no part in these totals.
    httpTestingController
      .expectOne((r) => r.url.endsWith(`partners/${partner.id}/doubles`))
      .flush({ cards: [] } as PartnerDoublesResponse);
    fixture.detectChanges();
  }

  afterEach(() => httpTestingController.verify());

  function text(selector: string): string {
    return (
      fixture.nativeElement
        .querySelector(selector)
        ?.textContent.trim()
        .replace(/\s+/g, ' ') ?? ''
    );
  }

  function receivedTotal(): string {
    return text('.trade-proposal-received-total');
  }

  function givenTotal(): string {
    return text('.trade-proposal-given-total');
  }

  function checkbox(selector: string, index: number): HTMLInputElement {
    return fixture.nativeElement.querySelectorAll(
      `${selector} input[type="checkbox"]`
    )[index];
  }

  it('should show the euro total of each side of the Trade match when opened', async () => {
    await initFixture(bob);

    expect(receivedTotal()).toBe('You receive 45.50 €');
    expect(givenTotal()).toBe('You give 2.00 €');
  });

  it('should update the totals on each checked or unchecked card', async () => {
    await initFixture(bob);

    checkbox('.trade-proposal-given', 1).click();
    fixture.detectChanges();
    expect(givenTotal()).toBe('You give 1.20 €');

    checkbox('.trade-proposal-received', 0).click();
    fixture.detectChanges();
    expect(receivedTotal()).toBe('You receive 0.00 €');

    checkbox('.trade-proposal-received', 0).click();
    fixture.detectChanges();
    expect(receivedTotal()).toBe('You receive 45.50 €');
  });

  it('should count a card checked from outside the Trade match', async () => {
    await initFixture(bob);

    checkbox('.trade-proposal-given', 2).click();
    fixture.detectChanges();
    expect(givenTotal()).toBe('You give 14.00 €');

    checkbox('.trade-proposal-given', 2).click();
    fixture.detectChanges();
    expect(givenTotal()).toBe('You give 2.00 €');
  });

  // Scenario 11 of the spec.
  it('should flag a checked card without a Scryfall price in the total of its side', async () => {
    await initFixture({ ...bob, doubles: [ragavan, brainstorm] });

    expect(receivedTotal()).toBe(
      'You receive 45.50 € + 1 card without a price (Brainstorm)'
    );
    expect(givenTotal()).toBe('You give 2.00 €');

    checkbox('.trade-proposal-received', 1).click();
    fixture.detectChanges();
    expect(receivedTotal()).toBe('You receive 45.50 €');
  });

  it('should send only the recipient and card ids, never a price', async () => {
    await initFixture(bob);

    fixture.nativeElement.querySelector('.trade-proposal-send').click();

    const req = httpTestingController.expectOne(
      (r) => r.method === 'POST' && r.url.endsWith('api/trade-proposals')
    );
    expect(req.request.body).toEqual({
      recipientId: 'bob',
      givenCards: ['sol-ring', 'counterspell'],
      receivedCards: ['ragavan'],
    });
    expect(JSON.stringify(req.request.body)).not.toContain('price');
    req.flush({ proposals: [] } as TradeProposalsResponse);
  });
});
