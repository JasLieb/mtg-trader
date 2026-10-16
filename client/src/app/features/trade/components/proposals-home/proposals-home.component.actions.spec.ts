import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { makeCard } from '../../../common/models/card';
import { TradeProposal } from '../../models/trade-proposal';
import { TradeProposalRefusal } from '../../models/trade-proposal-action';
import { TradeProposalService } from '../../services/trade-proposal/trade-proposal.service';
import { ProposalsHomeComponent } from './proposals-home.component';

describe('ProposalsHomeComponent actions', () => {
  let fixture: ComponentFixture<ProposalsHomeComponent>;
  let tradeProposalService: jasmine.SpyObj<TradeProposalService>;
  let proposals: BehaviorSubject<TradeProposal[]>;

  // Scenario 1 of the spec, seen by Bob: Alice gives him her Sol Ring for his Ragavan.
  const receivedFromAlice: TradeProposal = {
    id: 'p1',
    isSent: false,
    otherUserId: 'alice',
    otherUserName: 'alice@mail',
    givenCards: [makeCard('ragavan', 'Ragavan')],
    receivedCards: [makeCard('sol-ring', 'Sol Ring')],
    state: 'Pending',
    sentAt: '2026-10-16T09:30:00Z',
  };
  // The same proposal, seen by Alice.
  const sentToBob: TradeProposal = {
    ...receivedFromAlice,
    isSent: true,
    otherUserId: 'bob',
    otherUserName: 'bob@mail',
    givenCards: receivedFromAlice.receivedCards,
    receivedCards: receivedFromAlice.givenCards,
  };

  beforeEach(async () => {
    proposals = new BehaviorSubject<TradeProposal[]>([]);
    tradeProposalService = jasmine.createSpyObj(
      'TradeProposalService',
      ['refresh', 'accept', 'decline', 'withdraw'],
      { proposals$: proposals.asObservable() }
    );
    tradeProposalService.accept.and.returnValue(of([]));
    tradeProposalService.decline.and.returnValue(of([]));
    tradeProposalService.withdraw.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      providers: [{ provide: TradeProposalService, useValue: tradeProposalService }],
      imports: [ProposalsHomeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProposalsHomeComponent);
    fixture.detectChanges();
  });

  function show(...shown: TradeProposal[]) {
    proposals.next(shown);
    fixture.detectChanges();
  }

  function button(selector: string): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function actions(): string[] {
    return Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll('mat-card-actions button')
    ).map((action) => action.textContent?.trim() ?? '');
  }

  function refusalText(): string {
    return (
      fixture.nativeElement
        .querySelector('.proposal-refusal')
        ?.textContent?.trim()
        .replace(/\s+/g, ' ') ?? ''
    );
  }

  function refuse(refusal: TradeProposalRefusal) {
    return throwError(() => refusal);
  }

  it('should offer to accept or decline a pending proposal I received', () => {
    show(receivedFromAlice);

    expect(actions()).toEqual(['Accept', 'Decline']);
  });

  it('should offer to withdraw a pending proposal I sent', () => {
    show(sentToBob);

    expect(actions()).toEqual(['Withdraw']);
  });

  for (const state of ['Accepted', 'Declined', 'Withdrawn'] as const) {
    it(`should offer no action on a ${state} proposal`, () => {
      show({ ...receivedFromAlice, state }, { ...sentToBob, id: 'p2', state });

      expect(actions()).toEqual([]);
    });
  }

  it('should show an accepted proposal as a Trade', () => {
    show({ ...sentToBob, state: 'Accepted' });

    const title = fixture.nativeElement.querySelector('.proposal-title');
    expect(title.textContent.trim().replace(/\s+/g, ' ')).toBe('Trade with bob@mail');
  });

  it('should accept the proposal when Accept is clicked', () => {
    show(receivedFromAlice);

    button('.proposal-accept')!.click();

    expect(tradeProposalService.accept).toHaveBeenCalledOnceWith('p1');
  });

  it('should decline the proposal when Decline is clicked', () => {
    show(receivedFromAlice);

    button('.proposal-decline')!.click();

    expect(tradeProposalService.decline).toHaveBeenCalledOnceWith('p1');
  });

  it('should withdraw the proposal when Withdraw is clicked', () => {
    show(sentToBob);

    button('.proposal-withdraw')!.click();

    expect(tradeProposalService.withdraw).toHaveBeenCalledOnceWith('p1');
  });

  it('should send one action at a time', () => {
    const pending = new Subject<TradeProposal[]>();
    tradeProposalService.accept.and.returnValue(pending);
    show(receivedFromAlice);

    button('.proposal-accept')!.click();
    fixture.detectChanges();

    expect(button('.proposal-decline')!.disabled).toBeTrue();
    fixture.componentInstance.decline(receivedFromAlice);
    expect(tradeProposalService.decline).not.toHaveBeenCalled();

    pending.next([]);
    fixture.detectChanges();
    expect(button('.proposal-decline')!.disabled).toBeFalse();
  });

  // Scenario 7 of the spec.
  it('should name the missing cards when the acceptance is refused for them', () => {
    tradeProposalService.accept.and.returnValue(
      refuse({ reason: 'missing-cards', missingCards: ['sol-ring'] })
    );
    show(receivedFromAlice);

    button('.proposal-accept')!.click();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.proposal-missing-cards').textContent
    ).toBe('Sol Ring');
    expect(refusalText()).toContain("Can't accept");
    expect(actions()).toEqual(['Accept', 'Decline']);
  });

  // Scenario 5 of the spec: Alice withdrew it before Bob accepted.
  it('should say the proposal is no longer pending when the action is refused for that', () => {
    tradeProposalService.accept.and.returnValue(refuse({ reason: 'not-pending' }));
    show(receivedFromAlice);

    button('.proposal-accept')!.click();
    show({ ...receivedFromAlice, state: 'Withdrawn' });

    expect(refusalText()).toBe('This trade proposal is no longer pending.');
    expect(actions()).toEqual([]);
  });

  it('should say the action failed when it is refused for another reason', () => {
    tradeProposalService.withdraw.and.returnValue(refuse({ reason: 'failed' }));
    show(sentToBob);

    button('.proposal-withdraw')!.click();
    fixture.detectChanges();

    expect(refusalText()).toBe('The trade proposal could not be updated.');
    expect(button('.proposal-withdraw')!.disabled).toBeFalse();
  });

  it('should clear the refusal when the next action on the proposal succeeds', () => {
    tradeProposalService.accept.and.returnValue(
      refuse({ reason: 'missing-cards', missingCards: ['sol-ring'] })
    );
    show(receivedFromAlice);
    button('.proposal-accept')!.click();
    fixture.detectChanges();

    button('.proposal-decline')!.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.proposal-refusal')).toBeNull();
  });
});
