import { useCallback, useMemo, useRef, useState } from 'react';
import type { Combo } from '../data/primitives';
import { RNG } from '../engine/rng';
import {
  pullBatch,
  canRedeemSpark, redeemSpark,
  canCraftWithShards, craftWithShards,
  fillPreview,
} from '../engine/engine';
import { createInitialState, PULL_COST, type EngineState, type PullResult } from '../engine/types';

export interface UseGachaEngine {
  state: EngineState;
  lastResults: PullResult[];
  pull: (count: number) => void;
  pull1: () => void;
  pull10: () => void;
  spark: () => void;
  shards: () => void;
  setWishlist: (id: string, add: boolean, max?: number) => void;
  addFunds: (amount?: number) => void;
  reset: () => void;
  canPull1: boolean;
  canPull10: boolean;
  canSpark: boolean;
  canShards: boolean;
  pullCost: number;
  isPulling: boolean;
  pullBurstKey: number;  // increments each pull — useful as animation key
}

export function useGachaEngine(combo: Combo): UseGachaEngine {
  const rngRef = useRef<RNG>(new RNG());
  const stateRef = useRef<EngineState>(createInitialState(combo));
  const [, setTick] = useState(0);
  const [lastResults, setLastResults] = useState<PullResult[]>([]);
  const [isPulling, setIsPulling] = useState(false);
  const [pullBurstKey, setPullBurstKey] = useState(0);

  const rerender = useCallback(() => setTick(t => t + 1), []);
  const state = stateRef.current;

  // Keep preview queue topped up reactively.
  if (combo.dist.id === 'preview' && state.previewQueue.length < 3) {
    fillPreview(rngRef.current, state, combo, 3);
  }

  const pull = useCallback((count: number) => {
    const s = stateRef.current;
    const cost = PULL_COST * count;
    if (s.freeCurrency < cost) return;
    s.freeCurrency -= cost;
    setIsPulling(true);
    setPullBurstKey(k => k + 1);
    const results = pullBatch(rngRef.current, s, combo, count);
    setLastResults(results);
    if (combo.dist.id === 'preview') fillPreview(rngRef.current, s, combo, 3);
    rerender();
    // brief "pulling" state for animations to latch on
    setTimeout(() => setIsPulling(false), 60);
  }, [combo, rerender]);

  const pull1 = useCallback(() => pull(1), [pull]);
  const pull10 = useCallback(() => pull(10), [pull]);

  const spark = useCallback(() => {
    const s = stateRef.current;
    const unit = redeemSpark(s, combo);
    if (unit) {
      setLastResults([{ unit, rarity: 5, sparkRedeemed: true }]);
      setPullBurstKey(k => k + 1);
      rerender();
    }
  }, [combo, rerender]);

  const shards = useCallback(() => {
    const s = stateRef.current;
    const unit = craftWithShards(s, combo);
    if (unit) {
      setLastResults([{ unit, rarity: 5, extra: { shardCraft: true } }]);
      setPullBurstKey(k => k + 1);
      rerender();
    }
  }, [combo, rerender]);

  const setWishlist = useCallback((id: string, add: boolean, max = 3) => {
    const s = stateRef.current;
    const idx = s.wishlist.indexOf(id);
    if (add && idx < 0 && s.wishlist.length < max) s.wishlist.push(id);
    if (!add && idx >= 0) s.wishlist.splice(idx, 1);
    rerender();
  }, [rerender]);

  const addFunds = useCallback((amount = 16000) => {
    stateRef.current.freeCurrency += amount;
    rerender();
  }, [rerender]);

  const reset = useCallback(() => {
    rngRef.current = new RNG();
    stateRef.current = createInitialState(combo);
    setLastResults([]);
    setPullBurstKey(0);
    rerender();
  }, [combo, rerender]);

  return useMemo(() => ({
    state,
    lastResults,
    pull,
    pull1,
    pull10,
    spark,
    shards,
    setWishlist,
    addFunds,
    reset,
    canPull1: state.freeCurrency >= PULL_COST,
    canPull10: state.freeCurrency >= PULL_COST * 10,
    canSpark: canRedeemSpark(state),
    canShards: canCraftWithShards(state),
    pullCost: PULL_COST,
    isPulling,
    pullBurstKey,
  }), [state, lastResults, pull, pull1, pull10, spark, shards, setWishlist, addFunds, reset, isPulling, pullBurstKey]);
}
