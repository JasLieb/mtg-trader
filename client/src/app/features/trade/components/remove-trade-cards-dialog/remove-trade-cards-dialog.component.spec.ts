import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, Subject, throwError } from 'rxjs';
import { makeCard } from '../../../common/models/card';
import { TradeCardsRemovalRefusal } from '../../models/trade-cards-removal';
import { TradeProposal } from '../../models/trade-proposal';
import { TradeProposalService } from '../../services/trade-proposal/trade-proposal.service';
import { RemoveTradeCardsDialogComponent } from './remove-trade-cards-dialog.component';

describe('RemoveTradeCardsDialogComponent', () => {
  let fixture: ComponentFixture<RemoveTradeCardsDialogComponent>;
  let tradeProposalService: jasmine.SpyObj<TradeProposalService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<RemoveTradeCardsDialogComponent>>;

  // Scenarios 1 and 9 of the spec, seen by Alice: Bob accepted her Sol Ring and Thoughtseize for his Ragavan.
  const tradeWithBob: TradeProposal = {
    id: 'p1',
    isSent: true,
    otherUserId: 'bob',
    otherUserName: 'bob@mail',
    givenCards: [
      makeCard('sol-ring', 'Sol Ring'),
      makeCard('thoughtseize', 'Thoughtseize'),
    ],
    receivedCards: [makeCard('ragavan', 'Ragavan')],
    state: 'Accepted',
    sentAt: '2026-10-16T09:30:00Z',
    hasRemovedCards: false,
  };

  beforeEach(async () => {
    tradeProposalService = jasmine.createSpyObj('TradeProposalService', ['removeCards']);
    tradeProposalService.removeCards.and.returnValue(of([]));
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: tradeWithBob },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: TradeProposalService, useValue: tradeProposalService },
      ],
      imports: [RemoveTradeCardsDialogComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(RemoveTradeCardsDialogComponent);
    fixture.detectChanges();
  });

  function checkboxes(selector: string): HTMLInputElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll(`${selector} input[type="checkbox"]`)
    );
  }

  function labels(selector: string): string[] {
    return Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll(selector)).map(
      (checkbox) => checkbox.textContent?.trim() ?? ''
    );
  }

  function validateButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.remove-trade-cards-validate');
  }

  function errorText(): string {
    return (
      fixture.nativeElement
        .querySelector('.remove-trade-cards-error')
        ?.textContent?.trim()
        .replace(/\s+/g, ' ') ?? ''
    );
  }

  it('should list every card of the trade, grouped by side, all checked', () => {
    expect(labels('.remove-trade-cards-given')).toEqual(['Sol Ring', 'Thoughtseize']);
    expect(labels('.remove-trade-cards-received')).toEqual(['Ragavan']);
    expect(checkboxes('.remove-trade-cards-given').map((c) => c.checked)).toEqual([true, true]);
    expect(checkboxes('.remove-trade-cards-received').map((c) => c.checked)).toEqual([true]);
  });

  it('should remove every card and close when validated as opened', () => {
    validateButton().click();

    expect(tradeProposalService.removeCards).toHaveBeenCalledOnceWith('p1', {
      givenCards: ['sol-ring', 'thoughtseize'],
      receivedCards: ['ragavan'],
    });
    expect(dialogRef.close).toHaveBeenCalledOnceWith(true);
  });

  // Scenario 10 of the spec.
  it('should keep Sol Ring out of the removal when Alice unchecks it', () => {
    checkboxes('.remove-trade-cards-given')[0].click();
    fixture.detectChanges();

    validateButton().click();

    expect(tradeProposalService.removeCards).toHaveBeenCalledOnceWith('p1', {
      givenCards: ['thoughtseize'],
      receivedCards: ['ragavan'],
    });
  });

  it('should still validate the step when every card is unchecked', () => {
    for (const checkbox of [
      ...checkboxes('.remove-trade-cards-given'),
      ...checkboxes('.remove-trade-cards-received'),
    ])
      checkbox.click();
    fixture.detectChanges();

    expect(validateButton().disabled).toBeFalse();
    validateButton().click();

    expect(tradeProposalService.removeCards).toHaveBeenCalledOnceWith('p1', {
      givenCards: [],
      receivedCards: [],
    });
    expect(dialogRef.close).toHaveBeenCalledOnceWith(true);
  });

  it('should send the step once while it is being written', () => {
    tradeProposalService.removeCards.and.returnValue(new Subject<TradeProposal[]>());

    validateButton().click();
    fixture.detectChanges();

    expect(validateButton().disabled).toBeTrue();
    fixture.componentInstance.remove();
    expect(tradeProposalService.removeCards).toHaveBeenCalledTimes(1);
  });

  for (const [refusal, message] of [
    [
      { reason: 'not-available' },
      'No card was removed: this trade changed since it was loaded.',
    ],
    [{ reason: 'failed' }, 'The cards could not be removed from your lists.'],
  ] as [TradeCardsRemovalRefusal, string][]) {
    it(`should stay open and say so when the step is refused as ${refusal.reason}`, () => {
      tradeProposalService.removeCards.and.returnValue(throwError(() => refusal));

      validateButton().click();
      fixture.detectChanges();

      expect(dialogRef.close).not.toHaveBeenCalled();
      expect(errorText()).toBe(message);
      expect(validateButton().disabled).toBeFalse();
    });
  }
});
