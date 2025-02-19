import { Card } from "../../common/models/card";

export interface UserTrader {
  id: string;
  name: string;
  doubles: Card[],
  wanted: Card[]
}

export interface UserTraderMin {
  id: string;
  name: string;
  doubles: string[],
  wanted: string[],
}
