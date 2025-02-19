import { Card } from "../../common/models/card";

export interface Wantlist {
  id: string,
  name: string,
  cards: Card[]
}

export interface WantlistMin {
  id: string;
  name: string;
  cards: string[];
}
