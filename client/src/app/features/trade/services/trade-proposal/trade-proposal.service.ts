import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
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
import { PartnerDoublesResponse } from '../../models/partner-doubles-response';
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

  // A Trade partner's whole Doubles list, for the proposal form; used once, so it is not kept as state.
  // The server refuses it to anyone who is not their Trade partner: the form then offers none of these cards.
  fetchPartnerDoubles(partnerId: string): Observable<Card[]> {
    return this.http
      .get<PartnerDoublesResponse>(
        `${this.apiTradeProposalsUrl}/partners/${encodeURIComponent(partnerId)}/doubles`
      )
      .pipe(
        switchMap((res) => this.fetchCards(res.cards)),
        catchError((error) => {
          console.error(error);
          return of([]);
        })
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

  // A card Scryfall could not load is left out.
  private fetchCards(cardIds: string[]): Observable<Card[]> {
    if (cardIds.length == 0) return of([]);
    return forkJoin(cardIds.map((id) => this.cardService.fetch(id))).pipe(
      map((cards) => cards.filter((card): card is Card => !!card))
    );
  }
}
