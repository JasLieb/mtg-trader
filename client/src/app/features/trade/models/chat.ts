import { ChatMessage } from "./chat-message";
import { UserTrader } from "./user-trader";

export interface Chat {
  recipientId: string;
  // recipient: UserTrader;
  chatMessages: ChatMessage[];
}

export interface Chats {
  chats: Chat[];
}

