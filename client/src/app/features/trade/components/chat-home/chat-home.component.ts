import { Component, OnDestroy, Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { Subject, takeUntil } from 'rxjs';
import { ChatService } from '../../services/chat/chat.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Chat } from '../../models/chat';

@Component({
  selector: 'app-chat-home',
  imports: [MatCardModule],
  templateUrl: './chat-home.component.html',
  styleUrl: './chat-home.component.scss',
})
export class ChatHomeComponent implements OnDestroy {
  private unsubscribe = new Subject();

  chats: Signal<Chat[]>;

  constructor(
    private chatService: ChatService,
    private activatedRoute: ActivatedRoute
  ) {
    this.chats = toSignal(chatService.fetchChats(), { initialValue: [] });
    this.activatedRoute.params
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((params) => {});
  }

  ngOnDestroy(): void {
    this.unsubscribe.next(null);
    this.unsubscribe.complete();
  }
}
