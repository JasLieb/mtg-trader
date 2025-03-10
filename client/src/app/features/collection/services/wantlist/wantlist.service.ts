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
import {
  PopulatedWantlistResponse,
  WantlistsResponse,
} from '../../models/wantlist-response';
import { makeApiUrl } from '../../../../core/utils/makeUrl';

@Injectable({
  providedIn: 'root',
})
export class WantlistService {
  private readonly apiWantlistUrl = makeApiUrl('api/wantlist');

  private wantlistsBehavior = new BehaviorSubject<Wantlist[]>([]);
  wantlists$ = this.wantlistsBehavior.asObservable();

  private doublesBehavior = new BehaviorSubject<Wantlist>({} as Wantlist);
  doubles$ = this.doublesBehavior.asObservable();

  constructor(private http: HttpClient, private cardService: CardService) {
    this.refreshWantlists();
  }

  create(wantlistName: string) {
    this.subscribeWantlistResponse(
      this.http.post<WantlistsResponse>(this.apiWantlistUrl, { wantlistName })
    );
  }

  updateWantlist(wantlist: Wantlist) {
    this.subscribeWantlistResponse(
      this.http.put<WantlistsResponse>(this.apiWantlistUrl, {
        wantlistId: wantlist.id,
        cards: wantlist.cards.map((c) => c.id),
      })
    );
  }

  delete(wantlistId: string) {
    this.subscribeWantlistResponse(
      this.http.delete<WantlistsResponse>(
        `${this.apiWantlistUrl}?wantlistId=${wantlistId}`
      )
    );
  }

  private refreshWantlists() {
    this.subscribeWantlistResponse(
      this.http.get<WantlistsResponse>(this.apiWantlistUrl)
    );
  }

  private subscribeWantlistResponse(response: Observable<WantlistsResponse>) {
    subscribeOnce(
      this.populateWantlistsWithFetchedCards(response),
      (cardsAndWantlistsMins) => {
        const userWantlists = this.makeUserWantlists(cardsAndWantlistsMins);
        this.wantlistsBehavior.next(userWantlists.wantlists);
        this.doublesBehavior.next(userWantlists.doubles);
      }
    );
  }

  private populateWantlistsWithFetchedCards(
    wantlistResponse: Observable<WantlistsResponse>
  ): Observable<PopulatedWantlistResponse> {
    return wantlistResponse.pipe(
      switchMap((response) => {
        const cardsObs: Observable<Card>[] = response.wantlists.flatMap(
          (wantlist) => wantlist.cards.map((c) => this.cardService.fetch(c))
        );
        return cardsObs.length == 0
          ? of({
              cards: [],
              originalResponse: response,
            } as PopulatedWantlistResponse)
          : forkJoin(cardsObs).pipe(
              map((cards) => {
                return {
                  cards,
                  originalResponse: response,
                } as PopulatedWantlistResponse;
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

  private makeUserWantlists(
    populatedWantlists: PopulatedWantlistResponse
  ): UserWantlists {
    const parsedWl = populatedWantlists.originalResponse.wantlists.map(
      (wantlist) => {
        return {
          id: wantlist.id,
          name: wantlist.name,
          cards: wantlist.cards.map((card) =>
            populatedWantlists.cards.find((c) => c.id == card)
          ),
        } as Wantlist;
      }
    );

    return {
      wantlists: parsedWl.filter((wl) => !wl.id.includes('double')),
      doubles: parsedWl.find((wl) => wl.id.includes('double')),
    } as UserWantlists;
  }
}
