export interface ScryfallCard {
  id: string;
  set: string;
  name: string;
  scryfall_uri: string;
  card_faces: CardFace[];
  image_uris: CardImageUris;
  // The finishes the printing exists in: 'nonfoil', 'foil', 'etched'.
  finishes?: string[];
  // Scryfall sends prices as decimal strings, and null when it has none.
  prices: {
    eur: string | null;
    eur_foil: string | null;
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
