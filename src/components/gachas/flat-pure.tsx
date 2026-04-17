// HAND-CRAFTED: Flat distribution + Pure RNG (no mitigation).
// Vibe: 2006-casino dread. Warning-red/orange, flashing regulatory banner,
// cold regret math laid out in a non-negotiable way.
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { featuredFor, FIVE_STAR_RATE, FOUR_STAR_RATE } from '../../data/roster';
import { useGachaEngine } from '../../lib/useGachaEngine';
import { UnitCard, StatusBar } from '../../lib/GachaFrame';

const ACCENT = '#e36b6b';
const HOT = '#ff8a3c';
const TYPE_KEY = 'flat-pure';

interface Props { slug: string }

export default function FlatPure({ slug }: Props) {
  const navigate = useNavigate();
  const variants = useMemo(() => combosForType(TYPE_KEY), []);
  const combo = useMemo(() => variants.find(v => v.slug === slug) ?? variants[0], [variants, slug]);
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;
  const featured = featuredFor(combo.banner.id);

  // Regret calculator
  const expectedPullsFor5 = Math.round(1 / FIVE_STAR_RATE); // ~166
  const p500 = Math.pow(1 - FIVE_STAR_RATE, 500);           // prob of NO 5-star in 500 pulls
  const p900 = Math.pow(1 - FIVE_STAR_RATE, 900);
  const noFiveYet = state.totalPulls - state.fiveStarCount * expectedPullsFor5;
  const pullsBad = state.pullsSinceFiveStar > expectedPullsFor5 * 1.5;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #3a1214 0%, #1a0607 60%, #0a0303 100%)',
      padding: 18,
      color: '#f2e8e4',
    }}>
      <style>{KEYFRAMES}</style>

      <Link to="/" style={{ color: '#f2c4b8', fontSize: 13, opacity: 0.8, textDecoration: 'none' }}>← Back to dashboard</Link>

      {/* REGULATORY WARNING BANNER */}
      <div role="alert" style={{
        marginTop: 12,
        padding: '10px 14px',
        background: 'repeating-linear-gradient(45deg, #1a0606 0px, #1a0606 14px, #2b0a0a 14px, #2b0a0a 28px)',
        border: `2px solid ${HOT}`,
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: `0 0 30px -6px ${HOT}66, inset 0 0 20px -5px ${ACCENT}55`,
      }}>
        <div style={{
          fontSize: 11,
          letterSpacing: 0.22,
          fontWeight: 800,
          color: HOT,
          padding: '3px 8px',
          background: '#0a0303',
          border: `1px solid ${HOT}`,
          animation: 'fp-blink 2.1s steps(2) infinite',
          whiteSpace: 'nowrap',
        }}>REGULATORY WARNING</div>
        <div style={{ fontSize: 12, color: '#f2d4c8', lineHeight: 1.5 }}>
          Pure-RNG gacha without any guarantee floor is flagged under 2026 JP loot-box disclosure rules and the EU Digital Fairness Act. Jurisdictions including Belgium, NL, and parts of AU prohibit this configuration outright. This demo is for reference only.
        </div>
      </div>

      {/* HEADER */}
      <header style={{ marginTop: 18, marginBottom: 16, position: 'relative' }}>
        <div style={{ fontSize: 10.5, letterSpacing: 0.22, color: HOT, textTransform: 'uppercase', marginBottom: 4 }}>
          House edge · unmitigated
        </div>
        <h1 style={{
          margin: 0,
          fontSize: 34,
          fontWeight: 900,
          letterSpacing: 0.4,
          color: '#fff',
          textShadow: `0 0 22px ${ACCENT}`,
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}>FLAT&nbsp;·&nbsp;PURE RNG</h1>
        <p style={{ margin: '6px 0 0', color: '#f2c4b8', fontSize: 13, opacity: 0.8, maxWidth: 720 }}>
          Independent trials forever. No pity. No spark. No shards. Every pull is a fresh coin flip at the base rate. This is the anti-design baseline — preserved here so newer systems can be measured against it.
        </p>
      </header>

      {/* VARIANT PICKER */}
      {variants.length > 1 && (
        <div style={{
          padding: 10,
          background: 'rgba(227, 107, 107, 0.05)',
          border: `1px solid ${ACCENT}44`,
          borderRadius: 4,
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 10, letterSpacing: 0.15, textTransform: 'uppercase', color: ACCENT, marginBottom: 6 }}>
            Variant · {variants.length} configurations of Flat × Pure
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {variants.map(v => {
              const active = v.slug === combo.slug;
              return (
                <button key={v.slug} onClick={() => navigate(`/play/${v.slug}`)} style={{
                  padding: '5px 10px',
                  fontSize: 11,
                  background: active ? ACCENT : 'transparent',
                  color: active ? '#1a0607' : '#f2c4b8',
                  border: `1px solid ${active ? ACCENT : ACCENT + '66'}`,
                  borderRadius: 2,
                  cursor: 'pointer',
                  fontWeight: active ? 700 : 400,
                  letterSpacing: 0.04,
                }}>{v.banner.name} · {v.currency.name}</button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) 280px', gap: 16 }}>
        {/* MAIN COLUMN */}
        <div>
          {/* FEATURED (brief) */}
          {featured.five.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, letterSpacing: 0.15, textTransform: 'uppercase', color: '#f2c4b8', marginBottom: 6, opacity: 0.7 }}>
                Featured — good luck finding them
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {featured.five.map(u => (
                  <span key={u.id} style={{
                    padding: '5px 12px',
                    fontSize: 12,
                    fontWeight: 700,
                    background: `linear-gradient(90deg, ${u.color}, ${u.color}aa)`,
                    color: '#0f0e13',
                    borderRadius: 20,
                    border: `1px solid ${ACCENT}`,
                  }}>★5 {u.name}</span>
                ))}
                {featured.four.map(u => (
                  <span key={u.id} style={{
                    padding: '4px 10px',
                    fontSize: 11,
                    color: '#d8b8b0',
                    border: `1px solid ${ACCENT}55`,
                    borderRadius: 20,
                  }}>★4 {u.name}</span>
                ))}
              </div>
            </div>
          )}

          {/* REGRET CALCULATOR */}
          <div style={{
            padding: 16,
            background: 'linear-gradient(180deg, #1a0607 0%, #0f0404 100%)',
            border: `1px solid ${ACCENT}77`,
            borderLeft: `4px solid ${HOT}`,
            borderRadius: 4,
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 10.5, letterSpacing: 0.18, textTransform: 'uppercase', color: HOT, marginBottom: 10, fontWeight: 700 }}>
              Regret Calculator
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <RegretStat label="Base 5★ rate" value={`${(FIVE_STAR_RATE * 100).toFixed(1)}%`} note="per pull · independent" />
              <RegretStat label="Expected pulls for ANY 5★" value={`${expectedPullsFor5}`} note="mean of a geometric dist." />
              <RegretStat label="P(no 5★ in 500 pulls)" value={`${(p500 * 100).toFixed(1)}%`} note="yes, this happens" danger />
              <RegretStat label="Base 4★ rate" value={`${(FOUR_STAR_RATE * 100).toFixed(1)}%`} note="also independent" />
              <RegretStat label="Cost of 166 pulls" value={`${(166 * eng.pullCost).toLocaleString()}`} note="to hit the mean" />
              <RegretStat label="P(no 5★ in 900 pulls)" value={`${(p900 * 100).toFixed(2)}%`} note="tail risk is real" danger />
            </div>
            <div style={{ marginTop: 10, fontSize: 11.5, color: '#d8b8b0', lineHeight: 1.5 }}>
              With no safety net, the 5% worst-luck player could easily go 500+ pulls dry. There is no ceiling and no floor — only the coin.
            </div>
          </div>

          {/* STATUS */}
          <div style={{
            padding: 10,
            background: 'rgba(227, 107, 107, 0.06)',
            border: `1px solid ${ACCENT}33`,
            borderRadius: 4,
            marginBottom: 12,
          }}>
            <StatusBar combo={combo} eng={eng} />
            {pullsBad && (
              <div style={{
                marginTop: 8,
                padding: '6px 10px',
                background: `${HOT}22`,
                border: `1px solid ${HOT}`,
                borderRadius: 2,
                fontSize: 11.5,
                color: HOT,
                fontWeight: 600,
              }}>
                {state.pullsSinceFiveStar} pulls without a 5★ — this is not a bug, this is the product.
              </div>
            )}
          </div>

          {/* CONTROLS */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <PureButton disabled={!eng.canPull1} onClick={eng.pull1}>
              Pull 1 · {eng.pullCost.toLocaleString()}
            </PureButton>
            <PureButton primary disabled={!eng.canPull10} onClick={eng.pull10}>
              Pull 10 · {(eng.pullCost * 10).toLocaleString()}
            </PureButton>
            <PureButton ghost onClick={() => eng.addFunds()}>+ Funds</PureButton>
            <PureButton ghost onClick={eng.reset}>Reset</PureButton>
          </div>

          {/* RESULTS */}
          <div style={{
            minHeight: 160,
            padding: 14,
            background: 'rgba(0,0,0,0.45)',
            border: `1px solid ${ACCENT}22`,
            borderRadius: 4,
          }}>
            {lastResults.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: '#a08278', fontSize: 13 }}>
                No pulls yet. The coin is patient.
              </div>
            ) : (
              <div key={eng.pullBurstKey} style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: 8,
              }}>
                {lastResults.map((r, i) => (
                  <UnitCard key={i} result={r} delay={i * 45} />
                ))}
              </div>
            )}
          </div>

          {noFiveYet > 100 && state.fiveStarCount === 0 && state.totalPulls > 100 && (
            <div style={{
              marginTop: 14,
              padding: 10,
              background: '#2b0a0a',
              border: `1px solid ${HOT}`,
              color: '#f2d4c8',
              fontSize: 12,
              fontStyle: 'italic',
              borderRadius: 2,
            }}>
              Still no 5★. This is what removing guarantees feels like.
            </div>
          )}
        </div>

        {/* SIDE PANEL */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            padding: 14,
            background: 'rgba(227, 107, 107, 0.07)',
            border: `1px solid ${ACCENT}44`,
            borderRadius: 4,
          }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 12, letterSpacing: 0.12, textTransform: 'uppercase', color: ACCENT }}>
              Guarantee layers
            </h3>
            {combo.guarantee.layers.length === 0 ? (
              <div style={{
                padding: '10px 12px',
                background: '#1a0607',
                border: `1px dashed ${HOT}`,
                borderRadius: 2,
                fontSize: 11.5,
                color: HOT,
                fontFamily: 'monospace',
                letterSpacing: 0.08,
              }}>NONE · PURE RNG</div>
            ) : (
              <div>{combo.guarantee.layers.map((l, i) => <div key={i}>{l}</div>)}</div>
            )}
            <div style={{ marginTop: 10, fontSize: 11, color: '#b89890', lineHeight: 1.5 }}>
              Historically: Fate/Grand Order at launch (2015), most pre-2018 JP mobile. Every modern gacha that looks generous is reacting to this.
            </div>
          </div>

          <div style={{
            padding: 14,
            background: 'rgba(0,0,0,0.35)',
            border: `1px solid ${ACCENT}33`,
            borderRadius: 4,
          }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 12, letterSpacing: 0.12, textTransform: 'uppercase', color: '#f2c4b8' }}>
              Mechanic
            </h3>
            <div style={{ fontSize: 11.5, color: '#d8b8b0', lineHeight: 1.55 }}>
              <div><b style={{ color: ACCENT }}>Distribution:</b> {combo.dist.name}</div>
              <div><b style={{ color: ACCENT }}>Banner:</b> {combo.banner.name}</div>
              <div><b style={{ color: ACCENT }}>Currency:</b> {combo.currency.name}</div>
              <div style={{ marginTop: 6 }}><b style={{ color: ACCENT }}>Tag:</b> <span className={`tag ${combo.tag.cls}`}>{combo.tag.text}</span></div>
            </div>
          </div>

          <div style={{
            padding: 14,
            background: 'rgba(0,0,0,0.35)',
            border: `1px solid ${ACCENT}33`,
            borderRadius: 4,
          }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 12, letterSpacing: 0.12, textTransform: 'uppercase', color: '#f2c4b8' }}>
              Log · {state.history.length}
            </h3>
            {state.history.length === 0 ? (
              <div style={{ fontSize: 11, color: '#7a5e56' }}>No pulls yet.</div>
            ) : (
              <div style={{ maxHeight: 200, overflowY: 'auto', fontSize: 10.5, fontFamily: 'monospace', color: '#d8b8b0' }}>
                {state.history.slice(-30).reverse().map((h, i) => (
                  <div key={i} style={{ padding: '1px 0', color: h.rarity === 5 ? HOT : h.rarity === 4 ? '#b89890' : '#7a5e56' }}>
                    #{state.history.length - i} · ★{h.rarity} {h.unit.name}
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

function RegretStat({ label, value, note, danger }: { label: string; value: string; note: string; danger?: boolean }) {
  return (
    <div style={{
      padding: '8px 10px',
      background: 'rgba(0,0,0,0.4)',
      border: `1px solid ${danger ? HOT : ACCENT}44`,
      borderRadius: 2,
    }}>
      <div style={{ fontSize: 9.5, letterSpacing: 0.1, textTransform: 'uppercase', color: danger ? HOT : '#b89890' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: danger ? HOT : '#fff', fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>{value}</div>
      <div style={{ fontSize: 10, color: '#8a706a', marginTop: 1 }}>{note}</div>
    </div>
  );
}

function PureButton({ children, onClick, disabled, primary, ghost }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; primary?: boolean; ghost?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: ghost ? '8px 12px' : '10px 18px',
      fontSize: 12.5,
      fontWeight: 700,
      letterSpacing: 0.06,
      textTransform: 'uppercase',
      background: primary ? `linear-gradient(180deg, ${HOT}, ${ACCENT})` : ghost ? 'transparent' : 'rgba(227, 107, 107, 0.12)',
      color: primary ? '#0f0404' : '#f2c4b8',
      border: `1px solid ${primary ? HOT : ACCENT + '88'}`,
      borderRadius: 2,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.35 : 1,
      boxShadow: primary ? `0 0 14px -2px ${HOT}88` : 'none',
    }}>{children}</button>
  );
}

const KEYFRAMES = `
@keyframes fp-blink {
  0%, 49% { background: #0a0303; color: ${HOT}; }
  50%, 100% { background: ${HOT}; color: #0a0303; }
}
`;
