import { Injectable } from '@angular/core';
import { ChathubProxy } from './chathub.proxy';
import { combineLatest, forkJoin, map, Observable } from 'rxjs';
import { Chat } from '../../models/chat';
import { TradeService } from '../trade/trade.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  chats$: Observable<Chat[]>;

  constructor(
    private tradeService: TradeService,
    private chathubProxy: ChathubProxy
  ) {
    this.chats$ = combineLatest([
      this.chathubProxy.chats$,
      this.tradeService.find(),
    ]).pipe(
      map((pair) => {
        const chats = pair[0];
        const userTraders = pair[1];
        return chats.flatMap((dto) => {
          const recipient = userTraders.find((u) => u.id == dto.recipientId);
          return recipient
            ? ({
                recipient,
                chatMessages: dto.chatMessages,
              } as Chat)
            : [];
        });
      })
    );
  }

  sendMessage(message: string, recipientId: string) {
    this.chathubProxy.sendMessage(message, recipientId);
  }
}
