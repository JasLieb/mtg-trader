import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WantlistService } from './features/collection/services/wantlist/wantlist.service';
import { of } from 'rxjs';
import { Wantlist } from './features/collection/models/wantlist';

describe('AppComponent', () => {
  let wantlistService: jasmine.SpyObj<WantlistService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, HttpClientTestingModule],
    }).compileComponents();

    wantlistService = TestBed.inject(
      WantlistService
    ) as jasmine.SpyObj<WantlistService>;
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'MTG Trader' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('MTG Trader');
  });

  it(`should not have displayed wantlist if no wantlists`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const wantlist = fixture.nativeElement.querySelector('app-wantlist');
    expect(wantlist).toBeNull();
  });

  it(`should have displayed wantlist`, () => {
    wantlistService.wantlists$ = of([{id: 't', name: 'toto', cards: []}] as Wantlist[])
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const wantlist = fixture.nativeElement.querySelector('app-wantlist');
    expect(wantlist).toBeTruthy();
  });
});
