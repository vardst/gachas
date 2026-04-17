// HAND-CRAFTED — Preview + Pure RNG.
// Vibe: clean Nordic transparency. "If you can see the result, is it really gambling?"
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { useGachaEngine } from '../../lib/useGachaEngine';
import { FIVE_STAR_RATE, FOUR_STAR_RATE, THREE_STAR_RATE, type Unit } from '../../data/roster';
import { StatusBar, PullResults } from '../../lib/GachaFrame';

const ACCENT = '#66a4d9';
const INK = '#1b2a36';
const CANVAS = '#f5f2eb';
const PAPER = '#ffffff';

const KEYFRAMES = `
@keyframes ppure-fade-in { 0% { opacity: 0; transform: translateX(24px); } 100% { opacity: 1; transform: translateX(0); } }
@keyframes ppure-slide-out { 0% { opacity: 1; transform: translateX(0) scale(1); } 60% { opacity: 0.6; transform: translateX(-40px) translateY(28px) scale(0.9); } 100% { opacity: 0; transform: translateX(-60px) translateY(80px) scale(0.7); } }
@keyframes ppure-shift-left { 0% { transform: translateX(calc(33.333% + 14px)); } 100% { transform: translateX(0); } }
@keyframes ppure-tick { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
`;

type Phase = 'idle' | 'advancing';

