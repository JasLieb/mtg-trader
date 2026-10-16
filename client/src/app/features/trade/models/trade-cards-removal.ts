import { WantlistsResponse } from '../../collection/models/wantlist-response';
import { TradeProposalMin, TradeProposalsResponse } from './trade-proposal';
import { isTrade } from './trade-proposal-action';

// RemoveTradeCardsRequest on the server, seen from the connected user: the Trade's cards they give
// that leave their doubles list, and the cards they receive that leave every wantlist holding them.
// Unchecked cards are left out.
export interface RemoveTradeCardsRequest {
  givenCards: string[];
  receivedCards: string[];
}

// TradeCardsRemovedResponse on the server: the user's lists and proposals, each in full, once the
// step is done. WantlistService rebuilds the wantlists and doubles from the first, as from any
// wantlist mutation, and TradeProposalService the proposals from the second.
export type TradeCardsRemovedResponse = WantlistsResponse & TradeProposalsResponse;

// Why the server refused the step. 'not-available' (HTTP 409): the trade changed since it was
// loaded, the step having been done already, for instance; nothing was removed.
export type TradeCardsRemovalRefusal =
  | { reason: 'not-available' }
  | { reason: 'failed' };

type TradeStatus = Pick<TradeProposalMin, 'isSent' | 'state' | 'hasRemovedCards'>;

// Each User of a Trade goes once through "Remove these cards from my lists".
export function canRemoveCards(proposal: TradeStatus): boolean {
  return isTrade(proposal) && !proposal.hasRemovedCards;
}
