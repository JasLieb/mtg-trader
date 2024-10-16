import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
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

  it(`should have displayed wantlist`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const wantlist = fixture.nativeElement.querySelector('app-wantlist');
    expect(wantlist).toBeTruthy();
  });
});
