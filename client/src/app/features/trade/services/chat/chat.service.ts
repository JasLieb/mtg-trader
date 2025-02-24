import { Injectable } from '@angular/core';
import { ChathubProxy } from './chathub.proxy';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  chats$ = this.chathubProxy.chats$;

  constructor(private chathubProxy: ChathubProxy) {}

  sendMessage(message: string, recipientId: string) {
    this.chathubProxy.sendMessage(message, recipientId);
  }
}
