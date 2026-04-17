// HAND-CRAFTED — Granblue Classic / Nikke flavor.
// Focus: giant spark meter; sky / airship / floating-island aesthetic.
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { useGachaEngine } from '../../lib/useGachaEngine';
import { featuredFor } from '../../data/roster';
import { UnitCard, StatusBar, CelebrationFlash } from '../../lib/GachaFrame';

const ACCENT = '#2F9DFF';
const GOLD = '#F7CE4A';

const KEYFRAMES = `
@keyframes gb-cloud-drift-1 { 0% { transform: translateX(-10%); } 100% { transform: translateX(110%); } }
@keyframes gb-cloud-drift-2 { 0% { transform: translateX(110%); } 100% { transform: translateX(-10%); } }
@keyframes gb-ring-pulse { 0%, 100% { box-shadow: 0 0 0 2px ${GOLD}, 0 0 60px -8px ${GOLD}aa, inset 0 0 60px -20px ${GOLD}55; } 50% { box-shadow: 0 0 0 3px ${GOLD}, 0 0 90px -2px ${GOLD}cc, inset 0 0 90px -10px ${GOLD}88; } }
@keyframes gb-spark-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes gb-spark-btn-glow { 0%, 100% { filter: drop-shadow(0 0 8px ${GOLD}aa); } 50% { filter: drop-shadow(0 0 18px ${GOLD}); } }
@keyframes gb-float-up { 0% { transform: translateY(40px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
@keyframes gb-ssr-rise { 0% { transform: translate(-50%, 30px) scale(0.8); opacity: 0; letter-spacing: 0; filter: blur(6px); } 30% { opacity: 1; filter: blur(0); } 100% { transform: translate(-50%, -10px) scale(1.1); opacity: 0; letter-spacing: 18px; filter: blur(3px); } }
@keyframes gb-ssr-ring { 0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(3); opacity: 0; } }
@keyframes gb-milestone-pop { 0% { transform: scale(0.6); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
`;

