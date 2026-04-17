// HAND-CRAFTED — Project Sekai step-up flavor.
// Focus: 10-beat step cycle strip with per-step rewards; musical notes on pull.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { useGachaEngine } from '../../lib/useGachaEngine';
import { featuredFor } from '../../data/roster';
import { UnitCard } from '../../lib/GachaFrame';

const PINK = '#FF8FB1';
const CYAN = '#4ED9D2';
const VIOLET = '#B48CF2';

interface StepReward {
  label: string;
  detail: string;
  major?: boolean;
  hero?: boolean;
}

const STEP_REWARDS: StepReward[] = [
  { label: '★3+', detail: 'Standard' },
  { label: '★3+', detail: 'Standard' },
  { label: '★4+', detail: 'Guaranteed 4★', major: true },
  { label: '★3+', detail: 'Bonus crystals' },
  { label: '★5 FEAT', detail: 'Guaranteed 5★ featured', hero: true },
  { label: '★3+', detail: 'Standard' },
  { label: '★4+', detail: 'Guaranteed 4★', major: true },
  { label: '★3+', detail: '2× crystals' },
  { label: '★4+', detail: 'Guaranteed 4★', major: true },
  { label: '★5', detail: 'Guaranteed 5★', hero: true },
];

const KEYFRAMES = `
@keyframes sk-note-rise { 0% { transform: translateY(0) rotate(0deg); opacity: 0; } 15% { opacity: 1; } 100% { transform: translateY(-180px) rotate(var(--rot, 20deg)); opacity: 0; } }
@keyframes sk-petal { 0% { transform: translate(0, -20px) rotate(0deg); opacity: 0; } 10% { opacity: 0.9; } 100% { transform: translate(var(--tx, 60px), 280px) rotate(540deg); opacity: 0; } }
@keyframes sk-pulse-glow { 0%, 100% { box-shadow: 0 0 0 2px ${PINK}, 0 0 32px -4px ${PINK}; transform: scale(1); } 50% { box-shadow: 0 0 0 3px ${PINK}, 0 0 52px -2px ${PINK}; transform: scale(1.04); } }
@keyframes sk-rainbow-strip { 0% { background-position: 0% 50%; } 100% { background-position: 300% 50%; } }
@keyframes sk-confetti-fall { 0% { transform: translate(0, -30px) rotate(0deg); opacity: 1; } 100% { transform: translate(var(--tx, 30px), 320px) rotate(720deg); opacity: 0; } }
@keyframes sk-reveal-pop { 0% { transform: translateY(20px) scale(0.85); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
@keyframes sk-reveal-pulse { 0%, 100% { filter: drop-shadow(0 0 12px ${PINK}); } 50% { filter: drop-shadow(0 0 24px ${CYAN}); } }
@keyframes sk-beat-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
@keyframes sk-cta-bounce { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-2px) scale(1.02); } }
`;

