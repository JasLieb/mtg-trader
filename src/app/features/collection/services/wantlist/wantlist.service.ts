import { Injectable } from '@angular/core';
import { Wantlist } from '../../models/wantlist';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WantlistService {
  private readonly wantlistsKey = 'wantlists';
  private wantlistsBehavior = new BehaviorSubject<Wantlist[]>(this.getWantlists());
  wantlists$ = this.wantlistsBehavior.asObservable();

  private readonly doublesKey = 'doubles';
  private readonly defaultDoubleWantlist = {
    id: 'doubles',
    name: 'doubles',
    cards: [],
  } as Wantlist;
  private doublesBehavior = new BehaviorSubject<Wantlist>(this.getDoubles());
  doubles$ = this.doublesBehavior.asObservable();

  // constructor() {
  //   this.wantlistsBehavior.next(this.getWantlists());
  //   this.doublesBehavior.next();
  // }

  updateWantlist(wantlist: Wantlist) {
    if(this.isDoubleWantlist(wantlist)) {
      this.updateDoubles(wantlist);
      return;
    }

    const wantlists = this.getWantlists();
    this.updateWantlists([
      ...wantlists.filter((wl) => wl.id !== wantlist.id),
      wantlist,
    ]);
  }

  private getWantlists() {
    return JSON.parse(
      window.localStorage.getItem(this.wantlistsKey) ?? '[]'
    ) as Wantlist[];
  }

  private updateWantlists(wantlists: Wantlist[]) {
    window.localStorage.setItem(this.wantlistsKey, JSON.stringify(wantlists));
    this.wantlistsBehavior.next(wantlists);
  }

  private isDoubleWantlist(wantlist: Wantlist): boolean {
    return wantlist.id == this.defaultDoubleWantlist.id;
  }

  private getDoubles() {
    const parsedDoubles = JSON.parse(
      window.localStorage.getItem(this.doublesKey) ?? '{}'
    ) as Wantlist;
    return 'cards' in parsedDoubles ? parsedDoubles : this.defaultDoubleWantlist;
  }

  private updateDoubles(wantlist: Wantlist) {
    window.localStorage.setItem(this.doublesKey, JSON.stringify(wantlist));
    this.doublesBehavior.next(wantlist);
  }
}
