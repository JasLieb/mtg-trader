import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionDisplayerComponent } from './collection-displayer.component';
import { WantlistService } from '../../services/wantlist/wantlist.service';
import { of } from 'rxjs';
import { Wantlist } from '../../models/wantlist';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CollectionDisplayerComponent', () => {
  let component: CollectionDisplayerComponent;
  let fixture: ComponentFixture<CollectionDisplayerComponent>;
  let wantlistService: jasmine.SpyObj<WantlistService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionDisplayerComponent, HttpClientTestingModule]
    })
    .compileComponents();

    wantlistService = TestBed.inject(
      WantlistService
    ) as jasmine.SpyObj<WantlistService>;

    fixture = TestBed.createComponent(CollectionDisplayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have wantlist and double tabs', () => {
    const tabs = fixture.nativeElement.querySelectorAll('.collection-tab');
    expect(tabs.length).toBe(2);
  });

  it('should have wantlist displayed on wantlist tab clicked', () => {
    const tabs = fixture.nativeElement.querySelectorAll('.collection-tab');

    tabs[0].click();
    fixture.detectChanges();

    expect(component.areWantlistsDisplayed()).toBeTrue();
  });

  it('should have doubles displayed on double tab clicked', () => {
    const tabs = fixture.nativeElement.querySelectorAll('.collection-tab');

    tabs[1].click();
    fixture.detectChanges();

    expect(component.areWantlistsDisplayed()).toBeFalse();
  });

  it('should have action buttons', () => {
    const buttons = fixture.nativeElement.querySelector('.collection-actions');
    expect(buttons).toBeTruthy();
  });

  it(`should have displayed wantlist`, () => {
    wantlistService.wantlists$ = of([{id: 't', name: 'toto', cards: []}] as Wantlist[])
    fixture = TestBed.createComponent(CollectionDisplayerComponent);
    fixture.detectChanges();
    const wantlist = fixture.nativeElement.querySelector('app-wantlist');
    expect(wantlist).toBeTruthy();
  });

  it(`should have displayed doubles`, () => {
    wantlistService.doubles$ = of({id: 't', name: 'toto', cards: []} as Wantlist)
    fixture = TestBed.createComponent(CollectionDisplayerComponent);
    fixture.nativeElement.querySelectorAll('.collection-tab')[1].click();

    fixture.detectChanges();

    const doubles = fixture.nativeElement.querySelector('app-wantlist');
    expect(doubles).toBeTruthy();
  });
});
