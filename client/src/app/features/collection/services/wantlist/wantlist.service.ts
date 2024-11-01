import { Injectable } from '@angular/core';
import { Wantlist } from '../../models/wantlist';
import {
  BehaviorSubject,
  catchError,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CardService } from '../card/card.service';
import { Card } from '../../models/card';

@Injectable({
  providedIn: 'root',
})
export class WantlistService {
  private readonly apiWantlistUrl = 'api/wantlist';

  private wantlistsBehavior = new BehaviorSubject<Wantlist[]>([]);
  wantlists$ = this.wantlistsBehavior.asObservable();

  private readonly doublesKey = 'doubles';
  private readonly defaultDoubleWantlist = {
    id: 'doubles',
    name: 'doubles',
    cards: [],
  } as Wantlist;
  private doublesBehavior = new BehaviorSubject<Wantlist>(this.getDoubles());
  doubles$ = this.doublesBehavior.asObservable();

  constructor(private http: HttpClient, private cardService: CardService) {
    this.refreshWantlists();
  }

  create(wantlistName: string) {
    this.subscribeWantlistResponse(
      this.http.post(this.apiWantlistUrl, { wantlistName })
    );
  }

  updateWantlist(wantlist: Wantlist) {
    if (this.isDoubleWantlist(wantlist)) {
      this.updateDoubles(wantlist);
      return;
    }

    this.notifyUpdate(wantlist);
  }

  delete(wantlistId: string) {
    this.subscribeWantlistResponse(
      this.http.delete(`${this.apiWantlistUrl}?wantlistId=${wantlistId}`)
    );
  }

  private isDoubleWantlist(wantlist: Wantlist): boolean {
    return wantlist.id == this.defaultDoubleWantlist.id;
  }

  private getDoubles() {
    const parsedDoubles = JSON.parse(
      window.localStorage.getItem(this.doublesKey) ?? '{}'
    ) as Wantlist;
    return 'cards' in parsedDoubles
      ? parsedDoubles
      : this.defaultDoubleWantlist;
  }

  private updateDoubles(wantlist: Wantlist) {
    window.localStorage.setItem(this.doublesKey, JSON.stringify(wantlist));
    this.doublesBehavior.next(wantlist);
  }

  private refreshWantlists() {
    this.subscribeWantlistResponse(this.http.get('api/wantlist'));
  }

  private notifyUpdate(wantlist: Wantlist) {
    this.subscribeWantlistResponse(
      this.http.put('api/wantlist', {
        wantlistId: wantlist.id,
        cards: wantlist.cards.map((c) => c.id),
      })
    );
  }

  private subscribeWantlistResponse(response: Observable<Object>) {
    response
      .pipe(
        switchMap((response) => {
          const cardsObs: Observable<Card>[] = (response as any[]).flatMap(
            (wantlist: any) =>
              wantlist.cardIds.map((c: any) => this.cardService.fetch(c))
          );
          return forkJoin(cardsObs).pipe(
            map((cards) => {
              return { cards: cards, wantlists: response };
            })
          );
        }),
        catchError((err) => this.handleError(err))
      )
      .subscribe((wl) => {
        this.wantlistsBehavior.next(
          this.parseWantlistResponse(wl.wantlists, wl.cards)
        );
      });
  }

  private handleError(error: HttpErrorResponse): Observable<any> {
    console.error(error);
    return of(new Error(error.message));
  }

  private parseWantlistResponse(wantlists: any[], cards: Card[]): Wantlist[] {
    return wantlists.map((wantlist: any) => {
      return {
        id: wantlist.id,
        name: wantlist.name,
        cards: wantlist.cardIds.map((cardId: any) =>
          cards.find((c) => c.id == cardId)
        ),
      } as Wantlist;
    });
  }
}
