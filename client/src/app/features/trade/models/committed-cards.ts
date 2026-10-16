import { Card } from '../../common/models/card';

// CommittedCardsResponse on the server: the connected user's Committed Cards, that is the cards they
// give in a proposal still pending or in a Trade whose cards they have not yet removed from their lists,
// each with the names of the other users it is committed with. Only the server knows what is committed;
// the client only picks, among the cards it shows, those the server reports.
export interface CommittedCardsResponse {
  committedCards: CommittedCardResponse[];
}

// CommittedCardResponse on the server: one Committed Card, as its Scryfall card id.
export interface CommittedCardResponse {
  cardId: string;
  committedWith: string[];
}

// Who each committed card is committed with, by card id.
export type CommittedCards = ReadonlyMap<string, string[]>;

export function toCommittedCards(response: CommittedCardsResponse): CommittedCards {
  return new Map(
    response.committedCards.map((card) => [card.cardId, card.committedWith])
  );
}

// A card the user is about to commit that is already committed, with the users it is committed with.
// The card comes from CardService, which names it: the server only knows its id.
export interface CommittedCardWarning {
  card: Card;
  committedWith: string[];
}

// The warning for these cards, in their order: one line for each card the server reports as committed.
export function committedCardWarnings(
  cards: readonly Card[],
  committed: CommittedCards
): CommittedCardWarning[] {
  return cards.flatMap((card) => {
    const committedWith = committed.get(card.id) ?? [];
    return committedWith.length > 0 ? [{ card, committedWith }] : [];
  });
}

// "Bob", "Bob and Carol", "Bob, Carol and Dave".
export function formatUserNames(names: readonly string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}
