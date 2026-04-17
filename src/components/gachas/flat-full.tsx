// HAND-CRAFTED: Flat + Full suite — everything stacked (but NOT an anniversary-megabanner
// which is a separate named flavor). Everything visible, laid out calmly as panels.
// Subdued celebration gold; emphasis on transparency rather than festival loudness.
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { featuredFor } from '../../data/roster';
import { useGachaEngine } from '../../lib/useGachaEngine';
import { UnitCard, StatusBar } from '../../lib/GachaFrame';

const ACCENT = '#ffd86f';
const DEEP = '#f0b040';
const TYPE_KEY = 'flat-full';

interface Props { slug: string }

export default function FlatFull({ slug }: Props) {
  const navigate = useNavigate();
  const variants = useMemo(() => combosForType(TYPE_KEY), []);
  const combo = useMemo(() => variants.find(v => v.slug === slug) ?? variants[0], [variants, slug]);
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;
  const featured = featuredFor(combo.banner.id);

  const pityPct = Math.min(100, (state.pullsSinceFiveStar / state.hardPityAt) * 100);
  const sparkPct = Math.min(100, (state.sparkProgress / state.sparkThreshold) * 100);
  const shardPct = Math.min(100, (state.shards / state.shardsNeededForFive) * 100);
  const softPityActive = state.pullsSinceFiveStar >= state.softPityStart;

  // Systems active list
  const systems = [
    { key: 'pity', label: 'Soft + Hard Pity', active: true },
    { key: '5050', label: '50/50 Rate-up', active: true },
    { key: 'carry', label: 'Carry-over', active: true },
    { key: 'radiance', label: 'Capturing Radiance', active: true },
    { key: 'spark', label: 'Spark', active: true },
    { key: 'shards', label: 'Shards', active: true },
    { key: 'batch', label: '10× Batch floor', active: true },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1a1608 0%, #120e05 60%, #0a0803 100%)',
      color: '#f5ead0',
      padding: 18,
    }}>
      <Link to="/" style={{ color: '#c7b680', fontSize: 13, textDecoration: 'none' }}>← Back to dashboard</Link>

      {/* HEADER */}
      <header style={{
        marginTop: 14,
        marginBottom: 16,
        padding: '18px 22px',
        background: 'linear-gradient(90deg, rgba(255, 216, 111, 0.05) 0%, rgba(0,0,0,0.3) 100%)',
        border: `1px solid ${ACCENT}44`,
        borderLeft: `3px solid ${ACCENT}`,
        borderRadius: 3,
      }}>
        <div style={{ fontSize: 10.5, letterSpacing: 0.2, textTransform: 'uppercase', color: DEEP, marginBottom: 4, fontWeight: 600 }}>
          Full Stack · Independent-Trial Baseline
        </div>
        <h1 style={{
          margin: 0,
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: -0.2,
          color: '#fff7dd',
        }}>Flat · Full Suite</h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#c7b680', maxWidth: 760, lineHeight: 1.5 }}>
          Everything the industry has invented, stacked on the same banner — pity, 50/50, carry-over, Radiance, spark, shards, batch floor. Not a festival or anniversary — just a thorough standard configuration. Expensive to tune well; generous when it works.
        </p>
      </header>

      {/* SYSTEMS ACTIVE */}
      <div style={{
        marginBottom: 16,
        padding: '10px 14px',
        background: 'rgba(255, 216, 111, 0.04)',
        border: `1px solid ${ACCENT}33`,
        borderRadius: 3,
      }}>
        <div style={{ fontSize: 10, letterSpacing: 0.18, textTransform: 'uppercase', color: DEEP, marginBottom: 8, fontWeight: 600 }}>
          Systems active · all visible
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {systems.map(s => (
            <span key={s.key} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 10px',
              background: 'rgba(0,0,0,0.4)',
              border: `1px solid ${ACCENT}44`,
              borderRadius: 20,
              fontSize: 11,
              color: '#f5ead0',
            }}>
              <span aria-hidden style={{
                width: 12, height: 12, borderRadius: '50%',
                background: ACCENT,
                color: '#1a1608',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 900, lineHeight: 1,
              }}>✓</span>
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {variants.length > 1 && (
        <div style={{
          marginBottom: 16,
          padding: 10,
          background: 'rgba(255, 216, 111, 0.04)',
          border: `1px solid ${ACCENT}33`,
          borderRadius: 3,
        }}>
          <div style={{ fontSize: 10, letterSpacing: 0.14, textTransform: 'uppercase', color: DEEP, marginBottom: 6 }}>
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
                  color: active ? '#1a1608' : '#f5ead0',
                  border: `1px solid ${active ? ACCENT : ACCENT + '55'}`,
                  borderRadius: 2,
                  cursor: 'pointer',
                  fontWeight: active ? 600 : 400,
                }}>{v.banner.name} · {v.currency.name}</button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) 280px', gap: 16 }}>
        <div>
          {/* FEATURED */}
          {featured.five.length > 0 && (
            <div style={{ marginBottom: 14, padding: 10, background: 'rgba(0,0,0,0.3)', border: `1px solid ${ACCENT}33`, borderRadius: 2 }}>
              <div style={{ fontSize: 10, letterSpacing: 0.14, textTransform: 'uppercase', color: DEEP, marginBottom: 6 }}>Featured</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {featured.five.map(u => (
                  <span key={u.id} style={{
                    padding: '5px 12px',
                    fontSize: 12, fontWeight: 700,
                    background: `linear-gradient(90deg, ${u.color}, ${u.color}99)`,
                    color: '#1a1608',
                    borderRadius: 20,
                    border: `1px solid ${ACCENT}aa`,
                  }}>★5 {u.name}</span>
                ))}
                {featured.four.map(u => (
                  <span key={u.id} style={{
                    padding: '4px 10px', fontSize: 11,
                    color: '#f5ead0',
                    border: `1px solid ${ACCENT}44`,
                    borderRadius: 20,
                  }}>★4 {u.name}</span>
                ))}
              </div>
            </div>
          )}

          {/* THREE PANELS: PITY / SPARK / SHARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
            <Panel title="Pity" subtitle={softPityActive ? 'Soft active' : 'Tracking'} pct={pityPct} current={state.pullsSinceFiveStar} max={state.hardPityAt} extras={
              <div style={{ fontSize: 10.5, color: state.carryOver ? ACCENT : '#8c7d5e' }}>
                {state.carryOver ? 'Carry armed · next 5★ is featured' : 'No carry'}
              </div>
            } />
            <Panel title="Spark" subtitle={eng.canSpark ? 'Ready' : 'Accumulating'} pct={sparkPct} current={state.sparkProgress} max={state.sparkThreshold} extras={
              <button onClick={eng.spark} disabled={!eng.canSpark} style={{
                padding: '3px 8px', fontSize: 10, fontWeight: 700, letterSpacing: 0.1, textTransform: 'uppercase',
                background: eng.canSpark ? ACCENT : 'transparent',
                color: eng.canSpark ? '#1a1608' : '#8c7d5e',
                border: `1px solid ${ACCENT}55`,
                borderRadius: 1,
                cursor: eng.canSpark ? 'pointer' : 'not-allowed',
              }}>Redeem</button>
            } />
            <Panel title="Shards" subtitle={eng.canShards ? 'Forge ready' : 'Accruing'} pct={shardPct} current={state.shards} max={state.shardsNeededForFive} extras={
              <button onClick={eng.shards} disabled={!eng.canShards} style={{
                padding: '3px 8px', fontSize: 10, fontWeight: 700, letterSpacing: 0.1, textTransform: 'uppercase',
                background: eng.canShards ? ACCENT : 'transparent',
                color: eng.canShards ? '#1a1608' : '#8c7d5e',
                border: `1px solid ${ACCENT}55`,
                borderRadius: 1,
                cursor: eng.canShards ? 'pointer' : 'not-allowed',
              }}>Forge</button>
            } />
          </div>

          {/* RADIANCE PANEL (smaller, horizontal) */}
          <div style={{
            marginBottom: 14,
            padding: '10px 14px',
            background: 'rgba(0,0,0,0.3)',
            border: `1px solid ${ACCENT}33`,
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 14,
          }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 0.14, textTransform: 'uppercase', color: DEEP, fontWeight: 600 }}>
                Capturing Radiance
              </div>
              <div style={{ fontSize: 11.5, color: '#c7b680', marginTop: 2 }}>
                Adaptive 50/50 — each consecutive loss raises the next rate-up roll.
              </div>
            </div>
            <div style={{
              padding: '5px 10px',
              background: state.radianceLossStreak > 0 ? `${ACCENT}22` : 'transparent',
              border: `1px solid ${ACCENT}55`,
              borderRadius: 1,
              fontSize: 11,
              color: state.radianceLossStreak > 0 ? ACCENT : '#8c7d5e',
              letterSpacing: 0.05,
              textTransform: 'uppercase',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}>
              {state.radianceLossStreak > 0 ? `+${state.radianceLossStreak * 10}% next rate-up` : 'Streak: 0'}
            </div>
          </div>

          {/* STATUS */}
          <div style={{ padding: 10, background: 'rgba(0,0,0,0.35)', border: `1px solid ${ACCENT}33`, borderRadius: 2, marginBottom: 12 }}>
            <StatusBar combo={combo} eng={eng} />
          </div>

          {/* CONTROLS */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <FullButton disabled={!eng.canPull1} onClick={eng.pull1}>Pull 1 · {eng.pullCost}</FullButton>
            <FullButton primary disabled={!eng.canPull10} onClick={eng.pull10}>Pull 10 · {(eng.pullCost * 10).toLocaleString()}</FullButton>
            <FullButton disabled={!eng.canSpark} onClick={eng.spark}>Spark ({state.sparkProgress}/{state.sparkThreshold})</FullButton>
            <FullButton disabled={!eng.canShards} onClick={eng.shards}>Forge ({state.shards}/{state.shardsNeededForFive})</FullButton>
            <FullButton ghost onClick={() => eng.addFunds()}>+ Funds</FullButton>
            <FullButton ghost onClick={eng.reset}>Reset</FullButton>
          </div>

          {/* RESULTS */}
          <div style={{
            minHeight: 170,
            padding: 14,
            background: 'rgba(0,0,0,0.4)',
            border: `1px solid ${ACCENT}33`,
            borderRadius: 2,
          }}>
            {lastResults.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: '#8c7d5e', fontSize: 13 }}>
                All systems online. Press Pull to see how they interact.
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
          <div style={{ padding: 14, background: 'rgba(0,0,0,0.35)', border: `1px solid ${ACCENT}33`, borderRadius: 2 }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 11, letterSpacing: 0.18, textTransform: 'uppercase', color: DEEP }}>
              Cost ceilings
            </h3>
            <Row label="Hard pity · 5★ by" value={state.hardPityAt} />
            <Row label="Spark threshold" value={state.sparkThreshold} />
            <Row label="Shards for featured" value={state.shardsNeededForFive} />
            <Row label="Batch floor every" value={10} />
            <div style={{ marginTop: 8, fontSize: 11, color: '#c7b680', lineHeight: 1.5 }}>
              Every ceiling visible above is hit independently. Whichever ceiling triggers first wins. No hidden floors.
            </div>
          </div>

          <div style={{ padding: 14, background: 'rgba(0,0,0,0.35)', border: `1px solid ${ACCENT}33`, borderRadius: 2 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 11, letterSpacing: 0.18, textTransform: 'uppercase', color: DEEP }}>
              Layers
            </h3>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {combo.guarantee.layers.map((l, i) => (
                <span key={i} style={{
                  padding: '3px 8px',
                  fontSize: 10.5,
                  background: `${ACCENT}15`,
                  color: '#f5ead0',
                  border: `1px solid ${ACCENT}55`,
                  borderRadius: 1,
                }}>{l}</span>
              ))}
            </div>
          </div>

          <div style={{ padding: 14, background: 'rgba(0,0,0,0.35)', border: `1px solid ${ACCENT}33`, borderRadius: 2 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 11, letterSpacing: 0.18, textTransform: 'uppercase', color: DEEP }}>
              History · {state.history.length}
            </h3>
            {state.history.length === 0 ? (
              <div style={{ fontSize: 11, color: '#8c7d5e' }}>No pulls yet.</div>
            ) : (
              <div style={{ maxHeight: 260, overflowY: 'auto', fontSize: 10.5, color: '#c7b680' }}>
                {state.history.slice(-40).reverse().map((h, i) => {
                  const crafted = h.extra && (h.extra as Record<string, unknown>).shardCraft;
                  return (
                    <div key={i} style={{ padding: '1px 0', color: h.rarity === 5 ? ACCENT : h.rarity === 4 ? '#b79df2' : '#8c7d5e' }}>
                      #{state.history.length - i} · ★{h.rarity} {h.unit.name}
                      {h.hardPity && ' · hard'}{h.softPity && ' · soft'}
                      {h.rateUpHit && ' · rate-up'}{h.rateUpLoss && ' · lost'}
                      {h.carryOverConsumed && ' · carry'}{h.sparkRedeemed && ' · spark'}
                      {h.batchFloor && ' · batch'}
                      {crafted ? ' · forge' : ''}
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

function Panel({ title, subtitle, pct, current, max, extras }: {
  title: string; subtitle: string; pct: number; current: number; max: number; extras?: React.ReactNode;
}) {
  return (
    <div style={{
      padding: 12,
      background: 'rgba(0,0,0,0.35)',
      border: `1px solid ${ACCENT}44`,
      borderRadius: 2,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      minHeight: 120,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: 11, letterSpacing: 0.14, textTransform: 'uppercase', color: DEEP, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 10, color: '#c7b680', letterSpacing: 0.05, textTransform: 'uppercase' }}>{subtitle}</div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 500, color: '#fff7dd', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
        {current}<span style={{ color: '#8c7d5e', fontSize: 14 }}> / {max}</span>
      </div>
      <div style={{ position: 'relative', height: 6, background: 'rgba(0,0,0,0.6)', borderRadius: 1, overflow: 'hidden', border: `1px solid ${ACCENT}22` }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${DEEP}, ${ACCENT})`,
          transition: 'width 0.4s ease',
          boxShadow: `0 0 4px ${ACCENT}66`,
        }} />
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
        {extras}
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
      <span style={{ color: '#c7b680' }}>{label}</span>
      <b style={{ color: '#fff7dd', fontVariantNumeric: 'tabular-nums' }}>{typeof value === 'number' ? value.toLocaleString() : value}</b>
    </div>
  );
}

function FullButton({ children, onClick, disabled, primary, ghost }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; primary?: boolean; ghost?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '10px 14px',
      fontSize: 11.5,
      fontWeight: 700,
      letterSpacing: 0.06,
      textTransform: 'uppercase',
      background: primary ? `linear-gradient(180deg, ${ACCENT}, ${DEEP})` : ghost ? 'transparent' : 'rgba(255, 216, 111, 0.08)',
      color: primary ? '#1a1608' : '#f5ead0',
      border: `1px solid ${primary ? ACCENT : ACCENT + '55'}`,
      borderRadius: 2,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
    }}>{children}</button>
  );
}
