import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { makeApiUrl } from '../../../../core/utils/makeUrl';
import { subscribeOnce } from '../../../../core/utils/subscribeExtensions';
import { Card } from '../../../common/models/card';
import { CardService } from '../../../common/services/card/card.service';
import {
  SendTradeProposalRequest,
  TradeProposal,
  TradeProposalMin,
  TradeProposalsResponse,
} from '../../models/trade-proposal';

@Injectable({
  providedIn: 'root',
})
export class TradeProposalService {
  private readonly apiTradeProposalsUrl = makeApiUrl('api/trade-proposals');

  private proposalsBehavior = new BehaviorSubject<TradeProposal[]>([]);
  proposals$ = this.proposalsBehavior.asObservable();

  constructor(private http: HttpClient, private cardService: CardService) {}

  refresh() {
    subscribeOnce(
      this.publishProposals(
        this.http.get<TradeProposalsResponse>(this.apiTradeProposalsUrl)
      ),
      undefined,
      (error) => console.error(error)
    );
  }

  // The server answers with all of the user's proposals, which replace the current ones.
  send(request: SendTradeProposalRequest): Observable<TradeProposal[]> {
    return this.publishProposals(
      this.http.post<TradeProposalsResponse>(this.apiTradeProposalsUrl, request)
    );
  }

  private publishProposals(
    response: Observable<TradeProposalsResponse>
  ): Observable<TradeProposal[]> {
    return response.pipe(
      switchMap((res) => this.populateProposals(res.proposals)),
      tap((proposals) => this.proposalsBehavior.next(proposals))
    );
  }

  private populateProposals(
    proposals: TradeProposalMin[]
  ): Observable<TradeProposal[]> {
    const cardIds = [
      ...new Set(
        proposals.flatMap((p) => [...p.givenCards, ...p.receivedCards])
      ),
    ];
    const cardsObs: Observable<(Card | undefined)[]> =
      cardIds.length == 0
        ? of([])
        : forkJoin(cardIds.map((id) => this.cardService.fetch(id)));

    return cardsObs.pipe(
      map((cards) => {
        const cardsById = new Map(
          cards.flatMap((card) => (card ? [[card.id, card] as const] : []))
        );
        const toCards = (ids: string[]) =>
          ids.flatMap((id) => cardsById.get(id) ?? []);
        return proposals.map((proposal) => ({
          ...proposal,
          givenCards: toCards(proposal.givenCards),
          receivedCards: toCards(proposal.receivedCards),
        }));
      })
    );
  }
}
