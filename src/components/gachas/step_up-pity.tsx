// HAND-CRAFTED — Step-Up + Pity.
// Vibe: modern-polished. Two mitigation systems side-by-side: step floor + pity floor.
// Race display: whichever floor fires first is the one you'll actually hit.
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { useGachaEngine } from '../../lib/useGachaEngine';
import { featuredFor } from '../../data/roster';
import { UnitCard, StatusBar, CelebrationFlash } from '../../lib/GachaFrame';

const ACCENT = '#8CA4E5';
const DEEP = '#4d63a8';
const INK = '#e7ecf8';
const BG_0 = '#0f1322';
const BG_1 = '#1a2140';
const STEP_COLOR = '#8CA4E5';
const PITY_COLOR = '#b89de8';

const KEYFRAMES = `
@keyframes sp-shine { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes sp-pulse { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
@keyframes sp-fade-up { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes sp-winner-bloom { 0% { transform: scale(1); } 50% { transform: scale(1.04); } 100% { transform: scale(1); } }
`;

export default function StepUpPity({ slug }: { slug: string }) {
  const variants = combosForType('step_up-pity');
  const navigate = useNavigate();
  const combo = useMemo(() => variants.find(c => c.slug === slug) ?? variants[0], [variants, slug]);
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;

  const featured = featuredFor(combo.banner.id);
  const step = state.stepIndex;
  const stepLen = state.stepLength;
  const pullsToStepFloor = stepLen - step; // next guaranteed ★5 step
  const pullsToHardPity = state.hardPityAt - state.pullsSinceFiveStar;
  const pullsToSoftPity = Math.max(0, state.softPityStart - state.pullsSinceFiveStar);
  const stepWinsRace = pullsToStepFloor < pullsToHardPity;
  const pityPct = Math.min(100, (state.pullsSinceFiveStar / state.hardPityAt) * 100);
  const stepPct = (step / stepLen) * 100;

  const hasFive = lastResults.some(r => r.rarity === 5);
  const hasFour = lastResults.some(r => r.rarity === 4);

  return (
    <div className="page" style={{
      background: `radial-gradient(1100px 700px at 18% -10%, ${DEEP}33 0%, transparent 60%), linear-gradient(180deg, ${BG_0} 0%, ${BG_1} 100%)`,
      minHeight: '100vh', padding: 22, color: INK, borderRadius: 14,
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    }}>
      <style>{KEYFRAMES}</style>

      <Link to="/" style={{ color: '#a7b2d6', fontSize: 12.5, textDecoration: 'none', display: 'inline-block', marginBottom: 12 }}>← Back to dashboard</Link>

      <header style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, letterSpacing: 0.2, textTransform: 'uppercase', color: '#a7b2d6', fontWeight: 500 }}>
          Step-Up × Pity · dual-floor build
        </div>
        <h1 style={{ margin: '3px 0 0', fontSize: 30, fontWeight: 500, letterSpacing: -0.4, color: '#fff' }}>
          Step Floor <span style={{ color: '#7d89b0' }}>+</span> Pity Floor
        </h1>
        <div style={{ fontSize: 12.5, color: '#a7b2d6', marginTop: 4, maxWidth: 680, lineHeight: 1.5 }}>
          Two deterministic floors racing in parallel. The step cycle guarantees a ★5 at step {stepLen}; pity guarantees one at pull {state.hardPityAt}. Whichever counter fills first is the floor you'll actually hit.
        </div>
      </header>

      {variants.length > 1 && (
        <div style={{ marginBottom: 16, padding: 10, background: 'rgba(255,255,255,0.04)', border: `1px solid ${ACCENT}44`, borderRadius: 10, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.1, color: '#a7b2d6' }}>Variant</span>
          {variants.map(v => {
            const active = v.slug === combo.slug;
            return (
              <button key={v.slug} onClick={() => navigate(`/play/${v.slug}`)} style={{
                padding: '4px 10px', fontSize: 11.5, borderRadius: 999,
                background: active ? ACCENT : 'rgba(255,255,255,0.05)',
                color: active ? '#0f1322' : INK,
                border: `1px solid ${active ? ACCENT : 'rgba(255,255,255,0.1)'}`,
                cursor: 'pointer', fontWeight: active ? 600 : 400,
              }}>{v.banner.name} · {v.guarantee.name} · {v.currency.name}</button>
            );
          })}
        </div>
      )}

      {/* THE RACE */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${ACCENT}33`,
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div style={{ fontSize: 11, letterSpacing: 0.2, textTransform: 'uppercase', color: '#a7b2d6', fontWeight: 600 }}>
            Floor race
          </div>
          <div style={{ fontSize: 11.5, color: '#a7b2d6' }}>
            Pity in <b style={{ color: INK }}>{pullsToHardPity}</b>
            <span style={{ margin: '0 8px', color: '#4d5778' }}>|</span>
            Step ★5 in <b style={{ color: INK }}>{pullsToStepFloor}</b>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FloorCard
            title="Step floor"
            value={`${step + 1}/${stepLen}`}
            pct={stepPct}
            color={STEP_COLOR}
            winning={stepWinsRace}
            hint={step === stepLen - 1 ? 'NEXT PULL · ★5' : `★5 at step ${stepLen}`}
          />
          <FloorCard
            title="Pity floor"
            value={`${state.pullsSinceFiveStar}/${state.hardPityAt}`}
            pct={pityPct}
            color={PITY_COLOR}
            winning={!stepWinsRace}
            hint={
              state.pullsSinceFiveStar >= state.softPityStart
                ? `SOFT PITY · +rate-up`
                : pullsToSoftPity > 0
                  ? `Soft at ${state.softPityStart}`
                  : 'Hard at ' + state.hardPityAt
            }
          />
        </div>

        <div style={{
          marginTop: 12, padding: '8px 12px',
          background: stepWinsRace ? `${STEP_COLOR}1a` : `${PITY_COLOR}1a`,
          border: `1px solid ${stepWinsRace ? STEP_COLOR : PITY_COLOR}55`,
          borderRadius: 8,
          fontSize: 12, color: INK,
          display: 'flex', gap: 8, alignItems: 'center',
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: stepWinsRace ? STEP_COLOR : PITY_COLOR,
            animation: 'sp-pulse 1.4s ease-in-out infinite',
          }} />
          <span style={{ fontWeight: 600, letterSpacing: 0.1 }}>
            {stepWinsRace ? 'STEP FLOOR WINS' : 'PITY FLOOR WINS'}
          </span>
          <span style={{ color: '#a7b2d6' }}>
            {stepWinsRace
              ? `Step cycle hits ★5 first — in ${pullsToStepFloor} pull${pullsToStepFloor === 1 ? '' : 's'}.`
              : `Pity hits first — ★5 guaranteed in ${pullsToHardPity} pull${pullsToHardPity === 1 ? '' : 's'}.`}
          </span>
        </div>

        {['pity_5050', 'pity_7030', 'radiance'].includes(combo.guarantee.id) && state.carryOver && (
          <div style={{ marginTop: 8, fontSize: 11.5, color: '#cbe6c5', background: 'rgba(140,200,140,0.08)', padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(140,200,140,0.25)' }}>
            Carry-over armed: your next ★5 is guaranteed featured.
          </div>
        )}
        {combo.guarantee.id === 'radiance' && state.radianceLossStreak > 0 && (
          <div style={{ marginTop: 6, fontSize: 11.5, color: '#e8d08c', background: 'rgba(232,184,74,0.08)', padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(232,184,74,0.25)' }}>
            Capturing Radiance: +{state.radianceLossStreak * 10}% rate-up on next ★5 roll.
          </div>
        )}
      </div>

      {/* Step dots */}
      <div style={{ marginBottom: 14, padding: 10, background: 'rgba(255,255,255,0.03)', border: `1px solid ${ACCENT}22`, borderRadius: 10 }}>
        <div style={{ fontSize: 10.5, letterSpacing: 0.2, textTransform: 'uppercase', color: '#a7b2d6', fontWeight: 600, marginBottom: 6 }}>
          Step cycle
        </div>
        <div style={{ display: 'flex', gap: 3 }}>
          {Array.from({ length: stepLen }).map((_, i) => {
            const isCurrent = i === step;
            const isPast = i < step;
            const isFloor = i === stepLen - 1;
            return (
              <div key={i} style={{
                flex: 1, height: 26,
                background: isFloor
                  ? (isPast ? '#5e4c8a' : STEP_COLOR)
                  : isCurrent ? 'rgba(140,164,229,0.25)' : isPast ? 'rgba(140,164,229,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isFloor ? STEP_COLOR : isCurrent ? STEP_COLOR : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10.5, fontWeight: 600,
                color: isFloor && !isPast ? '#0f1322' : isCurrent ? INK : '#7d89b0',
              }}>{i + 1}{isFloor ? '★' : ''}</div>
            );
          })}
        </div>
      </div>

      {featured.five.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10.5, letterSpacing: 0.15, textTransform: 'uppercase', color: '#a7b2d6', fontWeight: 600, marginBottom: 6 }}>Featured</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {featured.five.map(u => (
              <span key={u.id} style={{
                padding: '4px 10px', fontSize: 12, fontWeight: 600,
                background: `linear-gradient(90deg, ${u.color}, ${u.color}cc)`,
                color: '#0f1322', borderRadius: 999,
                boxShadow: `0 0 0 1px ${STEP_COLOR}66`,
              }}>★5 {u.name}</span>
            ))}
            {featured.four.map(u => (
              <span key={u.id} style={{
                padding: '3px 9px', fontSize: 11, color: '#d4c5f2',
                background: 'rgba(184,157,232,0.1)', borderRadius: 999,
                border: '1px solid rgba(184,157,232,0.3)',
              }}>★4 {u.name}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: 10, background: 'rgba(255,255,255,0.03)', border: `1px solid ${ACCENT}22`, borderRadius: 8, marginBottom: 12 }}>
        <StatusBar combo={combo} eng={eng} />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <button onClick={eng.pull1} disabled={!eng.canPull1} style={polishedBtn(false)}>Pull 1 · {eng.pullCost}</button>
        <button onClick={eng.pull10} disabled={!eng.canPull10} style={polishedBtn(true)}>
          Pull 10 · {(eng.pullCost * 10).toLocaleString()}
        </button>
        <button onClick={() => eng.addFunds()} style={polishedBtn(false, true)}>+ Funds</button>
        <button onClick={eng.reset} style={polishedBtn(false, true)}>Reset</button>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${ACCENT}22`,
        borderRadius: 12, padding: 14, minHeight: 140, position: 'relative',
      }}>
        {hasFive && <CelebrationFlash tier={5} accent={ACCENT} />}
        {!hasFive && hasFour && <CelebrationFlash tier={4} accent={ACCENT} />}
        {lastResults.length === 0 ? (
          <div style={{ padding: 22, textAlign: 'center', color: '#7d89b0', fontSize: 13 }}>
            Press Pull. Watch both counters; the one that fills first is your actual safety net.
          </div>
        ) : (
          <div key={eng.pullBurstKey} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px,1fr))', gap: 10 }}>
            {lastResults.map((r, i) => (
              <div key={i} style={{ animation: `sp-fade-up 0.35s ease-out ${i * 40}ms both` }}>
                <UnitCard result={r} delay={0} />
              </div>
            ))}
          </div>
        )}
      </div>

      {state.history.length > 0 && (
        <div style={{ marginTop: 12, padding: 10, background: 'rgba(255,255,255,0.03)', border: `1px solid ${ACCENT}22`, borderRadius: 8, fontSize: 11.5, color: '#a7b2d6' }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.1, fontWeight: 600, marginBottom: 5 }}>Recent · {state.history.length}</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {state.history.slice(-16).reverse().map((h, i) => (
              <span key={i} style={{
                padding: '2px 7px', fontSize: 10.5, borderRadius: 4,
                background: h.rarity === 5 ? `${STEP_COLOR}22` : h.rarity === 4 ? 'rgba(184,157,232,0.12)' : 'rgba(255,255,255,0.04)',
                color: h.rarity === 5 ? STEP_COLOR : h.rarity === 4 ? '#d4c5f2' : '#7d89b0',
                border: h.rarity >= 4 ? `1px solid ${h.rarity === 5 ? STEP_COLOR : PITY_COLOR}44` : '1px solid rgba(255,255,255,0.05)',
                fontWeight: h.rarity >= 4 ? 600 : 400,
              }}>★{h.rarity} {h.unit.name}{h.hardPity ? ' ·hard' : h.softPity ? ' ·soft' : ''}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FloorCard({ title, value, pct, color, winning, hint }: {
  title: string; value: string; pct: number; color: string; winning: boolean; hint: string;
}) {
  return (
    <div style={{
      padding: 12,
      background: winning ? `${color}14` : 'rgba(255,255,255,0.02)',
      border: `1px solid ${winning ? color : color + '33'}`,
      borderRadius: 10,
      transition: 'background 0.3s, border 0.3s',
      animation: winning ? 'sp-winner-bloom 2s ease-in-out infinite' : undefined,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontSize: 10.5, letterSpacing: 0.15, textTransform: 'uppercase', color: color, fontWeight: 700 }}>{title}</span>
        <span style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{value}</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: `linear-gradient(90deg, ${color}, #fff)`,
          backgroundSize: '200% 100%',
          animation: winning ? 'sp-shine 3s linear infinite' : undefined,
          transition: 'width 0.35s cubic-bezier(.22,1,.36,1)',
        }} />
      </div>
      <div style={{ marginTop: 6, fontSize: 10.5, color: '#a7b2d6', letterSpacing: 0.1 }}>{hint}</div>
    </div>
  );
}

function polishedBtn(primary: boolean, ghost = false): React.CSSProperties {
  if (primary) {
    return {
      padding: '9px 16px', fontSize: 13, fontWeight: 600, letterSpacing: 0.2,
      background: `linear-gradient(180deg, ${ACCENT}, ${DEEP})`,
      color: '#0f1322',
      border: `1px solid ${ACCENT}`,
      borderRadius: 8, cursor: 'pointer',
      boxShadow: `0 4px 14px -4px ${ACCENT}88`,
    };
  }
  if (ghost) {
    return {
      padding: '8px 14px', fontSize: 12.5,
      background: 'transparent', color: '#a7b2d6',
      border: '1px solid rgba(140,164,229,0.25)', borderRadius: 8, cursor: 'pointer',
    };
  }
  return {
    padding: '9px 14px', fontSize: 12.5,
    background: 'rgba(255,255,255,0.05)', color: INK,
    border: `1px solid ${ACCENT}55`, borderRadius: 8, cursor: 'pointer',
  };
}
