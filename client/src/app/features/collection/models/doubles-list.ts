import { UserWantlists } from './user-wantlists';
import { Wantlist } from './wantlist';

// A user's doubles list is an ordinary wantlist whose id is `{userId}_doubles`.
// This is the client's only definition of that format; the server's is DoublesList in MtgTrader.Core.
const DOUBLES_LIST_ID_SUFFIX = '_doubles';

export function doublesListIdFor(userId: string): string {
  return `${userId}${DOUBLES_LIST_ID_SUFFIX}`;
}

export function isDoublesListId(wantlistId: string): boolean {
  return wantlistId.endsWith(DOUBLES_LIST_ID_SUFFIX);
}

export function splitDoublesList(wantlists: Wantlist[]): UserWantlists {
  return {
    wantlists: wantlists.filter((wl) => !isDoublesListId(wl.id)),
    doubles: wantlists.find((wl) => isDoublesListId(wl.id)),
  } as UserWantlists;
}
