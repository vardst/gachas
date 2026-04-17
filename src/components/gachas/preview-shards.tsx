// HAND-CRAFTED — Preview + Shards.
// Vibe: "you can see dupes coming — plan your shards".
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { useGachaEngine } from '../../lib/useGachaEngine';
import type { Unit } from '../../data/roster';
import { StatusBar, PullResults } from '../../lib/GachaFrame';

const ACCENT = '#d4a26f';
const INK = '#1a1512';
const CANVAS = '#f4ecdf';
const CARD = '#fffaf2';
const DUPE = '#c97c4a';

const SHARDS_PER_DUPE_FIVE = 25;
const SHARDS_PER_THREE = 1;

const KEYFRAMES = `
@keyframes pshard-slide-out { 0% { transform: translateX(0) translateY(0); opacity: 1; } 100% { transform: translateX(-60px) translateY(40px) scale(0.85); opacity: 0; } }
@keyframes pshard-shift { 0% { transform: translateX(34%); } 100% { transform: translateX(0); } }
@keyframes pshard-enter { 0% { transform: translateX(40px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
@keyframes pshard-tick { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
@keyframes pshard-glint { 0% { opacity: 0; transform: translateY(-4px) rotate(-8deg); } 40% { opacity: 1; } 100% { opacity: 0; transform: translateY(-14px) rotate(-2deg); } }
`;

type Phase = 'idle' | 'advancing';

