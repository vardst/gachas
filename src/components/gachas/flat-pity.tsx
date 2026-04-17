// HAND-CRAFTED: Flat + Hard/Soft pity, NO rate-up guarantee.
// Vibe: modern-gacha baseline, pre-50/50 era. Cool blue. Harsh because each
// 5★ is still a coin-flip across the full 5★ pool — pity gives a ceiling
// but no control over WHICH 5★ you get.
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { featuredFor } from '../../data/roster';
import { useGachaEngine } from '../../lib/useGachaEngine';
import { UnitCard, StatusBar, CelebrationFlash } from '../../lib/GachaFrame';

const ACCENT = '#7EC4F5';
const WARN = '#f4d874';
const TYPE_KEY = 'flat-pity';

interface Props { slug: string }

export default function FlatPity({ slug }: Props) {
  const navigate = useNavigate();
  const variants = useMemo(() => combosForType(TYPE_KEY), []);
  const combo = useMemo(() => variants.find(v => v.slug === slug) ?? variants[0], [variants, slug]);
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;
  const featured = featuredFor(combo.banner.id);

  const softPityActive = state.pullsSinceFiveStar >= state.softPityStart;
  const pityPct = Math.min(100, (state.pullsSinceFiveStar / state.hardPityAt) * 100);
  const softPityPct = (state.softPityStart / state.hardPityAt) * 100;
  const pullsToSoft = Math.max(0, state.softPityStart - state.pullsSinceFiveStar);
  const pullsToHard = Math.max(0, state.hardPityAt - state.pullsSinceFiveStar);
  const hasFive = lastResults.some(r => r.rarity === 5);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a1320 0%, #0f1e32 60%, #0a1320 100%)',
      color: '#e0ecf7',
      padding: 18,
    }}>
      <style>{KEYFRAMES}</style>

      <Link to="/" style={{ color: '#98b8d6', fontSize: 13, textDecoration: 'none' }}>← Back to dashboard</Link>

      {/* HEADER */}
      <header style={{
        marginTop: 14,
        padding: '18px 22px',
        background: 'rgba(126, 196, 245, 0.05)',
        border: `1px solid ${ACCENT}33`,
        borderRadius: 6,
        marginBottom: 16,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `linear-gradient(${ACCENT}11 1px, transparent 1px), linear-gradient(90deg, ${ACCENT}11 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 30% 50%, #000 30%, transparent 90%)',
          opacity: 0.5,
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 10.5, letterSpacing: 0.18, textTransform: 'uppercase', color: ACCENT, marginBottom: 4 }}>
            Pity ceiling · no rate-up
          </div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 600, letterSpacing: -0.3, color: '#fff' }}>
            Flat · Soft + Hard Pity
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#98b8d6', maxWidth: 720, lineHeight: 1.5 }}>
            Pity gives you a ceiling, but no guarantees on WHICH 5★. Each 5★ is a coin-flip across the pool. This is the Genshin-adjacent baseline — but uglier on purpose: without a 50/50 carry-over, a featured 5★ is never more than a fraction of the full roster odds.
          </p>
        </div>
      </header>

      {/* VARIANT */}
      {variants.length > 1 && (
        <div style={{
          marginBottom: 16,
          padding: 10,
          background: 'rgba(0,0,0,0.35)',
          border: `1px solid ${ACCENT}33`,
          borderRadius: 4,
        }}>
          <div style={{ fontSize: 10, letterSpacing: 0.14, textTransform: 'uppercase', color: '#98b8d6', marginBottom: 6 }}>
            Variant · {variants.length} of Flat × Pity
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {variants.map(v => {
              const active = v.slug === combo.slug;
              return (
                <button key={v.slug} onClick={() => navigate(`/play/${v.slug}`)} style={{
                  padding: '4px 10px',
                  fontSize: 11,
                  background: active ? ACCENT : 'transparent',
                  color: active ? '#0f0e13' : '#cfe3f5',
                  border: `1px solid ${active ? ACCENT : ACCENT + '55'}`,
                  borderRadius: 3,
                  cursor: 'pointer',
                  fontWeight: active ? 600 : 400,
                }}>{v.banner.name} · {v.guarantee.name} · {v.currency.name}</button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) 300px', gap: 16 }}>
        <div>
          {/* PITY HERO */}
          <div style={{
            padding: 18,
            background: 'rgba(126, 196, 245, 0.04)',
            border: `1px solid ${softPityActive ? WARN : ACCENT}77`,
            borderRadius: 6,
            marginBottom: 14,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {softPityActive && (
              <div aria-hidden style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(ellipse at center, ${WARN}10 0%, transparent 60%)`,
                animation: 'fp-pulse 2.2s ease-in-out infinite',
                pointerEvents: 'none',
              }} />
            )}
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10.5, letterSpacing: 0.15, textTransform: 'uppercase', color: softPityActive ? WARN : ACCENT }}>
                    Pulls since last 5★
                  </div>
                  <div style={{
                    fontSize: 64,
                    fontWeight: 200,
                    lineHeight: 1,
                    color: softPityActive ? WARN : '#fff',
                    fontVariantNumeric: 'tabular-nums',
                    textShadow: softPityActive ? `0 0 30px ${WARN}88` : `0 0 20px ${ACCENT}44`,
                    letterSpacing: -2,
                  }}>{state.pullsSinceFiveStar}</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 11.5, color: '#98b8d6', lineHeight: 1.7 }}>
                  <div>Soft @ {state.softPityStart} · <b style={{ color: softPityActive ? WARN : '#cfe3f5' }}>{pullsToSoft === 0 ? 'active' : `${pullsToSoft} to go`}</b></div>
                  <div>Hard @ {state.hardPityAt} · <b style={{ color: '#cfe3f5' }}>{pullsToHard}</b></div>
                </div>
              </div>

              <div style={{ position: 'relative', height: 18, background: 'rgba(0,0,0,0.5)', borderRadius: 2, overflow: 'hidden', border: `1px solid ${ACCENT}33` }}>
                <div style={{
                  width: `${pityPct}%`,
                  height: '100%',
                  background: softPityActive
                    ? `linear-gradient(90deg, ${ACCENT} 0%, ${WARN} 80%, #fff1b3 100%)`
                    : `linear-gradient(90deg, ${ACCENT}44, ${ACCENT})`,
                  boxShadow: softPityActive ? `0 0 16px ${WARN}aa` : `0 0 8px ${ACCENT}66`,
                  transition: 'width 0.5s cubic-bezier(.22,1,.36,1)',
                }} />
                <div aria-hidden style={{
                  position: 'absolute',
                  left: `${softPityPct}%`,
                  top: -2, bottom: -2, width: 2,
                  background: WARN,
                  boxShadow: `0 0 6px ${WARN}`,
                }} />
              </div>
              <div style={{ position: 'relative', marginTop: 4, fontSize: 10, color: '#7a94b1', display: 'flex', justifyContent: 'space-between', letterSpacing: 0.08, textTransform: 'uppercase' }}>
                <span>0</span>
                <span style={{ color: softPityActive ? WARN : '#7a94b1' }}>soft {state.softPityStart}</span>
                <span>hard {state.hardPityAt}</span>
              </div>

              <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <InfoPill>After hard pity: some 5★ (unknown which)</InfoPill>
                <InfoPill danger>No 50/50 · no carry-over</InfoPill>
                <InfoPill>Featured % = {(100 / (featured.five.length + 4)).toFixed(0)}% of 5★ rolls</InfoPill>
              </div>
            </div>
          </div>

          {/* FEATURED */}
          {featured.five.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10.5, letterSpacing: 0.15, textTransform: 'uppercase', color: '#98b8d6', marginBottom: 6 }}>
                Featured — not guaranteed
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {featured.five.map(u => (
                  <span key={u.id} style={{
                    padding: '5px 12px',
                    fontSize: 12,
                    fontWeight: 700,
                    background: `linear-gradient(90deg, ${u.color}, ${u.color}99)`,
                    color: '#0f0e13',
                    borderRadius: 20,
                    border: `1px solid ${ACCENT}aa`,
                  }}>★5 {u.name}</span>
                ))}
                {featured.four.map(u => (
                  <span key={u.id} style={{
                    padding: '4px 10px',
                    fontSize: 11,
                    color: '#cfe3f5',
                    border: `1px solid ${ACCENT}44`,
                    borderRadius: 20,
                  }}>★4 {u.name}</span>
                ))}
              </div>
            </div>
          )}

          {/* STATUS */}
          <div style={{
            padding: 10,
            background: 'rgba(0,0,0,0.35)',
            border: `1px solid ${ACCENT}33`,
            borderRadius: 4,
            marginBottom: 12,
          }}>
            <StatusBar combo={combo} eng={eng} />
          </div>

          {/* CONTROLS */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <PityButton disabled={!eng.canPull1} onClick={eng.pull1}>Pull 1 · {eng.pullCost}</PityButton>
            <PityButton primary disabled={!eng.canPull10} onClick={eng.pull10}>Pull 10 · {(eng.pullCost * 10).toLocaleString()}</PityButton>
            <PityButton ghost onClick={() => eng.addFunds()}>+ Funds</PityButton>
            <PityButton ghost onClick={eng.reset}>Reset</PityButton>
          </div>

          {/* RESULTS */}
          <div style={{
            position: 'relative',
            minHeight: 170,
            padding: 14,
            background: 'rgba(0,0,0,0.45)',
            border: `1px solid ${ACCENT}33`,
            borderRadius: 4,
            overflow: 'hidden',
          }}>
            {hasFive && <CelebrationFlash tier={5} accent={ACCENT} />}
            {lastResults.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: '#7a94b1', fontSize: 13 }}>
                Press Pull to start. Pity resets when a 5★ lands — from any source, not just the featured one.
              </div>
            ) : (
              <div key={eng.pullBurstKey} style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: 8,
              }}>
                {lastResults.map((r, i) => (
                  <UnitCard key={i} result={r} delay={i * 55} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SIDE */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ padding: 14, background: 'rgba(0,0,0,0.35)', border: `1px solid ${ACCENT}33`, borderRadius: 4 }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 11, letterSpacing: 0.15, textTransform: 'uppercase', color: ACCENT }}>
              Why this is harsh
            </h3>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11.5, color: '#cfe3f5', lineHeight: 1.6 }}>
              <li>Hard pity guarantees a 5★ — any 5★, uniformly from the pool.</li>
              <li>No mechanism makes the featured 5★ more likely.</li>
              <li>Losing pity-roll feels worse than losing a 50/50.</li>
              <li>Expected pulls to get a specific featured 5★ can easily exceed 180.</li>
            </ul>
          </div>

          <div style={{ padding: 14, background: 'rgba(0,0,0,0.35)', border: `1px solid ${ACCENT}33`, borderRadius: 4 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 11, letterSpacing: 0.15, textTransform: 'uppercase', color: ACCENT }}>
              Layers
            </h3>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {combo.guarantee.layers.map((l, i) => (
                <span key={i} style={{
                  padding: '3px 8px',
                  fontSize: 10.5,
                  background: `${ACCENT}15`,
                  color: '#cfe3f5',
                  border: `1px solid ${ACCENT}44`,
                  borderRadius: 2,
                }}>{l}</span>
              ))}
            </div>
          </div>

          <div style={{ padding: 14, background: 'rgba(0,0,0,0.35)', border: `1px solid ${ACCENT}33`, borderRadius: 4 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 11, letterSpacing: 0.15, textTransform: 'uppercase', color: ACCENT }}>
              History · {state.history.length}
            </h3>
            {state.history.length === 0 ? (
              <div style={{ fontSize: 11, color: '#7a94b1' }}>No pulls yet.</div>
            ) : (
              <div style={{ maxHeight: 220, overflowY: 'auto', fontSize: 10.5, color: '#cfe3f5' }}>
                {state.history.slice(-40).reverse().map((h, i) => (
                  <div key={i} style={{ padding: '1px 0', color: h.rarity === 5 ? WARN : h.rarity === 4 ? '#b79df2' : '#7a94b1' }}>
                    #{state.history.length - i} · ★{h.rarity} {h.unit.name}
                    {h.hardPity && ' · hard'}{h.softPity && ' · soft'}
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoPill({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <span style={{
      padding: '3px 9px',
      fontSize: 10.5,
      letterSpacing: 0.06,
      textTransform: 'uppercase',
      color: danger ? '#e88a8a' : ACCENT,
      background: danger ? 'rgba(232, 138, 138, 0.08)' : `${ACCENT}12`,
      border: `1px solid ${danger ? '#e88a8a' : ACCENT}55`,
      borderRadius: 2,
    }}>{children}</span>
  );
}

function PityButton({ children, onClick, disabled, primary, ghost }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; primary?: boolean; ghost?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '10px 16px',
      fontSize: 12.5,
      fontWeight: 600,
      letterSpacing: 0.06,
      textTransform: 'uppercase',
      background: primary ? `linear-gradient(180deg, ${ACCENT} 0%, #5ba9dd 100%)` : ghost ? 'transparent' : 'rgba(126, 196, 245, 0.08)',
      color: primary ? '#0f0e13' : '#cfe3f5',
      border: `1px solid ${primary ? ACCENT : ACCENT + '55'}`,
      borderRadius: 3,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      boxShadow: primary ? `0 0 12px -2px ${ACCENT}88` : 'none',
    }}>{children}</button>
  );
}

const KEYFRAMES = `
@keyframes fp-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.9; }
}
`;
