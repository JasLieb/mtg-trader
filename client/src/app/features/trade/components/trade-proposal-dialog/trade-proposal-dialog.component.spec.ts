import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { WantlistService } from '../../../collection/services/wantlist/wantlist.service';
import { makeCard } from '../../../common/models/card';
import { UserTrader } from '../../models/user-trader';
import { TradeProposalService } from '../../services/trade-proposal/trade-proposal.service';
import { TradeProposalDialogComponent } from './trade-proposal-dialog.component';

describe('TradeProposalDialogComponent', () => {
  let fixture: ComponentFixture<TradeProposalDialogComponent>;
  let tradeProposalService: jasmine.SpyObj<TradeProposalService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<TradeProposalDialogComponent>>;

  // Scenario 1 of the spec, seen by Alice: Bob holds the Ragavan she wants and wants her Sol Ring.
  const bob: UserTrader = {
    id: 'bob',
    name: 'Bob',
    doubles: [makeCard('ragavan', 'Ragavan')],
    wanted: [makeCard('sol-ring', 'Sol Ring')],
  };

  async function initFixture(partner: UserTrader) {
    tradeProposalService = jasmine.createSpyObj('TradeProposalService', [
      'send',
      'fetchPartnerDoubles',
      'fetchCommittedCards',
    ]);
    tradeProposalService.send.and.returnValue(of([]));
    tradeProposalService.fetchPartnerDoubles.and.returnValue(of([]));
    tradeProposalService.fetchCommittedCards.and.returnValue(of(new Map()));
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: partner },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: TradeProposalService, useValue: tradeProposalService },
        { provide: WantlistService, useValue: { doubles$: of(undefined) } },
      ],
      imports: [TradeProposalDialogComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TradeProposalDialogComponent);
    fixture.detectChanges();
  }

  function checkboxes(selector: string): HTMLInputElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll(`${selector} input[type="checkbox"]`)
    );
  }

  function sendButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.trade-proposal-send');
  }

  it('should check every card of the Trade match when opened', async () => {
    await initFixture(bob);

    expect(checkboxes('.trade-proposal-received').map((c) => c.checked)).toEqual([true]);
    expect(checkboxes('.trade-proposal-given').map((c) => c.checked)).toEqual([true]);
    expect(sendButton().disabled).toBeFalse();
  });

  it('should send the checked cards to the partner and close when send', async () => {
    await initFixture(bob);

    sendButton().click();

    expect(tradeProposalService.send).toHaveBeenCalledOnceWith({
      recipientId: 'bob',
      givenCards: ['sol-ring'],
      receivedCards: ['ragavan'],
    });
    expect(dialogRef.close).toHaveBeenCalledOnceWith(true);
  });

  it('should not send when every given card is unchecked', async () => {
    await initFixture(bob);

    checkboxes('.trade-proposal-given')[0].click();
    fixture.detectChanges();

    expect(sendButton().disabled).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain(
      'Pick at least one card on each side.'
    );
    fixture.componentInstance.send();
    expect(tradeProposalService.send).not.toHaveBeenCalled();
  });

  it('should not send when the partner holds none of the cards I want', async () => {
    await initFixture({ ...bob, doubles: [] });

    expect(fixture.nativeElement.textContent).toContain("none of Bob's doubles");
    expect(sendButton().disabled).toBeTrue();
  });

  it('should stay open and say so when the proposal is refused', async () => {
    await initFixture(bob);
    tradeProposalService.send.and.returnValue(throwError(() => new Error('400')));

    sendButton().click();
    fixture.detectChanges();

    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain(
      'The trade proposal could not be sent.'
    );
    expect(sendButton().disabled).toBeFalse();
  });
});
