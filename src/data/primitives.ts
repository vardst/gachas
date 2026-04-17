// Ported from public/reference/gacha_combinatorics_explorer.html
// Source of truth for the 4 design axes and validity rules.

export type DistId = 'flat' | 'step_up' | 'box' | 'preview' | 'sugoroku' | 'wishlist';
export type BannerId = 'standard' | 'limited' | 'weapon' | 'fes' | 'collab' | 'dual';
export type GuaranteeId =
  | 'pure' | 'batch' | 'hard' | 'soft'
  | 'pity_5050' | 'pity_7030' | 'radiance'
  | 'spark_only' | 'spark_pity'
  | 'shards' | 'shards_pity'
  | 'full_suite';
export type CurrencyId = 'single' | 'dual' | 'tickets';

export interface Distribution {
  id: DistId;
  name: string;
  desc: string;
}

export interface Banner {
  id: BannerId;
  name: string;
  desc: string;
}

export interface Guarantee {
  id: GuaranteeId;
  name: string;
  layers: string[];
  generosity: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface Currency {
  id: CurrencyId;
  name: string;
  desc: string;
}

export const distributions: Distribution[] = [
  { id: 'flat',     name: 'Flat',     desc: 'Fixed probabilities per pull, independent trials' },
  { id: 'step_up',  name: 'Step-Up',  desc: 'Probabilities shift per consecutive roll within a cycle' },
  { id: 'box',      name: 'Box',      desc: 'Finite pool, pulled items removed until reset' },
  { id: 'preview',  name: 'Preview',  desc: 'Next N pulls revealed before commitment' },
  { id: 'sugoroku', name: 'Sugoroku', desc: 'Pulls advance a pawn on a reward track' },
  { id: 'wishlist', name: 'Wishlist', desc: 'Top-rarity pulls resolve to player-selected pool' },
];

export const banners: Banner[] = [
  { id: 'standard', name: 'Standard only', desc: 'Permanent pool only, no featured' },
  { id: 'limited',  name: 'Limited',       desc: 'Time-gated featured banner' },
  { id: 'weapon',   name: 'Weapon/gear',   desc: 'Separate gear-focused pool' },
  { id: 'fes',      name: 'Festival',      desc: 'Anniversary-tier doubled rates' },
  { id: 'collab',   name: 'Collab',        desc: 'IP crossover, typically non-rerun' },
  { id: 'dual',     name: 'Dual rate-up',  desc: 'Two simultaneous featured characters' },
];

export const guarantees: Guarantee[] = [
  { id: 'pure',        name: 'Pure RNG',           layers: [], generosity: 1 },
  { id: 'batch',       name: 'Batch floor',        layers: ['10x batch floor'], generosity: 2 },
  { id: 'hard',        name: 'Hard pity',          layers: ['10x batch floor', 'Hard pity'], generosity: 3 },
  { id: 'soft',        name: 'Soft + Hard pity',   layers: ['10x batch floor', 'Hard pity', 'Soft pity ramp'], generosity: 4 },
  { id: 'pity_5050',   name: 'Pity + 50/50',       layers: ['10x batch floor', 'Hard pity', 'Soft pity', '50/50 rate-up', 'Carry-over'], generosity: 4 },
  { id: 'pity_7030',   name: 'Pity + 70/30',       layers: ['10x batch floor', 'Hard pity', 'Soft pity', '70/30 rate-up', 'Carry-over'], generosity: 5 },
  { id: 'radiance',    name: 'Capturing Radiance', layers: ['10x batch floor', 'Hard pity', 'Soft pity', '55/45 adaptive', 'Carry-over'], generosity: 5 },
  { id: 'spark_only',  name: 'Spark only',         layers: ['10x batch floor', 'Spark tickets'], generosity: 4 },
  { id: 'spark_pity',  name: 'Spark + Pity',       layers: ['10x batch floor', 'Hard pity', 'Soft pity', 'Spark tickets'], generosity: 5 },
  { id: 'shards',      name: 'Shard conversion',   layers: ['10x batch floor', 'Dupe-to-shards'], generosity: 4 },
  { id: 'shards_pity', name: 'Shards + Pity',      layers: ['10x batch floor', 'Hard pity', 'Soft pity', 'Dupe-to-shards'], generosity: 5 },
  { id: 'full_suite',  name: 'Full suite',         layers: ['10x batch floor', 'Hard pity', 'Soft pity', '50/50 + Radiance', 'Spark', 'Shards', 'Carry-over'], generosity: 6 },
];

export const currencies: Currency[] = [
  { id: 'single',  name: 'Single',         desc: 'One free currency, no paid/free split' },
  { id: 'dual',    name: 'Dual',           desc: 'Free currency + Paid currency separated' },
  { id: 'tickets', name: 'Banner tickets', desc: 'Per-banner locked ticket currency' },
];

export function isValid(d: Distribution, b: Banner, g: Guarantee, c: Currency): boolean {
  if (d.id === 'preview') {
    if (['pity_5050', 'pity_7030', 'radiance', 'full_suite'].includes(g.id)) return false;
    if (c.id === 'tickets') return false;
  }
  if (d.id === 'box') {
    if (['spark_only', 'spark_pity', 'full_suite'].includes(g.id)) return false;
  }
  if (d.id === 'wishlist') {
    if (['pity_5050', 'pity_7030', 'radiance'].includes(g.id)) return false;
  }
  if (['pity_5050', 'pity_7030', 'radiance', 'full_suite'].includes(g.id)) {
    if (b.id === 'standard') return false;
  }
  if (d.id === 'sugoroku' && g.id === 'full_suite') return false;
  if (b.id === 'collab' && c.id === 'single') return false;
  if (b.id === 'dual' && ['pure', 'batch', 'hard', 'soft', 'spark_only', 'shards'].includes(g.id)) return false;
  if (b.id === 'weapon' && g.id === 'pure') return false;
  return true;
}

export interface ComboTag {
  text: 'Player-hate risk' | 'Regulatory risk' | 'Novel' | 'F2P-friendly' | 'Whale-focused' | 'Harsh' | 'Standard';
  cls: 'tag-good' | 'tag-warn' | 'tag-danger' | 'tag-neutral' | 'tag-accent';
}

export function getTag(d: Distribution, b: Banner, g: Guarantee, c: Currency): ComboTag {
  if (g.id === 'pure' && b.id !== 'standard') return { text: 'Player-hate risk', cls: 'tag-danger' };
  if (d.id === 'box' && g.id === 'pure') return { text: 'Player-hate risk', cls: 'tag-danger' };
  if (d.id === 'flat' && g.id === 'pure' && c.id === 'tickets') return { text: 'Regulatory risk', cls: 'tag-danger' };
  if (d.id === 'sugoroku' && g.generosity >= 5) return { text: 'Novel', cls: 'tag-accent' };
  if (d.id === 'preview' && g.id === 'spark_pity') return { text: 'Novel', cls: 'tag-accent' };
  if (d.id === 'wishlist' && g.id === 'full_suite') return { text: 'Novel', cls: 'tag-accent' };
  if (d.id === 'preview' && b.id === 'fes') return { text: 'Novel', cls: 'tag-accent' };
  if (d.id === 'box' && b.id === 'limited' && g.id === 'pity_5050') return { text: 'Novel', cls: 'tag-accent' };
  if (d.id === 'step_up' && b.id === 'collab') return { text: 'Novel', cls: 'tag-accent' };
  if (g.generosity >= 5 && c.id !== 'tickets') return { text: 'F2P-friendly', cls: 'tag-good' };
  if (g.generosity <= 2 && c.id === 'dual') return { text: 'Whale-focused', cls: 'tag-warn' };
  if (g.generosity <= 2) return { text: 'Harsh', cls: 'tag-warn' };
  return { text: 'Standard', cls: 'tag-neutral' };
}

export function generateName(d: Distribution, b: Banner, g: Guarantee, c: Currency): string {
  const bannerPart = b.id === 'standard' ? 'Permanent' : b.name;
  if (d.id === 'flat' && b.id === 'limited' && g.id === 'pity_5050' && c.id === 'dual') return 'HoYoverse Standard';
  if (d.id === 'flat' && b.id === 'limited' && g.id === 'radiance' && c.id === 'dual') return 'Genshin 5.0+';
  if (d.id === 'flat' && b.id === 'standard' && g.id === 'spark_only' && c.id === 'dual') return 'Granblue Classic';
  if (d.id === 'flat' && b.id === 'limited' && g.id === 'spark_pity' && c.id === 'dual') return 'Arknights Limited';
  if (d.id === 'flat' && b.id === 'fes' && g.id === 'full_suite') return 'Anniversary Megabanner';
  if (d.id === 'box' && b.id === 'standard' && g.id === 'batch') return 'Dragalia Box';
  if (d.id === 'box' && b.id === 'fes') return 'Festival Box';
  if (d.id === 'step_up' && b.id === 'limited' && g.id === 'spark_pity') return 'Sekai Step-Up';
  if (d.id === 'step_up' && b.id === 'fes') return 'Festival Step-Up';
  if (d.id === 'wishlist' && b.id === 'limited' && g.id === 'spark_pity') return 'Solo Leveling Model';
  if (d.id === 'preview' && b.id === 'limited') return 'Transparent Reveal';
  if (d.id === 'sugoroku') return 'Sugoroku Track';
  return `${d.name} ${bannerPart} / ${g.name}`;
}

export function getExample(d: Distribution, b: Banner, g: Guarantee, c: Currency): string {
  if (d.id === 'flat' && b.id === 'limited' && g.id === 'pity_5050' && c.id === 'dual') return 'Honkai: Star Rail, ZZZ (pre-5.0 Genshin)';
  if (d.id === 'flat' && b.id === 'limited' && g.id === 'radiance' && c.id === 'dual') return 'Genshin Impact v5.0+';
  if (d.id === 'flat' && b.id === 'limited' && g.id === 'pity_7030' && c.id === 'dual') return 'Punishing: Gray Raven';
  if (d.id === 'flat' && b.id === 'standard' && g.id === 'spark_only' && c.id === 'dual') return 'Granblue Fantasy, Nikke';
  if (d.id === 'flat' && b.id === 'limited' && g.id === 'spark_pity' && c.id === 'dual') return 'Arknights (limited banners)';
  if (d.id === 'flat' && b.id === 'weapon' && g.id === 'pity_5050' && c.id === 'dual') return 'Genshin weapon (Epitomized Path)';
  if (d.id === 'step_up' && b.id === 'fes' && g.id === 'full_suite') return 'Project Sekai Colorful Fes';
  if (d.id === 'step_up' && b.id === 'limited' && g.id === 'spark_pity') return 'Project Sekai standard step-up';
  if (d.id === 'box' && b.id === 'standard' && g.id === 'batch') return 'Dragalia Lost box banner (RIP)';
  if (d.id === 'wishlist' && b.id === 'limited') return 'Solo Leveling: Arise (wishlist tier)';
  if (d.id === 'flat' && b.id === 'limited' && g.id === 'pure' && c.id === 'dual') return 'Fate/Grand Order (original)';
  if (d.id === 'flat' && b.id === 'dual' && g.id === 'pity_5050') return 'Genshin Character Event Wish 1+2';
  if (d.id === 'flat' && b.id === 'collab' && g.id === 'spark_pity') return 'Arknights × Rainbow Six, FGO collabs';
  if (d.id === 'flat' && b.id === 'standard' && g.id === 'pure') return 'Early 2010s Japanese mobile';
  if (d.id === 'flat' && b.id === 'fes' && g.id === 'pity_5050') return 'Blue Archive Fes, HSR Fes';
  if (d.id === 'flat' && b.id === 'limited' && g.id === 'shards_pity') return 'Limbus Company, Epic Seven';
  return '';
}

export function getNotes(d: Distribution, b: Banner, g: Guarantee, c: Currency): string[] {
  const notes: string[] = [];
  if (d.id === 'step_up') notes.push('Step-up works best with 8-10 roll cycles; longer feels like a treadmill.');
  if (d.id === 'box') notes.push('Bounded completion — max whale spend is the pool cost. Good for completionists.');
  if (d.id === 'preview') notes.push('Reveal mechanics trade monetization for regulatory safety. Monetization drops 20-40% typically.');
  if (d.id === 'sugoroku') notes.push('Event-scale design only; high UI cost. Never the core system.');
  if (d.id === 'wishlist') notes.push('Softens dupe pain massively. Best with rosters under 30 characters.');
  if (g.id === 'pure') notes.push('No mitigation at all — regulatory and retention risk in 2026+.');
  if (g.id === 'pity_5050') notes.push('The genre-standard structure; players understand it immediately.');
  if (g.id === 'radiance') notes.push('Adaptive 50/50 — compensates for consecutive losses. Player-friendly upgrade.');
  if (g.id === 'spark_only') notes.push('No rate-up guarantee; whale clarity via spark threshold instead.');
  if (g.id === 'shards') notes.push('Dupe conversion is the dominant QoL feature of 2024+ gachas.');
  if (g.id === 'full_suite') notes.push('Maximum generosity. Works for giant Fes events, unsustainable as default.');
  if (b.id === 'weapon') notes.push('Weapon banners are typically the highest-grossing banner type — tune 50/50 cautiously.');
  if (b.id === 'collab') notes.push('Collab banners drive D1 acquisition from the IP fanbase; usually non-rerun.');
  if (b.id === 'dual') notes.push('Shared pity across two rate-ups effectively doubles a banner slot.');
  if (b.id === 'fes') notes.push('Festival banners print money — reserve currency events around them.');
  if (c.id === 'tickets') notes.push('Banner-locked tickets create use-or-lose pressure.');
  if (c.id === 'dual') notes.push('Free/paid split is near-universal for compliance with disclosure rules.');
  return notes;
}

export interface Combo {
  id: number;
  slug: string;
  name: string;
  dist: Distribution;
  banner: Banner;
  guarantee: Guarantee;
  currency: Currency;
  generosity: number;
  tag: ComboTag;
  example: string;
  notes: string[];
}

export function slugFor(d: Distribution, b: Banner, g: Guarantee, c: Currency): string {
  return `${d.id}-${b.id}-${g.id}-${c.id}`;
}

export function buildCombos(): Combo[] {
  const combos: Combo[] = [];
  let id = 0;
  for (const d of distributions) {
    for (const b of banners) {
      for (const g of guarantees) {
        for (const c of currencies) {
          if (!isValid(d, b, g, c)) continue;
          id++;
          combos.push({
            id,
            slug: slugFor(d, b, g, c),
            name: generateName(d, b, g, c),
            dist: d,
            banner: b,
            guarantee: g,
            currency: c,
            generosity: g.generosity,
            tag: getTag(d, b, g, c),
            example: getExample(d, b, g, c),
            notes: getNotes(d, b, g, c),
          });
        }
      }
    }
  }
  return combos;
}

export const combos = buildCombos();

export function getCombo(slug: string): Combo | undefined {
  return combos.find(c => c.slug === slug);
}
