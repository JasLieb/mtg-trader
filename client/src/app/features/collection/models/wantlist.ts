import { Card } from "../../common/models/card";

export interface Wantlist {
  id: string,
  name: string,
  cards: Card[]
}
