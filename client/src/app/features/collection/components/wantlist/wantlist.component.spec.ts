import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WantlistComponent } from './wantlist.component';
import { WantlistService } from '../../services/wantlist/wantlist.service';
import { Card } from '../../models/card';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('WantlistComponent', () => {
  let component: WantlistComponent;
  let fixture: ComponentFixture<WantlistComponent>;
  let wantlistService: jasmine.SpyObj<WantlistService>;

  beforeEach(async () => {
    const wantlistSpy = jasmine.createSpyObj('WantlistService', [
      'updateWantlist', 'delete'
    ]);
    await TestBed.configureTestingModule({
      providers: [{ provide: WantlistService, useValue: wantlistSpy }],
      imports: [HttpClientTestingModule, WantlistComponent],
    }).compileComponents();

    wantlistService = TestBed.inject(WantlistService) as jasmine.SpyObj<WantlistService>;

    fixture = TestBed.createComponent(WantlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    const cardList = fixture.nativeElement.querySelector('app-card-list');
    expect(cardList).toBeTruthy();
  });

  it('should have card searcher', () => {
    const searcher = fixture.nativeElement.querySelector('app-card-searcher');
    expect(searcher).toBeTruthy();
  });

  it('should add card to wantlist when searched card is found', () => {
    fixture.componentRef.setInput('wantlist', {
      id: 'id',
      name: 'firstWantlist',
      cards: [],
    });
    fixture.detectChanges();

    component.addCardToWantlist({ id: 'toto', name: 'toto' } as Card);

    expect(wantlistService.updateWantlist.calls.count()).toBe(1);
    expect(wantlistService.updateWantlist).toHaveBeenCalledWith(
      jasmine.objectContaining({ cards: [{ id: 'toto', name: 'toto' }] })
    );
  });

  it('should delete card when onDeleteCard emited', () => {
    fixture.componentRef.setInput('wantlist', {
      id: 'id',
      name: 'firstWantlist',
      cards: [{ id: 'toto', name: 'toto' } as Card],
    });

    component.deleteCard({ id: 'toto', name: 'toto' } as Card);
    expect(wantlistService.updateWantlist.calls.count()).toBe(1);
    expect(wantlistService.updateWantlist).toHaveBeenCalledWith(
      jasmine.objectContaining({ cards: [] })
    );
  });

  it('should allow wantlist deletion when delete button is clicked', () => {
    fixture.componentRef.setInput('wantlist', {
      id: 'id',
      name: 'firstWantlist',
      cards: [{ id: 'toto', name: 'toto' } as Card],
    });

    const deletionButton = fixture.nativeElement.querySelector('button');
    deletionButton.click();

    expect(wantlistService.delete.calls.count()).toBe(1);
    expect(wantlistService.delete).toHaveBeenCalledWith('id');
  });
});
