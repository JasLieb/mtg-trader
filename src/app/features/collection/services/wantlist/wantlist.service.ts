import { Injectable } from '@angular/core';
import { Wantlist } from '../../models/wantlist';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WantlistService {
  private readonly wantlistsKey = 'wantlists';
  private wantlistsBehavior = new BehaviorSubject<Wantlist[]>([]);
  wantlists$ = this.wantlistsBehavior.asObservable();

  constructor() {
    this.wantlistsBehavior.next(
      this.getWantlists()
    );
  }

  updateWantlist(wantlist: Wantlist) {
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
}
