import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { CardSearcherComponent } from './card-searcher.component';
import { CardService } from '../../services/card/card.service';
import { Card } from '../../models/card';

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have card search text box', () => {
    const textInput = fixture.nativeElement.querySelector('input');
    expect(textInput).toBeTruthy();
    // const addCardButton = fixture.nativeElement.querySelector('button');
    // expect(addCardButton).toBeTruthy();
  });

  it('should search card when card name is given', fakeAsync(() => {
    component.searchControl.setValue('toto');
    tick(500);
    expect(cardService.search.calls.count()).toEqual(1);
  }));

  it('should not display found card when no results', () => {
    const results = fixture.nativeElement.querySelector('ul');
    expect(results).toBeNull();
  });

  it('should display found card when have search result', () => {
    const card = { id: 't', name: 'toto' } as Card;
    component.results.set([card]);
    fixture.detectChanges();

    const results = fixture.nativeElement.querySelector('ul');
    expect(results).toBeTruthy();
  });
});
