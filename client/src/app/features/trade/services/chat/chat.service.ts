import { Injectable, signal } from '@angular/core';
import { filter, Observable, of } from 'rxjs';
import { Chat } from '../../models/chat';
import { UserTrader } from '../../models/user-trader';
import * as signalR from '@microsoft/signalr';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { subscribeOnce } from '../../../../core/utils/subscribeExtensions';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private hubConnection: signalR.HubConnection | null = null;
  private connectionId: string | undefined;

  static shouldInitHubConnection: boolean = true;

  messages = signal<string[]>([]);

  constructor(private authService: AuthService) {
    if (ChatService.shouldInitHubConnection) {
      subscribeOnce(
        this.authService.connectedUserToken$.pipe(filter((token) => !!token)),
        (userToken) => {
          this.initHubConnection(userToken);
        }
      );
    }
  }

  private initHubConnection(userToken: string) {
    const options: signalR.IHttpConnectionOptions = {
      accessTokenFactory: () => userToken,
      transport:
        signalR.HttpTransportType.WebSockets |
        signalR.HttpTransportType.LongPolling,
    };

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('/chathub', options)
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('Connection started');
      })
      .catch((err) => console.error(err));

    this.hubConnection.on('ReceiveMessage', (message: string) => {
      this.messages.set([...this.messages(), message]);
    });
  }

  sendMessage(message: string, senderId: string, recipientId: string) {
    if (recipientId && this.hubConnection) {
      this.hubConnection
        .invoke('SendMessage', senderId, recipientId, message)
        .catch((err) => console.error(err));
    }
  }

  fetchChats(): Observable<Chat[]> {
    return of([
      {
        id: '1',
        recipient: {
          id: 'toto',
          name: 'jas',
          doubles: [{ id: 't', name: 'toto', uri: 'card', image_uri: 'd' }],
          wanted: [{ id: 't', name: 'toto', uri: 'card', image_uri: 'd' }],
        } as UserTrader,
        messages: ['hello'],
      } as Chat,
    ]);
  }
}
