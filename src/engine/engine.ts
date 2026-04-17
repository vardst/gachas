import type { Combo } from '../data/primitives';
import {
  roster, fiveStars, fourStars, threeStars,
  FIVE_STAR_RATE, FOUR_STAR_RATE,
  featuredFor, getUnit, type Unit, type Rarity,
} from '../data/roster';
import { RNG } from './rng';
import type { EngineState, PullResult } from './types';

// Soft pity ramp: linear increase from base to ~32% at hardPity-1.
function effectiveFiveStarRate(state: EngineState, guaranteeId: string): number {
  const base = FIVE_STAR_RATE;
  if (!['soft', 'pity_5050', 'pity_7030', 'radiance', 'spark_pity', 'shards_pity', 'full_suite'].includes(guaranteeId)) {
    return base;
  }
  const pulls = state.pullsSinceFiveStar;
  if (pulls < state.softPityStart) return base;
  const span = state.hardPityAt - state.softPityStart;
  const progress = (pulls - state.softPityStart) / span;
  return base + (0.32 - base) * Math.min(1, progress);
}

function pickRarity(rng: RNG, state: EngineState, guaranteeId: string, batchTail = false): Rarity {
  if (['hard', 'soft', 'pity_5050', 'pity_7030', 'radiance', 'spark_pity', 'shards_pity', 'full_suite'].includes(guaranteeId)) {
    if (state.pullsSinceFiveStar + 1 >= state.hardPityAt) return 5;
  }
  const fiveRate = effectiveFiveStarRate(state, guaranteeId);
  const fourFloor = batchTail && state.pullsSinceFourStar >= 9;
  if (fourFloor) return 4;
  const r = rng.next();
  if (r < fiveRate) return 5;
  if (r < fiveRate + FOUR_STAR_RATE) return 4;
  return 3;
}

function resolveFiveStar(
  rng: RNG, state: EngineState, combo: Combo,
): { unit: Unit; flags: Partial<PullResult> } {
  const { guarantee, banner } = combo;
  const featured = featuredFor(banner.id).five;
  const flags: Partial<PullResult> = {};

  // Wishlist: 5* resolves to a wishlist unit if any.
  if (combo.dist.id === 'wishlist' && state.wishlist.length > 0) {
    const id = rng.pick(state.wishlist);
    const unit = getUnit(id) ?? rng.pick(fiveStars);
    return { unit, flags: { rateUpHit: true } };
  }

  // Rate-up guarantees
  const useRateUp = ['pity_5050', 'pity_7030', 'radiance', 'full_suite'].includes(guarantee.id);
  if (useRateUp && featured.length > 0) {
    let rateUpP = 0.5;
    if (guarantee.id === 'pity_7030') rateUpP = 0.7;
    if (guarantee.id === 'radiance') {
      // Adaptive: +10% per prior loss up to +40%
      rateUpP = Math.min(0.9, 0.55 + state.radianceLossStreak * 0.1);
      flags.radianceTrigger = state.radianceLossStreak > 0;
    }
    if (guarantee.id === 'full_suite') rateUpP = 0.5;

    if (state.carryOver) {
      flags.rateUpHit = true;
      flags.carryOverConsumed = true;
      return { unit: rng.pick(featured), flags };
    }
    if (rng.chance(rateUpP)) {
      flags.rateUpHit = true;
      return { unit: rng.pick(featured), flags };
    }
    flags.rateUpLoss = true;
    return { unit: rng.pick(fiveStars.filter(u => !featured.includes(u)).length > 0 ? fiveStars.filter(u => !featured.includes(u)) : fiveStars), flags };
  }

  // Non rate-up: uniform among 5*
  if (banner.id === 'standard' || featured.length === 0) {
    return { unit: rng.pick(fiveStars), flags };
  }
  // Featured banner but no rate-up guarantee: still slight pull-toward-featured
  return { unit: rng.chance(0.5) ? rng.pick(featured) : rng.pick(fiveStars), flags };
}

function resolveFourStar(rng: RNG, combo: Combo): Unit {
  const featured = featuredFor(combo.banner.id).four;
  if (['pity_5050', 'pity_7030', 'radiance', 'spark_pity', 'full_suite'].includes(combo.guarantee.id) && featured.length > 0) {
    if (rng.chance(0.5)) return rng.pick(featured);
  }
  return rng.pick(fourStars);
}

function resolveThreeStar(rng: RNG): Unit {
  return rng.pick(threeStars);
}

