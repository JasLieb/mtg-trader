import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { UserDoubles } from '../../models/user-doubles';
import { CardService } from '../../../common/services/card/card.service';
import { Card } from '../../../common/models/card';

@Injectable({
  providedIn: 'root',
})
export class TradeService {
  constructor(
    private httpClient: HttpClient,
    private cardService: CardService
  ) {}

  find(): Observable<UserDoubles[]> {
    return this.httpClient.get('api/trade').pipe(
      switchMap((response: any) => {
        const cardsObs: Observable<Card>[] = (response.users as any[]).flatMap(
          (user: any) => user.doubles.map((c: any) => this.cardService.fetch(c))
        );
        return cardsObs.length == 0
          ? of({
              id: response.id,
              name: response.name,
              doubles: [],
            })
          : forkJoin(cardsObs).pipe(
              map((cards) => {
                return response.users.map((user: any) => {
                  return {
                    id: user.id,
                    name: user.name,
                    doubles: cards,
                  };
                });
              })
            );
      })
    );
  }
}
