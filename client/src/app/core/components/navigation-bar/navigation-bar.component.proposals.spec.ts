import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TradeProposalService } from '../../../features/trade/services/trade-proposal/trade-proposal.service';
import { Routes } from '../../models/routesEnum';
import { AuthService } from '../../services/auth/auth.service';
import { NavigationService } from '../../services/navigation/navigation.service';
import { NavigationBarComponent } from './navigation-bar.component';

describe('NavigationBarComponent proposals entry', () => {
  let navService: jasmine.SpyObj<NavigationService>;
  let fixture: ComponentFixture<NavigationBarComponent>;

  async function initFixture(currentRoute: string) {
    navService = jasmine.createSpyObj('NavigationService', ['navigateProposals'], {
      currentRoute$: of(currentRoute),
    });
    await TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: jasmine.createSpyObj('AuthService', ['disconnect']) },
        { provide: NavigationService, useValue: navService },
        {
          provide: TradeProposalService,
          useValue: jasmine.createSpyObj(
            'TradeProposalService',
            ['refreshPendingReceivedCount'],
            { pendingReceivedCount$: of(0) }
          ),
        },
      ],
      imports: [NavigationBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationBarComponent);
    fixture.detectChanges();
  }

  function proposalsItem(): HTMLElement | undefined {
    return Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll('.navigation-bar-item')
    ).find((item) => item.textContent?.trim() === 'Proposals');
  }

  it('should navigate to the proposals when the Proposals item is clicked', async () => {
    await initFixture('');

    proposalsItem()?.click();

    expect(navService.navigateProposals).toHaveBeenCalled();
  });

  it('should have proposals underlined when is proposals url', async () => {
    await initFixture(Routes.ProposalsUrl);

    expect(fixture.componentInstance.isProposalsTab()).toBeTrue();
    expect(proposalsItem()?.classList).toContain('navigation-bar-item-selected');
  });
});