export default function PreviewShards({ slug }: { slug: string }) {
  const variants = combosForType('preview-shards');
  const navigate = useNavigate();
  const combo = useMemo(() => variants.find(c => c.slug === slug) ?? variants[0], [variants, slug]);
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;

  const [phase, setPhase] = useState<Phase>('idle');
  const lastKey = useRef(0);
  useEffect(() => {
    if (eng.pullBurstKey !== lastKey.current && eng.pullBurstKey > 0) {
      lastKey.current = eng.pullBurstKey;
      setPhase('advancing');
      const t = setTimeout(() => setPhase('idle'), 420);
      return () => clearTimeout(t);
    }
  }, [eng.pullBurstKey]);

  const ownedIds = useMemo(() => new Set(state.history.filter(h => h.rarity === 5).map(h => h.unit.id)), [state.history]);
  const usesPity = combo.guarantee.id === 'shards_pity';

  // Shard forecast based on the visible queue.
  const forecast = useMemo(() => {
    let shards = 0;
    const dupeNames: string[] = [];
    const tempOwned = new Set(ownedIds);
    for (const u of state.previewQueue.slice(0, 3)) {
      if (u.rarity === 5) {
        if (tempOwned.has(u.id)) {
          shards += SHARDS_PER_DUPE_FIVE;
          dupeNames.push(u.name);
        } else {
          tempOwned.add(u.id);
        }
      } else if (u.rarity === 3) {
        shards += SHARDS_PER_THREE;
      }
    }
    return { shards, dupeNames };
  }, [state.previewQueue, ownedIds]);

  const canCraft = eng.canShards;
  const projectedShards = state.shards + forecast.shards;
  const projectedCraft = projectedShards >= state.shardsNeededForFive;
  const hasFive = lastResults.some(r => r.rarity === 5);
  const hasFour = lastResults.some(r => r.rarity === 4);

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(180deg, ${CANVAS} 0%, #ede2cf 100%)`,
      color: INK,
      padding: '26px 32px 60px',
      fontFamily: '"Inter", -apple-system, sans-serif',
    }}>
      <style>{KEYFRAMES}</style>

      <Link to="/" style={{ fontSize: 12, color: INK, opacity: 0.6, textDecoration: 'none' }}>← Back</Link>

      <header style={{ marginTop: 18, marginBottom: 22 }}>
        <div style={{ fontSize: 10, letterSpacing: 0.22, textTransform: 'uppercase', color: DUPE, fontWeight: 600, marginBottom: 6 }}>
          Preview · Shard Crafting
        </div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 500, letterSpacing: -0.4 }}>
          Plan your dupes
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#6c5a47', maxWidth: 580, lineHeight: 1.55 }}>
          You can see the next three pulls. Duplicates become shards. Shards become a featured ★5 of your choice.
          Forecast what&apos;s coming before you commit.
        </p>
      </header>

      {variants.length > 1 && (
        <VariantRow variants={variants} current={combo.slug} onPick={(s) => navigate(`/play/${s}`)} />
      )}

      <section style={{
        background: CARD,
        border: `1px solid ${ACCENT}44`,
        borderRadius: 8,
        padding: 20,
        marginBottom: 14,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <div style={{ fontSize: 10, letterSpacing: 0.2, textTransform: 'uppercase', color: '#8c7864' }}>
            Workbench · next three
          </div>
          <ForecastChip shards={forecast.shards} dupeNames={forecast.dupeNames} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {state.previewQueue.slice(0, 3).map((u, i) => (
            <QueueCard key={`${u.id}-${i}-${eng.pullBurstKey}`} unit={u} position={i} phase={phase} owned={ownedIds.has(u.id)} />
          ))}
          {state.previewQueue.length === 0 && (
            <div style={{ gridColumn: '1 / -1', fontSize: 12, color: '#8c7864', padding: 28, textAlign: 'center' }}>loading…</div>
          )}
        </div>
      </section>

      <section style={{
        background: CARD,
        border: `1px solid ${ACCENT}44`,
        borderRadius: 8,
        padding: 20,
        marginBottom: 14,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div style={{ fontSize: 10, letterSpacing: 0.2, textTransform: 'uppercase', color: '#8c7864' }}>Shard stockpile</div>
          <div style={{ fontSize: 11, color: canCraft ? ACCENT : '#8c7864' }}>
            {canCraft ? 'Craft available' : projectedCraft ? `+${forecast.shards} incoming → craftable after queue` : `${state.shardsNeededForFive - state.shards} to craft`}
          </div>
        </div>
        <ShardBar current={state.shards} projected={projectedShards} goal={state.shardsNeededForFive} />
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6c5a47' }}>
          <span><b style={{ color: ACCENT, fontSize: 18 }}>{state.shards}</b> <span style={{ opacity: 0.6 }}>/ {state.shardsNeededForFive}</span></span>
          <span style={{ opacity: 0.7 }}>dupe ★5 = {SHARDS_PER_DUPE_FIVE} · common ★3 = {SHARDS_PER_THREE}</span>
        </div>

        <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px dashed ${ACCENT}55` }}>
          <StatusBar combo={combo} eng={eng} />
        </div>

        <div className="pull-row" style={{ marginTop: 12 }}>
          <button className="btn" disabled={!eng.canPull1} onClick={eng.pull1}>Pull 1 · {eng.pullCost}</button>
          <button
            className="btn btn-primary"
            disabled={!eng.canPull10}
            onClick={eng.pull10}
            style={{ background: ACCENT, borderColor: ACCENT, color: '#0f0e13' }}
          >
            Pull 10 · {(eng.pullCost * 10).toLocaleString()}
          </button>
          <button
            className="btn"
            disabled={!eng.canShards}
            onClick={eng.shards}
            style={canCraft ? { background: DUPE, borderColor: DUPE, color: '#fff', fontWeight: 600 } : undefined}
          >
            Craft ({state.shards}/{state.shardsNeededForFive})
          </button>
          <button className="btn btn-ghost" onClick={() => eng.addFunds()}>+ Funds</button>
          <button className="btn btn-ghost" onClick={eng.reset}>Reset</button>
        </div>

        <PullResults key={eng.pullBurstKey} results={lastResults} hasFive={hasFive} hasFour={hasFour} accent={ACCENT} />
      </section>

      <section style={{ background: CARD, border: `1px solid ${ACCENT}33`, borderRadius: 8, padding: '14px 16px' }}>
        <div style={{ fontSize: 10, letterSpacing: 0.2, textTransform: 'uppercase', color: '#8c7864', marginBottom: 8 }}>
          ★5 roster · dupes ahead
        </div>
        {ownedIds.size === 0 ? (
          <div style={{ fontSize: 12, color: '#8c7864' }}>No ★5 yet — dupe shard math activates once you own one.</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {[...ownedIds].map(id => {
              const unit = state.history.find(h => h.unit.id === id)?.unit;
              if (!unit) return null;
              const count = state.history.filter(h => h.unit.id === id && h.rarity === 5).length;
              return (
                <span key={id} style={{ fontSize: 11, padding: '3px 9px', background: unit.color + '22', color: unit.color, border: `1px solid ${unit.color}66`, borderRadius: 999, fontWeight: 600 }}>
                  ★5 {unit.name} ×{count}
                </span>
              );
            })}
          </div>
        )}
      </section>

      {usesPity && (
        <div style={{ marginTop: 12, padding: '10px 14px', background: CARD, border: `1px solid ${ACCENT}33`, borderRadius: 6, fontSize: 12, color: '#6c5a47' }}>
          Pity underlay · <b>{state.pullsSinceFiveStar}</b> / {state.hardPityAt} (soft @ {state.softPityStart})
        </div>
      )}
    </div>
  );
}

function QueueCard({ unit, position, phase, owned }: { unit: Unit; position: number; phase: Phase; owned: boolean }) {
  const anim = phase === 'advancing'
    ? (position === 0 ? 'pshard-slide-out 400ms ease-in forwards' : position === 2 ? 'pshard-enter 420ms ease-out both' : 'pshard-shift 400ms ease-out both')
    : undefined;
  const isDupe = owned && unit.rarity === 5;
  const msg = isDupe ? `Dupe → +${SHARDS_PER_DUPE_FIVE} shards` : unit.rarity === 5 ? 'New ★5 — no shards' : unit.rarity === 4 ? 'Rare pull' : `+${SHARDS_PER_THREE} shard`;
  return (
    <div style={{ position: 'relative', padding: '16px 14px', background: `linear-gradient(180deg, ${unit.color}18 0%, ${CARD} 100%)`, border: `1px solid ${unit.color}55`, borderRadius: 6, minHeight: 140, animation: anim, overflow: 'hidden' }}>
      {isDupe && (
        <div aria-hidden style={{ position: 'absolute', top: 8, right: 8, width: 12, height: 12, background: DUPE, transform: 'rotate(45deg)', animation: 'pshard-glint 2s ease-in-out infinite' }} />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 9.5, letterSpacing: 0.2, textTransform: 'uppercase', color: '#8c7864' }}>{position === 0 ? 'Next up' : `+${position}`}</span>
        <span style={{ fontSize: 10, padding: '2px 7px', background: unit.color, color: '#0f0e13', borderRadius: 3, fontWeight: 700 }}>★{unit.rarity}</span>
      </div>
      <div style={{ fontSize: 19, fontWeight: 500, color: INK, letterSpacing: -0.2 }}>{unit.name}</div>
      <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px dashed ${unit.color}44`, fontSize: 10.5, color: isDupe ? DUPE : '#8c7864', fontWeight: isDupe ? 600 : 400 }}>{msg}</div>
    </div>
  );
}

