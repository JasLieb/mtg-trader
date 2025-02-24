import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  combineLatest,
  forkJoin,
  map,
  mergeMap,
  Observable,
  of,
} from 'rxjs';
import { TradeableResponse } from '../../models/tradeable-response';
import { CardService } from '../../../common/services/card/card.service';
import { Card } from '../../../common/models/card';
import { UserTrader, UserTraderMin } from '../../models/user-trader';

@Injectable({
  providedIn: 'root',
})
export class TradeService {
  constructor(
    private httpClient: HttpClient,
    private cardService: CardService
  ) {}

  find(): Observable<UserTrader[]> {
    return this.httpClient.get<TradeableResponse>('api/trade').pipe(
      mergeMap((response) => {
        return forkJoin(
          response.users.map((userMin) => this.populateUser(userMin))
        );
      })
    );
  }

  private populateUser(userMin: UserTraderMin): Observable<UserTrader> {
    const doublesObs: Observable<Card | undefined>[] = userMin.doubles.length == 0 ? [of(undefined)] : userMin.doubles.flatMap((double) =>
      this.cardService.fetch(double)
    );
    const wantedsObs: Observable<Card | undefined>[] = userMin.wanted.length == 0 ? [of(undefined)] : userMin.wanted.flatMap((wanted) =>
      this.cardService.fetch(wanted)
    );
    return combineLatest(
      [forkJoin(doublesObs), forkJoin(wantedsObs)],
      (doubles, wanted) => {
        return {
          doubles: doubles.filter(w => !!w),
          wanted: wanted.filter(w => !!w),
        };
      }
    ).pipe(
      map((fetchedCards) => {
        return {
          id: userMin.id,
          name: userMin.name,
          doubles: fetchedCards.doubles,
          wanted: fetchedCards.wanted,
        } as UserTrader;
      })
    );
  }
}
