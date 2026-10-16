import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { NavigationService } from '../../../../core/services/navigation/navigation.service';
import { makeCard } from '../../../common/models/card';
import { TradeProposal } from '../../models/trade-proposal';
import { TradeProposalRefusal } from '../../models/trade-proposal-action';
import { ChatService } from '../../services/chat/chat.service';
import { TradeProposalService } from '../../services/trade-proposal/trade-proposal.service';
import { ProposalsHomeComponent } from './proposals-home.component';

describe('ProposalsHomeComponent expired proposals', () => {
  let fixture: ComponentFixture<ProposalsHomeComponent>;
  let tradeProposalService: jasmine.SpyObj<TradeProposalService>;
  let chatService: jasmine.SpyObj<ChatService>;
  let navigationService: jasmine.SpyObj<NavigationService>;
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
    sentAt: '2026-10-09T09:30:00Z',
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
    chatService = jasmine.createSpyObj('ChatService', ['initChat']);
    navigationService = jasmine.createSpyObj('NavigationService', ['navigateChat']);

    await TestBed.configureTestingModule({
      providers: [
        { provide: TradeProposalService, useValue: tradeProposalService },
        { provide: ChatService, useValue: chatService },
        { provide: NavigationService, useValue: navigationService },
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

  function texts(selector: string): string[] {
    return Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll(selector)).map(
      (element) => element.textContent?.trim().replace(/\s+/g, ' ') ?? ''
    );
  }

  // The actions on the proposal itself; the chat link, offered on every proposal, is left out.
  function actions(): string[] {
    return texts('mat-card-actions button:not(.proposal-chat)');
  }

  function chatLinks(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.proposal-chat'));
  }

  // Scenario 6 of the spec: the server reports it Expired to both Users.
  it('should show a proposal the server reports as expired with that state, sent or received', () => {
    show({ ...receivedFromAlice, state: 'Expired' }, { ...sentToBob, id: 'p2', state: 'Expired' });

    const states = texts('.proposal-state');
    expect(states.length).toBe(2);
    states.forEach((state) => expect(state).toContain('Expired'));
    expect(texts('.proposal-title')).toEqual(['Received from alice@mail', 'Sent to bob@mail']);
  });

  it('should offer no accept, decline or withdraw on an expired proposal', () => {
    show({ ...receivedFromAlice, state: 'Expired' }, { ...sentToBob, id: 'p2', state: 'Expired' });

    expect(actions()).toEqual([]);
  });

  it('should still offer to send a message to the other user of an expired proposal', () => {
    show({ ...receivedFromAlice, state: 'Expired' });

    expect(chatLinks().length).toBe(1);
    chatLinks()[0].click();

    expect(chatService.initChat).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({ id: 'alice', name: 'alice@mail' })
    );
    expect(navigationService.navigateChat).toHaveBeenCalledOnceWith('alice');
  });

  // Scenario 6 of the spec: the page was loaded before the proposal expired.
  it('should show the proposal expired once its acceptance is refused for no longer being pending', () => {
    tradeProposalService.accept.and.returnValue(
      throwError((): TradeProposalRefusal => ({ reason: 'not-pending' }))
    );
    show(receivedFromAlice);

    fixture.nativeElement.querySelector('.proposal-accept').click();
    // The service reloads the proposals after that refusal; the server now reports it expired.
    show({ ...receivedFromAlice, state: 'Expired' });

    expect(texts('.proposal-refusal')).toEqual(['This trade proposal is no longer pending.']);
    expect(texts('.proposal-state')[0]).toContain('Expired');
    expect(actions()).toEqual([]);
  });

  it('should trust the state the server reports and never work out expiry from the sending date', () => {
    show({ ...receivedFromAlice, sentAt: '2020-01-01T00:00:00Z' });

    expect(texts('.proposal-state')[0]).toContain('Pending');
    expect(actions()).toEqual(['Accept', 'Decline']);
  });
});
