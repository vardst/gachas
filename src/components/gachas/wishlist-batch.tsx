// HAND-CRAFTED: Wishlist distribution + Batch floor only.
// Vibe: honest, simple. Pick up to 3, 10x batch guarantees a 4-star+ every ten.
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { featuredFor, fiveStars } from '../../data/roster';
import { useGachaEngine } from '../../lib/useGachaEngine';
import { UnitCard } from '../../lib/GachaFrame';

const ACCENT = '#a0d468';
const DEEP = '#6ba840';
const INK = '#e8f0dc';
const BG = '#0e1508';
const TYPE_KEY = 'wishlist-batch';

interface Props { slug: string }

export default function WishlistBatch({ slug }: Props) {
  const navigate = useNavigate();
  const variants = useMemo(() => combosForType(TYPE_KEY), []);
  const combo = useMemo(() => variants.find(v => v.slug === slug) ?? variants[0], [variants, slug]);
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;
  const featured = featuredFor(combo.banner.id);

  const batchProgress = state.pullsSinceBatchFloor % 10;
  const pullsToNextFloor = 10 - batchProgress;

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(180deg, #162118 0%, ${BG} 100%)`,
      padding: 20, color: INK,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <style>{KEYFRAMES}</style>

      <Link to="/" style={{ color: INK, fontSize: 13, opacity: 0.7, textDecoration: 'none' }}>
        &larr; Back to dashboard
      </Link>

      <header style={{ marginTop: 14, marginBottom: 18, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10.5, letterSpacing: 0.22, color: ACCENT, textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 }}>
            Wishlist &middot; batch floor
          </div>
          <h1 style={{
            margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: 0.2,
            color: '#fff', fontFamily: 'system-ui, sans-serif',
          }}>Honest Wishlist</h1>
          <p style={{ margin: '4px 0 0', color: INK, fontSize: 13, opacity: 0.75, maxWidth: 620 }}>
            Pick up to 3. Top-rarity pulls resolve to your wishlist. The only safety net is a 10x batch floor guaranteeing at least 4-star on every tenth pull. No pity. No spark. No fuss.
          </p>
        </div>
        <div style={{
          padding: '10px 14px', minWidth: 180,
          background: `${ACCENT}11`, border: `1px solid ${ACCENT}55`, borderRadius: 4,
        }}>
          <div style={{ fontSize: 10, letterSpacing: 0.15, textTransform: 'uppercase', color: ACCENT, opacity: 0.9 }}>
            Next batch floor
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
            in {pullsToNextFloor}
          </div>
          <div style={{ marginTop: 4, height: 4, background: '#1a2414', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(batchProgress / 10) * 100}%`, background: ACCENT, transition: 'width 300ms' }} />
          </div>
        </div>
      </header>

      {variants.length > 1 && (
        <div style={{ padding: 10, background: `${ACCENT}08`, border: `1px solid ${ACCENT}33`, borderRadius: 4, marginBottom: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: 0.15, textTransform: 'uppercase', color: ACCENT, marginBottom: 6 }}>
            Variant &middot; {variants.length} configurations
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {variants.map(v => {
              const active = v.slug === combo.slug;
              return (
                <button key={v.slug} onClick={() => navigate(`/play/${v.slug}`)} style={{
                  padding: '5px 10px', fontSize: 11,
                  background: active ? ACCENT : 'transparent',
                  color: active ? BG : INK,
                  border: `1px solid ${active ? ACCENT : ACCENT + '66'}`,
                  borderRadius: 2, cursor: 'pointer', fontWeight: active ? 700 : 400,
                }}>{v.banner.name} &middot; {v.currency.name}</button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) 280px', gap: 16 }}>
        <div>
          {/* WISHLIST HERO */}
          <div style={{
            padding: 16, marginBottom: 14,
            background: 'rgba(160, 212, 104, 0.06)',
            border: `1px solid ${ACCENT}55`, borderRadius: 6,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 11, letterSpacing: 0.15, textTransform: 'uppercase', color: ACCENT, fontWeight: 700 }}>
                Wishlist &middot; pick up to 3
              </div>
              <div style={{ fontSize: 14, color: INK, fontVariantNumeric: 'tabular-nums' }}>
                <b style={{ color: ACCENT }}>{state.wishlist.length}</b>
                <span style={{ opacity: 0.6 }}> / 3 selected</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 6 }}>
              {fiveStars.map(u => {
                const active = state.wishlist.includes(u.id);
                const locked = !active && state.wishlist.length >= 3;
                return (
                  <button
                    key={u.id}
                    disabled={locked}
                    onClick={() => eng.setWishlist(u.id, !active, 3)}
                    style={{
                      padding: '8px 10px',
                      background: active ? `${u.color}` : 'transparent',
                      border: `1px solid ${active ? u.color : ACCENT + '44'}`,
                      color: active ? '#0f0e13' : INK,
                      borderRadius: 3,
                      cursor: locked ? 'not-allowed' : 'pointer',
                      fontSize: 12.5,
                      fontWeight: active ? 700 : 500,
                      textAlign: 'left',
                      opacity: locked ? 0.3 : 1,
                      transition: 'all 140ms',
                    }}>
                    <span style={{ fontSize: 9.5, opacity: 0.7, marginRight: 4 }}>&#9733;5</span>{u.name}
                  </button>
                );
              })}
            </div>

            {state.wishlist.length === 0 && (
              <div style={{ marginTop: 10, fontSize: 11, color: ACCENT, fontStyle: 'italic', opacity: 0.8 }}>
                Wishlist empty. 5-star pulls will draw from the standard pool.
              </div>
            )}
          </div>

          {/* FEATURED */}
          {featured.five.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, letterSpacing: 0.14, textTransform: 'uppercase', color: INK, opacity: 0.5, marginBottom: 4 }}>
                Banner featured
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {featured.five.map(u => (
                  <span key={u.id} style={{
                    padding: '4px 10px', fontSize: 11.5, fontWeight: 600,
                    background: `${u.color}`, color: '#0f0e13', borderRadius: 18,
                  }}>&#9733;5 {u.name}</span>
                ))}
                {featured.four.map(u => (
                  <span key={u.id} style={{
                    padding: '3px 9px', fontSize: 11, color: u.color,
                    border: `1px solid ${u.color}55`, borderRadius: 18,
                  }}>&#9733;4 {u.name}</span>
                ))}
              </div>
            </div>
          )}

          {/* STATUS */}
          <div style={{
            padding: 10, background: 'rgba(0,0,0,0.3)',
            border: `1px solid ${ACCENT}22`, borderRadius: 4, marginBottom: 12,
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8,
          }}>
            <Stat label="Free" value={state.freeCurrency.toLocaleString()} />
            <Stat label="Pulls" value={state.totalPulls} />
            <Stat label="5★" value={state.fiveStarCount} accent />
            <Stat label="4★+ floors" value={state.history.filter(h => h.batchFloor).length} />
            <Stat label="Wishlist hits" value={state.history.filter(h => h.rarity === 5 && state.wishlist.includes(h.unit.id)).length} />
          </div>

          {/* CONTROLS */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <Btn disabled={!eng.canPull1} onClick={eng.pull1}>Pull 1 &middot; {eng.pullCost.toLocaleString()}</Btn>
            <Btn primary disabled={!eng.canPull10} onClick={eng.pull10}>Pull 10 &middot; {(eng.pullCost * 10).toLocaleString()}</Btn>
            <Btn ghost onClick={() => eng.addFunds()}>+ Funds</Btn>
            <Btn ghost onClick={eng.reset}>Reset</Btn>
          </div>

          {/* RESULTS */}
          <div style={{
            minHeight: 150, padding: 14,
            background: 'rgba(0,0,0,0.4)', border: `1px solid ${ACCENT}22`, borderRadius: 4,
          }}>
            {lastResults.length === 0 ? (
              <div style={{ padding: 26, textAlign: 'center', color: '#8ea080', fontSize: 13 }}>
                Pull 10 to see the batch floor in action. Every 10th pull is at least 4-star.
              </div>
            ) : (
              <div key={eng.pullBurstKey} style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8,
              }}>
                {lastResults.map((r, i) => <UnitCard key={i} result={r} delay={i * 45} />)}
              </div>
            )}
          </div>
        </div>

        {/* SIDE */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SidePanel title="The only guarantee" accent={ACCENT}>
            <div style={{ fontSize: 12, color: INK, lineHeight: 1.55 }}>
              Every <b style={{ color: ACCENT }}>10th pull</b> is at minimum a 4-star.
              Nothing else. No pity. No spark. No shards.
            </div>
            <div style={{ marginTop: 10, padding: 8, background: `${DEEP}22`, border: `1px solid ${DEEP}`, fontSize: 11, color: '#c8dcb0', fontFamily: 'monospace', borderRadius: 2 }}>
              pullsSinceBatchFloor = {state.pullsSinceBatchFloor}
            </div>
          </SidePanel>

          <SidePanel title="Selections" accent={ACCENT}>
            {state.wishlist.length === 0 ? (
              <div style={{ fontSize: 11.5, color: '#8ea080', fontStyle: 'italic' }}>No picks yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {state.wishlist.map((id, i) => {
                  const u = fiveStars.find(f => f.id === id);
                  if (!u) return null;
                  return (
                    <div key={id} style={{
                      padding: '5px 8px', background: `${u.color}22`,
                      borderLeft: `3px solid ${u.color}`, fontSize: 12,
                    }}>
                      <span style={{ opacity: 0.6, marginRight: 6 }}>#{i + 1}</span>
                      <b style={{ color: u.color }}>{u.name}</b>
                    </div>
                  );
                })}
              </div>
            )}
          </SidePanel>

          <SidePanel title={`Log · ${state.history.length}`} accent={ACCENT}>
            {state.history.length === 0 ? (
              <div style={{ fontSize: 11, color: '#6a7a60' }}>No pulls yet.</div>
            ) : (
              <div style={{ maxHeight: 200, overflowY: 'auto', fontSize: 10.5, fontFamily: 'monospace', color: INK }}>
                {state.history.slice(-30).reverse().map((h, i) => (
                  <div key={i} style={{
                    padding: '1px 0',
                    color: h.rarity === 5 ? ACCENT : h.rarity === 4 ? (h.batchFloor ? DEEP : '#b8c8a0') : '#6a7a60',
                  }}>
                    #{state.history.length - i} &middot; &#9733;{h.rarity} {h.unit.name}{h.batchFloor ? ' · FLOOR' : ''}
                  </div>
                ))}
              </div>
            )}
          </SidePanel>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 9.5, letterSpacing: 0.1, textTransform: 'uppercase', color: '#7e9070' }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: accent ? ACCENT : '#fff', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}

function SidePanel({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: 12, background: 'rgba(0,0,0,0.3)', border: `1px solid ${accent}33`, borderRadius: 4 }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 11, letterSpacing: 0.12, textTransform: 'uppercase', color: accent }}>{title}</h3>
      {children}
    </div>
  );
}

function Btn({ children, onClick, disabled, primary, ghost }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; primary?: boolean; ghost?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: ghost ? '8px 12px' : '10px 18px', fontSize: 12.5, fontWeight: 600,
      letterSpacing: 0.04,
      background: primary ? ACCENT : ghost ? 'transparent' : 'rgba(160,212,104,0.1)',
      color: primary ? BG : INK,
      border: `1px solid ${primary ? ACCENT : ACCENT + '55'}`,
      borderRadius: 3, cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.35 : 1,
    }}>{children}</button>
  );
}

const KEYFRAMES = `
@keyframes wb-grow {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
`;
