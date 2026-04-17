// HAND-CRAFTED: Flat + 10x batch floor only.
// Vibe: early-2010s JP mobile utilitarian. Flat colors, monospace, honest.
// The only guarantee is: every 10th pull is at least 4-star.
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { featuredFor } from '../../data/roster';
import { useGachaEngine } from '../../lib/useGachaEngine';
import { UnitCard, StatusBar } from '../../lib/GachaFrame';

const ACCENT = '#a0d468';
const INK = '#1a1d18';
const TYPE_KEY = 'flat-batch';

interface Props { slug: string }

export default function FlatBatch({ slug }: Props) {
  const navigate = useNavigate();
  const variants = useMemo(() => combosForType(TYPE_KEY), []);
  const combo = useMemo(() => variants.find(v => v.slug === slug) ?? variants[0], [variants, slug]);
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;
  const featured = featuredFor(combo.banner.id);

  // Batch floor math: every 10th pull is guaranteed 4★+
  const batchNumber = Math.floor(state.totalPulls / 10) + 1;
  const pullsIntoBatch = state.totalPulls % 10;
  const pullsUntilFloor = 10 - pullsIntoBatch;
  const floorReached = pullsIntoBatch === 0 && state.totalPulls > 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f3f0e4',
      color: INK,
      padding: 18,
      fontFamily: '"Helvetica Neue", Arial, sans-serif',
    }}>
      <Link to="/" style={{ color: '#4a5c3c', fontSize: 13, textDecoration: 'none' }}>← Back to dashboard</Link>

      {/* HEADER */}
      <header style={{
        marginTop: 12,
        marginBottom: 16,
        padding: '14px 18px',
        background: '#fff',
        border: `2px solid ${INK}`,
        borderRadius: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 0.18, textTransform: 'uppercase', color: '#4a5c3c', fontWeight: 700, marginBottom: 2 }}>
            System 2.0 · Batch Floor Only
          </div>
          <h1 style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: -0.5,
            color: INK,
          }}>Flat × 10× Batch</h1>
          <p style={{ margin: '3px 0 0', fontSize: 12.5, color: '#5c6556', maxWidth: 620 }}>
            The bare minimum mitigation — every 10-pull is guaranteed to contain at least one 4-star-or-better item. Otherwise, pure independent trials. Nothing fancy. No pity, no spark, no shards.
          </p>
        </div>
        <div style={{
          padding: '6px 10px',
          background: ACCENT,
          border: `2px solid ${INK}`,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.1,
          textTransform: 'uppercase',
          color: INK,
        }}>Build · 2.0</div>
      </header>

      {/* VARIANT PICKER */}
      {variants.length > 1 && (
        <div style={{
          marginBottom: 14,
          padding: 10,
          background: '#fff',
          border: `1px solid ${INK}`,
        }}>
          <div style={{ fontSize: 10, letterSpacing: 0.12, textTransform: 'uppercase', color: '#5c6556', marginBottom: 6, fontWeight: 700 }}>
            Variant · {variants.length}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {variants.map(v => {
              const active = v.slug === combo.slug;
              return (
                <button key={v.slug} onClick={() => navigate(`/play/${v.slug}`)} style={{
                  padding: '4px 10px',
                  fontSize: 11,
                  background: active ? ACCENT : '#fff',
                  color: INK,
                  border: `1px solid ${INK}`,
                  borderRadius: 0,
                  cursor: 'pointer',
                  fontWeight: active ? 700 : 400,
                }}>{v.banner.name} / {v.currency.name}</button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) 280px', gap: 16 }}>
        {/* MAIN */}
        <div>
          {/* BATCH PROGRESS — the hero of this file */}
          <div style={{
            padding: 16,
            background: '#fff',
            border: `2px solid ${INK}`,
            marginBottom: 14,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: 0.12, textTransform: 'uppercase', color: '#5c6556', fontWeight: 700 }}>
                  Batch
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1, fontFamily: 'Menlo, Consolas, monospace' }}>
                  #{batchNumber.toString().padStart(3, '0')}
                </div>
              </div>
              <div style={{
                padding: '8px 14px',
                background: floorReached ? ACCENT : '#f3f0e4',
                border: `1px solid ${INK}`,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 0.08,
                color: INK,
                textTransform: 'uppercase',
              }}>
                {floorReached
                  ? 'Floor just delivered'
                  : `${pullsUntilFloor} until 4★+ guaranteed`}
              </div>
            </div>

            {/* 10-cell track */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4, marginTop: 8 }}>
              {Array.from({ length: 10 }).map((_, i) => {
                const done = i < pullsIntoBatch;
                const isFloor = i === 9;
                return (
                  <div key={i} style={{
                    aspectRatio: '1 / 1',
                    background: done ? (isFloor ? ACCENT : INK) : '#f3f0e4',
                    border: `1px solid ${INK}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    color: done ? (isFloor ? INK : '#fff') : '#9da494',
                    fontFamily: 'Menlo, Consolas, monospace',
                    position: 'relative',
                  }}>
                    {i + 1}
                    {isFloor && !done && (
                      <div style={{
                        position: 'absolute',
                        bottom: -14,
                        fontSize: 8,
                        letterSpacing: 0.1,
                        color: '#4a5c3c',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                        fontWeight: 700,
                      }}>floor</div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 22, fontSize: 11.5, color: '#5c6556', lineHeight: 1.5 }}>
              The 10th pull of any batch is always a 4★ or better. That is the only safety net in this configuration. No pity timer exists across batches — each reset is independent.
            </div>
          </div>

          {/* FEATURED (plain) */}
          {featured.five.length > 0 && (
            <div style={{ marginBottom: 14, padding: 10, background: '#fff', border: `1px solid ${INK}` }}>
              <div style={{ fontSize: 10, letterSpacing: 0.12, textTransform: 'uppercase', color: '#5c6556', marginBottom: 6, fontWeight: 700 }}>Featured</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {featured.five.map(u => (
                  <span key={u.id} style={{
                    padding: '4px 10px',
                    fontSize: 11.5,
                    fontWeight: 700,
                    background: u.color,
                    color: INK,
                    border: `1px solid ${INK}`,
                  }}>★5 {u.name}</span>
                ))}
                {featured.four.map(u => (
                  <span key={u.id} style={{
                    padding: '4px 10px',
                    fontSize: 11,
                    background: '#f3f0e4',
                    color: INK,
                    border: `1px solid ${INK}`,
                  }}>★4 {u.name}</span>
                ))}
              </div>
            </div>
          )}

          {/* STATUS */}
          <div style={{ padding: 10, background: '#fff', border: `1px solid ${INK}`, marginBottom: 12 }}>
            <StatusBar combo={combo} eng={eng} />
          </div>

          {/* CONTROLS */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            <BatchButton disabled={!eng.canPull1} onClick={eng.pull1}>Pull 1 · {eng.pullCost}</BatchButton>
            <BatchButton primary disabled={!eng.canPull10} onClick={eng.pull10}>Pull 10 · {(eng.pullCost * 10).toLocaleString()}</BatchButton>
            <BatchButton ghost onClick={() => eng.addFunds()}>+ Funds</BatchButton>
            <BatchButton ghost onClick={eng.reset}>Reset</BatchButton>
          </div>

          {/* RESULTS */}
          <div style={{
            minHeight: 160,
            padding: 12,
            background: '#fff',
            border: `1px solid ${INK}`,
          }}>
            {lastResults.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: '#9da494', fontSize: 12.5 }}>
                No pulls yet. Press Pull 10 to guarantee a 4★ floor on the last slot.
              </div>
            ) : (
              <div key={eng.pullBurstKey} style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: 6,
              }}>
                {lastResults.map((r, i) => (
                  <UnitCard key={i} result={r} delay={i * 40} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SIDE */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ padding: 12, background: '#fff', border: `1px solid ${INK}` }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 11, letterSpacing: 0.12, textTransform: 'uppercase', color: '#4a5c3c', fontWeight: 700 }}>
              Layers
            </h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 11.5, color: INK, lineHeight: 1.7 }}>
              {combo.guarantee.layers.map((l, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, background: ACCENT, border: `1px solid ${INK}` }} />
                  {l}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ padding: 12, background: '#fff', border: `1px solid ${INK}` }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 11, letterSpacing: 0.12, textTransform: 'uppercase', color: '#4a5c3c', fontWeight: 700 }}>
              Totals
            </h3>
            <Row label="Batches completed" value={Math.floor(state.totalPulls / 10)} />
            <Row label="Floor pulls" value={state.history.filter(h => h.batchFloor).length} />
            <Row label="5★ obtained" value={state.fiveStarCount} />
            <Row label="Featured obtained" value={state.featuredObtained} />
          </div>

          <div style={{ padding: 12, background: '#fff', border: `1px solid ${INK}` }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 11, letterSpacing: 0.12, textTransform: 'uppercase', color: '#4a5c3c', fontWeight: 700 }}>
              Log · {state.history.length}
            </h3>
            {state.history.length === 0 ? (
              <div style={{ fontSize: 11, color: '#9da494' }}>—</div>
            ) : (
              <div style={{ maxHeight: 200, overflowY: 'auto', fontSize: 10.5, fontFamily: 'Menlo, Consolas, monospace', color: INK }}>
                {state.history.slice(-30).reverse().map((h, i) => (
                  <div key={i} style={{ padding: '1px 0' }}>
                    #{(state.history.length - i).toString().padStart(3, '0')}
                    {' '}★{h.rarity} {h.unit.name}{h.batchFloor ? ' *floor' : ''}
                  </div>
                ))}
              </div>
            )}
          </div>

          {combo.example && (
            <div style={{
              padding: 10,
              background: ACCENT + '33',
              border: `1px solid ${INK}`,
              fontSize: 11,
              color: INK,
              lineHeight: 1.5,
            }}>
              <div style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.1, color: '#4a5c3c', fontWeight: 700, marginBottom: 2 }}>Analogue</div>
              {combo.example}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      padding: '3px 0',
      fontSize: 11.5,
      borderBottom: '1px dotted #9da494',
    }}>
      <span style={{ color: '#5c6556' }}>{label}</span>
      <b style={{ fontFamily: 'Menlo, Consolas, monospace' }}>{value.toLocaleString()}</b>
    </div>
  );
}

function BatchButton({ children, onClick, disabled, primary, ghost }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; primary?: boolean; ghost?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '8px 14px',
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 0.04,
      background: primary ? ACCENT : ghost ? 'transparent' : '#fff',
      color: INK,
      border: `2px solid ${INK}`,
      borderRadius: 0,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      fontFamily: 'inherit',
      textTransform: 'uppercase',
    }}>{children}</button>
  );
}
