import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TradeHomeComponent } from './trade-home.component';
import { TradeService } from '../../services/trade/trade.service';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NavigationService } from '../../../../core/services/navigation/navigation.service';
import { UserTrader } from '../../models/user-trader';
import { ChatService } from '../../services/chat/chat.service';

describe('TradeHomeComponent', () => {
  let component: TradeHomeComponent;
  let fixture: ComponentFixture<TradeHomeComponent>;
  let chatService: jasmine.SpyObj<ChatService>;
  let tradeService: jasmine.SpyObj<TradeService>;
  let navigationService: jasmine.SpyObj<NavigationService>;

  beforeEach(async () => {
    const chatSpy = jasmine.createSpyObj('ChatService', ['initChat']);
    const tradeSpy = jasmine.createSpyObj('TradeService', ['find']);
    const navigationSpy = jasmine.createSpyObj('NavigationService', ['navigateChat']);
    await TestBed.configureTestingModule({
      providers: [
        { provide: ChatService, useValue: chatSpy },
        { provide: TradeService, useValue: tradeSpy },
        { provide: NavigationService, useValue: navigationSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      imports: [TradeHomeComponent, NoopAnimationsModule],
    }).compileComponents();

    chatService = TestBed.inject(ChatService) as jasmine.SpyObj<ChatService>;

    tradeService = TestBed.inject(TradeService) as jasmine.SpyObj<TradeService>;
    tradeService.find.and.callFake(() => of([]));

    navigationService = TestBed.inject(NavigationService) as jasmine.SpyObj<NavigationService>;
  });

  function initFixture() {
    fixture = TestBed.createComponent(TradeHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should be created', () => {
    initFixture();
    expect(component).toBeTruthy();
  });

  it('should find trade after content init', () => {
    initFixture();
    expect(tradeService.find.calls.count()).toBe(1);
  });

  it('should display user with tradeable doubles when some', () => {
    tradeService.find.and.callFake(() => of([{ id: '1' } as UserTrader]));

    initFixture();

    const users = fixture.nativeElement.querySelectorAll('.trade-user');
    expect(users.length).toBe(1);

    const cardList = fixture.nativeElement.querySelector('app-trade-card-list');
    expect(cardList).toBeTruthy();
  });

  it('should have trade actions', () => {
    tradeService.find.and.callFake(() => of([{ id: '1' } as UserTrader]));
    initFixture();

    const actions =
      fixture.nativeElement.querySelectorAll('.trade-user-action');
    expect(actions.length).toBe(1);
  });

  it('should init new chat on send message button click', () => {
    const userToChat = { id: '1' } as UserTrader;
    tradeService.find.and.callFake(() => of([userToChat]));
    initFixture();

    const actions =
      fixture.nativeElement.querySelectorAll('.trade-user-action');
    actions[0].click();

    expect(chatService.initChat).toHaveBeenCalledOnceWith(userToChat);
  });

  it('should navigate to chat home component on send message button click', () => {
    tradeService.find.and.callFake(() => of([{ id: '1' } as UserTrader]));
    initFixture();

    const actions =
      fixture.nativeElement.querySelectorAll('.trade-user-action');
    actions[0].click();

    expect(navigationService.navigateChat).toHaveBeenCalledOnceWith('1');
  });
});
