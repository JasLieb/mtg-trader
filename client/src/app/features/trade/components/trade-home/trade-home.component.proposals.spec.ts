import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { NavigationService } from '../../../../core/services/navigation/navigation.service';
import { makeCard } from '../../../common/models/card';
import { UserTrader } from '../../models/user-trader';
import { ChatService } from '../../services/chat/chat.service';
import { TradeService } from '../../services/trade/trade.service';
import { TradeProposalDialogComponent } from '../trade-proposal-dialog/trade-proposal-dialog.component';
import { TradeHomeComponent } from './trade-home.component';

describe('TradeHomeComponent proposing a trade', () => {
  let fixture: ComponentFixture<TradeHomeComponent>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let navigationService: jasmine.SpyObj<NavigationService>;

  const bob: UserTrader = {
    id: 'bob',
    name: 'Bob',
    doubles: [makeCard('ragavan', 'Ragavan')],
    wanted: [makeCard('sol-ring', 'Sol Ring')],
  };

  async function initFixture(dialogResult: boolean | undefined) {
    dialog = jasmine.createSpyObj('MatDialog', {
      open: jasmine.createSpyObj({ afterClosed: of(dialogResult) }),
    });
    navigationService = jasmine.createSpyObj('NavigationService', [
      'navigateChat',
      'navigateProposals',
    ]);
    const tradeService = jasmine.createSpyObj('TradeService', ['find']);
    tradeService.find.and.returnValue(of([bob]));

    await TestBed.configureTestingModule({
      providers: [
        { provide: MatDialog, useValue: dialog },
        { provide: NavigationService, useValue: navigationService },
        { provide: TradeService, useValue: tradeService },
        { provide: ChatService, useValue: jasmine.createSpyObj('ChatService', ['initChat']) },
      ],
      imports: [TradeHomeComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TradeHomeComponent);
    fixture.detectChanges();
  }

  function proposeButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.trade-user-propose');
  }

  it('should open the proposal form for the partner when propose a trade is clicked', async () => {
    await initFixture(undefined);

    proposeButton().click();

    expect(dialog.open).toHaveBeenCalledOnceWith(TradeProposalDialogComponent, {
      data: bob,
    });
  });

  it('should go to the proposals once the proposal is sent', async () => {
    await initFixture(true);

    proposeButton().click();

    expect(navigationService.navigateProposals).toHaveBeenCalledTimes(1);
  });

  it('should stay on the trade page when the form is cancelled', async () => {
    await initFixture(undefined);

    proposeButton().click();

    expect(navigationService.navigateProposals).not.toHaveBeenCalled();
  });
});
