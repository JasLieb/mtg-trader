export interface Card {
  id: string;
  name: string;
  uri: string;
  image_uri: string;
  price: number;
  set: string;
  set_uri: string;
  sets: CardSet[];
}

export function makeCard(
  id = '',
  name = '',
  uri = '',
  image_uri = '',
  price = 0,
  set = '',
  set_uri = '',
  sets: CardSet[] = []
): Card {
  return {
    id,
    name,
    uri,
    image_uri,
    price,
    set,
    set_uri,
    sets,
  };
}

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

export interface CardSet {
  id: string; // card id following associated set
  set_name: string;
  set_id: string;
}

interface CardImageUris {
  normal: string;
}

interface CardFace {
  illustration_id: string;
}