export default function SekaiStepUp({ slug }: { slug: string }) {
  const variants = combosForType('sekai-step-up');
  const navigate = useNavigate();
  const combo = useMemo(() => variants.find(c => c.slug === slug) ?? variants[0], [variants, slug]);
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;

  const featured = featuredFor(combo.banner.id);
  const hasFive = lastResults.some(r => r.rarity === 5);

  // musical note particles triggered on pull
  const [notes, setNotes] = useState<Array<{ id: number; glyph: string; left: number; color: string; rot: number; delay: number }>>([]);
  const noteIdRef = useRef(0);

  useEffect(() => {
    if (eng.pullBurstKey === 0) return;
    const glyphs = ['♪', '♫', '♬', '♩', '♭', '♯'];
    const colors = [PINK, CYAN, VIOLET, '#FFE76B'];
    const newNotes = Array.from({ length: 14 }, () => ({
      id: noteIdRef.current++,
      glyph: glyphs[Math.floor(Math.random() * glyphs.length)],
      left: 10 + Math.random() * 80,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: (Math.random() - 0.5) * 80,
      delay: Math.random() * 350,
    }));
    setNotes(n => [...n, ...newNotes]);
    const t = setTimeout(() => setNotes(n => n.slice(newNotes.length)), 2000);
    return () => clearTimeout(t);
  }, [eng.pullBurstKey]);

  // confetti + petals during 5* celebration
  const [celebrating, setCelebrating] = useState(false);
  useEffect(() => {
    if (hasFive) {
      setCelebrating(true);
      const t = setTimeout(() => setCelebrating(false), 2200);
      return () => clearTimeout(t);
    }
  }, [eng.pullBurstKey, hasFive]);

  const confetti = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    tx: (Math.random() - 0.5) * 200,
    color: [PINK, CYAN, VIOLET, '#FFE76B', '#FFF'][Math.floor(Math.random() * 5)],
    delay: Math.random() * 400,
    size: 6 + Math.random() * 8,
  })), [eng.pullBurstKey]);

  const onBigStep = state.stepIndex === 4; // step 5 (0-indexed)

  return (
    <div className="page" style={{
      background: `
        radial-gradient(ellipse at 15% 10%, rgba(255,143,177,0.35) 0%, transparent 50%),
        radial-gradient(ellipse at 85% 20%, rgba(78,217,210,0.28) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 100%, rgba(180,140,242,0.3) 0%, transparent 55%),
        linear-gradient(180deg, #2a1635 0%, #3a1e45 50%, #2a1a3f 100%)
      `,
      minHeight: '100vh',
      borderRadius: 16,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{KEYFRAMES}</style>

      <div style={{ position: 'relative', zIndex: 3 }}>
        <Link to="/" style={{ color: '#f7d0e0', fontSize: 13, display: 'inline-block', marginBottom: 14, opacity: 0.85 }}>← Back to dashboard</Link>

        <header style={{ marginBottom: 20, position: 'relative' }}>
          {/* rainbow accent strip */}
          <div aria-hidden style={{
            height: 3, borderRadius: 3, marginBottom: 10, width: 120,
            background: `linear-gradient(90deg, ${PINK}, ${CYAN}, ${VIOLET}, ${PINK})`,
            backgroundSize: '300% 100%',
            animation: 'sk-rainbow-strip 4s linear infinite',
          }} />
          <div style={{ fontSize: 11, color: '#f7d0e0', letterSpacing: 0.2, textTransform: 'uppercase', marginBottom: 2 }}>Step-Up Gacha · Limited Banner</div>
          <h1 style={{ margin: 0, fontSize: 36, fontWeight: 700, color: '#fff', letterSpacing: -0.5, textShadow: `0 0 20px ${PINK}aa` }}>
            <span style={{ color: PINK }}>COLORFUL</span> <span style={{ color: CYAN }}>STAGE</span> <span style={{ color: VIOLET }}>★</span>
          </h1>
          <p style={{ margin: '4px 0 0', color: '#f7d0e0', fontSize: 13 }}>
            Project Sekai · 10-step cycle · each step escalates the guarantee
          </p>
        </header>

        {/* Variant picker */}
        {variants.length > 1 && (
          <div style={{ marginBottom: 16, padding: 10, background: 'rgba(0,0,0,0.3)', borderRadius: 12, border: `1px solid ${PINK}66`, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10.5, letterSpacing: 0.1, textTransform: 'uppercase', color: '#f7d0e0' }}>Banner Mix</span>
            {variants.map(v => {
              const active = v.slug === combo.slug;
              return (
                <button key={v.slug} onClick={() => navigate(`/play/${v.slug}`)} style={{
                  padding: '5px 12px', fontSize: 12, fontWeight: 600, borderRadius: 999, cursor: 'pointer',
                  background: active ? `linear-gradient(90deg, ${PINK}, ${VIOLET})` : 'rgba(255,255,255,0.08)',
                  color: active ? '#fff' : '#f7d0e0',
                  border: `1px solid ${active ? 'transparent' : PINK + '66'}`,
                }}>{v.banner.name} · {v.currency.name}</button>
              );
            })}
          </div>
        )}

        {/* THE HERO — Step Cycle strip */}
        <div style={{
          padding: 18, marginBottom: 18,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.2))',
          borderRadius: 14, border: `1px solid ${PINK}55`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10.5, color: '#f7d0e0', letterSpacing: 0.15, textTransform: 'uppercase' }}>Step Cycle · 10 beats</div>
              <div style={{ fontSize: 22, color: '#fff', fontWeight: 700, marginTop: 2 }}>
                Step {state.stepIndex + 1} <span style={{ color: '#f7d0e0', fontSize: 13, fontWeight: 400 }}>of {state.stepLength}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 11.5, color: '#f7d0e0' }}>
              <div><span style={{ color: PINK, fontWeight: 700 }}>Step 3</span> · 4★ guarantee</div>
              <div><span style={{ color: CYAN, fontWeight: 700 }}>Step 5</span> · 5★ featured</div>
            </div>
          </div>

          {/* Beats strip */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STEP_REWARDS.length}, 1fr)`, gap: 6 }}>
            {STEP_REWARDS.map((r, i) => {
              const isCurrent = i === state.stepIndex;
              const isDone = i < state.stepIndex;
              const base = r.hero ? CYAN : r.major ? PINK : 'rgba(255,255,255,0.08)';
              return (
                <div key={i} style={{
                  padding: '10px 4px',
                  background: isCurrent
                    ? `linear-gradient(180deg, ${r.hero ? CYAN : PINK}, ${r.hero ? '#27a39d' : '#c96186'})`
                    : isDone ? 'rgba(255,255,255,0.12)' : `${base}${r.major || r.hero ? 'dd' : ''}`,
                  borderRadius: 8,
                  border: `1.5px solid ${isCurrent ? '#fff' : isDone ? 'rgba(255,255,255,0.2)' : r.hero ? CYAN : r.major ? PINK : 'rgba(255,255,255,0.1)'}`,
                  textAlign: 'center',
                  opacity: isDone ? 0.55 : 1,
                  position: 'relative',
                  ...(isCurrent ? { animation: 'sk-pulse-glow 1.6s ease-in-out infinite' } : {}),
                }}>
                  <div style={{ fontSize: 10, color: isCurrent ? 'rgba(255,255,255,0.85)' : '#f7d0e0', letterSpacing: 0.05, marginBottom: 2 }}>
                    {i + 1}
                  </div>
                  <div style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: isCurrent ? '#fff' : isDone ? 'rgba(255,255,255,0.6)' : r.hero ? '#fff' : r.major ? '#fff' : '#dcd0e8',
                    letterSpacing: 0.02,
                  }}>{r.label}</div>
                </div>
              );
            })}
          </div>

          {/* Per-step detail */}
          <div style={{ marginTop: 12, padding: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: '#f7d0e0', letterSpacing: 0.1, textTransform: 'uppercase' }}>Next pull-10 reward</div>
              <div style={{ fontSize: 15, color: '#fff', fontWeight: 600 }}>
                {STEP_REWARDS[state.stepIndex].label} · {STEP_REWARDS[state.stepIndex].detail}
              </div>
            </div>
            {onBigStep && (
              <div style={{
                padding: '6px 14px',
                background: `linear-gradient(90deg, ${CYAN}, ${PINK})`,
                color: '#0f0e13', borderRadius: 20, fontSize: 12.5, fontWeight: 700,
                letterSpacing: 0.06,
                animation: 'sk-cta-bounce 1.2s ease-in-out infinite',
                textTransform: 'uppercase',
              }}>
                ★ COMMIT FOR THE 5★ ★
              </div>
            )}
          </div>

          <div style={{ marginTop: 10, fontSize: 11.5, color: '#dcd0e8', lineHeight: 1.45 }}>
            Step 3 guarantees a 4★. Step 5 guarantees a 5★ featured. The reveal moment is the dopamine.
          </div>
        </div>

        {/* Featured cards */}
        {featured.five.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.12, color: '#f7d0e0', marginBottom: 6 }}>Now Performing</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {featured.five.map(u => (
                <div key={u.id} style={{
                  padding: '6px 14px',
                  background: `linear-gradient(90deg, ${u.color}, ${PINK})`,
                  color: '#1a0e20', fontWeight: 700, fontSize: 12.5, borderRadius: 20,
                  boxShadow: `0 4px 14px -4px ${PINK}`,
                }}>★5 {u.name}</div>
              ))}
              {featured.four.map(u => (
                <div key={u.id} style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 11.5, borderRadius: 20, border: `1px solid ${CYAN}66` }}>★4 {u.name}</div>
              ))}
            </div>
          </div>
        )}

        {/* Status row */}
        <div style={{ padding: 10, background: 'rgba(0,0,0,0.35)', borderRadius: 10, border: `1px solid ${PINK}33`, marginBottom: 14, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Stat k="Crystals" v={state.freeCurrency.toLocaleString()} color={PINK} />
          {combo.currency.id === 'dual' && <Stat k="Paid" v={state.paidCurrency.toString()} />}
          {combo.currency.id === 'tickets' && <Stat k="Tickets" v={state.tickets.toString()} />}
          <Stat k="Pulls" v={state.totalPulls.toString()} />
          <Stat k="★5" v={state.fiveStarCount.toString()} color={CYAN} />
          <Stat k="Featured" v={state.featuredObtained.toString()} color={VIOLET} />
          <Stat k="Spark" v={`${state.sparkProgress}/${state.sparkThreshold}`} />
        </div>

        {/* Pull controls */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
          <button onClick={eng.pull1} disabled={!eng.canPull1} style={rhythmBtn(false)}>
            Solo Pull · {eng.pullCost}
          </button>
          <button onClick={eng.pull10} disabled={!eng.canPull10} style={rhythmBtn(true, onBigStep)}>
            10-Pull Encore · {(eng.pullCost * 10).toLocaleString()}
          </button>
          <button onClick={eng.spark} disabled={!eng.canSpark} style={rhythmBtn(false, false, false, true)}>
            Spark ({state.sparkProgress}/{state.sparkThreshold})
          </button>
          <button onClick={() => eng.addFunds()} style={rhythmBtn(false, false, true)}>+ Crystals</button>
          <button onClick={eng.reset} style={rhythmBtn(false, false, true)}>Reset</button>
        </div>

        {/* Results stage */}
        <div style={{
          position: 'relative', minHeight: 180,
          padding: 16, borderRadius: 14,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.4), rgba(0,0,0,0.25))',
          border: `1px solid ${PINK}44`,
          overflow: 'hidden',
        }}>
          {/* Musical notes */}
          {notes.map(n => (
            <span key={n.id} aria-hidden style={{
              position: 'absolute',
              left: `${n.left}%`, bottom: 10,
              fontSize: 22, color: n.color,
              ['--rot' as never]: `${n.rot}deg`,
              animation: `sk-note-rise 1.8s cubic-bezier(.22,1,.36,1) ${n.delay}ms forwards`,
              pointerEvents: 'none', zIndex: 1,
              textShadow: `0 0 10px ${n.color}`,
            }}>{n.glyph}</span>
          ))}

          {/* Confetti + petals on 5* */}
          {celebrating && (
            <>
              {confetti.map(c => (
                <span key={c.id} aria-hidden style={{
                  position: 'absolute', top: -10, left: `${c.left}%`,
                  width: c.size, height: c.size, background: c.color, borderRadius: 2,
                  ['--tx' as never]: `${c.tx}px`,
                  animation: `sk-confetti-fall 1.8s cubic-bezier(.33,.8,.5,1) ${c.delay}ms forwards`,
                  pointerEvents: 'none', zIndex: 4,
                }} />
              ))}
              {Array.from({ length: 10 }).map((_, i) => (
                <span key={`p-${i}`} aria-hidden style={{
                  position: 'absolute', top: -20, left: `${Math.random() * 100}%`,
                  width: 10, height: 10, borderRadius: '50% 0 50% 50%',
                  background: `linear-gradient(135deg, ${PINK}, #ffcfda)`,
                  ['--tx' as never]: `${(Math.random() - 0.5) * 140}px`,
                  animation: `sk-petal 2.2s linear ${Math.random() * 300}ms forwards`,
                  pointerEvents: 'none', zIndex: 4,
                }} />
              ))}
              <div style={{
                position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%)',
                fontSize: 40, fontWeight: 900, letterSpacing: 4,
                background: `linear-gradient(90deg, ${PINK}, ${CYAN}, ${VIOLET}, ${PINK})`,
                backgroundSize: '300% 100%',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                animation: 'sk-reveal-pop 0.5s cubic-bezier(.22,1,.36,1) both, sk-rainbow-strip 2.5s linear infinite, sk-reveal-pulse 1.4s ease-in-out infinite',
                pointerEvents: 'none', zIndex: 5,
              }}>★5 GET ★</div>
            </>
          )}

          <div style={{ fontSize: 10.5, color: '#f7d0e0', letterSpacing: 0.1, textTransform: 'uppercase', marginBottom: 10, position: 'relative', zIndex: 2 }}>
            Live stage · Results
          </div>

          {lastResults.length === 0 ? (
            <div style={{ padding: 28, textAlign: 'center', color: '#f7d0e0', fontSize: 13 }}>
              The stage is quiet. Tap a pull to start the performance.
            </div>
          ) : (
            <div key={eng.pullBurstKey} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, position: 'relative', zIndex: 2 }}>
              {lastResults.map((r, i) => (
                <div key={i} style={{ animation: `sk-reveal-pop 0.5s cubic-bezier(.22,1,.36,1) ${i * 50}ms both` }}>
                  <UnitCard result={r} delay={0} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History */}
        {state.history.length > 0 && (
          <div style={{ marginTop: 16, padding: 10, background: 'rgba(0,0,0,0.3)', borderRadius: 10, border: `1px solid ${PINK}33`, fontSize: 11.5 }}>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.1, color: '#f7d0e0', marginBottom: 6 }}>Setlist · {state.history.length} pulls</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {state.history.slice(-14).reverse().map((h, i) => (
                <span key={i} style={{
                  padding: '2px 9px', borderRadius: 12, fontSize: 10.5,
                  background: h.rarity === 5 ? `${CYAN}33` : h.rarity === 4 ? `${PINK}33` : 'rgba(255,255,255,0.06)',
                  color: h.rarity === 5 ? CYAN : h.rarity === 4 ? PINK : '#dcd0e8',
                  border: `1px solid ${h.rarity === 5 ? CYAN + '66' : h.rarity === 4 ? PINK + '66' : 'rgba(255,255,255,0.1)'}`,
                  animation: h.rarity === 5 ? 'sk-beat-bounce 0.8s ease-in-out infinite' : undefined,
                }}>★{h.rarity} {h.unit.name}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ k, v, color }: { k: string; v: string; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <span style={{ fontSize: 10, color: '#f7d0e0', letterSpacing: 0.08, textTransform: 'uppercase' }}>{k}</span>
      <b style={{ fontSize: 15, color: color ?? '#fff', fontWeight: 700 }}>{v}</b>
    </div>
  );
}

function rhythmBtn(primary: boolean, hero = false, ghost = false, secondary = false): React.CSSProperties {
  if (hero) {
    return {
      padding: '11px 22px', fontSize: 14, fontWeight: 800, letterSpacing: 0.04,
      background: `linear-gradient(90deg, ${CYAN}, ${PINK}, ${VIOLET})`,
      backgroundSize: '200% 100%',
      color: '#1a0e20', border: 'none', borderRadius: 999, cursor: 'pointer',
      boxShadow: `0 6px 20px -4px ${PINK}, 0 0 0 3px rgba(255,255,255,0.15)`,
      animation: 'sk-rainbow-strip 3s linear infinite, sk-cta-bounce 1.2s ease-in-out infinite',
      textTransform: 'uppercase',
    };
  }
  if (primary) {
    return {
      padding: '10px 20px', fontSize: 13.5, fontWeight: 700, letterSpacing: 0.03,
      background: `linear-gradient(90deg, ${PINK}, #e86a97)`,
      color: '#1a0e20', border: 'none', borderRadius: 999, cursor: 'pointer',
      boxShadow: `0 4px 14px -4px ${PINK}cc`,
    };
  }
  if (secondary) {
    return {
      padding: '10px 16px', fontSize: 12.5, fontWeight: 600,
      background: `linear-gradient(90deg, ${CYAN}, #27a39d)`,
      color: '#0f0e13', border: 'none', borderRadius: 999, cursor: 'pointer',
    };
  }
  if (ghost) {
    return {
      padding: '9px 14px', fontSize: 12, background: 'transparent',
      color: '#f7d0e0', border: `1px solid ${PINK}66`, borderRadius: 999, cursor: 'pointer',
    };
  }
  return {
    padding: '10px 16px', fontSize: 12.5, fontWeight: 600,
    background: 'rgba(255,255,255,0.1)', color: '#fff',
    border: `1px solid ${PINK}66`, borderRadius: 999, cursor: 'pointer',
  };
}
