import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { NavigationService } from '../../../../core/services/navigation/navigation.service';
import { makeCard } from '../../../common/models/card';
import { UserTrader } from '../../models/user-trader';
import { ChatService } from '../../services/chat/chat.service';
import { TradeService } from '../../services/trade/trade.service';
import { TradeHomeComponent } from './trade-home.component';

// Trade partners are symmetric, so a partner can have nothing to give me, or want nothing of mine.
describe('TradeHomeComponent with a one-sided Trade match', () => {
  let fixture: ComponentFixture<TradeHomeComponent>;
  let tradeService: jasmine.SpyObj<TradeService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: ChatService, useValue: jasmine.createSpyObj('ChatService', ['initChat']) },
        { provide: TradeService, useValue: jasmine.createSpyObj('TradeService', ['find']) },
        {
          provide: NavigationService,
          useValue: jasmine.createSpyObj('NavigationService', ['navigateChat']),
        },
      ],
      imports: [TradeHomeComponent, NoopAnimationsModule],
    }).compileComponents();

    tradeService = TestBed.inject(TradeService) as jasmine.SpyObj<TradeService>;
  });

  function initFixture(partners: UserTrader[]) {
    tradeService.find.and.returnValue(of(partners));
    fixture = TestBed.createComponent(TradeHomeComponent);
    fixture.detectChanges();
  }

  function cardLists(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('app-trade-card-list'));
  }

  it('should display a partner who holds none of the cards I want', () => {
    initFixture([
      { id: 'carol', name: 'Carol', doubles: [], wanted: [makeCard('sol-ring', 'Sol Ring')] },
    ]);

    expect(fixture.nativeElement.querySelectorAll('.trade-user').length).toBe(1);
    const [theirDoubles, myDoubles] = cardLists();
    expect(theirDoubles.textContent).toContain("none of Carol's doubles");
    expect(theirDoubles.querySelectorAll('.trade-card').length).toBe(0);
    expect(myDoubles.querySelectorAll('.trade-card').length).toBe(1);
  });

  it('should display a partner who wants none of my doubles', () => {
    initFixture([
      { id: 'bob', name: 'Bob', doubles: [makeCard('ragavan', 'Ragavan')], wanted: [] },
    ]);

    const [theirDoubles, myDoubles] = cardLists();
    expect(theirDoubles.querySelectorAll('.trade-card').length).toBe(1);
    expect(myDoubles.textContent).toContain('none of your doubles');
    expect(myDoubles.querySelectorAll('.trade-card').length).toBe(0);
  });

  it('should not display an empty message when both sides hold cards', () => {
    initFixture([
      {
        id: 'bob',
        name: 'Bob',
        doubles: [makeCard('ragavan', 'Ragavan')],
        wanted: [makeCard('sol-ring', 'Sol Ring')],
      },
    ]);

    expect(fixture.nativeElement.querySelectorAll('.trade-card-list-empty').length).toBe(0);
  });
});
