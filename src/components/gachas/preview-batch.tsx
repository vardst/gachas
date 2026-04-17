// HAND-CRAFTED — Preview + Batch floor.
// Vibe: utilitarian. Preview queue above a minimal batch-floor indicator.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { useGachaEngine } from '../../lib/useGachaEngine';
import type { Unit } from '../../data/roster';
import { StatusBar, PullResults } from '../../lib/GachaFrame';

const ACCENT = '#a0d468';
const INK = '#1d2216';
const SURFACE = '#f7f7f3';
const CARD = '#ffffff';

const KEYFRAMES = `
@keyframes pbatch-slide-out { 0% { transform: translateX(0) translateY(0); opacity: 1; } 100% { transform: translateX(-60px) translateY(60px) scale(0.85); opacity: 0; } }
@keyframes pbatch-shift { 0% { transform: translateX(30%); } 100% { transform: translateX(0); } }
@keyframes pbatch-appear { 0% { transform: translateX(40px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
@keyframes pbatch-pulse { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.3); } }
`;

type Phase = 'idle' | 'advancing';

export default function PreviewBatch({ slug }: { slug: string }) {
  const variants = combosForType('preview-batch');
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
      const t = setTimeout(() => setPhase('idle'), 400);
      return () => clearTimeout(t);
    }
  }, [eng.pullBurstKey]);

  const batchProgress = state.pullsSinceBatchFloor;
  const batchFloorNext = batchProgress >= 9;
  const pullsUntilFloor = Math.max(0, 9 - batchProgress);
  const hasFive = lastResults.some(r => r.rarity === 5);
  const hasFour = lastResults.some(r => r.rarity === 4);

  return (
    <div style={{
      minHeight: '100vh',
      background: SURFACE,
      color: INK,
      padding: '24px 32px 60px',
      fontFamily: '"IBM Plex Sans", -apple-system, sans-serif',
    }}>
      <style>{KEYFRAMES}</style>

      <Link to="/" style={{ fontSize: 12, color: INK, opacity: 0.6, textDecoration: 'none' }}>
        ← Back
      </Link>

      <header style={{ marginTop: 18, marginBottom: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.2, color: ACCENT, fontWeight: 600, marginBottom: 4 }}>
            Preview · Batch Floor
          </div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 500, letterSpacing: -0.4 }}>
            Queue + Floor
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#5a6550', maxWidth: 520 }}>
            Three pulls visible on the belt. Every tenth pull guarantees 4★ or higher. Everything else is RNG.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Tile label="Pulls" value={state.totalPulls} />
          <Tile label="5★" value={state.fiveStarCount} />
          <Tile label="Free" value={state.freeCurrency.toLocaleString()} />
        </div>
      </header>

      {variants.length > 1 && (
        <VariantRow variants={variants} current={combo.slug} onPick={(s) => navigate(`/play/${s}`)} />
      )}

      <section style={{
        background: CARD,
        border: `1px solid ${INK}14`,
        borderRadius: 6,
        padding: '22px 22px 20px',
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 10, letterSpacing: 0.18, textTransform: 'uppercase', color: '#8a9480', marginBottom: 12 }}>
          Conveyor · next three
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {state.previewQueue.slice(0, 3).map((u, i) => (
            <QueueCard key={`${u.id}-${i}-${eng.pullBurstKey}`} unit={u} position={i} phase={phase} />
          ))}
          {state.previewQueue.length === 0 && (
            <div style={{ gridColumn: '1 / -1', fontSize: 11.5, color: '#8a9480', padding: 30, textAlign: 'center' }}>loading…</div>
          )}
        </div>

        <BatchStrip progress={batchProgress} floorNext={batchFloorNext} pullsUntilFloor={pullsUntilFloor} />

        <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px dashed ${INK}1a` }}>
          <StatusBar combo={combo} eng={eng} />
        </div>

        <div className="pull-row" style={{ marginTop: 14 }}>
          <button className="btn" disabled={!eng.canPull1} onClick={eng.pull1}>Pull 1 · {eng.pullCost}</button>
          <button
            className="btn btn-primary"
            disabled={!eng.canPull10}
            onClick={eng.pull10}
            style={{ background: ACCENT, borderColor: ACCENT, color: '#0f0e13' }}
          >
            Pull 10 · {(eng.pullCost * 10).toLocaleString()}
          </button>
          <button className="btn btn-ghost" onClick={() => eng.addFunds()}>+ Funds</button>
          <button className="btn btn-ghost" onClick={eng.reset}>Reset</button>
        </div>

        <PullResults key={eng.pullBurstKey} results={lastResults} hasFive={hasFive} hasFour={hasFour} accent={ACCENT} />
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12 }}>
        <div style={{ background: CARD, border: `1px solid ${INK}14`, borderRadius: 6, padding: '14px 16px' }}>
          <div style={{ fontSize: 10, letterSpacing: 0.18, textTransform: 'uppercase', color: '#8a9480', marginBottom: 8 }}>Rules</div>
          <ul style={{ margin: 0, paddingLeft: 16, color: '#5a6550', lineHeight: 1.6 }}>
            <li>Next three pulls shown on the belt.</li>
            <li>Every 10th pull is guaranteed ★4 or better.</li>
            <li>No pity, no carry-over, no spark.</li>
          </ul>
        </div>
        <div style={{ background: CARD, border: `1px solid ${INK}14`, borderRadius: 6, padding: '14px 16px' }}>
          <div style={{ fontSize: 10, letterSpacing: 0.18, textTransform: 'uppercase', color: '#8a9480', marginBottom: 8 }}>Log · {state.history.length}</div>
          <div style={{ maxHeight: 140, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {state.history.slice(-14).reverse().map((h, i) => (
              <div key={i} style={{ fontSize: 11.5, fontFamily: 'monospace', color: h.rarity === 5 ? ACCENT : INK, opacity: h.rarity === 3 ? 0.55 : 1 }}>
                ★{h.rarity} {h.unit.name}{h.batchFloor ? ' · floor' : ''}
              </div>
            ))}
            {state.history.length === 0 && <div style={{ color: '#8a9480' }}>No pulls yet.</div>}
          </div>
        </div>
      </section>
    </div>
  );
}

function QueueCard({ unit, position, phase }: { unit: Unit; position: number; phase: Phase }) {
  const anim = phase === 'advancing'
    ? (position === 0 ? 'pbatch-slide-out 380ms ease-in forwards'
      : position === 2 ? 'pbatch-appear 400ms ease-out both'
      : 'pbatch-shift 380ms ease-out both')
    : undefined;
  return (
    <div style={{
      position: 'relative',
      padding: '16px 14px',
      background: CARD,
      border: `1px solid ${INK}1a`,
      borderLeft: `3px solid ${unit.color}`,
      borderRadius: 3,
      minHeight: 110,
      animation: anim,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 9.5, letterSpacing: 0.2, textTransform: 'uppercase', color: '#8a9480' }}>
          {position === 0 ? 'Next up' : `Slot ${position + 1}`}
        </span>
        <span style={{ fontSize: 10, padding: '2px 6px', background: unit.color, color: '#fff', borderRadius: 2, fontWeight: 600 }}>
          ★{unit.rarity}
        </span>
      </div>
      <div style={{ fontSize: 18, fontWeight: 500, color: INK, letterSpacing: -0.2 }}>{unit.name}</div>
      <div style={{ marginTop: 6, fontSize: 10.5, fontFamily: 'monospace', color: '#8a9480' }}>{unit.id}</div>
    </div>
  );
}

function BatchStrip({ progress, floorNext, pullsUntilFloor }: { progress: number; floorNext: boolean; pullsUntilFloor: number }) {
  return (
    <div style={{ marginTop: 18, padding: '12px 14px', background: SURFACE, border: `1px solid ${INK}12`, borderRadius: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 10, letterSpacing: 0.18, textTransform: 'uppercase', color: '#8a9480' }}>
          10× batch floor
        </div>
        <div style={{ fontSize: 11, color: floorNext ? ACCENT : INK, fontWeight: floorNext ? 600 : 400 }}>
          {floorNext ? 'Floor armed — next pull ≥ ★4' : `${pullsUntilFloor} pulls until floor`}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4, height: 22 }}>
        {Array.from({ length: 10 }).map((_, i) => {
          const filled = i < progress;
          const isLast = i === 9;
          return (
            <div key={i} style={{
              flex: 1,
              background: filled ? ACCENT : isLast ? ACCENT + '22' : '#e8ebe2',
              border: isLast ? `1px dashed ${ACCENT}` : `1px solid ${filled ? ACCENT : '#dde1d3'}`,
              borderRadius: 2,
              position: 'relative',
              transformOrigin: 'center bottom',
              animation: floorNext && isLast ? 'pbatch-pulse 1.2s ease-in-out infinite' : undefined,
            }}>
              {isLast && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: floorNext ? '#0f0e13' : ACCENT, fontWeight: 700 }}>
                  ★4+
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${INK}14`, borderRadius: 4, padding: '6px 12px', minWidth: 62, textAlign: 'center' }}>
      <div style={{ fontSize: 9, letterSpacing: 0.18, textTransform: 'uppercase', color: '#8a9480' }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: INK }}>{value}</div>
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
            border: `1px solid ${active ? ACCENT : INK + '22'}`,
            fontWeight: active ? 600 : 400,
          }}>
            {v.banner.name} · {v.currency.name}
          </button>
        );
      })}
    </div>
  );
}
