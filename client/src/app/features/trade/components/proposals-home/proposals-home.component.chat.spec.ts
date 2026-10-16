import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { NavigationService } from '../../../../core/services/navigation/navigation.service';
import { makeCard } from '../../../common/models/card';
import { TradeProposal } from '../../models/trade-proposal';
import { ChatService } from '../../services/chat/chat.service';
import { TradeProposalService } from '../../services/trade-proposal/trade-proposal.service';
import { ProposalsHomeComponent } from './proposals-home.component';

describe('ProposalsHomeComponent conversation link', () => {
  let fixture: ComponentFixture<ProposalsHomeComponent>;
  let chatService: jasmine.SpyObj<ChatService>;
  let navigationService: jasmine.SpyObj<NavigationService>;
  let proposals: BehaviorSubject<TradeProposal[]>;

  const sentToBob: TradeProposal = {
    id: 'p1',
    isSent: true,
    otherUserId: 'bob',
    otherUserName: 'bob@mail',
    givenCards: [makeCard('sol-ring', 'Sol Ring')],
    receivedCards: [makeCard('ragavan', 'Ragavan')],
    state: 'Pending',
    sentAt: '2026-10-16T09:30:00Z',
  };
  const receivedFromCarol: TradeProposal = {
    ...sentToBob,
    id: 'p2',
    isSent: false,
    otherUserId: 'carol',
    otherUserName: 'carol@mail',
    state: 'Declined',
  };

  beforeEach(async () => {
    proposals = new BehaviorSubject<TradeProposal[]>([sentToBob, receivedFromCarol]);
    chatService = jasmine.createSpyObj('ChatService', ['initChat']);
    navigationService = jasmine.createSpyObj('NavigationService', ['navigateChat']);

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: TradeProposalService,
          useValue: jasmine.createSpyObj('TradeProposalService', ['refresh'], {
            proposals$: proposals.asObservable(),
          }),
        },
        { provide: ChatService, useValue: chatService },
        { provide: NavigationService, useValue: navigationService },
      ],
      imports: [ProposalsHomeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProposalsHomeComponent);
    fixture.detectChanges();
  });

  function chatLinks(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.proposal-chat'));
  }

  it('should offer a link to the conversation on every proposal, whatever its state', () => {
    expect(chatLinks().length).toBe(2);
  });

  it('should open the conversation with the recipient of a sent proposal', () => {
    chatLinks()[0].click();

    expect(chatService.initChat).toHaveBeenCalledOnceWith({
      id: 'bob',
      name: 'bob@mail',
      doubles: sentToBob.receivedCards,
      wanted: sentToBob.givenCards,
    });
    expect(navigationService.navigateChat).toHaveBeenCalledOnceWith('bob');
  });

  it('should open the conversation with the author of a received proposal', () => {
    chatLinks()[1].click();

    expect(chatService.initChat).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({ id: 'carol', name: 'carol@mail' })
    );
    expect(navigationService.navigateChat).toHaveBeenCalledOnceWith('carol');
  });

  it('should start the chat before going to the chat page', () => {
    navigationService.navigateChat.and.callFake(() =>
      expect(chatService.initChat).toHaveBeenCalled()
    );

    chatLinks()[0].click();

    expect(navigationService.navigateChat).toHaveBeenCalled();
  });
});
