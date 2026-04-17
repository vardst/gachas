// HAND-CRAFTED — Step-Up + Batch floor.
// Vibe: honest, compact, utilitarian. Two progress bars stacked: step cycle + batch floor.
// Clean spacing, no ornament. The step floor + batch floor work together quietly.
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { useGachaEngine } from '../../lib/useGachaEngine';
import { featuredFor } from '../../data/roster';
import { UnitCard, StatusBar, CelebrationFlash } from '../../lib/GachaFrame';

const ACCENT = '#a0d468';
const SHADOW = '#6fa83d';
const INK = '#142014';
const PAPER = '#f6f9f1';

const KEYFRAMES = `
@keyframes sub-reveal { 0% { opacity: 0; transform: translateY(6px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes sub-pulse-soft { 0%, 100% { opacity: 0.75; } 50% { opacity: 1; } }
`;

export default function StepUpBatch({ slug }: { slug: string }) {
  const variants = combosForType('step_up-batch');
  const navigate = useNavigate();
  const combo = useMemo(() => variants.find(c => c.slug === slug) ?? variants[0], [variants, slug]);
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;

  const featured = featuredFor(combo.banner.id);
  const step = state.stepIndex;
  const stepLen = state.stepLength;
  const stepProgress = (step / stepLen) * 100;
  const batchProgress = (state.pullsSinceBatchFloor / 10) * 100;
  const pullsToBatchFloor = 10 - state.pullsSinceBatchFloor;
  const pullsToStepReset = stepLen - step;

  const hasFive = lastResults.some(r => r.rarity === 5);
  const hasFour = lastResults.some(r => r.rarity === 4);

  return (
    <div className="page" style={{
      background: PAPER,
      minHeight: '100vh',
      padding: 20,
      color: INK,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      borderRadius: 8,
    }}>
      <style>{KEYFRAMES}</style>

      <Link to="/" style={{ color: '#5a6a5a', fontSize: 12.5, textDecoration: 'none', display: 'inline-block', marginBottom: 12 }}>← Back to dashboard</Link>

      <header style={{ marginBottom: 18, paddingBottom: 12, borderBottom: `2px solid ${ACCENT}` }}>
        <div style={{ fontSize: 11, letterSpacing: 0.15, textTransform: 'uppercase', color: SHADOW, fontWeight: 600 }}>
          Step-Up × Batch Floor · utilitarian build
        </div>
        <h1 style={{ margin: '2px 0 0', fontSize: 26, fontWeight: 600, color: INK, letterSpacing: -0.3 }}>
          Step Cycle + Tenth-Pull Safety
        </h1>
        <div style={{ fontSize: 12.5, color: '#4a5a4a', marginTop: 4, lineHeight: 1.5 }}>
          Two mitigation systems running in parallel: the step cycle guarantees a 5★ on the last pull, and the batch floor guarantees a 4★+ every tenth pull. Simple, honest, bounded.
        </div>
      </header>

      {variants.length > 1 && (
        <div style={{ marginBottom: 14, padding: 10, background: '#fff', border: `1px solid ${ACCENT}66`, borderRadius: 6, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.08, color: SHADOW, fontWeight: 600 }}>Variant</span>
          {variants.map(v => {
            const active = v.slug === combo.slug;
            return (
              <button key={v.slug} onClick={() => navigate(`/play/${v.slug}`)} style={{
                padding: '4px 10px', fontSize: 11.5,
                background: active ? ACCENT : '#fff',
                color: active ? '#0f1a0f' : INK,
                border: `1px solid ${active ? SHADOW : '#c8d6bc'}`,
                borderRadius: 4, cursor: 'pointer', fontWeight: active ? 600 : 400,
              }}>{v.banner.name} · {v.currency.name}</button>
            );
          })}
        </div>
      )}

      <div style={{ background: '#fff', border: `1px solid #cfe0ba`, borderRadius: 8, padding: 16, marginBottom: 14 }}>
        <ProgressRow
          label="Step cycle"
          sub={`Step ${step + 1}/${stepLen} · ${pullsToStepReset} to cycle reset`}
          pct={stepProgress}
          color={ACCENT}
          dark={SHADOW}
          accent={step === stepLen - 1}
          hint={step === stepLen - 1 ? 'NEXT PULL · guaranteed ★5' : `Step ${stepLen} guarantees ★5`}
        />
        <div style={{ height: 10 }} />
        <ProgressRow
          label="Batch floor"
          sub={`${state.pullsSinceBatchFloor}/10 · ${pullsToBatchFloor} to next ★4+ floor`}
          pct={batchProgress}
          color="#7fbdd4"
          dark="#3d7e96"
          accent={state.pullsSinceBatchFloor >= 9}
          hint={state.pullsSinceBatchFloor >= 9 ? 'NEXT PULL · guaranteed ★4+' : 'Every 10th pull ★4+'}
        />

        {/* Step tick-row */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.1, color: SHADOW, fontWeight: 600, marginBottom: 5 }}>
            Cycle map
          </div>
          <div style={{ display: 'flex', gap: 3 }}>
            {Array.from({ length: stepLen }).map((_, i) => {
              const isCurrent = i === step;
              const isPast = i < step;
              const isFloor = i === stepLen - 1;
              return (
                <div key={i} style={{
                  flex: 1, height: 22,
                  background: isFloor ? (isPast ? '#c9e2a8' : ACCENT) : isPast ? '#d8e5c8' : isCurrent ? '#fff' : '#eef4e4',
                  border: `1px solid ${isFloor ? SHADOW : isCurrent ? SHADOW : '#cfe0ba'}`,
                  borderRadius: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700,
                  color: isFloor ? INK : isPast ? '#6e8060' : INK,
                  boxShadow: isCurrent ? `inset 0 0 0 2px ${SHADOW}` : undefined,
                }}>{i + 1}{isFloor ? '★' : ''}</div>
              );
            })}
          </div>
        </div>
      </div>

      {featured.five.length > 0 && (
        <div style={{ marginBottom: 12, padding: 10, background: '#fff', border: `1px solid #cfe0ba`, borderRadius: 6 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.08, color: SHADOW, fontWeight: 600, marginBottom: 6 }}>Featured</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {featured.five.map(u => (
              <span key={u.id} style={{
                padding: '4px 10px', fontSize: 11.5, fontWeight: 600,
                background: u.color, color: INK, borderRadius: 4,
                border: '1px solid rgba(0,0,0,0.1)',
              }}>★5 {u.name}</span>
            ))}
            {featured.four.map(u => (
              <span key={u.id} style={{
                padding: '3px 9px', fontSize: 11, color: '#4a5a4a',
                background: '#eef4e4', borderRadius: 4,
                border: '1px solid #cfe0ba',
              }}>★4 {u.name}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: 10, background: '#fff', border: `1px solid #cfe0ba`, borderRadius: 6, marginBottom: 12 }}>
        <StatusBar combo={combo} eng={eng} />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <button onClick={eng.pull1} disabled={!eng.canPull1} style={utilBtn(false)}>Pull 1 · {eng.pullCost}</button>
        <button onClick={eng.pull10} disabled={!eng.canPull10} style={utilBtn(true)}>
          Pull 10 · {(eng.pullCost * 10).toLocaleString()}
        </button>
        <button onClick={() => eng.addFunds()} style={utilBtn(false, true)}>+ Funds</button>
        <button onClick={eng.reset} style={utilBtn(false, true)}>Reset</button>
      </div>

      <div style={{ background: '#fff', border: `1px solid #cfe0ba`, borderRadius: 8, padding: 14, minHeight: 140, position: 'relative' }}>
        {hasFive && <CelebrationFlash tier={5} accent={ACCENT} />}
        {!hasFive && hasFour && <CelebrationFlash tier={4} accent={ACCENT} />}
        {lastResults.length === 0 ? (
          <div style={{ padding: 22, textAlign: 'center', color: '#6e8060', fontSize: 13 }}>
            Pull to advance. Batch floor fires at 10; step floor fires at {stepLen}.
          </div>
        ) : (
          <div key={eng.pullBurstKey} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px,1fr))', gap: 8 }}>
            {lastResults.map((r, i) => (
              <div key={i} style={{ animation: `sub-reveal 0.3s ease-out ${i * 40}ms both` }}>
                <UnitCard result={r} delay={0} />
              </div>
            ))}
          </div>
        )}
      </div>

      {state.history.length > 0 && (
        <div style={{ marginTop: 12, padding: 10, background: '#fff', border: `1px solid #cfe0ba`, borderRadius: 6 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.08, color: SHADOW, fontWeight: 600, marginBottom: 6 }}>
            Recent · {state.history.length}
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {state.history.slice(-16).reverse().map((h, i) => (
              <span key={i} style={{
                padding: '2px 7px', fontSize: 10.5, borderRadius: 3,
                background: h.rarity === 5 ? `${ACCENT}44` : h.rarity === 4 ? '#f0e6c0' : '#eef4e4',
                color: h.rarity === 5 ? '#365d14' : h.rarity === 4 ? '#6e5a20' : '#5a6a5a',
                border: h.rarity >= 4 ? `1px solid ${SHADOW}` : '1px solid #cfe0ba',
                fontWeight: h.rarity >= 4 ? 600 : 400,
              }}>★{h.rarity} {h.unit.name}{h.batchFloor ? ' ·B' : ''}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressRow({ label, sub, pct, color, dark, accent, hint }: {
  label: string; sub: string; pct: number; color: string; dark: string; accent: boolean; hint: string;
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.1, color: dark }}>{label}</span>
          <span style={{ fontSize: 11, color: '#6e8060', marginLeft: 8 }}>{sub}</span>
        </div>
        <span style={{
          fontSize: 10.5, fontWeight: 700, letterSpacing: 0.1, textTransform: 'uppercase',
          color: accent ? dark : '#8a9a7f',
          animation: accent ? 'sub-pulse-soft 1.5s ease-in-out infinite' : undefined,
        }}>{hint}</span>
      </div>
      <div style={{ height: 12, background: '#e8efdd', borderRadius: 3, overflow: 'hidden', border: '1px solid #cfe0ba' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color} 0%, ${dark} 100%)`,
          transition: 'width 0.4s cubic-bezier(.22,1,.36,1)',
        }} />
      </div>
    </div>
  );
}

function utilBtn(primary: boolean, ghost = false): React.CSSProperties {
  if (primary) {
    return {
      padding: '9px 16px', fontSize: 13, fontWeight: 600,
      background: ACCENT, color: '#0f1a0f',
      border: `1px solid ${SHADOW}`, borderRadius: 4,
      cursor: 'pointer', letterSpacing: 0.1,
    };
  }
  if (ghost) {
    return {
      padding: '8px 14px', fontSize: 12.5,
      background: 'transparent', color: '#4a5a4a',
      border: '1px solid #c8d6bc', borderRadius: 4, cursor: 'pointer',
    };
  }
  return {
    padding: '9px 14px', fontSize: 12.5, fontWeight: 500,
    background: '#fff', color: INK,
    border: '1px solid #9bb583', borderRadius: 4, cursor: 'pointer',
  };
}
