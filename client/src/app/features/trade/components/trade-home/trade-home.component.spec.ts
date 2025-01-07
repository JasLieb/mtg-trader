import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeHomeComponent } from './trade-home.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TradeService } from '../../services/trade/trade.service';
import { of } from 'rxjs';
import { UserDoubles } from '../../models/user-doubles';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('TradeHomeComponent', () => {
  let component: TradeHomeComponent;
  let fixture: ComponentFixture<TradeHomeComponent>;
  let service: jasmine.SpyObj<TradeService>;

  beforeEach(async () => {
    const tradeSpy = jasmine.createSpyObj('TradeService', ['find']);
    await TestBed.configureTestingModule({
      providers: [{ provide: TradeService, useValue: tradeSpy }],
      imports: [
        TradeHomeComponent,
        HttpClientTestingModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();

    service = TestBed.inject(TradeService) as jasmine.SpyObj<TradeService>;
    service.find.and.callFake(() => of([]));
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
    expect(service.find.calls.count()).toBe(1);
  });

  it('should display user with tradeable doubles when some', () => {
    service.find.and.callFake(() => of([{}] as UserDoubles[]));

    initFixture();

    const users = fixture.nativeElement.querySelectorAll('.trade-user');
    expect(users.length).toBe(1);

    const cardList = fixture.nativeElement.querySelector('app-trade-card-list');
    expect(cardList).toBeTruthy();
  });

  it('should have trade actions', () => {
    service.find.and.callFake(() => of([{}] as UserDoubles[]));
    initFixture();

    const actions = fixture.nativeElement.querySelectorAll('.trade-user-action');
    expect(actions.length).toBe(1);
  });
});
