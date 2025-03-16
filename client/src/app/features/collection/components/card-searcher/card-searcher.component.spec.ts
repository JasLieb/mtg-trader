import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
  tick,
} from '@angular/core/testing';

import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { Card } from '../../../common/models/card';
import { CardService } from '../../../common/services/card/card.service';
import { CardSearcherComponent } from './card-searcher.component';

describe('CardSearcherComponent', () => {
  let component: CardSearcherComponent;
  let fixture: ComponentFixture<CardSearcherComponent>;
  let cardService: jasmine.SpyObj<CardService>;

  beforeEach(async () => {
    const cardSpy = jasmine.createSpyObj('CardService', ['search']);

    await TestBed.configureTestingModule({
      providers: [{ provide: CardService, useValue: cardSpy }],
      imports: [CardSearcherComponent, NoopAnimationsModule],
    }).compileComponents();

    cardService = TestBed.inject(CardService) as jasmine.SpyObj<CardService>;

    fixture = TestBed.createComponent(CardSearcherComponent);
    component = fixture.componentInstance;
    spyOn(component.onFoundCard, 'emit');
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have card search text box', () => {
    const textInput = fixture.nativeElement.querySelector('input');
    expect(textInput).toBeTruthy();
    expect(textInput.placeholder).toBe('Exotic Orchard');
  });

  it('should have add card button', () => {
    const addCardButton = fixture.nativeElement.querySelector('button');
    expect(addCardButton).toBeTruthy();
    expect(addCardButton.innerText).toBe('Add to wantlist');
  });

  it('should search card when card name is given', fakeAsync(() => {
    cardService.search.and.returnValue(of([]));

    component.searchControl.setValue('toto');
    tick(500);

    expect(cardService.search.calls.count()).toEqual(1);
    expect(cardService.search).toHaveBeenCalledWith('toto');
    flush();
  }));

  it('should not display found card when no search results', () => {
    const results = document.querySelectorAll('mat-option');
    expect(results.length).toBe(0);
  });

  it('should display found card when search result is returned', (done) => {
    cardService.search.and.returnValue(
      of([{ id: 't', name: 'toto' }] as Card[])
    );
    const inputElement = fixture.debugElement.query(By.css('input'));
    inputElement.nativeElement.dispatchEvent(new Event('focusin'));
    inputElement.nativeElement.value = 'toto';
    inputElement.nativeElement.dispatchEvent(new Event('input'));

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      fixture.detectChanges();

      const results = document.querySelectorAll('mat-option');
      expect(results.length).toBe(1);
      done();
    });
  });

  it("should replace selected result and clear results when found card's name is clicked", (done) => {
    cardService.search.and.returnValue(
      of([{ id: 't', name: 'toto' }] as Card[])
    );
    component.results.set([{ id: 't', name: 'toto' }] as Card[]);
    fixture.detectChanges();

    const inputElement = fixture.debugElement.query(By.css('input'));
    inputElement.nativeElement.dispatchEvent(new Event('focusin'));
    inputElement.nativeElement.value = 'toto';
    inputElement.nativeElement.dispatchEvent(new Event('input'));

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      fixture.detectChanges();

      const matOptions = document.querySelectorAll('mat-option');
      (matOptions[0] as HTMLElement).click();

      expect(component.searchControl.value).toBe('toto');
      expect(component.results()).toBe(undefined);
      done();
    });
  });

  it('should emit output event when add card is clicked', (done) => {
    cardService.search.and.returnValue(
      of([{ id: 't', name: 'toto' }] as Card[])
    );
    component.results.set([{ id: 't', name: 'toto' }] as Card[]);

    const inputElement = fixture.debugElement.query(By.css('input'));
    inputElement.nativeElement.dispatchEvent(new Event('focusin'));
    inputElement.nativeElement.value = 'toto';
    inputElement.nativeElement.dispatchEvent(new Event('input'));

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      (document.querySelectorAll('mat-option')[0] as HTMLElement).click();

      var btns = fixture.nativeElement.querySelectorAll('button');
      btns[btns.length - 1].click();

      expect(component.onFoundCard.emit).toHaveBeenCalledWith({
        id: 't',
        name: 'toto',
      } as Card);
      done();
    });
  });
});
