import { Card } from '../../common/models/card';

// The value of one side of a trade at the Scryfall prices of the moment (spec, "Valeur").
// Prices are read from the Cards CardService fetched and are never sent to the server.
// A Card Scryfall has no price for is kept out of `euros` and listed in `unpricedCards`,
// so a total never passes it off as worth 0 €.
export interface EuroTotal {
  euros: number;
  unpricedCards: Card[];
}

export function euroTotal(cards: readonly Card[]): EuroTotal {
  // Adding up cents keeps 0.10 + 0.20 at 0.30, which matters when totals are compared or sorted.
  let cents = 0;
  const unpricedCards: Card[] = [];
  for (const card of cards) {
    if (card.price == null) unpricedCards.push(card);
    else cents += Math.round(card.price * 100);
  }
  return { euros: cents / 100, unpricedCards };
}

// "12.40 €", or "12.40 € + 1 card without a price (Brainstorm)" when some Cards have no price.
export function formatEuroTotal({ euros, unpricedCards }: EuroTotal): string {
  const total = `${euros.toFixed(2)} €`;
  const count = unpricedCards.length;
  if (count == 0) return total;
  const names = unpricedCards.map((card) => card.name).join(', ');
  return `${total} + ${count} ${count == 1 ? 'card' : 'cards'} without a price (${names})`;
}