export default function PreviewPure({ slug }: { slug: string }) {
  const variants = combosForType('preview-pure');
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

  const hasFive = lastResults.some(r => r.rarity === 5);
  const hasFour = lastResults.some(r => r.rarity === 4);

  const odds: Record<3 | 4 | 5, string> = {
    5: (FIVE_STAR_RATE * 100).toFixed(2) + '%',
    4: (FOUR_STAR_RATE * 100).toFixed(2) + '%',
    3: (THREE_STAR_RATE * 100).toFixed(1) + '%',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: CANVAS,
      color: INK,
      padding: '28px 36px 60px',
      fontFamily: '"Inter", -apple-system, sans-serif',
    }}>
      <style>{KEYFRAMES}</style>

      <Link to="/" style={{ fontSize: 12, color: INK, opacity: 0.65, textDecoration: 'none', letterSpacing: 0.04 }}>
        ← Back
      </Link>

      <header style={{ marginTop: 22, marginBottom: 28, maxWidth: 920 }}>
        <div style={{ fontSize: 10.5, letterSpacing: 0.22, textTransform: 'uppercase', color: ACCENT, marginBottom: 6 }}>
          Preview · Pure RNG
        </div>
        <h1 style={{ margin: 0, fontSize: 42, fontWeight: 300, letterSpacing: -0.5, lineHeight: 1.05 }}>
          You see what you get.
        </h1>
        <p style={{ margin: '10px 0 0', fontSize: 14, color: '#556674', maxWidth: 560, lineHeight: 1.55, fontWeight: 300 }}>
          Next three pulls, rendered in plain sight. No safety nets, no carry-over, no pity. Just the roll,
          and the publication of the roll. If you can read this, can you really be surprised?
        </p>
      </header>

      {variants.length > 1 && (
        <VariantRow variants={variants} current={combo.slug} onPick={(s) => navigate(`/play/${s}`)} />
      )}

      <section style={{
        background: PAPER,
        border: `1px solid ${INK}14`,
        borderRadius: 4,
        padding: '32px 28px 28px',
        marginBottom: 22,
        boxShadow: `0 1px 0 ${INK}08, 0 20px 50px -30px ${ACCENT}44`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
          <div style={{ fontSize: 10, letterSpacing: 0.22, textTransform: 'uppercase', color: '#8696a4' }}>
            Manifest · next three pulls
          </div>
          <div style={{ fontSize: 10, letterSpacing: 0.12, color: '#8696a4', display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: ACCENT, animation: 'ppure-tick 1.6s ease-in-out infinite' }} />
            Live manifest
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {state.previewQueue.slice(0, 3).map((u, i) => (
            <PreviewCard key={`${u.id}-${i}-${eng.pullBurstKey}`} unit={u} position={i} odds={odds} phase={phase} />
          ))}
          {state.previewQueue.length === 0 && (
            <div style={{ gridColumn: '1 / -1', fontSize: 12, color: '#8696a4', padding: 40, textAlign: 'center' }}>
              preparing manifest…
            </div>
          )}
        </div>

        <div style={{ marginTop: 24, paddingTop: 18, borderTop: `1px dashed ${INK}22` }}>
          <StatusBar combo={combo} eng={eng} />
        </div>

        <div className="pull-row" style={{ marginTop: 16 }}>
          <button className="btn" disabled={!eng.canPull1} onClick={eng.pull1}>
            Commit 1 · {eng.pullCost.toLocaleString()}
          </button>
          <button
            className="btn btn-primary"
            disabled={!eng.canPull10}
            onClick={eng.pull10}
            style={{ background: ACCENT, borderColor: ACCENT, color: PAPER }}
          >
            Commit 10 · {(eng.pullCost * 10).toLocaleString()}
          </button>
          <button className="btn btn-ghost" onClick={() => eng.addFunds()}>+ Funds</button>
          <button className="btn btn-ghost" onClick={eng.reset}>Reset</button>
        </div>

        <PullResults key={eng.pullBurstKey} results={lastResults} hasFive={hasFive} hasFour={hasFour} accent={ACCENT} />
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, maxWidth: 920 }}>
        <div style={{ background: PAPER, border: `1px solid ${INK}14`, borderRadius: 4, padding: '18px 20px' }}>
          <div style={{ fontSize: 10, letterSpacing: 0.2, textTransform: 'uppercase', color: '#8696a4', marginBottom: 8 }}>
            Base odds per pull
          </div>
          <OddsRow tier={5} label="Legendary" value={odds[5]} />
          <OddsRow tier={4} label="Rare" value={odds[4]} />
          <OddsRow tier={3} label="Common" value={odds[3]} last />
          <div style={{ marginTop: 10, fontSize: 11, color: '#8696a4', lineHeight: 1.5 }}>
            Independent trials. No distribution memory. Each slot is rolled,
            published, and served on commit.
          </div>
        </div>
        <div style={{ background: PAPER, border: `1px solid ${INK}14`, borderRadius: 4, padding: '18px 20px' }}>
          <div style={{ fontSize: 10, letterSpacing: 0.2, textTransform: 'uppercase', color: '#8696a4', marginBottom: 8 }}>Ledger</div>
          {state.history.length === 0 ? (
            <div style={{ fontSize: 12, color: '#8696a4' }}>No commits yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 160, overflowY: 'auto' }}>
              {state.history.slice(-18).reverse().map((h, i) => (
                <div key={i} style={{ fontSize: 11.5, fontFamily: '"JetBrains Mono", monospace', color: h.rarity === 5 ? ACCENT : INK, opacity: h.rarity === 3 ? 0.5 : 1 }}>
                  #{state.history.length - i}  ★{h.rarity}  {h.unit.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function PreviewCard({ unit, position, odds, phase }: { unit: Unit; position: number; odds: Record<3 | 4 | 5, string>; phase: Phase }) {
  const isLeaving = phase === 'advancing' && position === 0;
  const isEntering = phase === 'advancing' && position === 2;
  const animation = isLeaving ? 'ppure-slide-out 400ms ease-in forwards'
    : isEntering ? 'ppure-fade-in 420ms ease-out both'
    : phase === 'advancing' ? 'ppure-shift-left 400ms ease-out both'
    : undefined;

  return (
    <div style={{
      position: 'relative',
      padding: '22px 18px 18px',
      background: PAPER,
      border: `1px solid ${unit.color}66`,
      borderTop: `4px solid ${unit.color}`,
      borderRadius: 2,
      minHeight: 180,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      animation,
      boxShadow: `0 1px 0 ${unit.color}22, 0 8px 30px -20px ${unit.color}`,
    }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 9.5, letterSpacing: 0.2, textTransform: 'uppercase', color: '#8696a4' }}>
            {position === 0 ? 'Next up' : `Slot ${position + 1}`}
          </div>
          <div style={{
            fontSize: 10,
            padding: '2px 7px',
            background: unit.color + '1a',
            color: unit.color,
            borderRadius: 2,
            fontWeight: 600,
            letterSpacing: 0.04,
          }}>
            ★{unit.rarity}
          </div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 400, color: INK, letterSpacing: -0.2, marginBottom: 8 }}>
          {unit.name}
        </div>
        <div style={{ height: 2, width: 28, background: unit.color, marginBottom: 10 }} />
        <div style={{ fontSize: 11, color: '#556674', lineHeight: 1.5 }}>
          {unit.rarity === 5 ? 'Legendary outcome — committed on pull.'
            : unit.rarity === 4 ? 'Rare outcome — committed on pull.'
            : 'Common outcome — committed on pull.'}
        </div>
      </div>
      <div style={{
        marginTop: 14,
        paddingTop: 10,
        borderTop: `1px dashed ${INK}1a`,
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 10,
        color: '#8696a4',
        letterSpacing: 0.04,
      }}>
        <span>p = {odds[unit.rarity]}</span>
        <span style={{ fontFamily: 'monospace' }}>{unit.color.toUpperCase()}</span>
      </div>
    </div>
  );
}

function OddsRow({ tier, label, value, last }: { tier: 3 | 4 | 5; label: string; value: string; last?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: last ? undefined : `1px solid ${INK}0f` }}>
      <span style={{ fontSize: 12, color: INK }}><b style={{ fontWeight: 500 }}>★{tier}</b> · {label}</span>
      <span style={{ fontSize: 12, fontFamily: 'monospace', color: ACCENT }}>{value}</span>
    </div>
  );
}

function VariantRow({ variants, current, onPick }: { variants: { slug: string; banner: { name: string }; guarantee: { name: string }; currency: { name: string } }[]; current: string; onPick: (s: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18, maxWidth: 920 }}>
      {variants.map(v => {
        const active = v.slug === current;
        return (
          <button
            key={v.slug}
            onClick={() => onPick(v.slug)}
            style={{
              padding: '6px 12px',
              fontSize: 11.5,
              borderRadius: 2,
              background: active ? ACCENT : PAPER,
              color: active ? PAPER : INK,
              border: `1px solid ${active ? ACCENT : INK + '22'}`,
              cursor: 'pointer',
              letterSpacing: 0.02,
            }}
          >
            {v.banner.name} · {v.currency.name}
          </button>
        );
      })}
    </div>
  );
}
