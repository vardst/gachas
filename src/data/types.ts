// Type taxonomy: classifies each combo into one of ~50 "types".
// Named flavors get dedicated types; everything else buckets by (dist × guarantee-family).

import type { Combo, GuaranteeId, DistId } from './primitives';
import { combos } from './primitives';

export type GuaranteeFamily = 'pure' | 'batch' | 'pity' | 'spark' | 'shards' | 'full';

export function guaranteeFamily(gid: GuaranteeId): GuaranteeFamily {
  if (gid === 'pure') return 'pure';
  if (gid === 'batch') return 'batch';
  if (gid === 'full_suite') return 'full';
  if (['hard', 'soft', 'pity_5050', 'pity_7030', 'radiance'].includes(gid)) return 'pity';
  if (['spark_only', 'spark_pity'].includes(gid)) return 'spark';
  return 'shards';
}

export interface GachaType {
  key: string;
  title: string;
  subtitle: string;
  accent: string;
  flavor: string;
  category: 'named' | 'generic';
  mechanicFocus: 'pity' | 'spark' | 'shards' | 'pure' | 'batch' | 'full' | 'box' | 'preview' | 'sugoroku' | 'wishlist' | 'step_up';
}

// 12 named flavor types.
export const NAMED_TYPES: Record<string, GachaType> = {
  'hoyoverse-standard': {
    key: 'hoyoverse-standard',
    title: 'HoYoverse Standard',
    subtitle: 'Flat rates · Limited banner · 50/50 + carry-over',
    accent: '#7EC4F5',
    flavor: 'The genre baseline used by Honkai: Star Rail, Zenless Zone Zero, and pre-5.0 Genshin. 50/50 on featured 5★, hard pity at 90, soft ramp from 74. Lose the 50/50, next 5★ is guaranteed featured. Understood instantly by any 2020+ gacha player.',
    category: 'named',
    mechanicFocus: 'pity',
  },
  'genshin-radiance': {
    key: 'genshin-radiance',
    title: 'Genshin 5.0+ (Capturing Radiance)',
    subtitle: 'Flat rates · Limited · Adaptive 55/45 + carry-over',
    accent: '#E8B84A',
    flavor: 'Genshin v5.0+ response to streakbreaker fatigue. After losing a 50/50, Radiance raises the next rate-up roll by ~10% per consecutive loss. Player-friendly upgrade without giving up 50/50 entirely.',
    category: 'named',
    mechanicFocus: 'pity',
  },
  'granblue-classic': {
    key: 'granblue-classic',
    title: 'Granblue Classic',
    subtitle: 'Flat rates · Permanent pool · Spark only',
    accent: '#2F9DFF',
    flavor: 'No rate-up guarantee — instead a fixed "spark" threshold (~300 pulls) lets you pick any featured unit outright. Whale clarity via deterministic floor rather than probabilistic pity. Used by Granblue Fantasy and Nikke.',
    category: 'named',
    mechanicFocus: 'spark',
  },
  'arknights-limited': {
    key: 'arknights-limited',
    title: 'Arknights Limited',
    subtitle: 'Flat rates · Limited · Soft+Hard pity + Spark',
    accent: '#C76D7E',
    flavor: 'Layered safety: pity guarantees a 6★ by pull 99 AND a spark ticket at 300 pulls redeems the limited of your choice. Known as "dual ceiling" — both probabilistic soft guarantees and a deterministic floor.',
    category: 'named',
    mechanicFocus: 'spark',
  },
  'anniversary-megabanner': {
    key: 'anniversary-megabanner',
    title: 'Anniversary Megabanner',
    subtitle: 'Flat rates · Festival · Full suite of guarantees',
    accent: '#FFD86F',
    flavor: 'Max-generosity anniversary-tier banner: doubled rates, 50/50 with carry-over, spark tickets, shard conversion, adaptive Radiance. Prints money once a year; unsustainable as a default.',
    category: 'named',
    mechanicFocus: 'full',
  },
  'dragalia-box': {
    key: 'dragalia-box',
    title: 'Dragalia Box',
    subtitle: 'Box draw · Finite pool · 10× batch floor',
    accent: '#A0D468',
    flavor: 'Pulls are drawn from a finite box pool — each pulled item is removed until reset. Bounded whale spend: max cost equals the pool cost. The ethical gacha archetype (RIP Dragalia Lost).',
    category: 'named',
    mechanicFocus: 'box',
  },
  'festival-box': {
    key: 'festival-box',
    title: 'Festival Box',
    subtitle: 'Box · Festival banner · Anniversary-scale',
    accent: '#FF9FD5',
    flavor: 'A box banner scaled up for festival/anniversary: doubled rates, juicier drops, often with multiple featured 5★s mixed into the finite pool. Deeply satisfying because every pull visibly depletes the box.',
    category: 'named',
    mechanicFocus: 'box',
  },
  'sekai-step-up': {
    key: 'sekai-step-up',
    title: 'Sekai Step-Up',
    subtitle: 'Step-up cycles · Limited · Spark + Pity',
    accent: '#FF8FB1',
    flavor: 'Each 10-pull step in a cycle escalates: step 3 guarantees 4★+, step 5 guarantees 5★ featured. Spark threshold layered on top. Player psychology is built around the step reveal moment — the "should I commit to step 5?" hook.',
    category: 'named',
    mechanicFocus: 'step_up',
  },
  'festival-step-up': {
    key: 'festival-step-up',
    title: 'Festival Step-Up',
    subtitle: 'Step-up · Festival banner',
    accent: '#FFB6E6',
    flavor: 'Step-up mechanic on a festival/anniversary banner. Steps are usually shorter (6-8 instead of 10) and loaded with discounts. Engagement-per-pull is exceptional; it prints money.',
    category: 'named',
    mechanicFocus: 'step_up',
  },
  'solo-leveling-model': {
    key: 'solo-leveling-model',
    title: 'Solo Leveling Wishlist',
    subtitle: 'Wishlist · Limited · Spark + Pity',
    accent: '#9B6CFF',
    flavor: 'Top-rarity pulls resolve to a player-chosen pool of 3. Dupe pain dissolves — you get what you want. Works best with rosters under 30 characters where every character is relatively unique.',
    category: 'named',
    mechanicFocus: 'wishlist',
  },
  'transparent-reveal': {
    key: 'transparent-reveal',
    title: 'Transparent Reveal',
    subtitle: 'Preview · Limited · Soft+Hard pity',
    accent: '#4FC98D',
    flavor: 'Next 3 pulls are shown before commit. Removes surprise entirely — trades monetization for regulatory safety. Monetization typically drops 20–40% but regulators love it and so does a quiet segment of players.',
    category: 'named',
    mechanicFocus: 'preview',
  },
  'sugoroku-track': {
    key: 'sugoroku-track',
    title: 'Sugoroku Track',
    subtitle: 'Board-advancement gacha · Event-scale',
    accent: '#FFA94D',
    flavor: 'Pulls advance a pawn around a 40-tile board. Tiles 10, 20, 30 award featured 5★; milestones (5, 15, 25, 35) award 4★. Event-scale only — high UI cost, deeply engaging when done right.',
    category: 'named',
    mechanicFocus: 'sugoroku',
  },
};

