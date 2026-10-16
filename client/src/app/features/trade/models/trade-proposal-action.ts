import { TradeProposalMin } from './trade-proposal';

export type TradeProposalAction = 'accept' | 'decline' | 'withdraw';

// MissingCardsResponse on the server, the body of an acceptance refused with HTTP 422: the
// proposal's cards that are no longer in the doubles list of the user who gives them.
export interface MissingCardsResponse {
  missingCards: string[];
}

// Why the server refused to accept, decline or withdraw a proposal.
export type TradeProposalRefusal =
  | { reason: 'missing-cards'; missingCards: string[] }
  | { reason: 'not-pending' }
  | { reason: 'failed' };

type ProposalStatus = Pick<TradeProposalMin, 'isSent' | 'state'>;

// The recipient accepts or declines a pending proposal.
export function canAnswer(proposal: ProposalStatus): boolean {
  return !proposal.isSent && proposal.state === 'Pending';
}

// The proposer withdraws a pending proposal.
export function canWithdraw(proposal: ProposalStatus): boolean {
  return proposal.isSent && proposal.state === 'Pending';
}

// An accepted proposal is a Trade.
export function isTrade(proposal: ProposalStatus): boolean {
  return proposal.state === 'Accepted';
}
