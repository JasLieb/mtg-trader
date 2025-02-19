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
import { CardService } from '../../../common/services/card/card.service';
import { Card } from '../../../common/models/card';
import { UserWantlists } from '../../models/user-wantlists';
import { subscribeOnce } from '../../../../core/utils/subscribeExtensions';

@Injectable({
  providedIn: 'root',
})
export class WantlistService {
  private readonly apiWantlistUrl = 'api/wantlist';

  private wantlistsBehavior = new BehaviorSubject<Wantlist[]>([]);
  wantlists$ = this.wantlistsBehavior.asObservable();

  private doublesBehavior = new BehaviorSubject<Wantlist>({} as Wantlist);
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
    this.subscribeWantlistResponse(
      this.http.put('api/wantlist', {
        wantlistId: wantlist.id,
        cards: wantlist.cards.map((c) => c.id),
      })
    );
  }

  delete(wantlistId: string) {
    this.subscribeWantlistResponse(
      this.http.delete(`${this.apiWantlistUrl}?wantlistId=${wantlistId}`)
    );
  }

  private refreshWantlists() {
    this.subscribeWantlistResponse(this.http.get('api/wantlist'));
  }

  private subscribeWantlistResponse(response: Observable<Object>) {
    subscribeOnce(this.populateWantlistsWithFetchedCards(response), (wl) => {
      const userWantlists = this.parseWantlistResponse(wl.wantlists, wl.cards);
      this.wantlistsBehavior.next(userWantlists.wantlists);
      this.doublesBehavior.next(userWantlists.doubles);
    });
  }

  private populateWantlistsWithFetchedCards(
    response: Observable<Object>
  ): Observable<any> {
    return response.pipe(
      switchMap((response) => {
        const cardsObs: Observable<Card>[] = (response as any[]).flatMap(
          (wantlist: any) =>
            wantlist.cardIds.map((c: any) => this.cardService.fetch(c))
        );
        return cardsObs.length == 0
          ? of({ cards: [], wantlists: response })
          : forkJoin(cardsObs).pipe(
              map((cards) => {
                return { cards: cards, wantlists: response };
              })
            );
      }),
      catchError((err) => this.handleError(err))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<any> {
    console.error(error);
    return of(new Error(error.message));
  }

  private parseWantlistResponse(
    wantlists: any[],
    cards: Card[]
  ): UserWantlists {
    const parsedWl = wantlists.map((wantlist: any) => {
      return {
        id: wantlist.id,
        name: wantlist.name,
        cards: wantlist.cardIds.map((cardId: any) =>
          cards.find((c) => c.id == cardId)
        ),
      } as Wantlist;
    });

    return {
      wantlists: parsedWl.filter((wl) => !wl.id.includes('double')),
      doubles: parsedWl.find((wl) => wl.id.includes('double')),
    } as UserWantlists;
  }
}
