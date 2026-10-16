import { canRemoveCards } from './trade-cards-removal';

describe('canRemoveCards', () => {
  it('should allow the step on a trade the user has not removed the cards of yet', () => {
    expect(canRemoveCards({ isSent: true, state: 'Accepted', hasRemovedCards: false })).toBeTrue();
    expect(canRemoveCards({ isSent: false, state: 'Accepted', hasRemovedCards: false })).toBeTrue();
  });

  it('should not allow the step twice', () => {
    expect(canRemoveCards({ isSent: true, state: 'Accepted', hasRemovedCards: true })).toBeFalse();
  });

  for (const state of ['Pending', 'Declined', 'Withdrawn'] as const) {
    it(`should not allow the step on a ${state} proposal`, () => {
      expect(canRemoveCards({ isSent: true, state, hasRemovedCards: false })).toBeFalse();
    });
  }
});