/** Classify a combo into a type key. */
export function classifyCombo(combo: Combo): string {
  const { dist, banner, guarantee } = combo;

  // Named matches (order matters: more specific first).
  if (dist.id === 'flat' && banner.id === 'limited' && guarantee.id === 'pity_5050') return 'hoyoverse-standard';
  if (dist.id === 'flat' && banner.id === 'limited' && guarantee.id === 'radiance') return 'genshin-radiance';
  if (dist.id === 'flat' && banner.id === 'standard' && guarantee.id === 'spark_only') return 'granblue-classic';
  if (dist.id === 'flat' && banner.id === 'limited' && guarantee.id === 'spark_pity') return 'arknights-limited';
  if (dist.id === 'flat' && banner.id === 'fes' && guarantee.id === 'full_suite') return 'anniversary-megabanner';
  if (dist.id === 'box' && banner.id === 'standard' && guarantee.id === 'batch') return 'dragalia-box';
  if (dist.id === 'box' && banner.id === 'fes') return 'festival-box';
  if (dist.id === 'step_up' && banner.id === 'limited' && guarantee.id === 'spark_pity') return 'sekai-step-up';
  if (dist.id === 'step_up' && banner.id === 'fes') return 'festival-step-up';
  if (dist.id === 'wishlist' && banner.id === 'limited' && guarantee.id === 'spark_pity') return 'solo-leveling-model';
  if (dist.id === 'preview' && banner.id === 'limited') return 'transparent-reveal';
  if (dist.id === 'sugoroku') return 'sugoroku-track';

  // Generic bucket: distribution × guarantee family.
  const family = guaranteeFamily(guarantee.id);
  return `${dist.id}-${family}`;
}

/** Pretty title for generic buckets. */
function genericTitle(dist: DistId, family: GuaranteeFamily): string {
  const distLabel: Record<DistId, string> = {
    flat: 'Flat', step_up: 'Step-Up', box: 'Box', preview: 'Preview', sugoroku: 'Sugoroku', wishlist: 'Wishlist',
  };
  const familyLabel: Record<GuaranteeFamily, string> = {
    pure: 'Pure RNG', batch: 'Batch-floor only', pity: 'Pity-based', spark: 'Spark-based', shards: 'Shard conversion', full: 'Full-suite',
  };
  return `${distLabel[dist]} · ${familyLabel[family]}`;
}

