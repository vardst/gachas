// HAND-CRAFTED — Step-Up + Pure RNG.
// Vibe: old-school Japanese mobile. Heavy UI chrome, thick black outlines.
// Step rewards are the ONLY mitigation — lean into the ladder hard.
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { useGachaEngine } from '../../lib/useGachaEngine';
import { featuredFor } from '../../data/roster';
import { UnitCard, StatusBar, CelebrationFlash } from '../../lib/GachaFrame';

const ACCENT = '#e36b6b';
const INK = '#0c0a09';
const PARCHMENT = '#f4ecd8';
const GOLD = '#c8a14a';

const KEYFRAMES = `
@keyframes sup-step-glow { 0%, 100% { box-shadow: 0 0 0 2px ${ACCENT}, 0 0 16px ${ACCENT}88, inset 0 0 8px ${ACCENT}55; } 50% { box-shadow: 0 0 0 3px ${ACCENT}, 0 0 24px ${ACCENT}cc, inset 0 0 12px ${ACCENT}99; } }
@keyframes sup-stamp-in { 0% { transform: scale(1.4) rotate(-6deg); opacity: 0; } 60% { opacity: 1; } 100% { transform: scale(1) rotate(-6deg); opacity: 1; } }
@keyframes sup-reveal { 0% { transform: translateY(12px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
`;

const STEP_REWARDS: { step: number; label: string; tier: 'normal' | 'four' | 'five' }[] = [
  { step: 1, label: 'Normal 10-pull', tier: 'normal' },
  { step: 2, label: 'Normal 10-pull', tier: 'normal' },
  { step: 3, label: 'GUARANTEED ★4 or higher', tier: 'four' },
  { step: 4, label: 'Normal 10-pull', tier: 'normal' },
  { step: 5, label: 'GUARANTEED ★5 drop', tier: 'five' },
  { step: 6, label: 'Normal 10-pull', tier: 'normal' },
  { step: 7, label: 'GUARANTEED ★4 or higher', tier: 'four' },
  { step: 8, label: 'Normal 10-pull', tier: 'normal' },
  { step: 9, label: 'GUARANTEED ★4 or higher', tier: 'four' },
  { step: 10, label: 'FINAL ★5 CONFIRMED', tier: 'five' },
];

