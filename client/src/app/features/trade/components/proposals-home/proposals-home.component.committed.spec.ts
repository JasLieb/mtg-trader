import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { NavigationService } from '../../../../core/services/navigation/navigation.service';
import { makeCard } from '../../../common/models/card';
import { CommittedCards } from '../../models/committed-cards';
import { TradeProposal } from '../../models/trade-proposal';
import { ChatService } from '../../services/chat/chat.service';
import { TradeProposalService } from '../../services/trade-proposal/trade-proposal.service';
import { ProposalsHomeComponent } from './proposals-home.component';

describe('ProposalsHomeComponent warning about committed cards before accepting', () => {
  let fixture: ComponentFixture<ProposalsHomeComponent>;
  let tradeProposalService: jasmine.SpyObj<TradeProposalService>;
  let proposals: BehaviorSubject<TradeProposal[]>;

  // Scenario 9 of the spec, seen by Bob: Alice gives him her Sol Ring and Thoughtseize for his Ragavan.
  const receivedFromAlice: TradeProposal = {
    id: 'p1',
    isSent: false,
    otherUserId: 'alice',
    otherUserName: 'alice@mail',
    givenCards: [makeCard('ragavan', 'Ragavan')],
    receivedCards: [makeCard('sol-ring', 'Sol Ring'), makeCard('thoughtseize', 'Thoughtseize')],
    state: 'Pending',
    sentAt: '2026-10-16T09:30:00Z',
    hasRemovedCards: false,
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

  // Bob's Ragavan is also in another of his proposals, still pending, with Alice.
  const ragavanCommitted: CommittedCards = new Map([['ragavan', ['alice@mail']]]);

  beforeEach(async () => {
    proposals = new BehaviorSubject<TradeProposal[]>([]);
    tradeProposalService = jasmine.createSpyObj(
      'TradeProposalService',
      ['refresh', 'accept', 'decline', 'withdraw', 'fetchCommittedCardsIn'],
      { proposals$: proposals.asObservable() }
    );
    tradeProposalService.accept.and.returnValue(of([]));
    tradeProposalService.decline.and.returnValue(of([]));
    tradeProposalService.withdraw.and.returnValue(of([]));
    tradeProposalService.fetchCommittedCardsIn.and.returnValue(of(ragavanCommitted));

    await TestBed.configureTestingModule({
      providers: [
        { provide: TradeProposalService, useValue: tradeProposalService },
        { provide: ChatService, useValue: jasmine.createSpyObj('ChatService', ['initChat']) },
        {
          provide: NavigationService,
          useValue: jasmine.createSpyObj('NavigationService', ['navigateChat']),
        },
      ],
      imports: [ProposalsHomeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProposalsHomeComponent);
    fixture.detectChanges();
  });

  function show(...shown: TradeProposal[]) {
    proposals.next(shown);
    fixture.detectChanges();
  }

  function click(selector: string) {
    fixture.nativeElement.querySelector(selector).click();
    fixture.detectChanges();
  }

  function warnings(): string[] {
    return Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll('.proposal-committed .committed-card')
    ).map((line) => line.textContent?.trim().replace(/\s+/g, ' ') ?? '');
  }

  function warningShown(): boolean {
    return fixture.nativeElement.querySelector('.proposal-committed') !== null;
  }

  // Scenario 9 of the spec.
  it('should warn Bob that his Ragavan is committed, then accept once he confirms', () => {
    show(receivedFromAlice);

    click('.proposal-accept');

    expect(tradeProposalService.fetchCommittedCardsIn).toHaveBeenCalledOnceWith('p1');
    expect(warnings()).toEqual(['Ragavan is already committed with alice@mail.']);
    expect(tradeProposalService.accept).not.toHaveBeenCalled();

    click('.proposal-confirm-accept');

    expect(tradeProposalService.accept).toHaveBeenCalledOnceWith('p1');
    // The service publishes the proposals the server sends back: it is now a Trade.
    show({ ...receivedFromAlice, state: 'Accepted' });
    expect(warningShown()).toBeFalse();
    expect(
      fixture.nativeElement.querySelector('.proposal-title').textContent.trim().replace(/\s+/g, ' ')
    ).toBe('Trade with alice@mail');
  });

  it('should accept at once when none of the cards I give is committed', () => {
    tradeProposalService.fetchCommittedCardsIn.and.returnValue(of(new Map()));
    show(receivedFromAlice);

    click('.proposal-accept');

    expect(tradeProposalService.accept).toHaveBeenCalledOnceWith('p1');
    expect(warningShown()).toBeFalse();
  });

  // A card I would receive is not mine to commit.
  it('should not warn about a card I would receive', () => {
    tradeProposalService.fetchCommittedCardsIn.and.returnValue(
      of(new Map([['sol-ring', ['Carol']]]))
    );
    show(receivedFromAlice);

    click('.proposal-accept');

    expect(warningShown()).toBeFalse();
    expect(tradeProposalService.accept).toHaveBeenCalledOnceWith('p1');
  });

  it('should not accept when the warning is cancelled', () => {
    show(receivedFromAlice);
    click('.proposal-accept');

    click('.proposal-cancel-accept');

    expect(warningShown()).toBeFalse();
    expect(tradeProposalService.accept).not.toHaveBeenCalled();
  });

  it('should let me decline instead once warned', () => {
    show(receivedFromAlice);
    click('.proposal-accept');

    click('.proposal-decline');

    expect(tradeProposalService.decline).toHaveBeenCalledOnceWith('p1');
    expect(tradeProposalService.accept).not.toHaveBeenCalled();
    expect(warningShown()).toBeFalse();
  });

  it('should drop the warning once the proposal is no longer pending', () => {
    show(receivedFromAlice);
    click('.proposal-accept');

    show({ ...receivedFromAlice, state: 'Withdrawn' });

    expect(warningShown()).toBeFalse();
  });

  it('should take no other action while it checks the cards I give', () => {
    const checking = new Subject<CommittedCards>();
    tradeProposalService.fetchCommittedCardsIn.and.returnValue(checking);
    show(receivedFromAlice);

    click('.proposal-accept');

    expect(fixture.nativeElement.querySelector('.proposal-decline').disabled).toBeTrue();
    checking.next(new Map());
    fixture.detectChanges();
    expect(tradeProposalService.accept).toHaveBeenCalledOnceWith('p1');
  });

  // The other User of the proposal never sees the warning: Alice has nothing to accept, and
  // withdrawing commits nothing.
  it('should never warn the proposer', () => {
    show(sentToBob);

    click('.proposal-withdraw');

    expect(tradeProposalService.withdraw).toHaveBeenCalledOnceWith('p1');
    expect(tradeProposalService.fetchCommittedCardsIn).not.toHaveBeenCalled();
    expect(warningShown()).toBeFalse();
  });
});
