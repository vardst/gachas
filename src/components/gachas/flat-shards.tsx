// HAND-CRAFTED: Flat + Shard conversion (dupes melt into crafting material).
// Vibe: alchemy / forge workshop. Warm bronze, rust, gear/anvil imagery.
// Hero: shard counter + "FORGE" button when full.
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { featuredFor } from '../../data/roster';
import { useGachaEngine } from '../../lib/useGachaEngine';
import { UnitCard, StatusBar } from '../../lib/GachaFrame';

const ACCENT = '#d4a26f';
const RUST = '#9c5a36';
const EMBER = '#f0a050';
const TYPE_KEY = 'flat-shards';

interface Props { slug: string }

export default function FlatShards({ slug }: Props) {
  const navigate = useNavigate();
  const variants = useMemo(() => combosForType(TYPE_KEY), []);
  const combo = useMemo(() => variants.find(v => v.slug === slug) ?? variants[0], [variants, slug]);
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;
  const featured = featuredFor(combo.banner.id);

  const shardPct = Math.min(100, (state.shards / state.shardsNeededForFive) * 100);
  const forgeReady = eng.canShards;
  const usesPity = combo.guarantee.id === 'shards_pity';
  const pityPct = usesPity ? Math.min(100, (state.pullsSinceFiveStar / state.hardPityAt) * 100) : 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 20% 100%, #3a2010 0%, #1f1208 55%, #0d0704 100%)',
      color: '#e8d0b0',
      padding: 18,
    }}>
      <style>{KEYFRAMES}</style>

      <Link to="/" style={{ color: '#c4976d', fontSize: 13, textDecoration: 'none' }}>← Back to dashboard</Link>

      {/* HEADER */}
      <header style={{
        marginTop: 14,
        marginBottom: 16,
        padding: '18px 22px',
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(156, 90, 54, 0.15) 0%, rgba(0,0,0,0.4) 100%)',
        border: `1px solid ${ACCENT}44`,
        borderRadius: 3,
        overflow: 'hidden',
      }}>
        {/* Gear decoration */}
        <Gear size={120} style={{ position: 'absolute', right: -30, top: -20, opacity: 0.08, animation: 'fsh-slow-rotate 80s linear infinite' }} />
        <Gear size={80} style={{ position: 'absolute', right: 60, top: 50, opacity: 0.06, animation: 'fsh-slow-rotate-rev 60s linear infinite' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 10.5, letterSpacing: 0.22, textTransform: 'uppercase', color: EMBER, marginBottom: 4, fontWeight: 600 }}>
            Forge Protocol · Dupe Conversion
          </div>
          <h1 style={{
            margin: 0,
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: -0.2,
            color: '#fff0d8',
            fontFamily: '"Trajan Pro", Georgia, serif',
            textShadow: `0 0 20px ${RUST}88`,
          }}>Flat · Shard Conversion</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#c4976d', maxWidth: 720, lineHeight: 1.5 }}>
            Dupes don't feel bad. They become shards. Collect 80 shards and forge them into a featured 5★ of your choice. The dominant QoL innovation of 2024+ gachas.
          </p>
        </div>
      </header>

      {variants.length > 1 && (
        <div style={{
          marginBottom: 16,
          padding: 10,
          background: 'rgba(156, 90, 54, 0.1)',
          border: `1px solid ${ACCENT}44`,
          borderRadius: 3,
        }}>
          <div style={{ fontSize: 10, letterSpacing: 0.15, textTransform: 'uppercase', color: EMBER, marginBottom: 6 }}>
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
                  color: active ? '#1f1208' : '#e8d0b0',
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
          {/* FORGE HERO */}
          <div style={{
            padding: 18,
            background: 'linear-gradient(180deg, rgba(156, 90, 54, 0.1) 0%, rgba(0,0,0,0.5) 100%)',
            border: `1px solid ${forgeReady ? EMBER : ACCENT}88`,
            borderRadius: 3,
            marginBottom: 14,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: forgeReady ? `inset 0 0 40px ${EMBER}22, 0 0 30px -6px ${EMBER}66` : 'none',
          }}>
            {forgeReady && (
              <div aria-hidden style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: `radial-gradient(ellipse at 50% 80%, ${EMBER}22 0%, transparent 60%)`,
                animation: 'fsh-fire 2.4s ease-in-out infinite',
              }} />
            )}
            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 18, alignItems: 'center' }}>
              {/* Anvil/crucible icon */}
              <div style={{
                width: 80, height: 80,
                background: `radial-gradient(circle at 50% 40%, ${forgeReady ? EMBER : RUST} 0%, ${DARK_RUST} 55%, #1a0a04 100%)`,
                borderRadius: '50%',
                border: `2px solid ${forgeReady ? EMBER : ACCENT}77`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: forgeReady ? `0 0 25px ${EMBER}aa, inset 0 0 12px #0a0503` : `inset 0 0 12px #0a0503`,
                fontSize: 34,
                color: forgeReady ? '#fff0d8' : ACCENT,
                fontFamily: 'Georgia, serif',
                fontWeight: 700,
                animation: forgeReady ? 'fsh-pulse 2.2s ease-in-out infinite' : undefined,
              }}>◈</div>

              <div>
                <div style={{ fontSize: 10.5, letterSpacing: 0.2, textTransform: 'uppercase', color: EMBER, fontWeight: 700 }}>
                  Shard Count
                </div>
                <div style={{
                  fontSize: 48,
                  fontWeight: 200,
                  lineHeight: 1,
                  color: forgeReady ? EMBER : '#fff0d8',
                  fontVariantNumeric: 'tabular-nums',
                  textShadow: forgeReady ? `0 0 20px ${EMBER}aa` : 'none',
                  fontFamily: 'Georgia, serif',
                }}>
                  {state.shards}
                  <span style={{ color: '#7a4a28', fontSize: 22, margin: '0 6px' }}>/</span>
                  {state.shardsNeededForFive}
                </div>
                {/* Bar */}
                <div style={{ marginTop: 8, position: 'relative', height: 14, background: 'rgba(0,0,0,0.6)', border: `1px solid ${ACCENT}44`, borderRadius: 1, overflow: 'hidden' }}>
                  <div style={{
                    width: `${shardPct}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${RUST} 0%, ${ACCENT} 60%, ${EMBER} 100%)`,
                    boxShadow: forgeReady ? `0 0 10px ${EMBER}` : `0 0 6px ${ACCENT}88`,
                    transition: 'width 0.5s cubic-bezier(.22,1,.36,1)',
                  }} />
                  {[20, 40, 60, 80].map(m => {
                    const pct = (m / state.shardsNeededForFive) * 100;
                    return (
                      <div key={m} style={{
                        position: 'absolute', left: `${pct}%`, top: -2, bottom: -2,
                        width: 1,
                        background: state.shards >= m ? EMBER : 'rgba(228,200,160,0.25)',
                      }} />
                    );
                  })}
                </div>
              </div>

              <button
                onClick={eng.shards}
                disabled={!forgeReady}
                style={{
                  padding: '14px 22px',
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: 0.2,
                  textTransform: 'uppercase',
                  background: forgeReady ? `linear-gradient(180deg, ${EMBER}, ${RUST})` : 'rgba(156, 90, 54, 0.12)',
                  color: forgeReady ? '#1a0a04' : '#7a4a28',
                  border: `2px solid ${forgeReady ? EMBER : ACCENT}77`,
                  borderRadius: 3,
                  cursor: forgeReady ? 'pointer' : 'not-allowed',
                  boxShadow: forgeReady ? `0 0 22px -2px ${EMBER}, inset 0 1px 0 #fff6e0` : 'none',
                  animation: forgeReady ? 'fsh-ready-pulse 1.8s ease-in-out infinite' : undefined,
                }}
              >
                {forgeReady ? 'FORGE ◈' : `FORGE (${state.shardsNeededForFive - state.shards} shards)`}
              </button>
            </div>

            <div style={{ marginTop: 14, fontSize: 12, color: '#c4976d', lineHeight: 1.5, position: 'relative' }}>
              Duplicates of units you already own melt into shards automatically. 80 shards = guaranteed featured. No pick-a-featured drama, no wasted dupes, no regret spiral.
            </div>
          </div>

          {/* Pity bar if applicable */}
          {usesPity && (
            <div style={{ padding: 10, background: 'rgba(0,0,0,0.4)', border: `1px solid ${ACCENT}33`, borderRadius: 2, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, letterSpacing: 0.12, textTransform: 'uppercase', marginBottom: 6 }}>
                <span style={{ color: '#c4976d' }}>Pity · since 5★</span>
                <span style={{ color: '#e8d0b0' }}>{state.pullsSinceFiveStar} / {state.hardPityAt}</span>
              </div>
              <div style={{ position: 'relative', height: 6, background: 'rgba(0,0,0,0.6)', borderRadius: 1, overflow: 'hidden', border: `1px solid ${ACCENT}22` }}>
                <div style={{
                  width: `${pityPct}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${ACCENT}66, ${EMBER})`,
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>
          )}

          {/* FEATURED */}
          {featured.five.length > 0 && (
            <div style={{ marginBottom: 14, padding: 10, background: 'rgba(0,0,0,0.35)', border: `1px solid ${ACCENT}33`, borderRadius: 2 }}>
              <div style={{ fontSize: 10, letterSpacing: 0.15, textTransform: 'uppercase', color: EMBER, marginBottom: 6 }}>Forgeable</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {featured.five.map(u => (
                  <span key={u.id} style={{
                    padding: '5px 12px',
                    fontSize: 12,
                    fontWeight: 700,
                    background: `linear-gradient(90deg, ${u.color}, ${u.color}99)`,
                    color: '#1a0a04',
                    borderRadius: 2,
                    border: `1px solid ${EMBER}aa`,
                    boxShadow: `0 0 8px -2px ${EMBER}55`,
                  }}>★5 {u.name}</span>
                ))}
                {featured.four.map(u => (
                  <span key={u.id} style={{
                    padding: '4px 10px',
                    fontSize: 11,
                    color: '#e8d0b0',
                    border: `1px solid ${ACCENT}55`,
                    borderRadius: 2,
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
            <ForgeButton disabled={!eng.canPull1} onClick={eng.pull1}>Pull 1 · {eng.pullCost}</ForgeButton>
            <ForgeButton primary disabled={!eng.canPull10} onClick={eng.pull10}>Pull 10 · {(eng.pullCost * 10).toLocaleString()}</ForgeButton>
            <ForgeButton ghost onClick={() => eng.addFunds()}>+ Funds</ForgeButton>
            <ForgeButton ghost onClick={eng.reset}>Reset</ForgeButton>
          </div>

          {/* RESULTS */}
          <div style={{
            minHeight: 170,
            padding: 14,
            background: 'rgba(0,0,0,0.5)',
            border: `1px solid ${ACCENT}33`,
            borderRadius: 2,
          }}>
            {lastResults.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: '#7a4a28', fontSize: 13 }}>
                The forge is cold. Pull to feed raw materials into the system.
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
            <h3 style={{ margin: '0 0 10px', fontSize: 11, letterSpacing: 0.18, textTransform: 'uppercase', color: EMBER }}>
              Forge ledger
            </h3>
            <Row label="Shards held" value={state.shards} />
            <Row label="Per 5★ forge" value={state.shardsNeededForFive} />
            <Row label="Crafts remaining" value={`${forgeReady ? 1 : 0} available`} />
            <Row label="5★ obtained" value={state.fiveStarCount} />
            <Row label="Featured obtained" value={state.featuredObtained} />
          </div>

          <div style={{ padding: 14, background: 'rgba(0,0,0,0.4)', border: `1px solid ${ACCENT}33`, borderRadius: 2 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 11, letterSpacing: 0.18, textTransform: 'uppercase', color: EMBER }}>
              Layers
            </h3>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {combo.guarantee.layers.map((l, i) => (
                <span key={i} style={{
                  padding: '3px 8px',
                  fontSize: 10.5,
                  background: `${ACCENT}14`,
                  color: '#e8d0b0',
                  border: `1px solid ${ACCENT}55`,
                  borderRadius: 1,
                }}>{l}</span>
              ))}
            </div>
            {combo.example && (
              <div style={{ marginTop: 10, padding: 8, background: 'rgba(156, 90, 54, 0.15)', fontSize: 11, color: '#c4976d', borderRadius: 1, borderLeft: `2px solid ${EMBER}` }}>
                <span style={{ color: EMBER, fontWeight: 600 }}>Analogue:</span> {combo.example}
              </div>
            )}
          </div>

          <div style={{ padding: 14, background: 'rgba(0,0,0,0.4)', border: `1px solid ${ACCENT}33`, borderRadius: 2 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 11, letterSpacing: 0.18, textTransform: 'uppercase', color: EMBER }}>
              History · {state.history.length}
            </h3>
            {state.history.length === 0 ? (
              <div style={{ fontSize: 11, color: '#7a4a28' }}>No pulls yet.</div>
            ) : (
              <div style={{ maxHeight: 220, overflowY: 'auto', fontSize: 10.5, color: '#c4976d' }}>
                {state.history.slice(-40).reverse().map((h, i) => {
                  const crafted = h.extra && (h.extra as Record<string, unknown>).shardCraft;
                  return (
                    <div key={i} style={{ padding: '1px 0', color: h.rarity === 5 ? EMBER : h.rarity === 4 ? '#c4976d' : '#7a4a28' }}>
                      #{state.history.length - i} · ★{h.rarity} {h.unit.name}
                      {crafted ? ' · forged' : ''}
                      {h.hardPity ? ' · hard' : ''}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

const DARK_RUST = '#5c2f18';

function Row({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      padding: '3px 0', fontSize: 11.5,
      borderBottom: `1px dashed ${ACCENT}22`,
    }}>
      <span style={{ color: '#c4976d' }}>{label}</span>
      <b style={{ color: '#fff0d8', fontVariantNumeric: 'tabular-nums' }}>{typeof value === 'number' ? value.toLocaleString() : value}</b>
    </div>
  );
}

function ForgeButton({ children, onClick, disabled, primary, ghost }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; primary?: boolean; ghost?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '10px 16px',
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 0.06,
      textTransform: 'uppercase',
      background: primary ? `linear-gradient(180deg, ${ACCENT}, ${RUST})` : ghost ? 'transparent' : 'rgba(156, 90, 54, 0.12)',
      color: primary ? '#1a0a04' : '#e8d0b0',
      border: `1px solid ${primary ? ACCENT : ACCENT + '66'}`,
      borderRadius: 2,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
    }}>{children}</button>
  );
}

function Gear({ size, style }: { size: number; style?: React.CSSProperties }) {
  // Simple 8-tooth gear silhouette via SVG
  const teeth = 12;
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100" style={style} aria-hidden>
      <g fill={ACCENT}>
        {Array.from({ length: teeth }).map((_, i) => {
          const a = (i * 360) / teeth;
          return <rect key={i} x={-4} y={-48} width={8} height={10} transform={`rotate(${a})`} />;
        })}
        <circle r={36} />
        <circle r={14} fill="#0d0704" />
      </g>
    </svg>
  );
}

const KEYFRAMES = `
@keyframes fsh-slow-rotate { from { transform: rotate(0); } to { transform: rotate(360deg); } }
@keyframes fsh-slow-rotate-rev { from { transform: rotate(360deg); } to { transform: rotate(0); } }
@keyframes fsh-pulse {
  0%, 100% { box-shadow: 0 0 20px ${EMBER}aa, inset 0 0 12px #0a0503; }
  50% { box-shadow: 0 0 40px ${EMBER}, inset 0 0 14px #0a0503; }
}
@keyframes fsh-fire {
  0%, 100% { opacity: 0.5; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-3px); }
}
@keyframes fsh-ready-pulse {
  0%, 100% { transform: translateY(0); box-shadow: 0 0 22px -2px ${EMBER}, inset 0 1px 0 #fff6e0; }
  50% { transform: translateY(-1px); box-shadow: 0 0 32px -2px ${EMBER}, inset 0 1px 0 #fff6e0; }
}
`;
