import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { Wantlist } from '../../../collection/models/wantlist';
import { WantlistService } from '../../../collection/services/wantlist/wantlist.service';
import { Card, makeCard } from '../../../common/models/card';
import { UserTrader } from '../../models/user-trader';
import { TradeProposalService } from '../../services/trade-proposal/trade-proposal.service';
import { TradeProposalDialogComponent } from './trade-proposal-dialog.component';

describe('TradeProposalDialogComponent with the other doubles', () => {
  let fixture: ComponentFixture<TradeProposalDialogComponent>;
  let tradeProposalService: jasmine.SpyObj<TradeProposalService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<TradeProposalDialogComponent>>;

  const ragavan = makeCard('ragavan', 'Ragavan');
  const brainstorm = makeCard('brainstorm', 'Brainstorm');
  const solRing = makeCard('sol-ring', 'Sol Ring');
  const counterspell = makeCard('counterspell', 'Counterspell');
  const thoughtseize = makeCard('thoughtseize', 'Thoughtseize');

  // Scenario 1 of the spec, seen by Alice: the Trade match is Ragavan against Sol Ring,
  // Bob also holds Brainstorm and Alice also holds Counterspell and Thoughtseize.
  const bob: UserTrader = {
    id: 'bob',
    name: 'Bob',
    doubles: [ragavan],
    wanted: [solRing],
  };

  async function initFixture(
    partner: UserTrader,
    partnerDoubles: Card[],
    myDoubles: (Card | undefined)[]
  ) {
    tradeProposalService = jasmine.createSpyObj('TradeProposalService', [
      'send',
      'fetchPartnerDoubles',
    ]);
    tradeProposalService.send.and.returnValue(of([]));
    tradeProposalService.fetchPartnerDoubles.and.returnValue(of(partnerDoubles));
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    const doubles = { id: 'alice_doubles', name: 'doubles', cards: myDoubles } as Wantlist;

    await TestBed.configureTestingModule({
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: partner },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: TradeProposalService, useValue: tradeProposalService },
        { provide: WantlistService, useValue: { doubles$: of(doubles) } },
      ],
      imports: [TradeProposalDialogComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TradeProposalDialogComponent);
    fixture.detectChanges();
  }

  function names(selector: string): string[] {
    return Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll(selector)).map(
      (checkbox) => checkbox.textContent?.trim() ?? ''
    );
  }

  function checked(selector: string): boolean[] {
    return Array.from<HTMLInputElement>(
      fixture.nativeElement.querySelectorAll(`${selector} input[type="checkbox"]`)
    ).map((checkbox) => checkbox.checked);
  }

  function checkbox(selector: string, name: string): HTMLInputElement {
    const index = names(selector).indexOf(name);
    return fixture.nativeElement.querySelectorAll(`${selector} input[type="checkbox"]`)[index];
  }

  function sendButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.trade-proposal-send');
  }

  it('should ask for the doubles of the partner the form is for', async () => {
    await initFixture(bob, [ragavan, brainstorm], [solRing]);

    expect(tradeProposalService.fetchPartnerDoubles).toHaveBeenCalledOnceWith('bob');
  });

  it("should list the partner's other doubles unchecked below the Trade match", async () => {
    await initFixture(bob, [ragavan, brainstorm], [solRing]);

    expect(names('.trade-proposal-received')).toEqual(['Ragavan', 'Brainstorm']);
    expect(checked('.trade-proposal-received')).toEqual([true, false]);
  });

  it('should list my other doubles unchecked below the Trade match', async () => {
    await initFixture(bob, [ragavan], [solRing, counterspell, thoughtseize]);

    expect(names('.trade-proposal-given')).toEqual(['Sol Ring', 'Counterspell', 'Thoughtseize']);
    expect(checked('.trade-proposal-given')).toEqual([true, false, false]);
  });

  it('should show a card of the Trade match only once', async () => {
    await initFixture(bob, [brainstorm, ragavan, brainstorm], [thoughtseize, solRing, solRing]);

    expect(names('.trade-proposal-received')).toEqual(['Ragavan', 'Brainstorm']);
    expect(names('.trade-proposal-given')).toEqual(['Sol Ring', 'Thoughtseize']);
  });

  it('should send a card of mine outside the Trade match once checked (scenario 1)', async () => {
    await initFixture(bob, [ragavan, brainstorm], [solRing, counterspell, thoughtseize]);

    checkbox('.trade-proposal-given', 'Thoughtseize').click();
    fixture.detectChanges();
    sendButton().click();

    expect(tradeProposalService.send).toHaveBeenCalledOnceWith({
      recipientId: 'bob',
      givenCards: ['sol-ring', 'thoughtseize'],
      receivedCards: ['ragavan'],
    });
    expect(dialogRef.close).toHaveBeenCalledOnceWith(true);
  });

  it('should let me receive a card from a partner who holds none of the cards I want', async () => {
    const carol: UserTrader = { id: 'carol', name: 'Carol', doubles: [], wanted: [solRing] };
    await initFixture(carol, [brainstorm], [solRing]);

    expect(names('.trade-proposal-received')).toEqual(['Brainstorm']);
    expect(sendButton().disabled).toBeTrue();

    checkbox('.trade-proposal-received', 'Brainstorm').click();
    fixture.detectChanges();
    sendButton().click();

    expect(tradeProposalService.send).toHaveBeenCalledOnceWith({
      recipientId: 'carol',
      givenCards: ['sol-ring'],
      receivedCards: ['brainstorm'],
    });
  });

  it('should leave out a card of mine Scryfall could not load', async () => {
    await initFixture(bob, [ragavan], [solRing, undefined, thoughtseize]);

    expect(names('.trade-proposal-given')).toEqual(['Sol Ring', 'Thoughtseize']);
  });
});
