// HAND-CRAFTED — Preview + Spark.
// Vibe: premium transparent. Preview queue + spark progress both hero-size.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { useGachaEngine } from '../../lib/useGachaEngine';
import type { Unit } from '../../data/roster';
import { featuredFor } from '../../data/roster';
import { StatusBar, PullResults } from '../../lib/GachaFrame';

const ACCENT = '#d093c7';
const GOLD = '#f6e4a8';
const DEEP = '#15101a';
const CARD = '#231b2c';

const KEYFRAMES = `
@keyframes pspark-slide-out { 0% { transform: translateX(0) translateY(0) scale(1); opacity: 1; filter: blur(0); } 70% { opacity: 0.4; filter: blur(1.5px); } 100% { transform: translateX(-90px) translateY(60px) scale(0.78); opacity: 0; filter: blur(3px); } }
@keyframes pspark-shift { 0% { transform: translateX(34%) scale(0.96); } 100% { transform: translateX(0) scale(1); } }
@keyframes pspark-enter { 0% { transform: translateX(60px) scale(0.9); opacity: 0; filter: blur(4px); } 100% { transform: translateX(0) scale(1); opacity: 1; filter: blur(0); } }
@keyframes pspark-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes pspark-ready { 0%, 100% { box-shadow: 0 0 0 1px ${GOLD}, 0 0 22px -2px ${GOLD}cc; } 50% { box-shadow: 0 0 0 2px ${GOLD}, 0 0 40px -2px ${GOLD}; } }
@keyframes pspark-orbit { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
`;

type Phase = 'idle' | 'advancing';

export default function PreviewSpark({ slug }: { slug: string }) {
  const variants = combosForType('preview-spark');
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
      const t = setTimeout(() => setPhase('idle'), 440);
      return () => clearTimeout(t);
    }
  }, [eng.pullBurstKey]);

  const sparkPct = Math.min(100, (state.sparkProgress / state.sparkThreshold) * 100);
  const sparkReady = eng.canSpark;
  const featured = featuredFor(combo.banner.id);
  const usesPity = combo.guarantee.id === 'spark_pity';
  const hasFive = lastResults.some(r => r.rarity === 5);
  const hasFour = lastResults.some(r => r.rarity === 4);

  return (
    <div style={{
      minHeight: '100vh',
      background: `radial-gradient(ellipse at 70% 10%, ${ACCENT}22 0%, ${DEEP} 55%), ${DEEP}`,
      color: '#ede4ef',
      padding: '26px 32px 60px',
      fontFamily: '"Inter", -apple-system, sans-serif',
    }}>
      <style>{KEYFRAMES}</style>

      <Link to="/" style={{ fontSize: 12, color: '#ede4ef', opacity: 0.55, textDecoration: 'none' }}>← Back</Link>

      <header style={{ marginTop: 18, marginBottom: 22 }}>
        <div style={{ fontSize: 10, letterSpacing: 0.22, textTransform: 'uppercase', color: ACCENT, fontWeight: 600, marginBottom: 6 }}>
          Preview · Spark {usesPity ? '+ Pity' : ''}
        </div>
        <h1 style={{ margin: 0, fontSize: 34, fontWeight: 400, letterSpacing: -0.4, color: '#fbf4fc' }}>
          See ahead, spark when ready
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: 13, color: '#b9a6bf', maxWidth: 560, lineHeight: 1.55 }}>
          The next three pulls are on display. The spark meter is filling. When it tops, pick any featured unit on your terms.
        </p>
      </header>

      {variants.length > 1 && (
        <VariantRow variants={variants} current={combo.slug} onPick={(s) => navigate(`/play/${s}`)} />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 16, marginBottom: 16 }}>
        <section style={{
          background: CARD,
          border: `1px solid ${ACCENT}30`,
          borderRadius: 10,
          padding: 22,
        }}>
          <div style={{ fontSize: 10, letterSpacing: 0.2, textTransform: 'uppercase', color: '#b9a6bf', marginBottom: 12 }}>
            Reveal queue · next three
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {state.previewQueue.slice(0, 3).map((u, i) => (
              <QueueCard key={`${u.id}-${i}-${eng.pullBurstKey}`} unit={u} position={i} phase={phase} />
            ))}
            {state.previewQueue.length === 0 && (
              <div style={{ gridColumn: '1 / -1', color: '#b9a6bf', fontSize: 12, padding: 28, textAlign: 'center' }}>loading…</div>
            )}
          </div>
        </section>

        <section style={{
          background: CARD,
          border: `1px solid ${sparkReady ? GOLD : ACCENT}30`,
          borderRadius: 10,
          padding: 20,
          position: 'relative',
          overflow: 'hidden',
          animation: sparkReady ? 'pspark-ready 2.2s ease-in-out infinite' : undefined,
        }}>
          <div style={{ fontSize: 10, letterSpacing: 0.2, textTransform: 'uppercase', color: '#b9a6bf', marginBottom: 6 }}>
            Spark meter
          </div>
          <SparkOrb pct={sparkPct} ready={sparkReady} />
          <div style={{ fontSize: 26, fontWeight: 500, color: sparkReady ? GOLD : '#fbf4fc', textAlign: 'center', marginTop: 6 }}>
            {state.sparkProgress} <span style={{ opacity: 0.5, fontSize: 14 }}>/ {state.sparkThreshold}</span>
          </div>
          <div style={{ textAlign: 'center', fontSize: 11, color: sparkReady ? GOLD : '#b9a6bf', marginTop: 2 }}>
            {sparkReady ? 'Redeem any featured unit' : `${state.sparkThreshold - state.sparkProgress} pulls to spark`}
          </div>
          {featured.five.length > 0 && (
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px dashed ${ACCENT}30` }}>
              <div style={{ fontSize: 9.5, letterSpacing: 0.16, textTransform: 'uppercase', color: '#b9a6bf', marginBottom: 6 }}>Redeem target</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {featured.five.map(u => (
                  <span key={u.id} style={{ fontSize: 10.5, padding: '3px 8px', background: u.color, color: '#0f0e13', borderRadius: 999, fontWeight: 600 }}>
                    ★5 {u.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <section style={{
        background: CARD,
        border: `1px solid ${ACCENT}1f`,
        borderRadius: 10,
        padding: 18,
        marginBottom: 14,
      }}>
        <StatusBar combo={combo} eng={eng} />
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
            disabled={!eng.canSpark}
            onClick={eng.spark}
            style={sparkReady ? { background: GOLD, borderColor: GOLD, color: '#0f0e13', fontWeight: 600 } : undefined}
          >
            Spark ({state.sparkProgress}/{state.sparkThreshold})
          </button>
          <button className="btn btn-ghost" onClick={() => eng.addFunds()}>+ Funds</button>
          <button className="btn btn-ghost" onClick={eng.reset}>Reset</button>
        </div>
        <PullResults key={eng.pullBurstKey} results={lastResults} hasFive={hasFive} hasFour={hasFour} accent={ACCENT} />
      </section>

      {usesPity && (
        <section style={{ background: CARD, border: `1px solid ${ACCENT}1f`, borderRadius: 10, padding: '14px 18px', fontSize: 12 }}>
          <div style={{ fontSize: 10, letterSpacing: 0.2, textTransform: 'uppercase', color: '#b9a6bf', marginBottom: 6 }}>Pity underlay</div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            <div><b style={{ color: ACCENT }}>{state.pullsSinceFiveStar}</b> since last 5★</div>
            <div style={{ opacity: 0.7 }}>soft @ {state.softPityStart}</div>
            <div style={{ opacity: 0.7 }}>hard @ {state.hardPityAt}</div>
          </div>
        </section>
      )}
    </div>
  );
}

function QueueCard({ unit, position, phase }: { unit: Unit; position: number; phase: Phase }) {
  const anim = phase === 'advancing'
    ? (position === 0 ? 'pspark-slide-out 420ms ease-in forwards'
      : position === 2 ? 'pspark-enter 440ms ease-out both'
      : 'pspark-shift 420ms ease-out both')
    : undefined;
  return (
    <div style={{
      position: 'relative',
      padding: '18px 14px 14px',
      background: `linear-gradient(160deg, ${unit.color}26 0%, ${unit.color}0a 60%, ${CARD} 100%)`,
      border: `1px solid ${unit.color}66`,
      borderRadius: 8,
      minHeight: 140,
      animation: anim,
      overflow: 'hidden',
    }}>
      {unit.rarity === 5 && (
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(110deg, transparent 30%, ${GOLD}55 50%, transparent 70%)`,
          backgroundSize: '200% 100%',
          animation: 'pspark-shimmer 3.2s linear infinite',
          pointerEvents: 'none',
        }} />
      )}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 9.5, letterSpacing: 0.2, textTransform: 'uppercase', color: '#b9a6bf' }}>
          {position === 0 ? 'Next up' : `+${position}`}
        </span>
        <span style={{ fontSize: 10, padding: '2px 7px', background: unit.color, color: '#0f0e13', borderRadius: 4, fontWeight: 700 }}>
          ★{unit.rarity}
        </span>
      </div>
      <div style={{ position: 'relative', fontSize: 21, fontWeight: 500, color: '#fbf4fc', letterSpacing: -0.2 }}>{unit.name}</div>
      <div style={{ position: 'relative', marginTop: 10, fontSize: 10.5, color: '#b9a6bf' }}>
        +1 spark on commit
      </div>
    </div>
  );
}

