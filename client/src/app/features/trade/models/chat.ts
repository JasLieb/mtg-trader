import { ChatMessage } from "./chat-message";
import { UserTrader } from "./user-trader";

export interface Chat {
  recipient: UserTrader;
  chatMessages: ChatMessage[];
}

export interface Chats {
  chats: ChatDto[];
}

export interface ChatDto {
  recipientId: string;
  chatMessages: ChatMessage[];
}

