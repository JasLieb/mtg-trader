import { Card } from '../../common/models/card';

// Only the server decides that a proposal has Expired (7 days after sentAt without an answer);
// the client never works it out from sentAt, so the page and the menu counter agree with the actions.
export type TradeProposalState =
  | 'Pending'
  | 'Accepted'
  | 'Declined'
  | 'Withdrawn'
  | 'Expired';

// TradeProposalResponse on the server, seen from the connected user: isSent tells whether they
// made the proposal, givenCards are the cards they give and receivedCards the cards they receive.
export interface TradeProposalMin {
  id: string;
  isSent: boolean;
  otherUserId: string;
  otherUserName: string;
  givenCards: string[];
  receivedCards: string[];
  state: TradeProposalState;
  sentAt: string;
  // On a Trade: whether the connected user has gone through "Remove these cards from my lists".
  hasRemovedCards: boolean;
}

export interface TradeProposalsResponse {
  proposals: TradeProposalMin[];
}

export interface TradeProposal
  extends Omit<TradeProposalMin, 'givenCards' | 'receivedCards'> {
  givenCards: Card[];
  receivedCards: Card[];
}

// Seen from the proposer: givenCards come from their doubles list, receivedCards from the recipient's.
export interface SendTradeProposalRequest {
  recipientId: string;
  givenCards: string[];
  receivedCards: string[];
}
