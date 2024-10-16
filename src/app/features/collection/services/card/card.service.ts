import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { Card } from '../../models/card';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CardService {
  constructor(private _httpClient: HttpClient) {}

  search(query: string): Observable<Card[]> {
    return this._httpClient
      .get(`https://api.scryfall.com/cards/search?q="${query}"`)
      .pipe(
        map((res: any) => res.data.map(this.parseCard)),
        catchError((err) => {
          console.log(err);
          return of([]);
        })
      );
  }

  private parseCard(raw: any): Card {
    const image = raw.card_faces
      ? raw.card_faces[0].illustration_id
      : raw.image_uris.normal;
    return {
      id: raw.id,
      name: raw.name,
      uri: raw.scryfall_uri,
      image_uri: image,
    } as Card;
  }
}
