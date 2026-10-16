import {
  doublesListIdFor,
  isDoublesListId,
  splitDoublesList,
} from './doubles-list';
import { Wantlist } from './wantlist';

describe('doubles list', () => {
  it('should append the doubles suffix to the user id when build id', () => {
    expect(doublesListIdFor('user1')).toBe('user1_doubles');
  });

  it('should recognize the doubles list when id is built for a user', () => {
    expect(isDoublesListId(doublesListIdFor('user1'))).toBeTrue();
  });

  [
    'double',
    'doubles',
    'user1_double',
    'user1_doubles_old',
    'doubles_user1',
    'my double list',
  ].forEach((wantlistId) => {
    it(`should not recognize the doubles list when id is "${wantlistId}"`, () => {
      expect(isDoublesListId(wantlistId)).toBeFalse();
    });
  });

  it('should keep a wantlist whose id contains double without the doubles suffix among the wantlists', () => {
    const wantlist = makeWantlist('user1_double_trouble');
    const doubles = makeWantlist(doublesListIdFor('user1'));

    const split = splitDoublesList([wantlist, doubles]);

    expect(split.wantlists).toEqual([wantlist]);
    expect(split.doubles).toEqual(doubles);
  });

  it('should leave doubles undefined when no wantlist is the doubles list', () => {
    const split = splitDoublesList([makeWantlist('a'), makeWantlist('b')]);

    expect(split.wantlists.length).toBe(2);
    expect(split.doubles).toBeUndefined();
  });
});

function makeWantlist(id: string): Wantlist {
  return { id, name: id, cards: [] };
}
