import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionDisplayerComponent } from './collection-displayer.component';
import { WantlistService } from '../../services/wantlist/wantlist.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CollectionDisplayerComponent', () => {
  let component: CollectionDisplayerComponent;
  let fixture: ComponentFixture<CollectionDisplayerComponent>;
  let wantlistService: jasmine.SpyObj<WantlistService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CollectionDisplayerComponent,
        HttpClientTestingModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();

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
    const tabs = fixture.nativeElement.querySelectorAll('.mat-mdc-tab');
    expect(tabs.length).toBe(2);
  });

  it(`should have displayed wantlist`, (done) => {
    fixture.nativeElement.querySelectorAll('.mat-mdc-tab')[0].click();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      const wantlist = fixture.nativeElement.querySelector(
        'app-wantlists-manager'
      );
      expect(wantlist).toBeTruthy();
      done();
    });
  });

  it(`should have displayed doubles`, (done) => {
    fixture.nativeElement.querySelectorAll('.mat-mdc-tab')[1].click();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      const doubles =
        fixture.debugElement.nativeElement.querySelector('app-wantlist');
      expect(doubles).toBeTruthy();
      done();
    });
  });
});
