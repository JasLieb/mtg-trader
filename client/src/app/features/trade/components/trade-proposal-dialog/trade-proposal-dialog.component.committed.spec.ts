import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { Wantlist } from '../../../collection/models/wantlist';
import { WantlistService } from '../../../collection/services/wantlist/wantlist.service';
import { makeCard } from '../../../common/models/card';
import { CommittedCards } from '../../models/committed-cards';
import { UserTrader } from '../../models/user-trader';
import { TradeProposalService } from '../../services/trade-proposal/trade-proposal.service';
import { TradeProposalDialogComponent } from './trade-proposal-dialog.component';

describe('TradeProposalDialogComponent warning about committed cards', () => {
  let fixture: ComponentFixture<TradeProposalDialogComponent>;
  let tradeProposalService: jasmine.SpyObj<TradeProposalService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<TradeProposalDialogComponent>>;

  const brainstorm = makeCard('brainstorm', 'Brainstorm');
  const solRing = makeCard('sol-ring', 'Sol Ring');
  const counterspell = makeCard('counterspell', 'Counterspell');
  const thoughtseize = makeCard('thoughtseize', 'Thoughtseize');

  // Scenario 4 of the spec, seen by Alice: Carol wants her Sol Ring, and Alice will take Carol's
  // Brainstorm, which is outside the Trade match.
  const carol: UserTrader = { id: 'carol', name: 'Carol', doubles: [], wanted: [solRing] };

  // Alice's proposal of scenario 1, still pending, commits her Sol Ring and Thoughtseize with Bob.
  const committedWithBob: CommittedCards = new Map([
    ['sol-ring', ['Bob']],
    ['thoughtseize', ['Bob']],
  ]);

  async function initFixture(committed: CommittedCards) {
    tradeProposalService = jasmine.createSpyObj('TradeProposalService', [
      'send',
      'fetchPartnerDoubles',
      'fetchCommittedCards',
    ]);
    tradeProposalService.send.and.returnValue(of([]));
    tradeProposalService.fetchPartnerDoubles.and.returnValue(of([brainstorm]));
    tradeProposalService.fetchCommittedCards.and.returnValue(of(committed));
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    const aliceDoubles = {
      id: 'alice_doubles',
      name: 'doubles',
      cards: [solRing, counterspell, thoughtseize],
    } as Wantlist;

    await TestBed.configureTestingModule({
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: carol },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: TradeProposalService, useValue: tradeProposalService },
        { provide: WantlistService, useValue: { doubles$: of(aliceDoubles) } },
      ],
      imports: [TradeProposalDialogComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TradeProposalDialogComponent);
    fixture.detectChanges();
  }

  function warnings(): string[] {
    return Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll('.trade-proposal-committed .committed-card')
    ).map((line) => line.textContent?.trim().replace(/\s+/g, ' ') ?? '');
  }

  function click(selector: string, name: string) {
    const checkboxes = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll(selector));
    const index = checkboxes.findIndex((checkbox) => checkbox.textContent?.trim() === name);
    checkboxes[index].querySelector('input')!.click();
    fixture.detectChanges();
  }

  function sendButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.trade-proposal-send');
  }

  it('should ask the server once for my committed cards', async () => {
    await initFixture(committedWithBob);

    expect(tradeProposalService.fetchCommittedCards).toHaveBeenCalledTimes(1);
  });

  // Scenario 4 of the spec.
  it('should warn that Sol Ring is committed with Bob before sending, and send anyway', async () => {
    await initFixture(committedWithBob);
    click('.trade-proposal-received', 'Brainstorm');

    expect(warnings()).toEqual(['Sol Ring is already committed with Bob.']);
    expect(sendButton().disabled).toBeFalse();

    sendButton().click();

    expect(tradeProposalService.send).toHaveBeenCalledOnceWith({
      recipientId: 'carol',
      givenCards: ['sol-ring'],
      receivedCards: ['brainstorm'],
    });
    expect(dialogRef.close).toHaveBeenCalledOnceWith(true);
  });

  it('should warn about a committed card outside the Trade match once it is checked', async () => {
    await initFixture(committedWithBob);

    click('.trade-proposal-given', 'Thoughtseize');
    expect(warnings()).toEqual([
      'Sol Ring is already committed with Bob.',
      'Thoughtseize is already committed with Bob.',
    ]);

    click('.trade-proposal-given', 'Thoughtseize');
    expect(warnings()).toEqual(['Sol Ring is already committed with Bob.']);
  });

  it('should stop warning about a committed card once it is unchecked', async () => {
    await initFixture(committedWithBob);

    click('.trade-proposal-given', 'Sol Ring');

    expect(warnings()).toEqual([]);
    expect(fixture.nativeElement.querySelector('.committed-cards-warning')).toBeNull();
  });

  it('should not warn about a card I would receive', async () => {
    await initFixture(new Map([['brainstorm', ['Dave']]]));

    click('.trade-proposal-received', 'Brainstorm');

    expect(warnings()).toEqual([]);
  });

  it('should not warn when none of my checked cards is committed', async () => {
    await initFixture(new Map());

    click('.trade-proposal-given', 'Thoughtseize');

    expect(warnings()).toEqual([]);
  });
});
