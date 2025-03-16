export interface ScryfallCard {
  id: string;
  set: string;
  name: string;
  scryfall_uri: string;
  card_faces: CardFace[];
  image_uris: CardImageUris;
  prices: {
    eur: number;
  };
}

export interface ScryfallCardSet {
  id: string;
  set_name: string;
  set_id: string;
}

interface CardImageUris {
  normal: string;
}

interface CardFace {
  illustration_id: string;
}
