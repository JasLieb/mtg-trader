import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private hubConnection: signalR.HubConnection;
  messages = signal<string[]>([]);

  constructor() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(
        '/chathub',
        signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.LongPolling
      )
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('Connection started');
        this.hubConnection.on('ReceiveMessage', (message: string) => {
          this.messages.set([...this.messages(), message]);
        });
      })
      .catch((err) => console.error(err));
  }

  sendMessage(message: string, senderId: string, recipientId: string) {
    if (recipientId) {
      this.hubConnection
        .invoke('SendMessage', senderId, recipientId, message)
        .catch((err) => console.error(err));
    }
  }
}
