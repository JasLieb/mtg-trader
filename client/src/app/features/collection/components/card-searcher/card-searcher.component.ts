import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  signal,
  WritableSignal,
} from '@angular/core';
import { CardService } from '../../../common/services/card/card.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { debounceTime, distinctUntilChanged, filter, mergeMap, Subject, takeUntil } from 'rxjs';
import { Card } from '../../../common/models/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-card-searcher',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
  ],
  templateUrl: './card-searcher.component.html',
  styleUrl: './card-searcher.component.scss',
})
export class CardSearcherComponent implements OnInit, OnDestroy {
  private selectedCard: Card | undefined;
  private unsubscribe = new Subject();

  results: WritableSignal<Card[] | undefined> = signal(undefined);
  searchControl: FormControl;

  @Output()
  onFoundCard = new EventEmitter<Card>();

  constructor(private cardService: CardService) {
    this.searchControl = new FormControl('');
  }

  ngOnInit(): void {
    this.searchControl.valueChanges
    .pipe(
      debounceTime(400),
      distinctUntilChanged(),
      filter((query) => query != undefined),
      mergeMap((query) => this.cardService.search(query)),
      takeUntil(this.unsubscribe)
    )
    .subscribe((foundCards) => {
      this.results.set(foundCards);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next(null);
    this.unsubscribe.complete();
  }

  onCardClicked(card: Card) {
    this.selectedCard = card;
    this.searchControl.setValue(card.name);
    this.results.set(undefined);
  }

  onAddCard() {
    if (this.selectedCard) {
      this.onFoundCard.emit(this.selectedCard);
    }
  }
}
