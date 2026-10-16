import { makeCard } from '../../common/models/card';
import {
  committedCardWarnings,
  formatUserNames,
  toCommittedCards,
} from './committed-cards';

describe('committed cards', () => {
  const solRing = makeCard('sol-ring', 'Sol Ring');
  const counterspell = makeCard('counterspell', 'Counterspell');
  const thoughtseize = makeCard('thoughtseize', 'Thoughtseize');

  const committed = toCommittedCards({
    committedCards: [
      { cardId: 'thoughtseize', committedWith: ['Bob'] },
      { cardId: 'sol-ring', committedWith: ['Bob', 'Carol'] },
      { cardId: 'ragavan', committedWith: ['Dave'] },
    ],
  });

  it('should warn about the given cards the server reports as committed, in their order', () => {
    expect(committedCardWarnings([solRing, counterspell, thoughtseize], committed)).toEqual([
      { card: solRing, committedWith: ['Bob', 'Carol'] },
      { card: thoughtseize, committedWith: ['Bob'] },
    ]);
  });

  it('should not warn about a card the server does not report', () => {
    expect(committedCardWarnings([counterspell], committed)).toEqual([]);
  });

  it('should not warn about anything when no card is committed', () => {
    expect(committedCardWarnings([solRing], toCommittedCards({ committedCards: [] }))).toEqual(
      []
    );
  });

  it('should name the users a card is committed with', () => {
    expect(formatUserNames(['Bob'])).toBe('Bob');
    expect(formatUserNames(['Bob', 'Carol'])).toBe('Bob and Carol');
    expect(formatUserNames(['Bob', 'Carol', 'Dave'])).toBe('Bob, Carol and Dave');
  });
});
