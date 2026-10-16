import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
  throwError,
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
import {
  MissingCardsResponse,
  TradeProposalAction,
  TradeProposalRefusal,
} from '../../models/trade-proposal-action';

@Injectable({
  providedIn: 'root',
})
export class TradeProposalService {
  private readonly apiTradeProposalsUrl = makeApiUrl('api/trade-proposals');

  private proposalsBehavior = new BehaviorSubject<TradeProposal[]>([]);
  proposals$ = this.proposalsBehavior.asObservable();

  // The received proposals still pending, counted from every list the server sends back,
  // before its cards are loaded, so the menu doesn't wait on Scryfall.
  private pendingReceivedCountBehavior = new BehaviorSubject<number>(0);
  pendingReceivedCount$ = this.pendingReceivedCountBehavior.asObservable();

  constructor(private http: HttpClient, private cardService: CardService) {}

  // Reloads only the counter: unlike refresh, it fetches no card from Scryfall,
  // so the menu can call it on every navigation.
  refreshPendingReceivedCount() {
    subscribeOnce(
      this.http.get<TradeProposalsResponse>(this.apiTradeProposalsUrl),
      (res) => this.publishPendingReceivedCount(res.proposals),
      (error) => console.error(error)
    );
  }

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

  // Like send, each action answers with all of the user's proposals. A refused action fails
  // with a TradeProposalRefusal instead of an HTTP error.
  accept(proposalId: string): Observable<TradeProposal[]> {
    return this.act(proposalId, 'accept');
  }

  decline(proposalId: string): Observable<TradeProposal[]> {
    return this.act(proposalId, 'decline');
  }

  withdraw(proposalId: string): Observable<TradeProposal[]> {
    return this.act(proposalId, 'withdraw');
  }

  private act(
    proposalId: string,
    action: TradeProposalAction
  ): Observable<TradeProposal[]> {
    const url = `${this.apiTradeProposalsUrl}/${encodeURIComponent(proposalId)}/${action}`;
    return this.publishProposals(
      this.http.post<TradeProposalsResponse>(url, null).pipe(
        catchError((error: unknown) => {
          const refusal = toRefusal(error);
          // The proposal changed since it was loaded: reload to show what became of it.
          if (refusal.reason === 'not-pending') this.refresh();
          return throwError(() => refusal);
        })
      )
    );
  }

  private publishProposals(
    response: Observable<TradeProposalsResponse>
  ): Observable<TradeProposal[]> {
    return response.pipe(
      tap((res) => this.publishPendingReceivedCount(res.proposals)),
      switchMap((res) => this.populateProposals(res.proposals)),
      tap((proposals) => this.proposalsBehavior.next(proposals))
    );
  }

  // Counts only what the server reports as pending, so a proposal it reports in any other
  // state, expired included, drops out of the counter with no change here.
  private publishPendingReceivedCount(proposals: TradeProposalMin[]) {
    this.pendingReceivedCountBehavior.next(
      proposals.filter((p) => !p.isSent && p.state === 'Pending').length
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

function toRefusal(error: unknown): TradeProposalRefusal {
  if (!(error instanceof HttpErrorResponse)) return { reason: 'failed' };
  switch (error.status) {
    case 422:
      return {
        reason: 'missing-cards',
        missingCards:
          (error.error as MissingCardsResponse | null)?.missingCards ?? [],
      };
    case 409:
      return { reason: 'not-pending' };
    default:
      return { reason: 'failed' };
  }
}
