import {
  Component,
  computed,
  OnDestroy,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { ChatService } from '../../services/chat/chat.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Chat } from '../../models/chat';
import { CommonModule } from '@angular/common';
import { subscribeOnce } from '../../../../core/utils/subscribeExtensions';

@Component({
  selector: 'app-chat-home',
  imports: [
    CommonModule,
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
  private selectedRecipientId: WritableSignal<string | undefined> =
    signal(undefined);

  messageControl: FormControl;
  chats: Signal<Chat[]>;
  selectedChat: Signal<Chat | undefined>;

  constructor(
    private chatService: ChatService,
    private activatedRoute: ActivatedRoute
  ) {
    this.messageControl = new FormControl('');
    this.chats = toSignal(chatService.chats$, { initialValue: [] });
    this.selectedChat = computed(() =>
      this.findOrMakeAssociatedChat(this.selectedRecipientId())
    );

    subscribeOnce(this.activatedRoute.params, (params) => {
      const recipientId = params['recipientId'];
      this.selectedRecipientId.set(recipientId);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next(null);
    this.unsubscribe.complete();
  }

  selectChat(recipientId: string) {
    if (recipientId) this.selectedRecipientId.set(recipientId);
  }

  onKeyDown($event: KeyboardEvent) {
    if ($event.key === 'Enter') {
      this.sendMessage();
    }
  }

  sendMessage(): void {
    const recipientId = this.selectedRecipientId();
    const message = this.messageControl.value.trim();
    if (message && recipientId) {
      this.chatService.sendMessage(message, recipientId);
      this.messageControl.reset();
    }
  }

  private findOrMakeAssociatedChat(
    recipientId: string | undefined
  ): Chat | undefined {
    return this.chats().find((c) => c.recipient.id === recipientId);
  }
}
