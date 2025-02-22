import { UserTrader } from "./user-trader";

export interface Chat {
  id: string;
  recipient: UserTrader;
  messages: string[];
}
