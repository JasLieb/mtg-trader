import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CardService } from '../../services/card/card.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Card } from '../../models/card';

@Component({
  selector: 'app-card-searcher',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './card-searcher.component.html',
  styleUrl: './card-searcher.component.scss',
})
export class CardSearcherComponent implements OnInit {
  searchControl: FormControl;
  results: WritableSignal<Card[] | undefined> = signal(undefined);

  constructor(private cardService: CardService) {
    this.searchControl = new FormControl('');
  }

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((query) => {
        this.cardService.search(query);
      });
  }
}