export function pullOne(rng: RNG, state: EngineState, combo: Combo, batchTail = false): PullResult {
  const { dist, guarantee } = combo;

  // Preview: serve from queue if present
  if (dist.id === 'preview' && state.previewQueue.length > 0) {
    const unit = state.previewQueue.shift()!;
    return finish({ unit, rarity: unit.rarity, preview: true }, state, combo);
  }

  // Box: draw without replacement
  if (dist.id === 'box') {
    if (!state.boxRemaining || state.boxRemaining.length === 0) {
      state.boxRemaining = buildBoxPool(combo);
    }
    const idx = rng.int(state.boxRemaining.length);
    const unit = state.boxRemaining.splice(idx, 1)[0];
    return finish({ unit, rarity: unit.rarity }, state, combo);
  }

  // Sugoroku: advance tile, tile dictates outcome
  if (dist.id === 'sugoroku') {
    state.sugorokuTile = (state.sugorokuTile + 1) % state.sugorokuLength;
    const tile = state.sugorokuTile;
    let unit: Unit;
    if (tile === 0) unit = rng.pick(fiveStars);
    else if (tile % 10 === 0) unit = rng.pick(fiveStars);
    else if (tile % 5 === 0) unit = rng.pick(fourStars);
    else if (tile % 3 === 0) unit = rng.pick(fourStars);
    else unit = rng.pick(threeStars);
    return finish({ unit, rarity: unit.rarity, extra: { tile } }, state, combo);
  }

  // Step-up: rate-up on final step of cycle
  let effGuaranteeId = guarantee.id;
  if (dist.id === 'step_up') {
    state.stepIndex = (state.stepIndex + 1) % state.stepLength;
    if (state.stepIndex === 0) {
      // Final pull of step cycle guarantees 4*+, boosts 5* chance
      batchTail = true;
    }
  }

  // Batch floor (10th pull guaranteed 4*+)
  const useBatchFloor = guarantee.layers.some(l => l.includes('batch floor'));
  if (useBatchFloor && state.pullsSinceBatchFloor >= 9) {
    batchTail = true;
  }

  const rarity = pickRarity(rng, state, effGuaranteeId, batchTail);
  const flags: Partial<PullResult> = {};

  if (batchTail && rarity === 4 && state.pullsSinceFourStar >= 9) flags.batchFloor = true;
  if (rarity === 5 && state.pullsSinceFiveStar + 1 >= state.hardPityAt) flags.hardPity = true;
  if (rarity === 5 && state.pullsSinceFiveStar >= state.softPityStart && !flags.hardPity) flags.softPity = true;

  let unit: Unit;
  if (rarity === 5) {
    const r = resolveFiveStar(rng, state, combo);
    unit = r.unit;
    Object.assign(flags, r.flags);
  } else if (rarity === 4) {
    unit = resolveFourStar(rng, combo);
  } else {
    unit = resolveThreeStar(rng);
  }

  return finish({ unit, rarity, ...flags }, state, combo);
}

function finish(result: PullResult, state: EngineState, combo: Combo): PullResult {
  state.totalPulls += 1;
  state.pullsSinceBatchFloor = state.pullsSinceBatchFloor >= 9 ? 0 : state.pullsSinceBatchFloor + 1;
  state.sparkProgress += 1;

  if (result.rarity === 5) {
    state.pullsSinceFiveStar = 0;
    state.pullsSinceFourStar = 0;
    state.fiveStarCount += 1;
    if (result.rateUpHit) {
      state.carryOver = false;
      state.radianceLossStreak = 0;
      state.featuredObtained += 1;
    } else if (result.rateUpLoss) {
      state.carryOver = true;
      state.radianceLossStreak += 1;
    }
    if (combo.dist.id === 'preview') {
      // Queue up a few units for the next rolls
    }
  } else if (result.rarity === 4) {
    state.pullsSinceFourStar = 0;
    state.pullsSinceFiveStar += 1;
  } else {
    state.pullsSinceFourStar += 1;
    state.pullsSinceFiveStar += 1;
    // Shard drop on 3*: tiny trickle
    if (['shards', 'shards_pity', 'full_suite'].includes(combo.guarantee.id)) {
      state.shards += 1;
    }
  }

  // Shards: duplicate 5* → shards
  if (result.rarity === 5 && ['shards', 'shards_pity', 'full_suite'].includes(combo.guarantee.id)) {
    const count = state.history.filter(h => h.unit.id === result.unit.id).length;
    if (count >= 1) state.shards += 25;
  }

  state.history.push(result);
  return result;
}

export function pullBatch(rng: RNG, state: EngineState, combo: Combo, count: number): PullResult[] {
  const results: PullResult[] = [];
  for (let i = 0; i < count; i++) {
    const batchTail = (i === count - 1) && count === 10;
    results.push(pullOne(rng, state, combo, batchTail));
  }
  return results;
}

function buildBoxPool(combo: Combo): Unit[] {
  const pool: Unit[] = [];
  const poolSize = 90;
  const feat = featuredFor(combo.banner.id);
  pool.push(...feat.five);
  for (let i = 0; i < 2; i++) pool.push(...fiveStars);
  for (let i = 0; i < 6; i++) pool.push(...fourStars);
  while (pool.length < poolSize) pool.push(roster[Math.floor(Math.random() * threeStars.length)] || threeStars[0]);
  return pool.slice(0, poolSize);
}

export function canRedeemSpark(state: EngineState): boolean {
  return state.sparkProgress >= state.sparkThreshold;
}

export function redeemSpark(state: EngineState, combo: Combo): Unit | null {
  if (!canRedeemSpark(state)) return null;
  state.sparkProgress -= state.sparkThreshold;
  const featured = featuredFor(combo.banner.id).five;
  const unit = featured[0] ?? fiveStars[0];
  state.featuredObtained += 1;
  state.history.push({ unit, rarity: 5, sparkRedeemed: true });
  state.fiveStarCount += 1;
  return unit;
}

export function canCraftWithShards(state: EngineState): boolean {
  return state.shards >= state.shardsNeededForFive;
}

export function craftWithShards(state: EngineState, combo: Combo): Unit | null {
  if (!canCraftWithShards(state)) return null;
  state.shards -= state.shardsNeededForFive;
  const featured = featuredFor(combo.banner.id).five;
  const unit = featured[0] ?? fiveStars[0];
  state.history.push({ unit, rarity: 5, extra: { shardCraft: true } });
  state.fiveStarCount += 1;
  return unit;
}

export function fillPreview(rng: RNG, state: EngineState, combo: Combo, n: number): void {
  if (combo.dist.id !== 'preview') return;
  while (state.previewQueue.length < n) {
    const rarity = pickRarity(rng, state, combo.guarantee.id);
    let unit: Unit;
    if (rarity === 5) unit = rng.pick(fiveStars);
    else if (rarity === 4) unit = rng.pick(fourStars);
    else unit = rng.pick(threeStars);
    state.previewQueue.push(unit);
  }
}
