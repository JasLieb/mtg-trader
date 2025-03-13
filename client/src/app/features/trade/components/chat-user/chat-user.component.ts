import { CommonModule } from '@angular/common';
import { Component, computed, input, Signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Chat } from '../../models/chat';
import { ChatMessage } from '../../models/chat-message';
import { ChatService } from '../../services/chat/chat.service';

@Component({
  selector: 'app-chat-user',
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
  templateUrl: './chat-user.component.html',
  styleUrl: './chat-user.component.scss',
})
export class ChatUserComponent {
  chat = input<Chat>();
  messageHistory: Signal<ChatMessage[]>;
  messageControl: FormControl = new FormControl('');

  constructor(private chatService: ChatService) {
    this.messageHistory = computed(
      () =>
        this.chat()?.chatMessages.sort(
          (a, b) => b.date.getTime() - a.date.getTime()
        ) || []
    );
  }

  onKeyDown($event: KeyboardEvent) {
    if ($event.key === 'Enter') {
      this.sendMessage();
    }
  }

  sendMessage(): void {
    const recipientId = this.chat()?.recipient.id;
    const message = this.messageControl.value.trim();
    if (message && recipientId) {
      this.chatService.sendMessage(message, recipientId);
      this.messageControl.reset();
    }
  }
}
