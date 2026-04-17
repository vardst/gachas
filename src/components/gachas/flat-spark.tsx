// HAND-CRAFTED: Flat + Spark variants (NOT Granblue / Arknights which are named).
// Vibe: warm amber / goldleaf alchemy. Spark is the hero — a long runway with
// dual-progress bars where applicable (pity + spark).
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { featuredFor } from '../../data/roster';
import { useGachaEngine } from '../../lib/useGachaEngine';
import { UnitCard, StatusBar } from '../../lib/GachaFrame';

const ACCENT = '#e0a048';
const GOLDLEAF = '#f6d27b';
const DARK = '#2a1a0a';
const TYPE_KEY = 'flat-spark';

interface Props { slug: string }

export default function FlatSpark({ slug }: Props) {
  const navigate = useNavigate();
  const variants = useMemo(() => combosForType(TYPE_KEY), []);
  const combo = useMemo(() => variants.find(v => v.slug === slug) ?? variants[0], [variants, slug]);
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;
  const featured = featuredFor(combo.banner.id);

  const sparkPct = Math.min(100, (state.sparkProgress / state.sparkThreshold) * 100);
  const sparkReady = eng.canSpark;
  const usesPity = ['spark_pity'].includes(combo.guarantee.id);
  const pityPct = usesPity ? Math.min(100, (state.pullsSinceFiveStar / state.hardPityAt) * 100) : 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 30% 10%, #3a2615 0%, #1f130a 60%, #0f0805 100%)',
      color: '#f6e4c8',
      padding: 18,
    }}>
      <style>{KEYFRAMES}</style>

      <Link to="/" style={{ color: '#d9b880', fontSize: 13, textDecoration: 'none' }}>← Back to dashboard</Link>

      {/* HEADER with decorative goldleaf frame */}
      <header style={{
        marginTop: 14,
        padding: '22px 26px',
        marginBottom: 18,
        position: 'relative',
        border: `1px solid ${ACCENT}55`,
        borderRadius: 2,
        background: 'linear-gradient(180deg, rgba(224, 160, 72, 0.08), rgba(0,0,0,0.35))',
        overflow: 'hidden',
      }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 6,
          border: `1px dashed ${GOLDLEAF}33`,
          pointerEvents: 'none',
          borderRadius: 1,
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 10.5, letterSpacing: 0.25, textTransform: 'uppercase', color: GOLDLEAF, marginBottom: 4 }}>
            Amber Threshold · Redemption Gacha
          </div>
          <h1 style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 400,
            letterSpacing: 1,
            color: '#fff1d0',
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            textShadow: `0 0 22px ${ACCENT}66`,
          }}>Flat · Spark {usesPity ? '+ Pity' : 'Only'}</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#d9b880', maxWidth: 720, lineHeight: 1.5 }}>
            A deterministic floor you can count pulls toward. Accumulate enough attempts and redeem a featured 5★ of your choice outright. Less famous than Granblue or Arknights — but the mechanical DNA is shared.
          </p>
        </div>
      </header>

      {variants.length > 1 && (
        <div style={{
          marginBottom: 14,
          padding: 10,
          background: 'rgba(224, 160, 72, 0.06)',
          border: `1px solid ${ACCENT}33`,
          borderRadius: 3,
        }}>
          <div style={{ fontSize: 10, letterSpacing: 0.15, textTransform: 'uppercase', color: GOLDLEAF, marginBottom: 6 }}>
            Variants · {variants.length}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {variants.map(v => {
              const active = v.slug === combo.slug;
              return (
                <button key={v.slug} onClick={() => navigate(`/play/${v.slug}`)} style={{
                  padding: '4px 10px',
                  fontSize: 11,
                  background: active ? ACCENT : 'transparent',
                  color: active ? '#1f130a' : '#f6e4c8',
                  border: `1px solid ${active ? ACCENT : ACCENT + '55'}`,
                  borderRadius: 2,
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
          {/* SPARK HERO */}
          <div style={{
            padding: 20,
            background: 'linear-gradient(180deg, rgba(224, 160, 72, 0.06) 0%, rgba(0, 0, 0, 0.5) 100%)',
            border: `1px solid ${sparkReady ? GOLDLEAF : ACCENT}88`,
            borderRadius: 3,
            marginBottom: 14,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: sparkReady ? `inset 0 0 40px ${GOLDLEAF}22, 0 0 30px -8px ${GOLDLEAF}55` : 'none',
          }}>
            {sparkReady && (
              <div aria-hidden style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(ellipse at center, ${GOLDLEAF}22 0%, transparent 60%)`,
                animation: 'fs-breath 2.8s ease-in-out infinite',
              }} />
            )}
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: 0.2, textTransform: 'uppercase', color: GOLDLEAF, fontWeight: 700 }}>
                    Amber Threshold
                  </div>
                  <div style={{
                    fontSize: 48,
                    fontWeight: 300,
                    lineHeight: 1,
                    color: sparkReady ? GOLDLEAF : '#fff1d0',
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                    marginTop: 4,
                    fontVariantNumeric: 'tabular-nums',
                    textShadow: sparkReady ? `0 0 24px ${GOLDLEAF}aa` : 'none',
                  }}>
                    {state.sparkProgress}
                    <span style={{ color: '#8a6a3a', fontSize: 24, margin: '0 4px' }}>/</span>
                    {state.sparkThreshold}
                  </div>
                </div>
                <div style={{
                  padding: '6px 14px',
                  background: sparkReady ? `linear-gradient(180deg, ${GOLDLEAF}, ${ACCENT})` : 'transparent',
                  color: sparkReady ? DARK : '#d9b880',
                  border: `1px solid ${sparkReady ? GOLDLEAF : ACCENT + '55'}`,
                  fontSize: 11,
                  letterSpacing: 0.14,
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  borderRadius: 2,
                  animation: sparkReady ? 'fs-breath 2.2s ease-in-out infinite' : undefined,
                }}>
                  {sparkReady ? 'Ready to redeem' : `${state.sparkThreshold - state.sparkProgress} remaining`}
                </div>
              </div>

              {/* Spark bar */}
              <div style={{ position: 'relative', height: 22, background: 'rgba(0,0,0,0.55)', border: `1px solid ${ACCENT}44`, borderRadius: 1, overflow: 'hidden' }}>
                <div style={{
                  width: `${sparkPct}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, #a67534 0%, ${ACCENT} 45%, ${GOLDLEAF} 80%, #fff1d0 100%)`,
                  backgroundSize: '200% 100%',
                  animation: 'fs-shimmer 4s linear infinite',
                  boxShadow: `0 0 14px ${GOLDLEAF}88`,
                  transition: 'width 0.5s cubic-bezier(.22,1,.36,1)',
                }} />
                {[0.25, 0.5, 0.75].map(frac => (
                  <div key={frac} style={{
                    position: 'absolute',
                    left: `${frac * 100}%`,
                    top: -2, bottom: -2,
                    width: 1,
                    background: state.sparkProgress >= state.sparkThreshold * frac ? GOLDLEAF : 'rgba(255,241,208,0.3)',
                    boxShadow: state.sparkProgress >= state.sparkThreshold * frac ? `0 0 4px ${GOLDLEAF}` : 'none',
                  }} />
                ))}
              </div>
              <div style={{ marginTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: '#8a6a3a', letterSpacing: 0.1, textTransform: 'uppercase' }}>
                <span>0</span>
                <span>¼</span>
                <span>½</span>
                <span>¾</span>
                <span>{state.sparkThreshold}</span>
              </div>

              {/* Pity bar underneath (only if spark+pity) */}
              {usesPity && (
                <div style={{ marginTop: 14, padding: '10px 12px', background: 'rgba(0,0,0,0.4)', border: `1px solid ${ACCENT}33`, borderRadius: 2 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, letterSpacing: 0.12, textTransform: 'uppercase', marginBottom: 6 }}>
                    <span style={{ color: '#d9b880' }}>Pity · since 5★</span>
                    <span style={{ color: '#f6e4c8' }}>{state.pullsSinceFiveStar} / {state.hardPityAt}</span>
                  </div>
                  <div style={{ position: 'relative', height: 8, background: 'rgba(0,0,0,0.45)', borderRadius: 1, overflow: 'hidden', border: `1px solid ${ACCENT}22` }}>
                    <div style={{
                      width: `${pityPct}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${ACCENT}66, ${ACCENT})`,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>
              )}

              <div style={{ marginTop: 12, fontSize: 12, color: '#d9b880', lineHeight: 1.5 }}>
                The spark threshold is an unbreakable contract. Every pull counts — dupes, misses, low-rarities. When the meter fills, you pick any featured unit on display and take it home.
              </div>
            </div>
          </div>

          {/* FEATURED */}
          {featured.five.length > 0 && (
            <div style={{ marginBottom: 14, padding: 10, background: 'rgba(224, 160, 72, 0.04)', border: `1px solid ${ACCENT}33`, borderRadius: 2 }}>
              <div style={{ fontSize: 10, letterSpacing: 0.15, textTransform: 'uppercase', color: GOLDLEAF, marginBottom: 6 }}>Sparkable</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {featured.five.map(u => (
                  <span key={u.id} style={{
                    padding: '5px 12px',
                    fontSize: 12,
                    fontWeight: 700,
                    background: `linear-gradient(90deg, ${u.color}, ${u.color}99)`,
                    color: DARK,
                    borderRadius: 20,
                    border: `1px solid ${GOLDLEAF}aa`,
                    boxShadow: `0 0 8px -2px ${GOLDLEAF}55`,
                  }}>★5 {u.name}</span>
                ))}
                {featured.four.map(u => (
                  <span key={u.id} style={{
                    padding: '4px 10px',
                    fontSize: 11,
                    color: '#f6e4c8',
                    border: `1px solid ${ACCENT}44`,
                    borderRadius: 20,
                  }}>★4 {u.name}</span>
                ))}
              </div>
            </div>
          )}

          {/* STATUS */}
          <div style={{ padding: 10, background: 'rgba(0,0,0,0.4)', border: `1px solid ${ACCENT}33`, borderRadius: 2, marginBottom: 12 }}>
            <StatusBar combo={combo} eng={eng} />
          </div>

          {/* CONTROLS */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <SparkButton disabled={!eng.canPull1} onClick={eng.pull1}>Pull 1 · {eng.pullCost}</SparkButton>
            <SparkButton primary disabled={!eng.canPull10} onClick={eng.pull10}>Pull 10 · {(eng.pullCost * 10).toLocaleString()}</SparkButton>
            <SparkButton spark disabled={!sparkReady} onClick={eng.spark} glow={sparkReady}>
              {sparkReady ? 'Redeem Spark ★' : `Spark (${state.sparkProgress}/${state.sparkThreshold})`}
            </SparkButton>
            <SparkButton ghost onClick={() => eng.addFunds()}>+ Funds</SparkButton>
            <SparkButton ghost onClick={eng.reset}>Reset</SparkButton>
          </div>

          {/* RESULTS */}
          <div style={{
            minHeight: 170,
            padding: 14,
            background: 'rgba(0,0,0,0.45)',
            border: `1px solid ${ACCENT}33`,
            borderRadius: 2,
          }}>
            {lastResults.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: '#8a6a3a', fontSize: 13 }}>
                The threshold awaits. Each pull brings you closer to the redemption.
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
          <div style={{ padding: 14, background: 'rgba(0,0,0,0.4)', border: `1px solid ${ACCENT}33`, borderRadius: 2 }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 11, letterSpacing: 0.18, textTransform: 'uppercase', color: GOLDLEAF }}>
              Spark math
            </h3>
            <Row label="Threshold" value={state.sparkThreshold} />
            <Row label="Progress" value={state.sparkProgress} />
            <Row label="Remaining" value={Math.max(0, state.sparkThreshold - state.sparkProgress)} />
            <Row label="Cost to finish" value={`${(Math.max(0, state.sparkThreshold - state.sparkProgress) * eng.pullCost).toLocaleString()}`} />
            <div style={{ marginTop: 10, fontSize: 11, color: '#d9b880', lineHeight: 1.5 }}>
              Spark is the whale ceiling. You will never need to spend more than this to secure the featured unit.
            </div>
          </div>

          <div style={{ padding: 14, background: 'rgba(0,0,0,0.4)', border: `1px solid ${ACCENT}33`, borderRadius: 2 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 11, letterSpacing: 0.18, textTransform: 'uppercase', color: GOLDLEAF }}>
              Layers
            </h3>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {combo.guarantee.layers.map((l, i) => (
                <span key={i} style={{
                  padding: '3px 8px',
                  fontSize: 10.5,
                  background: `${ACCENT}12`,
                  color: '#f6e4c8',
                  border: `1px solid ${ACCENT}55`,
                  borderRadius: 1,
                }}>{l}</span>
              ))}
            </div>
          </div>

          <div style={{ padding: 14, background: 'rgba(0,0,0,0.4)', border: `1px solid ${ACCENT}33`, borderRadius: 2 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 11, letterSpacing: 0.18, textTransform: 'uppercase', color: GOLDLEAF }}>
              History · {state.history.length}
            </h3>
            {state.history.length === 0 ? (
              <div style={{ fontSize: 11, color: '#8a6a3a' }}>No pulls yet.</div>
            ) : (
              <div style={{ maxHeight: 220, overflowY: 'auto', fontSize: 10.5, color: '#d9b880' }}>
                {state.history.slice(-40).reverse().map((h, i) => (
                  <div key={i} style={{ padding: '1px 0', color: h.rarity === 5 ? GOLDLEAF : h.rarity === 4 ? '#c4a06a' : '#8a6a3a' }}>
                    #{state.history.length - i} · ★{h.rarity} {h.unit.name}
                    {h.sparkRedeemed && ' · spark'}{h.hardPity && ' · hard'}
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

function Row({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      padding: '3px 0', fontSize: 11.5,
      borderBottom: `1px dashed ${ACCENT}22`,
    }}>
      <span style={{ color: '#d9b880' }}>{label}</span>
      <b style={{ color: '#fff1d0', fontVariantNumeric: 'tabular-nums' }}>{value.toLocaleString()}</b>
    </div>
  );
}

function SparkButton({ children, onClick, disabled, primary, ghost, spark, glow }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean;
  primary?: boolean; ghost?: boolean; spark?: boolean; glow?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '10px 16px',
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 0.06,
      textTransform: 'uppercase',
      background: spark && glow ? `linear-gradient(180deg, ${GOLDLEAF}, ${ACCENT})`
        : primary ? `linear-gradient(180deg, ${ACCENT}, #a67534)`
        : ghost ? 'transparent'
        : 'rgba(224, 160, 72, 0.1)',
      color: (primary || (spark && glow)) ? DARK : '#f6e4c8',
      border: `1px solid ${spark && glow ? GOLDLEAF : ACCENT}88`,
      borderRadius: 2,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      animation: spark && glow ? 'fs-breath 2s ease-in-out infinite' : undefined,
    }}>{children}</button>
  );
}

const KEYFRAMES = `
@keyframes fs-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes fs-breath {
  0%, 100% { filter: drop-shadow(0 0 6px ${GOLDLEAF}88); }
  50% { filter: drop-shadow(0 0 16px ${GOLDLEAF}); }
}
`;