export default function StepUpPure({ slug }: { slug: string }) {
  const variants = combosForType('step_up-pure');
  const navigate = useNavigate();
  const combo = useMemo(() => variants.find(c => c.slug === slug) ?? variants[0], [variants, slug]);
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;

  const featured = featuredFor(combo.banner.id);
  const currentStep = state.stepIndex; // 0-based
  const hasFive = lastResults.some(r => r.rarity === 5);
  const hasFour = lastResults.some(r => r.rarity === 4);

  return (
    <div className="page" style={{
      background: `repeating-linear-gradient(135deg, ${PARCHMENT} 0 18px, #ece2c5 18px 20px)`,
      minHeight: '100vh',
      borderRadius: 6,
      padding: 20,
      color: INK,
      fontFamily: 'Georgia, "Noto Serif JP", serif',
    }}>
      <style>{KEYFRAMES}</style>

      <Link to="/" style={{ color: INK, fontSize: 12, textDecoration: 'underline', display: 'inline-block', marginBottom: 12 }}>
        ← Back to dashboard
      </Link>

      <header style={{
        border: `4px double ${INK}`,
        padding: '14px 18px',
        background: '#fffbef',
        marginBottom: 16,
        position: 'relative',
      }}>
        <div style={{ fontSize: 10.5, letterSpacing: 0.2, textTransform: 'uppercase', color: '#6b4a25' }}>
          Mobile Gacha · 2012-era chrome
        </div>
        <h1 style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 900, letterSpacing: 2, color: INK, textShadow: `2px 2px 0 ${ACCENT}` }}>
          STEP-UP GASHA
        </h1>
        <div style={{ fontSize: 12, color: '#4a3620', marginTop: 3 }}>
          Step-Up · Pure RNG · No pity. No spark. The ladder is your only safety.
        </div>
        <div aria-hidden style={{
          position: 'absolute', right: 14, top: 10,
          padding: '4px 10px',
          border: `2px solid ${ACCENT}`,
          color: ACCENT, fontSize: 10, letterSpacing: 0.3,
          fontWeight: 900, textTransform: 'uppercase',
          animation: 'sup-stamp-in 0.6s ease-out',
          background: '#fffbef',
        }}>
          No-Pity Model
        </div>
      </header>

      {/* Variant picker */}
      {variants.length > 1 && (
        <div style={{ border: `2px solid ${INK}`, padding: 8, background: '#fffbef', marginBottom: 14, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.1, textTransform: 'uppercase' }}>Banner / Currency</span>
          {variants.map(v => {
            const active = v.slug === combo.slug;
            return (
              <button key={v.slug} onClick={() => navigate(`/play/${v.slug}`)} style={{
                padding: '4px 9px', fontSize: 11, cursor: 'pointer',
                background: active ? ACCENT : '#fff7e2',
                color: active ? '#fff' : INK,
                border: `2px solid ${INK}`, fontWeight: 700,
              }}>{v.banner.name} · {v.currency.name}</button>
            );
          })}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 14, alignItems: 'start' }}>
        {/* LEFT: main pull area */}
        <div>
          {/* WHAT YOU GET callout */}
          <div style={{
            border: `4px solid ${INK}`,
            background: '#fff',
            marginBottom: 14,
            boxShadow: `6px 6px 0 ${INK}`,
          }}>
            <div style={{
              background: INK, color: PARCHMENT, padding: '6px 12px',
              fontWeight: 900, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase',
            }}>
              What You Get · Step {currentStep + 1} of {state.stepLength}
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ fontSize: 11, marginBottom: 8, color: '#6b4a25', letterSpacing: 0.1 }}>
                This is the step you are ABOUT to draw on your next 10-pull.
              </div>
              <div style={{
                padding: '12px 14px',
                border: `3px solid ${ACCENT}`,
                background: `${ACCENT}14`,
                fontWeight: 900, fontSize: 18, letterSpacing: 0.5,
                color: INK,
              }}>
                {STEP_REWARDS[currentStep]?.label ?? '???'}
              </div>
            </div>
          </div>

          {/* Featured strip */}
          {featured.five.length > 0 && (
            <div style={{ border: `2px solid ${INK}`, background: '#fffbef', padding: 10, marginBottom: 14 }}>
              <div style={{ fontSize: 10.5, letterSpacing: 0.1, textTransform: 'uppercase', marginBottom: 6, fontWeight: 700 }}>
                Pickup Characters
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {featured.five.map(u => (
                  <div key={u.id} style={{
                    padding: '4px 10px', border: `2px solid ${INK}`, background: u.color,
                    color: INK, fontWeight: 700, fontSize: 12,
                  }}>★5 {u.name}</div>
                ))}
                {featured.four.map(u => (
                  <div key={u.id} style={{
                    padding: '3px 9px', border: `2px solid ${INK}`, background: '#fff',
                    color: INK, fontSize: 11,
                  }}>★4 {u.name}</div>
                ))}
              </div>
            </div>
          )}

          {/* Status */}
          <div style={{ border: `2px solid ${INK}`, background: '#fffbef', padding: 8, marginBottom: 12 }}>
            <StatusBar combo={combo} eng={eng} />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <button onClick={eng.pull1} disabled={!eng.canPull1} style={chromeBtn(false)}>Pull 1 · {eng.pullCost}</button>
            <button onClick={eng.pull10} disabled={!eng.canPull10} style={chromeBtn(true)}>
              STEP {currentStep + 1} · 10-PULL · {(eng.pullCost * 10).toLocaleString()}
            </button>
            <button onClick={() => eng.addFunds()} style={chromeBtn(false, true)}>+ Funds</button>
            <button onClick={eng.reset} style={chromeBtn(false, true)}>Reset</button>
          </div>

          {/* Results */}
          <div style={{ border: `3px solid ${INK}`, background: '#fff', padding: 14, minHeight: 140, position: 'relative' }}>
            {hasFive && <CelebrationFlash tier={5} accent={ACCENT} />}
            {!hasFive && hasFour && <CelebrationFlash tier={4} accent={ACCENT} />}
            {lastResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 22, color: '#6b4a25', fontSize: 13 }}>
                Press STEP {currentStep + 1} to draw. Step floor is your only guarantee.
              </div>
            ) : (
              <div key={eng.pullBurstKey} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px,1fr))', gap: 8 }}>
                {lastResults.map((r, i) => (
                  <div key={i} style={{ animation: `sup-reveal 0.35s ease-out ${i * 45}ms both` }}>
                    <UnitCard result={r} delay={0} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: the ladder */}
        <div style={{ border: `3px solid ${INK}`, background: '#fffbef', padding: 10, boxShadow: `4px 4px 0 ${INK}` }}>
          <div style={{
            background: INK, color: PARCHMENT, padding: '5px 10px',
            fontSize: 11, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase',
            marginBottom: 10,
          }}>
            The Ladder
          </div>
          <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
            {STEP_REWARDS.map((s, i) => {
              const isCurrent = i === currentStep;
              const isPast = i < currentStep;
              const tierColor = s.tier === 'five' ? ACCENT : s.tier === 'four' ? GOLD : '#b5a47d';
              return (
                <li key={s.step} style={{
                  padding: '6px 8px',
                  border: `2px solid ${INK}`,
                  background: isCurrent ? '#fff' : isPast ? '#e6dcc0' : '#fffbef',
                  opacity: isPast ? 0.55 : 1,
                  position: 'relative',
                  animation: isCurrent ? 'sup-step-glow 1.6s ease-in-out infinite' : undefined,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      background: tierColor, color: INK, fontSize: 11, fontWeight: 900,
                      border: `2px solid ${INK}`,
                    }}>{s.step}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: INK, letterSpacing: 0.05 }}>
                      {s.label}
                    </span>
                  </div>
                  {isCurrent && (
                    <div style={{ position: 'absolute', right: -8, top: '50%', transform: 'translateY(-50%)', background: ACCENT, color: '#fff', fontSize: 9, padding: '2px 4px', fontWeight: 900, letterSpacing: 0.2 }}>HERE</div>
                  )}
                </li>
              );
            })}
          </ol>

          <div style={{ marginTop: 10, fontSize: 11, color: '#6b4a25', lineHeight: 1.5, borderTop: `2px dashed ${INK}`, paddingTop: 8 }}>
            No pity counter. No spark ticket. The cycle resets after step 10. The guarantee is the ladder itself — miss a step, that guarantee is gone for this cycle.
          </div>

          {/* Mechanics mini-panel */}
          <div style={{ marginTop: 10, padding: 8, background: '#fff', border: `2px solid ${INK}`, fontSize: 10.5 }}>
            <div style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.15, marginBottom: 4 }}>Mechanics</div>
            <div>Dist: {combo.dist.name}</div>
            <div>Banner: {combo.banner.name}</div>
            <div>Guarantee: {combo.guarantee.name}</div>
            <div>Currency: {combo.currency.name}</div>
            <div style={{ marginTop: 4 }}>Tag: <span style={{ color: ACCENT, fontWeight: 900 }}>{combo.tag.text}</span></div>
          </div>

          {/* Recent history */}
          {state.history.length > 0 && (
            <div style={{ marginTop: 10, padding: 8, background: '#fff', border: `2px solid ${INK}`, fontSize: 10.5 }}>
              <div style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.15, marginBottom: 4 }}>Recent · {state.history.length}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {state.history.slice(-10).reverse().map((h, i) => (
                  <div key={i} style={{ color: h.rarity === 5 ? ACCENT : h.rarity === 4 ? '#8a6f1e' : '#4a3620', fontWeight: h.rarity >= 4 ? 700 : 400 }}>
                    ★{h.rarity} {h.unit.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function chromeBtn(primary: boolean, ghost = false): React.CSSProperties {
  if (primary) {
    return {
      padding: '10px 14px',
      fontSize: 13, fontWeight: 900, letterSpacing: 0.8,
      background: `linear-gradient(180deg, #ff8888 0%, ${ACCENT} 50%, #b84848 100%)`,
      color: '#fff',
      border: `3px solid ${INK}`,
      boxShadow: `3px 3px 0 ${INK}`,
      cursor: 'pointer',
      textTransform: 'uppercase',
      fontFamily: 'inherit',
    };
  }
  if (ghost) {
    return {
      padding: '8px 12px', fontSize: 12, fontWeight: 700,
      background: '#fffbef', color: INK,
      border: `2px solid ${INK}`, boxShadow: `2px 2px 0 ${INK}`,
      cursor: 'pointer', fontFamily: 'inherit',
    };
  }
  return {
    padding: '10px 14px', fontSize: 12.5, fontWeight: 800,
    background: '#fff7e2', color: INK,
    border: `3px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}`,
    cursor: 'pointer', fontFamily: 'inherit',
  };
}
