import {
  Component,
  computed,
  OnDestroy,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Chat } from '../../models/chat';
import { ChatService } from '../../services/chat/chat.service';
import { ChatUserComponent } from '../chat-user/chat-user.component';

@Component({
  selector: 'app-chat-home',
  imports: [ChatUserComponent],
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
    chatService: ChatService,
    private activatedRoute: ActivatedRoute
  ) {
    this.messageControl = new FormControl('');
    this.chats = toSignal(chatService.chats$, { initialValue: [] });
    this.selectedChat = computed(() =>
      this.findOrMakeAssociatedChat(this.selectedRecipientId())
    );

    this.activatedRoute.params
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((params) => {
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

  private findOrMakeAssociatedChat(
    recipientId: string | undefined
  ): Chat | undefined {
    return this.chats().find((c) => c.recipient.id === recipientId);
  }
}
