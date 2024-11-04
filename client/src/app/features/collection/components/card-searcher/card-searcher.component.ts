import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  signal,
  WritableSignal,
} from '@angular/core';
import { CardService } from '../../../common/services/card/card.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, mergeMap } from 'rxjs';
import { Card } from '../../../common/models/card';

@Component({
  selector: 'app-card-searcher',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './card-searcher.component.html',
  styleUrl: './card-searcher.component.scss',
})
export class CardSearcherComponent implements OnInit {
  private selectedCard: Card | undefined;

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
        mergeMap((query) => this.cardService.search(query))
      )
      .subscribe((foundCards) => {
        this.results.set(foundCards);
      });
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
