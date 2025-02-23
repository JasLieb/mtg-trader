import { Component, OnDestroy, Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ChatService } from '../../services/chat/chat.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Chat } from '../../models/chat';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-chat-home',
  imports: [
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './chat-home.component.html',
  styleUrl: './chat-home.component.scss',
})
export class ChatHomeComponent implements OnDestroy {
  private unsubscribe = new Subject();

  connectedUser: Signal<string>;
  messageControl: FormControl;
  chats: Signal<Chat[]>;

  constructor(
    authService: AuthService,
    private chatService: ChatService,
    private activatedRoute: ActivatedRoute
  ) {
    this.messageControl = new FormControl('');
    this.chats = toSignal(chatService.fetchChats(), { initialValue: [] });
    this.activatedRoute.params
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((params) => {
        // TODO go to chat with user given by activated route's params
      });
    this.connectedUser = toSignal(authService.connectedUserToken$, {
      initialValue: '',
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next(null);
    this.unsubscribe.complete();
  }

  onKeyDown($event: KeyboardEvent) {
    if ($event.key === 'Enter') {
      this.sendMessage();
    }
  }

  sendMessage(): void {
    const connectedUser = this.connectedUser();
    if (this.messageControl.value.trim() && connectedUser !== '') {
      this.chatService.sendMessage(this.messageControl.value, connectedUser);
      this.messageControl.reset();
    }
  }
}
