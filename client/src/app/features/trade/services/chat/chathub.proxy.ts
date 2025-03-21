import { Injectable } from '@angular/core';
import { BehaviorSubject, filter } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { subscribeOnce } from '../../../../core/utils/subscribeExtensions';
import { ChatMessage } from '../../models/chat-message';
import { ChatDto, Chats } from '../../models/chat';
import { makeApiUrl } from '../../../../core/utils/makeUrl';

@Injectable({
  providedIn: 'root',
})
export class ChathubProxy {
  private readonly chatHubUrl = makeApiUrl('chathub');
  private hubConnection: signalR.HubConnection | null = null;
  private receivedChatsBehavior = new BehaviorSubject<ChatDto[]>([]);

  chats$ = this.receivedChatsBehavior.asObservable();

  constructor(private authService: AuthService) {
    subscribeOnce(
      this.authService.connectedUserToken$.pipe(filter((token) => !!token)),
      (userToken) => {
        this.initHubConnection(userToken);
      }
    );
  }

  private initHubConnection(userToken: string) {
    const options: signalR.IHttpConnectionOptions = {
      accessTokenFactory: () => userToken,
      transport:
        signalR.HttpTransportType.WebSockets |
        signalR.HttpTransportType.LongPolling,
    };

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.chatHubUrl, options)
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('Connection started');
      })
      .catch((err) => console.error(err));

    this.hubConnection.on('ReceiveMessage', (message: ChatMessage) =>
      this.receiveMessage(message)
    );

    this.hubConnection.on('LoadHistory', (messages: Chats) => {
      this.receivedChatsBehavior.next(messages.chats as ChatDto[]);
    });
  }

  private receiveMessage(message: ChatMessage) {
    this.receivedChatsBehavior.next(
      this.receivedChatsBehavior.value.map((chat) => {
        if (
          chat.recipientId == message.authorId ||
          chat.recipientId == message.recipientId
        ) {
          chat.chatMessages.push(message);
        }
        return chat;
      })
    );
  }

  sendMessage(message: string, recipientId: string) {
    if (this.hubConnection) {
      this.hubConnection
        .invoke('SendMessage', recipientId, message)
        .catch((err) => console.error(err));
    }
  }
}
