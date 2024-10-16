import { Injectable } from '@angular/core';
import { Wantlist } from '../../models/wantlist';

@Injectable({
  providedIn: 'root'
})
export class WantlistService {
  private readonly wantlistsKey = 'wantlists';

  constructor() { }

  getWantlist(wantlistId: string) : Wantlist | undefined {
    const wantlists = this.getWantlists();
    return wantlists.filter(wl => wl.id == wantlistId).shift();
  }

  updateWantlist(wantlist: Wantlist) {
    const wantlists = this.getWantlists();
    this.updateWantlists(
      [
        ...wantlists.filter(wl => wl.id !== wantlist.id),
        wantlist
      ]
    );
  }

  private getWantlists() {
    return JSON.parse(
      window.localStorage.getItem(this.wantlistsKey) ?? '[]'
    ) as Wantlist[];
  }

  private updateWantlists(wantlists: Wantlist[]) {
    window.localStorage.setItem(
      this.wantlistsKey,
      JSON.stringify(wantlists)
    );
  }
}
