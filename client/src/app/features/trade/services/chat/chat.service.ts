import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable, zip } from 'rxjs';
import { Chat } from '../../models/chat';
import { UserTrader } from '../../models/user-trader';
import { TradeService } from '../trade/trade.service';
import { ChathubProxy } from './chathub.proxy';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private newChatBehavior = new BehaviorSubject<Chat[]>([]);
  chats$: Observable<Chat[]>;

  constructor(
    private tradeService: TradeService,
    private chathubProxy: ChathubProxy
  ) {
    const fetchedChats = this.mergeChatsWithUserTraders();

    this.chats$ = zip(
      [fetchedChats, this.newChatBehavior],
      (chats, newChats) => {
        return newChats.length > 0 &&
          !chats.some((c) => c.recipient.id == newChats[0].recipient.id)
          ? chats.concat(newChats)
          : chats;
      }
    );
  }

  initChat(recipient: UserTrader) {
    this.newChatBehavior.next([
      {
        recipient,
        chatMessages: [],
      },
    ]);
  }

  sendMessage(message: string, recipientId: string) {
    this.chathubProxy.sendMessage(message, recipientId);
  }

  private mergeChatsWithUserTraders() {
    return combineLatest([
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
}
