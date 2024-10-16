import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { CardSearcherComponent } from './card-searcher.component';
import { CardService } from '../../services/card/card.service';
import { Card } from '../../models/card';
import { of } from 'rxjs';

describe('CardSearcherComponent', () => {
  let component: CardSearcherComponent;
  let fixture: ComponentFixture<CardSearcherComponent>;
  let cardService: jasmine.SpyObj<CardService>;

  beforeEach(async () => {
    const cardSpy = jasmine.createSpyObj('CardService', ['search']);

    await TestBed.configureTestingModule({
      providers: [{ provide: CardService, useValue: cardSpy }],
      imports: [CardSearcherComponent],
    }).compileComponents();

    cardService = TestBed.inject(CardService) as jasmine.SpyObj<CardService>;

    fixture = TestBed.createComponent(CardSearcherComponent);
    component = fixture.componentInstance;
    spyOn(component.foundCardEmitter, 'emit');
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
  }));

  it('should not display found card when no search results', () => {
    const results = fixture.nativeElement.querySelector('ul');
    expect(results).toBeNull();
  });

  it('should display found card when search result is returned', fakeAsync(() => {
    cardService.search.and.returnValue(
      of([{ id: 't', name: 'toto' }] as Card[])
    );
    component.searchControl.setValue('toto');
    tick(500);

    fixture.detectChanges();

    const results = fixture.nativeElement.querySelector('li');
    expect(results).toBeTruthy();
  }));

  it("should replace selected result and clear results when found card's name is clicked", () => {
    component.results.set([{ id: 't', name: 'toto' }] as Card[]);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('li').click();

    expect(component.searchControl.value).toBe('toto');
    expect(component.results()).toBe(undefined);
  });

  it('should emit output event when add card is clicked', () => {
    component.results.set([{ id: 't', name: 'toto' }] as Card[]);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('li').click();

    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();

    expect(component.foundCardEmitter.emit).toHaveBeenCalledWith({ id: 't', name: 'toto' } as Card);
  });
});
