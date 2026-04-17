// HAND-CRAFTED — Step-Up + Spark.
// Vibe: premium layered. Three ceilings panel: step / pity (when present) / spark.
// Visually busy in a premium way — a lot going on but everything has a place.
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { useGachaEngine } from '../../lib/useGachaEngine';
import { featuredFor } from '../../data/roster';
import { UnitCard, StatusBar, CelebrationFlash } from '../../lib/GachaFrame';

const ACCENT = '#d093c7';
const DEEP = '#8a5a86';
const INK = '#f5eaf2';
const BG_0 = '#1a0f1a';
const BG_1 = '#2a1928';
const GOLD = '#f4d46b';
const TEAL = '#7fd4c9';

const KEYFRAMES = `
@keyframes sus-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes sus-ceiling-pulse { 0%, 100% { box-shadow: 0 0 0 1px currentColor, 0 0 14px -4px currentColor; } 50% { box-shadow: 0 0 0 2px currentColor, 0 0 24px -2px currentColor; } }
@keyframes sus-rise { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes sus-sparkle { 0% { transform: scale(0.6) rotate(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: scale(1) rotate(120deg); opacity: 0; } }
`;

export default function StepUpSpark({ slug }: { slug: string }) {
  const variants = combosForType('step_up-spark');
  const navigate = useNavigate();
  const combo = useMemo(() => variants.find(c => c.slug === slug) ?? variants[0], [variants, slug]);
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;

  const featured = featuredFor(combo.banner.id);
  const step = state.stepIndex;
  const stepLen = state.stepLength;
  const usesPity = ['spark_pity'].includes(combo.guarantee.id);
  const sparkReady = eng.canSpark;
  const sparkPct = Math.min(100, (state.sparkProgress / state.sparkThreshold) * 100);
  const stepPct = (step / stepLen) * 100;
  const pityPct = usesPity ? Math.min(100, (state.pullsSinceFiveStar / state.hardPityAt) * 100) : 0;

  const hasFive = lastResults.some(r => r.rarity === 5);
  const hasFour = lastResults.some(r => r.rarity === 4);

  return (
    <div className="page" style={{
      background: `radial-gradient(900px 600px at 70% -10%, ${ACCENT}22 0%, transparent 60%), linear-gradient(180deg, ${BG_0} 0%, ${BG_1} 100%)`,
      minHeight: '100vh', padding: 22, color: INK, borderRadius: 14,
      fontFamily: 'ui-serif, Georgia, serif',
    }}>
      <style>{KEYFRAMES}</style>

      <Link to="/" style={{ color: '#c9afc5', fontSize: 12.5, textDecoration: 'none', display: 'inline-block', marginBottom: 12 }}>← Back to dashboard</Link>

      <header style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: 0.3, textTransform: 'uppercase', color: '#c9afc5' }}>
          Step-Up · Spark{usesPity ? ' · Pity' : ''} · layered premium
        </div>
        <h1 style={{ margin: '4px 0 0', fontSize: 32, fontWeight: 400, letterSpacing: 0.4, color: '#fff', fontFamily: 'ui-serif, Georgia, serif' }}>
          {usesPity ? 'Three Ceilings' : 'Two Ceilings'}
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#c9afc5', maxWidth: 620, lineHeight: 1.55 }}>
          Step cycle, {usesPity ? 'pity rail, ' : ''}and spark meter — each a separate hand-rail to the reward. The cheapest path changes with every pull.
        </p>
      </header>

      {variants.length > 1 && (
        <div style={{ marginBottom: 14, padding: 10, background: 'rgba(255,255,255,0.03)', border: `1px solid ${ACCENT}44`, borderRadius: 10, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.12, color: '#c9afc5' }}>Variant</span>
          {variants.map(v => {
            const active = v.slug === combo.slug;
            return (
              <button key={v.slug} onClick={() => navigate(`/play/${v.slug}`)} style={{
                padding: '4px 10px', fontSize: 11.5, borderRadius: 999,
                background: active ? ACCENT : 'rgba(255,255,255,0.05)',
                color: active ? '#1a0f1a' : INK,
                border: `1px solid ${active ? ACCENT : 'rgba(208,147,199,0.25)'}`,
                cursor: 'pointer', fontWeight: active ? 600 : 400, fontFamily: 'inherit',
              }}>{v.banner.name} · {v.guarantee.name} · {v.currency.name}</button>
            );
          })}
        </div>
      )}

      {/* THREE-CEILINGS PANEL */}
      <div style={{
        background: `linear-gradient(180deg, rgba(208,147,199,0.08) 0%, rgba(0,0,0,0.2) 100%)`,
        border: `1px solid ${ACCENT}55`,
        borderRadius: 14, padding: 16, marginBottom: 14,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div style={{ fontSize: 11, letterSpacing: 0.3, textTransform: 'uppercase', color: GOLD, fontWeight: 700 }}>
            Ceilings
          </div>
          <div style={{ fontSize: 11, color: '#c9afc5', letterSpacing: 0.05 }}>
            {sparkReady ? 'Spark ready' : `Spark in ${state.sparkThreshold - state.sparkProgress}`}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: usesPity ? '1fr 1fr 1fr' : '1fr 1fr', gap: 10 }}>
          <Ceiling
            color={ACCENT}
            title="Step Floor"
            value={`${step + 1} / ${stepLen}`}
            caption={step === stepLen - 1 ? 'NEXT PULL ★5' : `★5 at step ${stepLen}`}
            pct={stepPct}
            hot={step === stepLen - 1}
          />
          {usesPity && (
            <Ceiling
              color={TEAL}
              title="Pity Floor"
              value={`${state.pullsSinceFiveStar} / ${state.hardPityAt}`}
              caption={state.pullsSinceFiveStar >= state.softPityStart ? 'SOFT PITY' : `Soft at ${state.softPityStart}`}
              pct={pityPct}
              hot={state.pullsSinceFiveStar >= state.softPityStart}
            />
          )}
          <Ceiling
            color={GOLD}
            title="Spark Redeem"
            value={`${state.sparkProgress} / ${state.sparkThreshold}`}
            caption={sparkReady ? 'READY · pick any featured ★5' : `${state.sparkThreshold - state.sparkProgress} pulls remaining`}
            pct={sparkPct}
            hot={sparkReady}
          />
        </div>

        <div style={{
          marginTop: 12, padding: '8px 12px',
          background: 'rgba(244,212,107,0.08)',
          border: '1px solid rgba(244,212,107,0.3)',
          borderRadius: 8, fontSize: 11.5, color: '#f1e0b3',
          lineHeight: 1.5,
        }}>
          Three rails, three outcomes: the step cycle forces a ★5 by step {stepLen}, {usesPity ? `pity forces one by pull ${state.hardPityAt}, ` : ''}and spark lets you outright buy a featured ★5 at {state.sparkThreshold} pulls. Whichever rail empties its meter first is your actual path.
        </div>
      </div>

      {/* Step strip with milestones */}
      <div style={{ marginBottom: 14, padding: 12, background: 'rgba(255,255,255,0.03)', border: `1px solid ${ACCENT}33`, borderRadius: 10 }}>
        <div style={{ fontSize: 10.5, letterSpacing: 0.15, textTransform: 'uppercase', color: '#c9afc5', fontWeight: 600, marginBottom: 8 }}>
          Step cycle · cycle {Math.floor(state.totalPulls / stepLen) + 1}
        </div>
        <div style={{ display: 'flex', gap: 3 }}>
          {Array.from({ length: stepLen }).map((_, i) => {
            const isCurrent = i === step;
            const isPast = i < step;
            const isFloor = i === stepLen - 1;
            const isMid = i === Math.floor(stepLen / 2) - 1;
            return (
              <div key={i} style={{
                flex: 1, height: 28,
                background: isFloor
                  ? (isPast ? `${ACCENT}66` : ACCENT)
                  : isMid
                    ? (isPast ? 'rgba(244,212,107,0.3)' : `${GOLD}66`)
                    : isCurrent ? 'rgba(208,147,199,0.25)' : isPast ? 'rgba(208,147,199,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isFloor ? ACCENT : isMid ? GOLD : isCurrent ? ACCENT : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10.5, fontWeight: 600,
                color: isFloor && !isPast ? '#1a0f1a' : isCurrent ? INK : '#a288a0',
              }}>{i + 1}{isFloor ? '★' : isMid ? '☆' : ''}</div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: '#a288a0' }}>
          <span>Start</span>
          <span>Mid · ★4+ guarantee</span>
          <span>Step {stepLen} · ★5</span>
        </div>
      </div>

      {featured.five.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10.5, letterSpacing: 0.15, textTransform: 'uppercase', color: '#c9afc5', marginBottom: 6 }}>Featured · spark-eligible</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {featured.five.map(u => (
              <span key={u.id} style={{
                padding: '5px 11px', fontSize: 12, fontWeight: 600,
                background: `linear-gradient(90deg, ${u.color}dd, ${u.color}99)`,
                color: '#1a0f1a', borderRadius: 999,
                boxShadow: `0 0 0 1px ${GOLD}, 0 0 14px -4px ${GOLD}aa`,
              }}>★5 {u.name}</span>
            ))}
            {featured.four.map(u => (
              <span key={u.id} style={{
                padding: '3px 9px', fontSize: 11, color: '#e5c7dd',
                background: 'rgba(208,147,199,0.1)', borderRadius: 999,
                border: '1px solid rgba(208,147,199,0.3)',
              }}>★4 {u.name}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: 10, background: 'rgba(255,255,255,0.03)', border: `1px solid ${ACCENT}22`, borderRadius: 8, marginBottom: 12 }}>
        <StatusBar combo={combo} eng={eng} />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <button onClick={eng.pull1} disabled={!eng.canPull1} style={premiumBtn(false)}>Pull 1 · {eng.pullCost}</button>
        <button onClick={eng.pull10} disabled={!eng.canPull10} style={premiumBtn(true)}>
          Pull 10 · {(eng.pullCost * 10).toLocaleString()}
        </button>
        <button onClick={eng.spark} disabled={!sparkReady} style={sparkBtn(sparkReady)}>
          {sparkReady ? 'REDEEM SPARK' : `Spark ${state.sparkProgress}/${state.sparkThreshold}`}
        </button>
        <button onClick={() => eng.addFunds()} style={premiumBtn(false, true)}>+ Funds</button>
        <button onClick={eng.reset} style={premiumBtn(false, true)}>Reset</button>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.02)', border: `1px solid ${ACCENT}22`,
        borderRadius: 12, padding: 14, minHeight: 150, position: 'relative',
      }}>
        {hasFive && <CelebrationFlash tier={5} accent={ACCENT} />}
        {!hasFive && hasFour && <CelebrationFlash tier={4} accent={ACCENT} />}
        {lastResults.length === 0 ? (
          <div style={{ padding: 22, textAlign: 'center', color: '#a288a0', fontSize: 13, fontStyle: 'italic' }}>
            Three rails. One reward. Pick your favorite path.
          </div>
        ) : (
          <div key={eng.pullBurstKey} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px,1fr))', gap: 10 }}>
            {lastResults.map((r, i) => (
              <div key={i} style={{ animation: `sus-rise 0.4s ease-out ${i * 45}ms both` }}>
                <UnitCard result={r} delay={0} />
              </div>
            ))}
          </div>
        )}
      </div>

      {state.history.length > 0 && (
        <div style={{ marginTop: 12, padding: 10, background: 'rgba(255,255,255,0.03)', border: `1px solid ${ACCENT}22`, borderRadius: 8 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.12, color: '#c9afc5', fontWeight: 600, marginBottom: 5 }}>
            Recent · {state.history.length}
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {state.history.slice(-16).reverse().map((h, i) => (
              <span key={i} style={{
                padding: '2px 7px', fontSize: 10.5, borderRadius: 4,
                background: h.rarity === 5 ? `${GOLD}22` : h.rarity === 4 ? 'rgba(208,147,199,0.18)' : 'rgba(255,255,255,0.04)',
                color: h.rarity === 5 ? GOLD : h.rarity === 4 ? '#e5c7dd' : '#a288a0',
                border: h.rarity >= 4 ? `1px solid ${h.rarity === 5 ? GOLD : ACCENT}44` : '1px solid rgba(255,255,255,0.05)',
                fontWeight: h.rarity >= 4 ? 600 : 400,
              }}>★{h.rarity} {h.unit.name}{h.sparkRedeemed ? ' ·spark' : h.hardPity ? ' ·hard' : ''}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Ceiling({ color, title, value, caption, pct, hot }: {
  color: string; title: string; value: string; caption: string; pct: number; hot: boolean;
}) {
  return (
    <div style={{
      padding: 12, borderRadius: 10,
      background: `linear-gradient(180deg, ${color}18, ${color}05)`,
      border: `1px solid ${color}55`,
      color,
      animation: hot ? 'sus-ceiling-pulse 1.6s ease-in-out infinite' : undefined,
    }}>
      <div style={{ fontSize: 10, letterSpacing: 0.25, textTransform: 'uppercase', fontWeight: 700, color }}>{title}</div>
      <div style={{ fontSize: 22, color: '#fff', fontWeight: 300, margin: '3px 0 6px', fontFamily: 'ui-serif, Georgia, serif' }}>{value}</div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: `linear-gradient(90deg, ${color}aa, ${color})`,
          backgroundSize: '200% 100%',
          animation: hot ? 'sus-shimmer 2.5s linear infinite' : undefined,
          transition: 'width 0.35s cubic-bezier(.22,1,.36,1)',
        }} />
      </div>
      <div style={{ marginTop: 6, fontSize: 10.5, color: '#d4c5d2', letterSpacing: 0.05 }}>{caption}</div>
    </div>
  );
}

function premiumBtn(primary: boolean, ghost = false): React.CSSProperties {
  if (primary) {
    return {
      padding: '10px 18px', fontSize: 13, fontWeight: 600, letterSpacing: 0.2,
      background: `linear-gradient(180deg, ${ACCENT}, ${DEEP})`,
      color: '#1a0f1a',
      border: `1px solid ${ACCENT}`,
      borderRadius: 8, cursor: 'pointer',
      boxShadow: `0 4px 14px -4px ${ACCENT}88`,
      fontFamily: 'inherit',
    };
  }
  if (ghost) {
    return {
      padding: '8px 14px', fontSize: 12.5,
      background: 'transparent', color: '#c9afc5',
      border: '1px solid rgba(208,147,199,0.25)', borderRadius: 8, cursor: 'pointer',
      fontFamily: 'inherit',
    };
  }
  return {
    padding: '9px 16px', fontSize: 12.5,
    background: 'rgba(255,255,255,0.05)', color: INK,
    border: `1px solid ${ACCENT}55`, borderRadius: 8, cursor: 'pointer',
    fontFamily: 'inherit',
  };
}

function sparkBtn(ready: boolean): React.CSSProperties {
  if (ready) {
    return {
      padding: '10px 18px', fontSize: 13, fontWeight: 800, letterSpacing: 0.3,
      background: `linear-gradient(180deg, ${GOLD}, #c89f3a)`,
      color: '#1a0f1a',
      border: `1px solid ${GOLD}`,
      borderRadius: 8, cursor: 'pointer',
      boxShadow: `0 4px 18px -4px ${GOLD}bb`,
      textTransform: 'uppercase',
      fontFamily: 'inherit',
    };
  }
  return {
    padding: '10px 16px', fontSize: 12.5,
    background: 'rgba(244,212,107,0.08)', color: '#f1e0b3',
    border: '1px solid rgba(244,212,107,0.4)', borderRadius: 8, cursor: 'pointer',
    fontFamily: 'inherit',
  };
}
