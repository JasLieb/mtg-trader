import { Card } from "../../common/models/card";
import { WantlistMin } from "./wantlist";

export interface WantlistsResponse {
  wantlists: WantlistMin[];
}

export interface PopulatedWantlistResponse {
  originalResponse: WantlistsResponse;
  cards: Card[];
}
