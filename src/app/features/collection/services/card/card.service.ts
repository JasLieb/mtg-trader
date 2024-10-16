import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  constructor() { }

  search(query: string) {
    console.log('hello')
  }
}
