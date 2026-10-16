import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, Injector } from '@angular/core';
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
import { WantlistService } from '../../../collection/services/wantlist/wantlist.service';
import {
  CommittedCards,
  CommittedCardsResponse,
  toCommittedCards,
} from '../../models/committed-cards';
import { PartnerDoublesResponse } from '../../models/partner-doubles-response';
import {
  RemoveTradeCardsRequest,
  TradeCardsRemovalRefusal,
  TradeCardsRemovedResponse,
} from '../../models/trade-cards-removal';
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

  // WantlistService is looked up only when a Trade's cards are removed: it loads the wantlists as
  // soon as it is created, which nothing else here needs.
  private readonly injector = inject(Injector);

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

  // The user's Committed Cards, for the warning of the proposal form; used once, so not kept as state.
  // The warning never blocks anything: when the server can't say, no card shows as committed.
  fetchCommittedCards(): Observable<CommittedCards> {
    return this.fetchCommitted(`${this.apiTradeProposalsUrl}/committed-cards`);
  }

  // Before the recipient accepts a proposal: the cards they give in it that are already committed
  // elsewhere, the proposal itself not counted. Like fetchCommittedCards, it never fails.
  fetchCommittedCardsIn(proposalId: string): Observable<CommittedCards> {
    return this.fetchCommitted(
      `${this.apiTradeProposalsUrl}/${encodeURIComponent(proposalId)}/committed-cards`
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

  // "Remove these cards from my lists" on a Trade. The server answers with the user's lists and
  // proposals in full: the lists go to WantlistService, so the Wantlists and Doubles pages are up to
  // date without a reload, and the proposals, where the step now shows as done, are published like
  // any action's. A refused step fails with a TradeCardsRemovalRefusal.
  removeCards(
    proposalId: string,
    request: RemoveTradeCardsRequest
  ): Observable<TradeProposal[]> {
    const url = `${this.apiTradeProposalsUrl}/${encodeURIComponent(proposalId)}/remove-cards`;
    return this.publishProposals(
      this.http.post<TradeCardsRemovedResponse>(url, request).pipe(
        tap((res) =>
          this.injector.get(WantlistService).publish({ wantlists: res.wantlists })
        ),
        catchError((error: unknown) => {
          const refusal = toRemovalRefusal(error);
          // The trade changed since it was loaded: reload to show what became of it.
          if (refusal.reason === 'not-available') this.refresh();
          return throwError(() => refusal);
        })
      )
    );
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

  private fetchCommitted(url: string): Observable<CommittedCards> {
    return this.http.get<CommittedCardsResponse>(url).pipe(
      map(toCommittedCards),
      catchError((error) => {
        console.error(error);
        return of<CommittedCards>(new Map());
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

function toRemovalRefusal(error: unknown): TradeCardsRemovalRefusal {
  return error instanceof HttpErrorResponse && error.status === 409
    ? { reason: 'not-available' }
    : { reason: 'failed' };
}
