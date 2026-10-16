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
import { Card, CardSet, makeCard } from '../../models/card';
import { ScryfallCard, ScryfallCardSet } from '../../models/scryfall-card';

@Injectable({
  providedIn: 'root',
})
export class CardService {
  constructor(private httpClient: HttpClient) {}

  search(query: string): Observable<Card[]> {
    return this.httpClient
      .get<{ data: ScryfallCard[] }>(`https://api.scryfall.com/cards/search?q="${query}"`)
      .pipe(
        map((res) => res.data.map(this.parseCard)),
        mergeMap((cards: Card[]) => {
          return combineLatest(cards.map(this.populateSets.bind(this)));
        }),
        catchError(() => {
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
        catchError(() => {
          return of(undefined);
        })
      );
  }

  private populateSets(card: Card): Observable<Card> {
    return this.httpClient
      .get<{ data: ScryfallCardSet[] }>(
        `https://api.scryfall.com/cards/search?unique=prints&q=!%22${card.name}%22`
      )
      .pipe(
        map((res) => {
          return this.populateCardSets(
            card,
            res.data.map((set: ScryfallCardSet) => {
              return {
                card_id: set.id,
                set_name: set.set_name,
                set_id: set.set_id,
              };
            })
          );
        })
      );
  }

  private parseCard(raw: ScryfallCard): Card {
    const image = raw.card_faces
      ? raw.card_faces[0].illustration_id
      : raw.image_uris.normal;
    return makeCard(
      raw.id,
      raw.name,
      raw.scryfall_uri,
      image,
      eurPrice(raw),
      raw.set,
      `https://svgs.scryfall.io/sets/${raw.set}.svg`,
      []
    );
  }

  private populateCardSets(originalCard: Card, sets: CardSet[]): Card {
    return {
      ...originalCard,
      sets,
    };
  }
}

// The one place that picks which Scryfall price a Card is worth. Cards are tracked by printing
// without a foil flag (ADR 0001), so a Card is valued at its non-foil price: the finish most
// copies are owned in, and the lower one, so a trade is not balanced on a foil premium nobody
// claimed. A printing made only in foil has no non-foil price, and its foil price applies.
// A missing price stays null rather than becoming 0.
function eurPrice(raw: ScryfallCard): number | null {
  const foilOnly =
    !!raw.finishes?.includes('foil') && !raw.finishes.includes('nonfoil');
  const price = foilOnly ? raw.prices.eur_foil : raw.prices.eur;
  if (price == null) return null;
  const euros = Number(price);
  return Number.isFinite(euros) ? euros : null;
}
