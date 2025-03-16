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

export interface CardSet {
  card_id: string;
  set_name: string;
  set_id: string;
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

export function makeCardMin({
  id: card_id = '',
  name = '',
  uri = '',
  image_uri = '',
  price = 0,
  set = '',
  set_uri = '',
  sets = [],
}: Card): Card {
  return {
    id: card_id,
    name,
    uri,
    image_uri,
    price,
    set,
    set_uri,
    sets,
  };
}
