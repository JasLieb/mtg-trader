import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { makeCard } from '../../../common/models/card';
import { TradeProposal } from '../../models/trade-proposal';
import { TradeProposalService } from '../../services/trade-proposal/trade-proposal.service';
import { ProposalsHomeComponent } from './proposals-home.component';

describe('ProposalsHomeComponent', () => {
  let fixture: ComponentFixture<ProposalsHomeComponent>;
  let tradeProposalService: jasmine.SpyObj<TradeProposalService>;
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

  beforeEach(async () => {
    proposals = new BehaviorSubject<TradeProposal[]>([]);
    tradeProposalService = jasmine.createSpyObj('TradeProposalService', ['refresh'], {
      proposals$: proposals.asObservable(),
    });

    await TestBed.configureTestingModule({
      providers: [{ provide: TradeProposalService, useValue: tradeProposalService }],
      imports: [ProposalsHomeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProposalsHomeComponent);
    fixture.detectChanges();
  });

  function titles(): string[] {
    return Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll('.proposal-title')
    ).map((title) => title.textContent?.trim().replace(/\s+/g, ' ') ?? '');
  }

  it('should reload the proposals when opened', () => {
    expect(tradeProposalService.refresh).toHaveBeenCalledTimes(1);
  });

  it('should say there is no proposal yet when there is none', () => {
    expect(fixture.nativeElement.querySelector('.proposals-empty')).toBeTruthy();
  });

  it('should show a sent proposal with its state and the cards of each side', () => {
    proposals.next([sentToBob]);
    fixture.detectChanges();

    expect(titles()).toEqual(['Sent to bob@mail']);
    expect(fixture.nativeElement.querySelector('.proposal-state').textContent).toContain('Pending');
    const given = fixture.nativeElement.querySelector('.proposal-given');
    const received = fixture.nativeElement.querySelector('.proposal-received');
    expect(given.textContent).toContain('Sol Ring');
    expect(received.textContent).toContain('Ragavan');
  });

  it('should show a received proposal with who sent it', () => {
    proposals.next([
      {
        ...sentToBob,
        id: 'p2',
        isSent: false,
        otherUserId: 'alice',
        otherUserName: 'alice@mail',
      },
    ]);
    fixture.detectChanges();

    expect(titles()).toEqual(['Received from alice@mail']);
  });

  it('should keep the order the proposals come in, pending first', () => {
    proposals.next([
      sentToBob,
      { ...sentToBob, id: 'p2', otherUserName: 'carol@mail', state: 'Accepted' },
    ]);
    fixture.detectChanges();

    expect(titles()).toEqual(['Sent to bob@mail', 'Sent to carol@mail']);
  });
});
