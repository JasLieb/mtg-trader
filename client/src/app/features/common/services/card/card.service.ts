import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  catchError,
  combineLatest,
  map,
  mergeMap,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { Card, CardSet, ScryfallCard } from '../../models/card';

@Injectable({
  providedIn: 'root',
})
export class CardService {
  constructor(private httpClient: HttpClient) {}

  search(query: string): Observable<Card[]> {
    return this.httpClient
      .get(`https://api.scryfall.com/cards/search?q="${query}"`)
      .pipe(
        map((res: any) => res.data.map(this.parseCard)),
        mergeMap((cards: Card[]) => {
          return combineLatest(cards.map(this.populateSets.bind(this)));
        }),
        catchError((_) => {
          return of([]);
        })
      );
  }

  fetch(cardId: string): Observable<Card | undefined> {
    return this.httpClient
      .get<ScryfallCard>(`https://api.scryfall.com/cards/${cardId}`)
      .pipe(
        switchMap((card) => {
          return this.populateSets(this.parseCard(card));
        }),
        catchError((_) => {
          return of(undefined);
        })
      );
  }

  private populateSets(card: Card): Observable<Card> {
    return this.httpClient
      .get(
        `https://api.scryfall.com/cards/search?unique=prints&q=!%22${card.name}%22`
      )
      .pipe(
        map((res: any) => {
          return this.populateCardSets(card, res.data as CardSet[]);
        })
      );
  }

  private parseCard(raw: ScryfallCard): Card {
    const image = raw.card_faces
      ? raw.card_faces[0].illustration_id
      : raw.image_uris.normal;
    return {
      id: raw.id,
      name: raw.name,
      uri: raw.scryfall_uri,
      image_uri: image,
      price: raw.prices.eur,
      set: raw.set,
      set_uri: `https://svgs.scryfall.io/sets/${raw.set}.svg`,
      sets: [],
    } as Card;
  }

  private populateCardSets(originalCard: Card, sets: CardSet[]): Card {
    return {
      ...originalCard,
      sets,
    };
  }
}
