import type { Combo } from '../data/primitives';
import type { Unit, Rarity } from '../data/roster';

export interface PullResult {
  unit: Unit;
  rarity: Rarity;
  // Flags describing *why* the pull resolved this way.
  hardPity?: boolean;
  softPity?: boolean;
  batchFloor?: boolean;
  rateUpHit?: boolean;
  rateUpLoss?: boolean;
  carryOverConsumed?: boolean;
  radianceTrigger?: boolean;
  sparkRedeemed?: boolean;
  preview?: boolean;
  // Mechanic-specific payload
  extra?: Record<string, unknown>;
}

export interface EngineState {
  // Pity counters
  pullsSinceFiveStar: number;
  pullsSinceFourStar: number;
  hardPityAt: number;
  softPityStart: number;
  // Rate-up state
  carryOver: boolean;
  radianceLossStreak: number;
  // Batch pull tracker
  pullsSinceBatchFloor: number;
  // Currencies
  freeCurrency: number;
  paidCurrency: number;
  tickets: number;
  // Spark
  sparkProgress: number;
  sparkThreshold: number;
  // Shards
  shards: number;
  shardsNeededForFive: number;
  // Box mechanics
  boxRemaining?: Unit[];
  boxSize: number;
  // Step-up
  stepIndex: number;
  stepLength: number;
  // Sugoroku
  sugorokuTile: number;
  sugorokuLength: number;
  // Preview buffer
  previewQueue: Unit[];
  // Wishlist selection
  wishlist: string[];
  // History
  history: PullResult[];
  totalPulls: number;
  fiveStarCount: number;
  // Feature units obtained (for spark / rate-up tracking)
  featuredObtained: number;
}

export function createInitialState(combo: Combo): EngineState {
  const pullCost = 1;
  return {
    pullsSinceFiveStar: 0,
    pullsSinceFourStar: 0,
    hardPityAt: combo.banner.id === 'weapon' ? 80 : 90,
    softPityStart: combo.banner.id === 'weapon' ? 65 : 74,
    carryOver: false,
    radianceLossStreak: 0,
    pullsSinceBatchFloor: 0,
    freeCurrency: 160 * pullCost * 100,
    paidCurrency: 0,
    tickets: 50,
    sparkProgress: 0,
    sparkThreshold: combo.banner.id === 'fes' ? 200 : 300,
    shards: 0,
    shardsNeededForFive: 80,
    boxSize: 90,
    stepIndex: 0,
    stepLength: 10,
    sugorokuTile: 0,
    sugorokuLength: 40,
    previewQueue: [],
    wishlist: [],
    history: [],
    totalPulls: 0,
    fiveStarCount: 0,
    featuredObtained: 0,
  };
}

export const PULL_COST = 160; // free currency per pull
