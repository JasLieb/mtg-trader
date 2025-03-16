import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Card, makeCard, makeCardMin } from '../../../common/models/card';
import { Wantlist } from '../../models/wantlist';
import { WantlistService } from '../../services/wantlist/wantlist.service';
import { WantlistComponent } from './wantlist.component';

describe('WantlistComponent', () => {
  let component: WantlistComponent;
  let fixture: ComponentFixture<WantlistComponent>;
  let wantlistService: jasmine.SpyObj<WantlistService>;

  beforeEach(async () => {
    const wantlistSpy = jasmine.createSpyObj('WantlistService', [
      'updateWantlist',
      'delete',
    ]);
    await TestBed.configureTestingModule({
      providers: [
        { provide: WantlistService, useValue: wantlistSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      imports: [WantlistComponent, NoopAnimationsModule],
    }).compileComponents();

    wantlistService = TestBed.inject(
      WantlistService
    ) as jasmine.SpyObj<WantlistService>;

    fixture = TestBed.createComponent(WantlistComponent);
    component = fixture.componentInstance;
  });

  function initInput(wantlist?: Wantlist) {
    fixture.componentRef.setInput(
      'wantlist',
      wantlist ?? {
        name: 'firstWantlist',
        cards: [],
      }
    );
    fixture.detectChanges();
  }

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have input wantlist name', () => {
    initInput();

    expect(component.name()).toBe('firstWantlist');
  });

  it('should add card to wantlist when searched card is found', () => {
    const expectedCard = makeCard('toto', 'toto');
    initInput({
      id: 'id',
      name: 'firstWantlist',
      cards: [],
    });

    component.addCardToWantlist(expectedCard);

    expect(wantlistService.updateWantlist.calls.count()).toBe(1);
    expect(wantlistService.updateWantlist).toHaveBeenCalledWith(
      jasmine.objectContaining({ cards: [expectedCard] })
    );
  });

  it('should delete card when onDeleteCard emited', () => {
    const actualCard = makeCard('toto', 'toto');
    initInput({
      id: 'id',
      name: 'firstWantlist',
      cards: [actualCard],
    });

    component.deleteCard(actualCard);
    expect(wantlistService.updateWantlist.calls.count()).toBe(1);
    expect(wantlistService.updateWantlist).toHaveBeenCalledWith(
      jasmine.objectContaining({ cards: [] })
    );
  });

  it('should update wantlist when new set is emitted for a card', () => {
    const actualBaseCard = makeCardMin({
      id: 'toto',
      name: 'toto',
      sets: [
        { card_id: 'toto', set_id: 'totoSet', set_name: 'totoSet' },
        { card_id: 'titi', set_id: 'titiSet', set_name: 'titiSet' },
      ],
    } as Card);
    const expectedUpdatedCard = makeCardMin({
      id: 'titi',
      name: 'titi',
      sets: [
        { card_id: 'toto', set_id: 'totoSet', set_name: 'totoSet' },
        { card_id: 'titi', set_id: 'titiSet', set_name: 'titiSet' },
      ],
    } as Card);
    initInput({
      id: 'id',
      name: 'firstWantlist',
      cards: [actualBaseCard],
    });

    component.updateCardSet({
      baseCard: actualBaseCard,
      updatedCard: expectedUpdatedCard,
    });
    expect(wantlistService.updateWantlist.calls.count()).toBe(1);
    expect(wantlistService.updateWantlist).toHaveBeenCalledWith(
      jasmine.objectContaining({
        cards: [expectedUpdatedCard],
      })
    );
  });
});