function genericSubtitle(dist: DistId, family: GuaranteeFamily, banners: Set<string>): string {
  const bannerList = [...banners].join(', ');
  return `${genericTitle(dist, family)} · banners: ${bannerList}`;
}

function genericAccent(family: GuaranteeFamily): string {
  switch (family) {
    case 'pure':   return '#e36b6b';
    case 'batch':  return '#a0d468';
    case 'pity':   return '#7EC4F5';
    case 'spark':  return '#c76d7e';
    case 'shards': return '#d4a26f';
    case 'full':   return '#ffd86f';
  }
}

function genericFlavor(dist: DistId, family: GuaranteeFamily): string {
  const distDesc: Record<DistId, string> = {
    flat: 'Independent trials — every pull is a fresh roll at the base rate.',
    step_up: 'Pulls organized into escalating cycles; late steps guarantee rarity floors.',
    box: 'Draws without replacement from a finite pool; every pull visibly depletes the box.',
    preview: 'Next pulls are revealed before commitment. Eliminates surprise.',
    sugoroku: 'Pulls advance a pawn around a reward track. Tile-based payouts.',
    wishlist: 'Top-rarity outcomes resolve to the player\'s chosen pool.',
  };
  const familyDesc: Record<GuaranteeFamily, string> = {
    pure: 'No safety nets at all. High volatility, high regret; regulatory risk in 2026+.',
    batch: 'Only guarantee is the 10× batch floor — a minimum rarity on every tenth pull.',
    pity: 'Probabilistic soft ramp + deterministic hard pity. Optionally with 50/50, 70/30, or adaptive Radiance.',
    spark: 'Spark threshold: accumulate N pulls, redeem for a guaranteed featured unit of choice.',
    shards: 'Duplicates convert to shards; shards can be crafted into a featured 5★.',
    full: 'Everything stacked: soft+hard pity, rate-up with carry-over, spark, shards, adaptive Radiance.',
  };
  return `${distDesc[dist]} ${familyDesc[family]}`;
}

/** Build the full type registry for generic buckets. */
export function buildGenericTypes(): Record<string, GachaType> {
  const byKey: Record<string, { combos: Combo[]; banners: Set<string> }> = {};
  for (const combo of combos) {
    const key = classifyCombo(combo);
    if (NAMED_TYPES[key]) continue;
    if (!byKey[key]) byKey[key] = { combos: [], banners: new Set() };
    byKey[key].combos.push(combo);
    byKey[key].banners.add(combo.banner.name);
  }
  const out: Record<string, GachaType> = {};
  for (const [key, { banners }] of Object.entries(byKey)) {
    const [distId, familyId] = key.split('-') as [DistId, GuaranteeFamily];
    const focus = focusForGeneric(distId, familyId);
    out[key] = {
      key,
      title: genericTitle(distId, familyId),
      subtitle: genericSubtitle(distId, familyId, banners),
      accent: genericAccent(familyId),
      flavor: genericFlavor(distId, familyId),
      category: 'generic',
      mechanicFocus: focus,
    };
  }
  return out;
}

function focusForGeneric(dist: DistId, family: GuaranteeFamily): GachaType['mechanicFocus'] {
  if (dist === 'box') return 'box';
  if (dist === 'preview') return 'preview';
  if (dist === 'sugoroku') return 'sugoroku';
  if (dist === 'wishlist') return 'wishlist';
  if (dist === 'step_up') return 'step_up';
  if (family === 'full') return 'full';
  if (family === 'pure') return 'pure';
  if (family === 'batch') return 'batch';
  if (family === 'pity') return 'pity';
  if (family === 'spark') return 'spark';
  return 'shards';
}

export const GENERIC_TYPES = buildGenericTypes();

export const ALL_TYPES: Record<string, GachaType> = { ...NAMED_TYPES, ...GENERIC_TYPES };

/** For a type key, return all combos belonging to it. */
export function combosForType(typeKey: string): Combo[] {
  return combos.filter(c => classifyCombo(c) === typeKey);
}

/** For a slug, return its type + all sibling variants. */
export function typeForSlug(slug: string): { type: GachaType; variants: Combo[] } | null {
  const combo = combos.find(c => c.slug === slug);
  if (!combo) return null;
  const key = classifyCombo(combo);
  const type = ALL_TYPES[key];
  if (!type) return null;
  return { type, variants: combosForType(key) };
}
