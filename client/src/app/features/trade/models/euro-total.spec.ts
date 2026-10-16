import { makeCard } from '../../common/models/card';
import { euroTotal, formatEuroTotal } from './euro-total';

describe('euro total', () => {
  const solRing = makeCard('sol-ring', 'Sol Ring', '', '', 1.2);
  const counterspell = makeCard('counterspell', 'Counterspell', '', '', 0.8);
  const ragavan = makeCard('ragavan', 'Ragavan', '', '', 45.5);
  const brainstorm = makeCard('brainstorm', 'Brainstorm', '', '', null);
  const ponder = makeCard('ponder', 'Ponder', '', '', null);

  it('should add up the Scryfall prices of the cards', () => {
    const total = euroTotal([solRing, counterspell, ragavan]);

    expect(total).toEqual({ euros: 47.5, unpricedCards: [] });
    expect(formatEuroTotal(total)).toBe('47.50 €');
  });

  it('should be 0.00 € when there is no card', () => {
    expect(formatEuroTotal(euroTotal([]))).toBe('0.00 €');
  });

  it('should add up prices without floating point drift', () => {
    const total = euroTotal([
      makeCard('a', 'a', '', '', 0.1),
      makeCard('b', 'b', '', '', 0.2),
    ]);

    expect(total.euros).toBe(0.3);
  });

  it('should count a card priced at 0 € as priced', () => {
    const total = euroTotal([makeCard('token', 'Token', '', '', 0)]);

    expect(total.unpricedCards).toEqual([]);
    expect(formatEuroTotal(total)).toBe('0.00 €');
  });

  // Scenario 11 of the spec.
  it('should flag a card without a price in the total instead of counting it as 0 €', () => {
    const total = euroTotal([solRing, brainstorm]);

    expect(total).toEqual({ euros: 1.2, unpricedCards: [brainstorm] });
    expect(formatEuroTotal(total)).toBe(
      '1.20 € + 1 card without a price (Brainstorm)'
    );
  });

  it('should say how many cards have no price and name them', () => {
    expect(formatEuroTotal(euroTotal([brainstorm, solRing, ponder]))).toBe(
      '1.20 € + 2 cards without a price (Brainstorm, Ponder)'
    );
  });

  it('should still flag the cards when none of them has a price', () => {
    expect(formatEuroTotal(euroTotal([brainstorm]))).toBe(
      '0.00 € + 1 card without a price (Brainstorm)'
    );
  });
});
