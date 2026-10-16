import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, Subject } from 'rxjs';
import { TradeProposalService } from '../../../features/trade/services/trade-proposal/trade-proposal.service';
import { Routes } from '../../models/routesEnum';
import { AuthService } from '../../services/auth/auth.service';
import { NavigationService } from '../../services/navigation/navigation.service';
import { NavigationBarComponent } from './navigation-bar.component';

describe('NavigationBarComponent pending proposals counter', () => {
  let fixture: ComponentFixture<NavigationBarComponent>;
  let currentRoute: Subject<string>;
  let pendingReceivedCount: BehaviorSubject<number>;
  let tradeProposalService: jasmine.SpyObj<TradeProposalService>;

  beforeEach(async () => {
    currentRoute = new Subject<string>();
    pendingReceivedCount = new BehaviorSubject(0);
    tradeProposalService = jasmine.createSpyObj(
      'TradeProposalService',
      ['refreshPendingReceivedCount'],
      { pendingReceivedCount$: pendingReceivedCount.asObservable() }
    );

    await TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: jasmine.createSpyObj('AuthService', ['disconnect']) },
        {
          provide: NavigationService,
          useValue: jasmine.createSpyObj('NavigationService', ['navigateProposals'], {
            currentRoute$: currentRoute.asObservable(),
          }),
        },
        { provide: TradeProposalService, useValue: tradeProposalService },
      ],
      imports: [NavigationBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationBarComponent);
    fixture.detectChanges();
  });

  function proposalsItem(): HTMLElement | undefined {
    return Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll('.navigation-bar-item')
    ).find((item) => item.textContent?.includes('Proposals'));
  }

  function counter(): HTMLElement | null {
    return proposalsItem()?.querySelector('.navigation-bar-counter') ?? null;
  }

  it('should show no counter when no received proposal is pending', () => {
    expect(counter()).toBeNull();
  });

  it('should show the number of pending received proposals on the Proposals entry', () => {
    pendingReceivedCount.next(1);
    fixture.detectChanges();

    expect(counter()?.textContent?.trim()).toBe('1');
  });

  it('should hide the counter once no received proposal is pending anymore', () => {
    pendingReceivedCount.next(1);
    fixture.detectChanges();

    pendingReceivedCount.next(0);
    fixture.detectChanges();

    expect(counter()).toBeNull();
  });

  it('should reload the count when the app resumes the last route on load', () => {
    expect(tradeProposalService.refreshPendingReceivedCount).not.toHaveBeenCalled();

    currentRoute.next(Routes.WantlistsUrl);

    expect(tradeProposalService.refreshPendingReceivedCount).toHaveBeenCalledTimes(1);
  });

  it('should reload the count on every navigation', () => {
    currentRoute.next(Routes.WantlistsUrl);
    currentRoute.next(Routes.TradeUrl);
    currentRoute.next(Routes.ProposalsUrl);
    currentRoute.next(Routes.ChatUrl);

    expect(tradeProposalService.refreshPendingReceivedCount).toHaveBeenCalledTimes(4);
  });

  it('should not reload the count on the auth page, where nobody is connected', () => {
    currentRoute.next(Routes.AuthUrl);

    expect(tradeProposalService.refreshPendingReceivedCount).not.toHaveBeenCalled();
  });
});