export default function GranblueClassic({ slug }: { slug: string }) {
  const variants = combosForType('granblue-classic');
  const navigate = useNavigate();
  const combo = useMemo(() => variants.find(c => c.slug === slug) ?? variants[0], [variants, slug]);
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;

  const featured = featuredFor(combo.banner.id);
  const sparkPct = Math.min(100, (state.sparkProgress / state.sparkThreshold) * 100);
  const sparkReady = eng.canSpark;
  const hasFive = lastResults.some(r => r.rarity === 5);
  const [showSSR, setShowSSR] = useState(false);

  useEffect(() => {
    if (hasFive) {
      setShowSSR(true);
      const t = setTimeout(() => setShowSSR(false), 1600);
      return () => clearTimeout(t);
    }
  }, [eng.pullBurstKey, hasFive]);

  const milestones = [100, 200, 300].filter(m => m <= state.sparkThreshold);

  return (
    <div className="page" style={{
      background: 'linear-gradient(180deg, #0a1b38 0%, #1e4675 42%, #3a7cb8 78%, #6cb0df 100%)',
      minHeight: '100vh',
      borderRadius: 16,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{KEYFRAMES}</style>

      {/* Parallax clouds */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', opacity: 0.55 }}>
        <div style={{ position: 'absolute', top: '12%', width: '30%', height: 90, background: 'radial-gradient(ellipse, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)', animation: 'gb-cloud-drift-1 55s linear infinite', filter: 'blur(4px)' }} />
        <div style={{ position: 'absolute', top: '34%', width: '24%', height: 70, background: 'radial-gradient(ellipse, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 70%)', animation: 'gb-cloud-drift-2 80s linear infinite', filter: 'blur(3px)' }} />
        <div style={{ position: 'absolute', top: '62%', width: '40%', height: 110, background: 'radial-gradient(ellipse, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 70%)', animation: 'gb-cloud-drift-1 95s linear infinite', filter: 'blur(6px)' }} />
        <div style={{ position: 'absolute', top: '82%', width: '22%', height: 55, background: 'radial-gradient(ellipse, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 70%)', animation: 'gb-cloud-drift-2 70s linear infinite', filter: 'blur(3px)' }} />
      </div>

      {/* Golden spark-ready ring border */}
      {sparkReady && (
        <div aria-hidden style={{ position: 'absolute', inset: 8, borderRadius: 12, pointerEvents: 'none', animation: 'gb-ring-pulse 1.8s ease-in-out infinite', zIndex: 2 }} />
      )}

      <div style={{ position: 'relative', zIndex: 3 }}>
        <Link to="/" style={{ color: '#cfe3f5', fontSize: 13, display: 'inline-block', marginBottom: 14, opacity: 0.85 }}>← Back to dashboard</Link>

        <header style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: 0.2, color: '#bad3ea', textTransform: 'uppercase', marginBottom: 4 }}>Skybound · Permanent Pool</div>
          <h1 style={{ margin: 0, fontSize: 34, fontWeight: 300, color: '#eaf4ff', letterSpacing: 0.5, textShadow: `0 2px 20px ${ACCENT}aa` }}>
            GRAND <span style={{ color: GOLD, fontWeight: 500 }}>SPARK</span> DRAW
          </h1>
          <p style={{ margin: '4px 0 0', color: '#bad3ea', fontSize: 13 }}>Granblue Classic · flat rates · spark-only · no rate-up</p>
        </header>

        {/* Variant picker */}
        {variants.length > 1 && (
          <div style={{ marginBottom: 18, padding: 10, background: 'rgba(10,27,56,0.55)', borderRadius: 8, border: `1px solid ${ACCENT}55`, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10.5, letterSpacing: 0.08, textTransform: 'uppercase', color: '#bad3ea' }}>Currency / Banner</span>
            {variants.map(v => {
              const active = v.slug === combo.slug;
              return (
                <button key={v.slug} onClick={() => navigate(`/play/${v.slug}`)} style={{
                  padding: '5px 11px', fontSize: 11.5, borderRadius: 999, cursor: 'pointer',
                  background: active ? GOLD : 'rgba(255,255,255,0.06)',
                  color: active ? '#0f0e13' : '#dbe8f7',
                  border: `1px solid ${active ? GOLD : ACCENT + '66'}`,
                }}>{v.banner.name} · {v.currency.name}</button>
              );
            })}
          </div>
        )}

        {/* THE HERO: Giant spark meter */}
        <div style={{
          padding: 22,
          background: 'linear-gradient(180deg, rgba(10,27,56,0.8) 0%, rgba(30,70,117,0.75) 100%)',
          borderRadius: 14,
          border: `1px solid ${sparkReady ? GOLD : ACCENT}aa`,
          marginBottom: 18,
          position: 'relative',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 10.5, letterSpacing: 0.18, textTransform: 'uppercase', color: GOLD, fontWeight: 600 }}>Spark Ceiling</div>
              <div style={{ fontSize: 18, color: '#eaf4ff', marginTop: 2, fontWeight: 300 }}>
                {state.sparkThreshold} pulls to guaranteed select
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 30, fontWeight: 300, color: sparkReady ? GOLD : '#eaf4ff', lineHeight: 1, textShadow: sparkReady ? `0 0 20px ${GOLD}` : 'none' }}>
                {state.sparkProgress}<span style={{ fontSize: 16, color: '#93b3d4' }}> / {state.sparkThreshold}</span>
              </div>
              <div style={{ fontSize: 10.5, color: '#93b3d4', marginTop: 2, letterSpacing: 0.08, textTransform: 'uppercase' }}>
                {sparkReady ? 'Ready to redeem' : `${state.sparkThreshold - state.sparkProgress} pulls remaining`}
              </div>
            </div>
          </div>

          {/* Horizontal gauge */}
          <div style={{ position: 'relative', height: 26, background: 'rgba(0,0,0,0.45)', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{
              width: `${sparkPct}%`,
              height: '100%',
              background: `linear-gradient(90deg, #c48f1e 0%, ${GOLD} 50%, #fff1b3 100%)`,
              backgroundSize: '200% 100%',
              animation: 'gb-spark-shimmer 3s linear infinite',
              boxShadow: `0 0 18px ${GOLD}aa`,
              transition: 'width 0.5s cubic-bezier(.22,1,.36,1)',
            }} />
            {milestones.map(m => {
              const pct = (m / state.sparkThreshold) * 100;
              const passed = state.sparkProgress >= m;
              return (
                <div key={m} style={{
                  position: 'absolute', left: `${pct}%`, top: -2, bottom: -2,
                  width: 2, background: passed ? '#fff1b3' : 'rgba(255,255,255,0.35)',
                  boxShadow: passed ? `0 0 8px ${GOLD}` : 'none',
                }} />
              );
            })}
          </div>

          {/* Milestone labels */}
          <div style={{ position: 'relative', height: 18, marginTop: 4 }}>
            {milestones.map(m => {
              const pct = (m / state.sparkThreshold) * 100;
              return (
                <div key={m} style={{
                  position: 'absolute', left: `${pct}%`, transform: 'translateX(-50%)',
                  fontSize: 10, color: state.sparkProgress >= m ? GOLD : '#93b3d4',
                  fontWeight: 500, letterSpacing: 0.05,
                }}>{m}</div>
              );
            })}
          </div>

          <div style={{ marginTop: 10, fontSize: 12, color: '#bad3ea', lineHeight: 1.5 }}>
            No rate-up. No pity. Spark is your only ceiling — the most transparent contract in gacha.
          </div>
        </div>

        {/* Featured units */}
        {featured.five.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.1, color: '#bad3ea', marginBottom: 6 }}>On the crystal deck</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {featured.five.map(u => (
                <div key={u.id} style={{
                  padding: '6px 14px',
                  background: `linear-gradient(90deg, ${u.color}dd, ${u.color}99)`,
                  color: '#0f0e13', fontWeight: 600, fontSize: 12.5, borderRadius: 20,
                  boxShadow: `0 0 0 1px ${GOLD}, 0 4px 12px -4px ${GOLD}88`,
                }}>★5 {u.name}</div>
              ))}
              {featured.four.map(u => (
                <div key={u.id} style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.08)', color: '#dbe8f7', fontSize: 11.5, borderRadius: 20, border: `1px solid ${ACCENT}66` }}>★4 {u.name}</div>
              ))}
            </div>
          </div>
        )}

        {/* Status bar */}
        <div style={{ padding: 10, background: 'rgba(10,27,56,0.6)', borderRadius: 8, border: `1px solid ${ACCENT}44`, marginBottom: 14 }}>
          <StatusBar combo={combo} eng={eng} />
        </div>

        {/* Pull controls */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          <button onClick={eng.pull1} disabled={!eng.canPull1} style={btnStyle(false, false)}>
            Pull 1 · {eng.pullCost}
          </button>
          <button onClick={eng.pull10} disabled={!eng.canPull10} style={btnStyle(true, false)}>
            Pull 10 · {(eng.pullCost * 10).toLocaleString()}
          </button>
          <button onClick={eng.spark} disabled={!sparkReady} style={{
            ...btnStyle(false, sparkReady),
            ...(sparkReady ? { animation: 'gb-spark-btn-glow 1.6s ease-in-out infinite' } : {}),
          }}>
            {sparkReady ? 'REDEEM SPARK ★' : `Spark (${state.sparkProgress}/${state.sparkThreshold})`}
          </button>
          <button onClick={() => eng.addFunds()} style={btnStyle(false, false, true)}>+ Funds</button>
          <button onClick={eng.reset} style={btnStyle(false, false, true)}>Reset</button>
        </div>

        {/* Results zone (cards rise from clouds) */}
        <div style={{ position: 'relative', minHeight: 160, padding: 14, background: 'rgba(10,27,56,0.45)', borderRadius: 10, border: `1px solid ${ACCENT}33` }}>
          {showSSR && (
            <>
              <div aria-hidden style={{
                position: 'absolute', left: '50%', top: '50%',
                width: 80, height: 80, borderRadius: '50%',
                border: `3px solid ${GOLD}`,
                animation: 'gb-ssr-ring 1.4s ease-out forwards',
                pointerEvents: 'none', zIndex: 5,
              }} />
              <div aria-hidden style={{
                position: 'absolute', left: '50%', top: '45%',
                fontSize: 56, fontWeight: 700, letterSpacing: 4,
                color: GOLD, textShadow: `0 0 40px ${GOLD}, 0 0 80px ${GOLD}88`,
                animation: 'gb-ssr-rise 1.6s ease-out forwards',
                pointerEvents: 'none', zIndex: 6, fontFamily: 'Georgia, serif',
              }}>★SSR★</div>
              <CelebrationFlash tier={5} accent={GOLD} />
            </>
          )}

          {lastResults.length === 0 ? (
            <div style={{ padding: 28, textAlign: 'center', color: '#bad3ea', fontSize: 13 }}>
              Press Pull to summon from the skyborne weapon pool.
            </div>
          ) : (
            <div key={eng.pullBurstKey} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
              {lastResults.map((r, i) => (
                <div key={i} style={{ animation: `gb-float-up 0.55s cubic-bezier(.22,1,.36,1) ${i * 55}ms both` }}>
                  <UnitCard result={r} delay={0} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent history strip */}
        {state.history.length > 0 && (
          <div style={{ marginTop: 16, padding: 10, background: 'rgba(10,27,56,0.45)', borderRadius: 8, border: `1px solid ${ACCENT}33`, fontSize: 11.5, color: '#bad3ea' }}>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.1, marginBottom: 6, color: '#9eb9d4' }}>Recent draws · {state.history.length}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {state.history.slice(-14).reverse().map((h, i) => (
                <span key={i} style={{
                  padding: '2px 7px', borderRadius: 10, fontSize: 10.5,
                  background: h.rarity === 5 ? `${GOLD}22` : h.rarity === 4 ? 'rgba(138,111,212,0.18)' : 'rgba(255,255,255,0.05)',
                  color: h.rarity === 5 ? GOLD : h.rarity === 4 ? '#b79df2' : '#9eb9d4',
                  border: `1px solid ${h.rarity === 5 ? GOLD + '66' : 'rgba(255,255,255,0.08)'}`,
                }}>★{h.rarity} {h.unit.name}{h.sparkRedeemed ? ' ·spark' : ''}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function btnStyle(primary: boolean, glowing: boolean, ghost = false): React.CSSProperties {
  if (glowing) {
    return {
      padding: '10px 18px', fontSize: 13.5, fontWeight: 700, letterSpacing: 0.6,
      background: `linear-gradient(180deg, ${GOLD}, #c48f1e)`,
      color: '#0f0e13', border: `1px solid ${GOLD}`, borderRadius: 8, cursor: 'pointer',
      textTransform: 'uppercase',
    };
  }
  if (primary) {
    return {
      padding: '10px 18px', fontSize: 13, fontWeight: 600,
      background: `linear-gradient(180deg, ${ACCENT}, #1f6fbf)`,
      color: '#eaf4ff', border: `1px solid ${ACCENT}`, borderRadius: 8, cursor: 'pointer',
      boxShadow: `0 2px 10px -2px ${ACCENT}88`,
    };
  }
  if (ghost) {
    return {
      padding: '10px 14px', fontSize: 12.5, background: 'transparent',
      color: '#cfe3f5', border: `1px solid ${ACCENT}55`, borderRadius: 8, cursor: 'pointer',
    };
  }
  return {
    padding: '10px 16px', fontSize: 13, background: 'rgba(255,255,255,0.06)',
    color: '#eaf4ff', border: `1px solid ${ACCENT}66`, borderRadius: 8, cursor: 'pointer',
  };
}
