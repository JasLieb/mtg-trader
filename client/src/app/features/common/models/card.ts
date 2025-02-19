export interface Card {
  id: string;
  name: string;
  uri: string;
  image_uri: string;
}

export interface ScryfallCard {
  id: string;
  name: string;
  scryfall_uri: string;
  card_faces: CardFace[];
  image_uris: CardImageUris;
}

interface CardImageUris {
  normal: string;
}

interface CardFace {
  illustration_id: string;
}
