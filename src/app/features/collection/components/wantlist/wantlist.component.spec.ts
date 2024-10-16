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
      'getWantlist',
    ]);
    await TestBed.configureTestingModule({
      providers: [{ provide: WantlistService, useValue: wantlistSpy }],
      imports: [HttpClientTestingModule, WantlistComponent],
    }).compileComponents();

    wantlistService = TestBed.inject(
      WantlistService
    ) as jasmine.SpyObj<WantlistService>;

    fixture = TestBed.createComponent(WantlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get wantlist data', () => {
    expect(wantlistService.getWantlist.calls.count()).toEqual(1);
  });

  it('should not have card list if no card', () => {
    const wantlistData = {
      id: 'id',
      name: 'firstWantlist',
      cards: [],
    };
    wantlistService.getWantlist.and.returnValue(wantlistData);
    fixture.detectChanges();
    const cardList = fixture.nativeElement.querySelector('app-card-list');
    expect(cardList).toBeNull();
  });

  it('should have card list if any card', () => {
    const wantlistData = {
      id: 'id',
      name: 'firstWantlist',
      cards: [{ id: 'a', name: 'toto' } as Card],
    };
    wantlistService.getWantlist.and.returnValue(wantlistData);
    component.ngOnInit();
    fixture.detectChanges();

    const cardList = fixture.nativeElement.querySelector('app-card-list');
    expect(cardList).toBeTruthy();
  });

  it('should have card searcher', () => {
    const searcher = fixture.nativeElement.querySelector('app-card-searcher');
    expect(searcher).toBeTruthy();
  });
});
