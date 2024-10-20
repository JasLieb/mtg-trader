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

  it(`should have displayed wantlist`, () => {
    const wantlist = fixture.nativeElement.querySelector('app-wantlists-manager');
    expect(wantlist).toBeTruthy();
  });

  it(`should have displayed doubles`, () => {
    fixture.nativeElement.querySelectorAll('.collection-tab')[1].click();
    fixture.detectChanges();

    const doubles = fixture.nativeElement.querySelector('app-wantlist');
    expect(doubles).toBeTruthy();
  });
});
