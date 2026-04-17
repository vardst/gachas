// HAND-CRAFTED — Preview + Pity.
// Vibe: stacked safety. Preview queue as the hero, pity as a second floor underneath.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { useGachaEngine } from '../../lib/useGachaEngine';
import type { Unit } from '../../data/roster';
import { StatusBar, PullResults } from '../../lib/GachaFrame';

const ACCENT = '#8CA4E5';
const SURFACE = '#0f1119';
const CARD = '#1a1d29';
const SOFT_WARN = '#f0b764';

const KEYFRAMES = `
@keyframes ppity-slide-out { 0% { transform: translateX(0) translateY(0) scale(1); opacity: 1; } 60% { opacity: 0.5; } 100% { transform: translateX(-80px) translateY(50px) scale(0.82); opacity: 0; } }
@keyframes ppity-shift { 0% { transform: translateX(34%); } 100% { transform: translateX(0); } }
@keyframes ppity-enter { 0% { transform: translateX(30px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
@keyframes ppity-shield { 0%, 100% { opacity: 0.35; } 50% { opacity: 0.7; } }
@keyframes ppity-fill { 0% { width: 0%; } 100% { width: var(--to); } }
`;

type Phase = 'idle' | 'advancing';

export default function PreviewPity({ slug }: { slug: string }) {
  const variants = combosForType('preview-pity');
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

  const pitySince = state.pullsSinceFiveStar;
  const softPity = state.softPityStart;
  const hardPity = state.hardPityAt;
  const useSoftPity = combo.guarantee.id === 'soft';
  const pityPct = Math.min(100, (pitySince / hardPity) * 100);
  const inSoft = useSoftPity && pitySince >= softPity;
  const hasFive = lastResults.some(r => r.rarity === 5);
  const hasFour = lastResults.some(r => r.rarity === 4);

  return (
    <div style={{
      minHeight: '100vh',
      background: `radial-gradient(ellipse at 20% 0%, ${ACCENT}18 0%, ${SURFACE} 60%)`,
      color: '#d8dce8',
      padding: '26px 32px 60px',
      fontFamily: '"Inter", -apple-system, sans-serif',
    }}>
      <style>{KEYFRAMES}</style>

      <Link to="/" style={{ fontSize: 12, color: '#d8dce8', opacity: 0.55, textDecoration: 'none' }}>
        ← Back
      </Link>

      <header style={{ marginTop: 18, marginBottom: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 0.22, textTransform: 'uppercase', color: ACCENT, fontWeight: 600, marginBottom: 6 }}>
            Preview · Pity
          </div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 500, letterSpacing: -0.4, color: '#f0f2f8' }}>
            Two-layer safety net
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#9aa2b7', maxWidth: 560, lineHeight: 1.55 }}>
            The next three pulls are revealed. Beneath that, pity tracks quietly until it trips. The transparency
            shield up top; the pity floor down below.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Stat label="Pulls" value={state.totalPulls} />
          <Stat label="5★" value={state.fiveStarCount} accent />
          <Stat label="Free" value={state.freeCurrency.toLocaleString()} />
        </div>
      </header>

      {variants.length > 1 && (
        <VariantRow variants={variants} current={combo.slug} onPick={(s) => navigate(`/play/${s}`)} />
      )}

      <section style={{
        background: CARD,
        border: `1px solid ${ACCENT}2a`,
        borderRadius: 10,
        padding: 22,
        marginBottom: 16,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(600px 120px at 50% -10%, ${ACCENT}1a, transparent 60%)`, animation: 'ppity-shield 5s ease-in-out infinite' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 10, letterSpacing: 0.2, textTransform: 'uppercase', color: '#9aa2b7', marginBottom: 12 }}>
            Layer 1 · Preview shield
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {state.previewQueue.slice(0, 3).map((u, i) => (
              <QueueCard key={`${u.id}-${i}-${eng.pullBurstKey}`} unit={u} position={i} phase={phase} />
            ))}
            {state.previewQueue.length === 0 && (
              <div style={{ gridColumn: '1 / -1', color: '#9aa2b7', fontSize: 12, padding: 28, textAlign: 'center' }}>loading…</div>
            )}
          </div>

          <div style={{ marginTop: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <div style={{ fontSize: 10, letterSpacing: 0.2, textTransform: 'uppercase', color: '#9aa2b7' }}>
                Layer 2 · Pity counter
              </div>
              <div style={{ fontSize: 12, color: inSoft ? SOFT_WARN : '#d8dce8' }}>
                <b style={{ fontWeight: 600 }}>{pitySince}</b>
                <span style={{ opacity: 0.55 }}> / {hardPity}</span>
                {inSoft && <span style={{ marginLeft: 8, color: SOFT_WARN }}>· soft pity rolling</span>}
              </div>
            </div>
            <PityBar pct={pityPct} soft={softPity} hard={hardPity} inSoft={inSoft} />
            <div style={{ marginTop: 6, fontSize: 10.5, color: '#9aa2b7', display: 'flex', justifyContent: 'space-between' }}>
              <span>base 0.6%</span>
              {useSoftPity && <span>soft ramp from {softPity}</span>}
              <span>hard guarantee at {hardPity}</span>
            </div>
          </div>

          <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${ACCENT}1f` }}>
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
        </div>
      </section>

      <section style={{ background: CARD, border: `1px solid ${ACCENT}1f`, borderRadius: 8, padding: '14px 18px' }}>
        <div style={{ fontSize: 10, letterSpacing: 0.2, textTransform: 'uppercase', color: '#9aa2b7', marginBottom: 8 }}>History · {state.history.length}</div>
        {state.history.length === 0 ? (
          <div style={{ fontSize: 12, color: '#9aa2b7' }}>No pulls yet.</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {state.history.slice(-40).reverse().map((h, i) => (
              <span key={i} style={{
                fontSize: 10.5,
                padding: '2px 6px',
                background: h.rarity === 5 ? ACCENT + '33' : h.rarity === 4 ? '#f0b76422' : '#ffffff08',
                color: h.rarity === 5 ? '#f0f2f8' : h.rarity === 4 ? SOFT_WARN : '#9aa2b7',
                borderRadius: 3,
                border: h.rarity === 5 ? `1px solid ${ACCENT}66` : '1px solid transparent',
              }}>
                ★{h.rarity} {h.unit.name}{h.hardPity ? '·H' : h.softPity ? '·S' : ''}
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function QueueCard({ unit, position, phase }: { unit: Unit; position: number; phase: Phase }) {
  const anim = phase === 'advancing'
    ? (position === 0 ? 'ppity-slide-out 400ms ease-in forwards'
      : position === 2 ? 'ppity-enter 420ms ease-out both'
      : 'ppity-shift 400ms ease-out both')
    : undefined;
  return (
    <div style={{
      position: 'relative',
      padding: '16px 14px',
      background: `linear-gradient(180deg, ${unit.color}2a 0%, ${CARD} 100%)`,
      border: `1px solid ${unit.color}55`,
      borderRadius: 6,
      minHeight: 130,
      animation: anim,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 9.5, letterSpacing: 0.2, textTransform: 'uppercase', color: '#9aa2b7' }}>
          {position === 0 ? 'Next up' : `+${position}`}
        </span>
        <span style={{ fontSize: 10, padding: '2px 7px', background: unit.color, color: '#0f0e13', borderRadius: 3, fontWeight: 700 }}>
          ★{unit.rarity}
        </span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 500, color: '#f0f2f8', letterSpacing: -0.2 }}>{unit.name}</div>
      <div style={{ marginTop: 8, height: 3, background: unit.color, borderRadius: 2, width: '40%' }} />
    </div>
  );
}

function PityBar({ pct, soft, hard, inSoft }: { pct: number; soft: number; hard: number; inSoft: boolean }) {
  const softPct = (soft / hard) * 100;
  return (
    <div style={{ position: 'relative', height: 14, background: '#ffffff0c', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: `${pct}%`,
        background: inSoft ? `linear-gradient(90deg, ${ACCENT}, ${SOFT_WARN})` : ACCENT,
        transition: 'width 300ms ease-out',
      }} />
      <div style={{ position: 'absolute', left: `${softPct}%`, top: -2, bottom: -2, width: 1, background: SOFT_WARN, opacity: 0.6 }} />
      <div style={{ position: 'absolute', right: 0, top: -2, bottom: -2, width: 2, background: '#e36b6b' }} />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${accent ? ACCENT + '66' : '#ffffff14'}`, borderRadius: 5, padding: '6px 12px', minWidth: 56, textAlign: 'center' }}>
      <div style={{ fontSize: 9, letterSpacing: 0.18, textTransform: 'uppercase', color: '#9aa2b7' }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: accent ? ACCENT : '#f0f2f8' }}>{value}</div>
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
            color: active ? '#0f0e13' : '#d8dce8',
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
