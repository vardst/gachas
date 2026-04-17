// HAND-CRAFTED — Step-Up + Full suite.
// Vibe: systems-on-systems dashboard. Calmer gold than anniversary-megabanner.
// EVERY mitigation rail visible in a clean grid — step, pity, spark, shards, Radiance,
// carry-over. A flight deck, not a hectic cascade.
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { useGachaEngine } from '../../lib/useGachaEngine';
import { featuredFor } from '../../data/roster';
import { UnitCard, StatusBar, CelebrationFlash } from '../../lib/GachaFrame';

const ACCENT = '#ffd86f';
const DEEP = '#b38e30';
const INK = '#f4efdc';
const BG_0 = '#12110d';
const BG_1 = '#1c1a12';
const COOL = '#8CA4E5';
const CLAY = '#c48a6e';
const ROSE = '#d093c7';
const SPRING = '#a0d468';

const KEYFRAMES = `
@keyframes suf-pulse { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
@keyframes suf-rise { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes suf-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes suf-glow { 0%, 100% { box-shadow: 0 0 0 1px currentColor, 0 0 14px -4px currentColor; } 50% { box-shadow: 0 0 0 2px currentColor, 0 0 22px 0 currentColor; } }
`;

export default function StepUpFull({ slug }: { slug: string }) {
  const variants = combosForType('step_up-full');
  const navigate = useNavigate();
  const combo = useMemo(() => variants.find(c => c.slug === slug) ?? variants[0], [variants, slug]);
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;

  const featured = featuredFor(combo.banner.id);
  const step = state.stepIndex;
  const stepLen = state.stepLength;

  const pityPct = Math.min(100, (state.pullsSinceFiveStar / state.hardPityAt) * 100);
  const sparkPct = Math.min(100, (state.sparkProgress / state.sparkThreshold) * 100);
  const shardPct = Math.min(100, (state.shards / state.shardsNeededForFive) * 100);
  const stepPct = (step / stepLen) * 100;

  const sparkReady = eng.canSpark;
  const shardsReady = eng.canShards;

  const hasFive = lastResults.some(r => r.rarity === 5);
  const hasFour = lastResults.some(r => r.rarity === 4);

  return (
    <div className="page" style={{
      background: `radial-gradient(900px 600px at 50% -15%, ${ACCENT}14 0%, transparent 55%), linear-gradient(180deg, ${BG_0} 0%, ${BG_1} 100%)`,
      minHeight: '100vh', padding: 22, color: INK, borderRadius: 14,
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    }}>
      <style>{KEYFRAMES}</style>

      <Link to="/" style={{ color: '#c8b87a', fontSize: 12.5, textDecoration: 'none', display: 'inline-block', marginBottom: 12 }}>← Back to dashboard</Link>

      <header style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 0.3, textTransform: 'uppercase', color: ACCENT, fontWeight: 600 }}>
            Step-Up × Full suite
          </div>
          <h1 style={{ margin: '3px 0 0', fontSize: 30, fontWeight: 500, color: '#fff', letterSpacing: -0.3 }}>
            Step-Up, Turned Up to 11
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#c8b87a', maxWidth: 620, lineHeight: 1.55 }}>
            Every mitigation system active: step cycle, pity rail, spark redeem, shard anvil, Radiance adaptivity, carry-over. A flight deck rather than a cascade.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: 320 }}>
          {['Step', 'Pity', 'Spark', 'Shards', 'Radiance', 'Carry-over'].map(l => (
            <span key={l} style={{
              padding: '3px 9px', fontSize: 10.5, borderRadius: 999,
              background: 'rgba(255,216,111,0.08)', color: ACCENT,
              border: `1px solid ${ACCENT}55`, letterSpacing: 0.1, fontWeight: 500,
            }}>{l}</span>
          ))}
        </div>
      </header>

      {variants.length > 1 && (
        <div style={{ marginBottom: 14, padding: 10, background: 'rgba(255,255,255,0.03)', border: `1px solid ${ACCENT}44`, borderRadius: 10, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.12, color: '#c8b87a' }}>Variant</span>
          {variants.map(v => {
            const active = v.slug === combo.slug;
            return (
              <button key={v.slug} onClick={() => navigate(`/play/${v.slug}`)} style={{
                padding: '4px 10px', fontSize: 11.5, borderRadius: 999,
                background: active ? ACCENT : 'rgba(255,255,255,0.05)',
                color: active ? '#12110d' : INK,
                border: `1px solid ${active ? ACCENT : 'rgba(255,216,111,0.2)'}`,
                cursor: 'pointer', fontWeight: active ? 600 : 400,
              }}>{v.banner.name} · {v.currency.name}</button>
            );
          })}
        </div>
      )}

      {/* TOP: full step strip (wide) */}
      <div style={{ marginBottom: 14, padding: 14, background: 'rgba(255,255,255,0.03)', border: `1px solid ${ACCENT}44`, borderRadius: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <div style={{ fontSize: 11, letterSpacing: 0.3, textTransform: 'uppercase', color: ACCENT, fontWeight: 700 }}>
            Step cycle · cycle {Math.floor(state.totalPulls / stepLen) + 1}
          </div>
          <div style={{ fontSize: 11, color: '#c8b87a' }}>
            Step {step + 1} / {stepLen}
            {step === stepLen - 1 && <span style={{ color: ACCENT, marginLeft: 8, fontWeight: 700 }}>· NEXT: ★5</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 3 }}>
          {Array.from({ length: stepLen }).map((_, i) => {
            const isCurrent = i === step;
            const isPast = i < step;
            const isFloor = i === stepLen - 1;
            const isMid = i === Math.floor(stepLen / 2) - 1;
            return (
              <div key={i} style={{
                flex: 1, height: 30,
                background: isFloor
                  ? (isPast ? `${DEEP}` : ACCENT)
                  : isMid
                    ? (isPast ? `${DEEP}88` : `${ACCENT}66`)
                    : isCurrent ? 'rgba(255,216,111,0.22)' : isPast ? 'rgba(255,216,111,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isFloor || isMid ? ACCENT : isCurrent ? ACCENT : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
                color: isFloor && !isPast ? '#12110d' : isCurrent ? INK : '#8d7f4f',
              }}>{i + 1}{isFloor ? '★' : isMid ? '☆' : ''}</div>
            );
          })}
        </div>
      </div>

      {/* DASHBOARD GRID — rails */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 10,
        marginBottom: 14,
      }}>
        <Rail
          color={ACCENT}
          title="Step Floor"
          big={`Step ${step + 1}`}
          pct={stepPct}
          caption={step === stepLen - 1 ? 'NEXT PULL · ★5' : `★5 at step ${stepLen}`}
          hot={step === stepLen - 1}
        />
        <Rail
          color={COOL}
          title="Pity"
          big={`${state.pullsSinceFiveStar} / ${state.hardPityAt}`}
          pct={pityPct}
          caption={state.pullsSinceFiveStar >= state.softPityStart ? 'SOFT PITY active' : `Soft at ${state.softPityStart}`}
          hot={state.pullsSinceFiveStar >= state.softPityStart}
        />
        <Rail
          color={ROSE}
          title="Spark"
          big={`${state.sparkProgress} / ${state.sparkThreshold}`}
          pct={sparkPct}
          caption={sparkReady ? 'READY · pick featured' : `${state.sparkThreshold - state.sparkProgress} to redeem`}
          hot={sparkReady}
        />
        <Rail
          color={CLAY}
          title="Shards"
          big={`${state.shards} / ${state.shardsNeededForFive}`}
          pct={shardPct}
          caption={shardsReady ? 'FORGE ready' : `${state.shardsNeededForFive - state.shards} to craft`}
          hot={shardsReady}
        />
        <Rail
          color={SPRING}
          title="Radiance"
          big={state.radianceLossStreak > 0 ? `+${state.radianceLossStreak * 10}%` : 'Idle'}
          pct={Math.min(100, state.radianceLossStreak * 25)}
          caption={state.radianceLossStreak > 0 ? `Streak: ${state.radianceLossStreak}` : 'No loss streak'}
          hot={state.radianceLossStreak >= 2}
        />
        <Rail
          color={state.carryOver ? '#a0d468' : '#6a6a6a'}
          title="Carry-over"
          big={state.carryOver ? 'ARMED' : 'Idle'}
          pct={state.carryOver ? 100 : 0}
          caption={state.carryOver ? 'Next ★5 is featured' : 'Not active'}
          hot={state.carryOver}
        />
      </div>

      {featured.five.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10.5, letterSpacing: 0.15, textTransform: 'uppercase', color: '#c8b87a', marginBottom: 6 }}>Featured · all rails target these</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {featured.five.map(u => (
              <span key={u.id} style={{
                padding: '4px 10px', fontSize: 12, fontWeight: 600,
                background: `linear-gradient(90deg, ${u.color}, ${u.color}cc)`,
                color: '#12110d', borderRadius: 999,
                boxShadow: `0 0 0 1px ${ACCENT}88, 0 0 14px -6px ${ACCENT}`,
              }}>★5 {u.name}</span>
            ))}
            {featured.four.map(u => (
              <span key={u.id} style={{
                padding: '3px 9px', fontSize: 11, color: '#e5d5a0',
                background: 'rgba(255,216,111,0.1)', borderRadius: 999,
                border: `1px solid ${ACCENT}33`,
              }}>★4 {u.name}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: 10, background: 'rgba(255,255,255,0.03)', border: `1px solid ${ACCENT}22`, borderRadius: 8, marginBottom: 12 }}>
        <StatusBar combo={combo} eng={eng} />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <button onClick={eng.pull1} disabled={!eng.canPull1} style={fullBtn(false)}>Pull 1 · {eng.pullCost}</button>
        <button onClick={eng.pull10} disabled={!eng.canPull10} style={fullBtn(true)}>
          Pull 10 · {(eng.pullCost * 10).toLocaleString()}
        </button>
        <button onClick={eng.spark} disabled={!sparkReady} style={sparkBtnFull(sparkReady)}>
          {sparkReady ? 'REDEEM SPARK' : `Spark ${state.sparkProgress}/${state.sparkThreshold}`}
        </button>
        <button onClick={eng.shards} disabled={!shardsReady} style={craftBtnFull(shardsReady)}>
          {shardsReady ? 'FORGE ★5' : `Craft ${state.shards}/${state.shardsNeededForFive}`}
        </button>
        <button onClick={() => eng.addFunds()} style={fullBtn(false, true)}>+ Funds</button>
        <button onClick={eng.reset} style={fullBtn(false, true)}>Reset</button>
      </div>

      <div style={{
        background: 'rgba(0,0,0,0.25)', border: `1px solid ${ACCENT}22`,
        borderRadius: 12, padding: 14, minHeight: 150, position: 'relative',
      }}>
        {hasFive && <CelebrationFlash tier={5} accent={ACCENT} />}
        {!hasFive && hasFour && <CelebrationFlash tier={4} accent={ACCENT} />}
        {lastResults.length === 0 ? (
          <div style={{ padding: 22, textAlign: 'center', color: '#8d7f4f', fontSize: 13 }}>
            Every mitigation system is active. This is step-up turned up to 11.
          </div>
        ) : (
          <div key={eng.pullBurstKey} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px,1fr))', gap: 10 }}>
            {lastResults.map((r, i) => (
              <div key={i} style={{ animation: `suf-rise 0.4s ease-out ${i * 45}ms both` }}>
                <UnitCard result={r} delay={0} />
              </div>
            ))}
          </div>
        )}
      </div>

      {state.history.length > 0 && (
        <div style={{ marginTop: 12, padding: 10, background: 'rgba(255,255,255,0.03)', border: `1px solid ${ACCENT}22`, borderRadius: 8 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.12, color: '#c8b87a', fontWeight: 600, marginBottom: 5 }}>Log · {state.history.length}</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {state.history.slice(-16).reverse().map((h, i) => (
              <span key={i} style={{
                padding: '2px 7px', fontSize: 10.5, borderRadius: 4,
                background: h.rarity === 5 ? `${ACCENT}22` : h.rarity === 4 ? 'rgba(208,147,199,0.15)' : 'rgba(255,255,255,0.04)',
                color: h.rarity === 5 ? ACCENT : h.rarity === 4 ? '#e5c7dd' : '#8d7f4f',
                border: h.rarity >= 4 ? `1px solid ${h.rarity === 5 ? ACCENT : ROSE}44` : '1px solid rgba(255,255,255,0.05)',
                fontWeight: h.rarity >= 4 ? 600 : 400,
              }}>★{h.rarity} {h.unit.name}
                {h.sparkRedeemed ? ' ·spark' : h.hardPity ? ' ·hard' : h.softPity ? ' ·soft' : h.rateUpHit ? ' ·rate' : h.rateUpLoss ? ' ·lost' : ''}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Rail({ color, title, big, pct, caption, hot }: {
  color: string; title: string; big: string; pct: number; caption: string; hot: boolean;
}) {
  return (
    <div style={{
      padding: 11, borderRadius: 8,
      background: `linear-gradient(180deg, ${color}12, ${color}03)`,
      border: `1px solid ${color}55`,
      color,
      animation: hot ? 'suf-glow 1.8s ease-in-out infinite' : undefined,
    }}>
      <div style={{ fontSize: 9.5, letterSpacing: 0.25, textTransform: 'uppercase', fontWeight: 700, color }}>{title}</div>
      <div style={{ fontSize: 17, color: '#fff', fontWeight: 500, margin: '3px 0 6px', letterSpacing: -0.2 }}>{big}</div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: `linear-gradient(90deg, ${color}aa, ${color})`,
          backgroundSize: '200% 100%',
          animation: hot ? 'suf-shimmer 2.5s linear infinite' : undefined,
          transition: 'width 0.35s cubic-bezier(.22,1,.36,1)',
        }} />
      </div>
      <div style={{ marginTop: 5, fontSize: 10, color: '#c8b87a', letterSpacing: 0.05 }}>{caption}</div>
    </div>
  );
}

function fullBtn(primary: boolean, ghost = false): React.CSSProperties {
  if (primary) {
    return {
      padding: '10px 18px', fontSize: 13, fontWeight: 600, letterSpacing: 0.2,
      background: `linear-gradient(180deg, ${ACCENT}, ${DEEP})`,
      color: '#12110d',
      border: `1px solid ${ACCENT}`,
      borderRadius: 8, cursor: 'pointer',
      boxShadow: `0 4px 14px -4px ${ACCENT}88`,
    };
  }
  if (ghost) {
    return {
      padding: '8px 14px', fontSize: 12.5,
      background: 'transparent', color: '#c8b87a',
      border: `1px solid ${ACCENT}33`, borderRadius: 8, cursor: 'pointer',
    };
  }
  return {
    padding: '9px 16px', fontSize: 12.5,
    background: 'rgba(255,255,255,0.05)', color: INK,
    border: `1px solid ${ACCENT}55`, borderRadius: 8, cursor: 'pointer',
  };
}

function sparkBtnFull(ready: boolean) { return specialBtn(ready, ROSE, '#8a5a86', '#e5c7dd'); }
function craftBtnFull(ready: boolean) { return specialBtn(ready, CLAY, '#8c5940', '#e0c3a8'); }

function specialBtn(ready: boolean, c1: string, c2: string, dim: string): React.CSSProperties {
  if (ready) return {
    padding: '10px 16px', fontSize: 12.5, fontWeight: 700, letterSpacing: 0.25,
    background: `linear-gradient(180deg, ${c1}, ${c2})`,
    color: '#12110d', border: `1px solid ${c1}`, borderRadius: 8, cursor: 'pointer',
    boxShadow: `0 0 16px -4px ${c1}aa`, textTransform: 'uppercase',
  };
  return {
    padding: '9px 14px', fontSize: 12.5, borderRadius: 8, cursor: 'pointer',
    background: `${c1}14`, color: dim, border: `1px solid ${c1}44`,
  };
}