function SparkOrb({ pct, ready }: { pct: number; ready: boolean }) {
  return (
    <div style={{ position: 'relative', width: 140, height: 140, margin: '10px auto' }}>
      <svg viewBox="0 0 100 100" width={140} height={140} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={50} cy={50} r={44} fill="none" stroke="#ffffff14" strokeWidth={6} />
        <circle
          cx={50} cy={50} r={44}
          fill="none"
          stroke={ready ? GOLD : ACCENT}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 44}
          strokeDashoffset={2 * Math.PI * 44 * (1 - pct / 100)}
          style={{ transition: 'stroke-dashoffset 400ms ease-out', filter: ready ? `drop-shadow(0 0 6px ${GOLD})` : undefined }}
        />
      </svg>
      <div aria-hidden style={{
        position: 'absolute', inset: 12, borderRadius: '50%',
        background: ready ? `radial-gradient(circle, ${GOLD}aa, transparent 70%)` : `radial-gradient(circle, ${ACCENT}55, transparent 70%)`,
        animation: ready ? 'pspark-orbit 6s linear infinite' : undefined,
      }} />
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
            padding: '5px 11px', fontSize: 11, borderRadius: 999, cursor: 'pointer',
            background: active ? ACCENT : '#ffffff08',
            color: active ? '#0f0e13' : '#ede4ef',
            border: `1px solid ${active ? ACCENT : '#ffffff14'}`,
            fontWeight: active ? 600 : 400,
          }}>
            {v.banner.name} · {v.guarantee.name} · {v.currency.name}
          </button>
        );
      })}
    </div>
  );
}