function ForecastChip({ shards, dupeNames }: { shards: number; dupeNames: string[] }) {
  if (shards === 0) return <span style={{ fontSize: 11, color: '#8c7864' }}>No shards forecast in queue</span>;
  return (
    <span style={{ fontSize: 11, padding: '4px 10px', background: DUPE + '1a', color: DUPE, border: `1px solid ${DUPE}55`, borderRadius: 999, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 7, height: 7, background: DUPE, transform: 'rotate(45deg)', animation: 'pshard-tick 1.4s ease-in-out infinite' }} />
      Upcoming dupes: +{shards} shards{dupeNames.length ? ` (${dupeNames.join(', ')})` : ''}
    </span>
  );
}

function ShardBar({ current, projected, goal }: { current: number; projected: number; goal: number }) {
  const currentPct = Math.min(100, (current / goal) * 100);
  const projectedPct = Math.min(100, (projected / goal) * 100);
  return (
    <div style={{ position: 'relative', height: 16, background: '#00000012', borderRadius: 4, overflow: 'hidden', border: `1px solid ${ACCENT}33` }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${projectedPct}%`, background: `repeating-linear-gradient(45deg, ${DUPE}33, ${DUPE}33 4px, transparent 4px, transparent 8px)`, transition: 'width 300ms ease-out' }} />
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${currentPct}%`, background: ACCENT, transition: 'width 300ms ease-out' }} />
    </div>
  );
}

function VariantRow({ variants, current, onPick }: { variants: { slug: string; banner: { name: string }; guarantee: { name: string }; currency: { name: string } }[]; current: string; onPick: (s: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
      {variants.map(v => {
        const active = v.slug === current;
        return (
          <button key={v.slug} onClick={() => onPick(v.slug)} style={{
            padding: '5px 11px', fontSize: 11, borderRadius: 3, cursor: 'pointer',
            background: active ? ACCENT : CARD,
            color: active ? '#0f0e13' : INK,
            border: `1px solid ${active ? ACCENT : ACCENT + '44'}`,
            fontWeight: active ? 600 : 400,
          }}>
            {v.banner.name} · {v.guarantee.name} · {v.currency.name}
          </button>
        );
      })}
    </div>
  );
}
