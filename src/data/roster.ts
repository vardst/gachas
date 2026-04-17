// Abstract no-art token roster. Tokens are colored rarity tiers.
// Units have a name, rarity, and color — no portraits.

export type Rarity = 3 | 4 | 5;

export interface Unit {
  id: string;
  name: string;
  rarity: Rarity;
  color: string;
}

function mk(id: string, name: string, rarity: Rarity, color: string): Unit {
  return { id, name, rarity, color };
}

export const roster: Unit[] = [
  mk('aria',    'Aria',    5, '#E8B84A'),
  mk('kestrel', 'Kestrel', 5, '#C76D7E'),
  mk('nocturne','Nocturne',5, '#6F5BC6'),
  mk('tessera', 'Tessera', 5, '#3F8DA6'),
  mk('vesper',  'Vesper',  5, '#B85A3C'),
  mk('briar',   'Briar',   4, '#8A6FD4'),
  mk('cadmus',  'Cadmus',  4, '#4B8E6E'),
  mk('drift',   'Drift',   4, '#2F7FB5'),
  mk('echo',    'Echo',    4, '#C48A2E'),
  mk('fern',    'Fern',    4, '#5A9B47'),
  mk('glint',   'Glint',   4, '#C0813A'),
  mk('hollow',  'Hollow',  4, '#7B6C9D'),
  mk('iris',    'Iris',    4, '#AD5E8A'),
  mk('ion',     'Ion',     3, '#6E7582'),
  mk('jot',     'Jot',     3, '#7E8492'),
  mk('knot',    'Knot',    3, '#77707E'),
  mk('lint',    'Lint',    3, '#7A8278'),
  mk('mote',    'Mote',    3, '#7A7470'),
  mk('nib',     'Nib',     3, '#757E7A'),
  mk('orb',     'Orb',     3, '#7E7774'),
  mk('plait',   'Plait',   3, '#71787F'),
  mk('quill',   'Quill',   3, '#7C7570'),
  mk('ream',    'Ream',    3, '#76807E'),
  mk('sigil',   'Sigil',   3, '#787070'),
];

export const fiveStars = roster.filter(u => u.rarity === 5);
export const fourStars = roster.filter(u => u.rarity === 4);
export const threeStars = roster.filter(u => u.rarity === 3);

export function getUnit(id: string): Unit | undefined {
  return roster.find(u => u.id === id);
}

export const FIVE_STAR_RATE = 0.006;
export const FOUR_STAR_RATE = 0.051;
export const THREE_STAR_RATE = 1 - FIVE_STAR_RATE - FOUR_STAR_RATE;

export function featuredFor(bannerId: string): { five: Unit[]; four: Unit[] } {
  switch (bannerId) {
    case 'standard': return { five: [], four: [] };
    case 'limited':  return { five: [fiveStars[0]], four: [fourStars[0], fourStars[1], fourStars[2]] };
    case 'weapon':   return { five: [fiveStars[1]], four: [fourStars[3]] };
    case 'fes':      return { five: [fiveStars[0], fiveStars[1]], four: [fourStars[0], fourStars[1], fourStars[2]] };
    case 'collab':   return { five: [fiveStars[2]], four: [fourStars[4], fourStars[5]] };
    case 'dual':     return { five: [fiveStars[0], fiveStars[1]], four: [fourStars[0], fourStars[1], fourStars[2]] };
    default:         return { five: [], four: [] };
  }
}
