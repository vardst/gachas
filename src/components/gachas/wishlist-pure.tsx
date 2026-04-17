// HAND-CRAFTED: Wishlist distribution + Pure RNG.
// Vibe: pick 3 and pray. No guarantees. If the wishlist is empty, every 5* is random.
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { featuredFor, fiveStars } from '../../data/roster';
import { useGachaEngine } from '../../lib/useGachaEngine';
import { UnitCard } from '../../lib/GachaFrame';

const ACCENT = '#e36b6b';
const WARN = '#ff8a3c';
const INK = '#f2d4c8';
const TYPE_KEY = 'wishlist-pure';

interface Props { slug: string }

export default function WishlistPure({ slug }: Props) {
  const navigate = useNavigate();
  const variants = useMemo(() => combosForType(TYPE_KEY), []);
  const combo = useMemo(() => variants.find(v => v.slug === slug) ?? variants[0], [variants, slug]);
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;
  const featured = featuredFor(combo.banner.id);

  const wishlistEmpty = state.wishlist.length === 0;
  const wishlistUnits = state.wishlist.map(id => fiveStars.find(u => u.id === id)).filter(Boolean);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #3a1214 0%, #1a0607 60%, #0a0303 100%)',
      padding: 18,
      color: INK,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <style>{KEYFRAMES}</style>

      <Link to="/" style={{ color: INK, fontSize: 13, opacity: 0.75, textDecoration: 'none' }}>
        &larr; Back to dashboard
      </Link>

      <header style={{ marginTop: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 10.5, letterSpacing: 0.2, color: WARN, textTransform: 'uppercase', marginBottom: 4 }}>
          Wishlist unguarded
        </div>
        <h1 style={{
          margin: 0, fontSize: 34, fontWeight: 900, letterSpacing: 0.3,
          color: '#fff', textShadow: `0 0 20px ${ACCENT}`,
          fontFamily: 'Georgia, serif',
        }}>PICK&nbsp;3&nbsp;AND&nbsp;PRAY</h1>
        <p style={{ margin: '6px 0 0', color: INK, fontSize: 13, opacity: 0.8, maxWidth: 720 }}>
          Top-rarity pulls resolve to your wishlist. There is no pity, no spark, no floor. If you leave the wishlist empty, every 5-star drops from the standard pool at random. The system will not save you.
        </p>
      </header>

      {variants.length > 1 && (
        <div style={{ padding: 10, background: 'rgba(227,107,107,0.05)', border: `1px solid ${ACCENT}44`, borderRadius: 4, marginBottom: 14 }}>
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
                  color: active ? '#1a0607' : INK,
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
            padding: 16,
            background: wishlistEmpty
              ? 'linear-gradient(180deg, #3a1214 0%, #1a0607 100%)'
              : 'linear-gradient(180deg, #2b0a0a 0%, #1a0607 100%)',
            border: `2px solid ${wishlistEmpty ? WARN : ACCENT}`,
            borderRadius: 6,
            marginBottom: 14,
            animation: wishlistEmpty ? 'wp-throb 2.4s ease-in-out infinite' : 'none',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 10.5, letterSpacing: 0.18, textTransform: 'uppercase', color: wishlistEmpty ? WARN : ACCENT, fontWeight: 800 }}>
                  Your Wishlist
                </div>
                <div style={{ fontSize: 13, color: INK, opacity: 0.8, marginTop: 2 }}>
                  Pick up to 3. Every 5-star pull resolves to one of these.
                </div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: wishlistEmpty ? WARN : ACCENT, fontVariantNumeric: 'tabular-nums' }}>
                {state.wishlist.length}/3
              </div>
            </div>

            {wishlistEmpty && (
              <div role="alert" style={{
                padding: '8px 12px', marginBottom: 10,
                background: `${WARN}22`, border: `1px solid ${WARN}`,
                fontSize: 12, color: WARN, fontWeight: 600, letterSpacing: 0.04,
              }}>
                No wishlist set. Every 5-star will be random from the entire standard pool.
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
              {fiveStars.map(u => {
                const active = state.wishlist.includes(u.id);
                const locked = !active && state.wishlist.length >= 3;
                return (
                  <button
                    key={u.id}
                    disabled={locked}
                    onClick={() => eng.setWishlist(u.id, !active, 3)}
                    style={{
                      padding: '10px 12px',
                      background: active ? `linear-gradient(135deg, ${u.color}, ${u.color}aa)` : 'rgba(0,0,0,0.4)',
                      border: `2px solid ${active ? '#fff' : ACCENT + '66'}`,
                      color: active ? '#0f0e13' : INK,
                      borderRadius: 4,
                      cursor: locked ? 'not-allowed' : 'pointer',
                      fontSize: 13,
                      fontWeight: active ? 800 : 500,
                      textAlign: 'left',
                      opacity: locked ? 0.35 : 1,
                      transition: 'all 140ms',
                      boxShadow: active ? `0 0 14px -4px ${u.color}` : 'none',
                    }}>
                    <div style={{ fontSize: 10, letterSpacing: 0.14, opacity: 0.7 }}>&#9733;5</div>
                    <div>{u.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FEATURED */}
          {featured.five.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, letterSpacing: 0.15, textTransform: 'uppercase', color: INK, opacity: 0.6, marginBottom: 6 }}>
                Banner featured (separate from wishlist)
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {featured.five.map(u => (
                  <span key={u.id} style={{
                    padding: '5px 12px', fontSize: 12, fontWeight: 700,
                    background: `linear-gradient(90deg, ${u.color}, ${u.color}aa)`,
                    color: '#0f0e13', borderRadius: 20, border: `1px solid ${ACCENT}`,
                  }}>&#9733;5 {u.name}</span>
                ))}
              </div>
            </div>
          )}

          {/* STATUS */}
          <div style={{
            padding: 10, background: 'rgba(227,107,107,0.06)',
            border: `1px solid ${ACCENT}33`, borderRadius: 4, marginBottom: 12,
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
          }}>
            <Stat label="Free" value={state.freeCurrency.toLocaleString()} />
            <Stat label="Pulls" value={state.totalPulls} />
            <Stat label="5★" value={state.fiveStarCount} accent />
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
            background: 'rgba(0,0,0,0.45)', border: `1px solid ${ACCENT}22`, borderRadius: 4,
          }}>
            {lastResults.length === 0 ? (
              <div style={{ padding: 26, textAlign: 'center', color: '#a08278', fontSize: 13 }}>
                No pulls yet. {wishlistEmpty ? 'Wishlist is empty — pick at least one unit.' : `Wishlist armed with ${state.wishlist.length}.`}
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
          <SidePanel title="Wishlist selections" accent={ACCENT}>
            {wishlistUnits.length === 0 ? (
              <div style={{ fontSize: 12, color: WARN, fontStyle: 'italic' }}>Empty. 5-stars will be random.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {wishlistUnits.map((u, i) => u && (
                  <div key={u.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 10px', background: `${u.color}22`,
                    border: `1px solid ${u.color}88`, borderRadius: 2, fontSize: 12,
                  }}>
                    <span style={{ fontSize: 10, opacity: 0.7 }}>#{i + 1}</span>
                    <span style={{ fontWeight: 700, color: u.color }}>&#9733;5 {u.name}</span>
                  </div>
                ))}
              </div>
            )}
          </SidePanel>

          <SidePanel title="No safety net" accent={WARN}>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11.5, lineHeight: 1.55, color: INK, opacity: 0.85 }}>
              <li>No soft or hard pity.</li>
              <li>No spark tickets.</li>
              <li>No dupe shards.</li>
              <li>The only guidance is your wishlist choice.</li>
            </ul>
            <div style={{ marginTop: 8, fontSize: 11, color: WARN, fontFamily: 'monospace' }}>
              P(no 5★ in 500 pulls) = 4.9%
            </div>
          </SidePanel>

          <SidePanel title={`Log · ${state.history.length}`} accent={ACCENT}>
            {state.history.length === 0 ? (
              <div style={{ fontSize: 11, color: '#7a5e56' }}>No pulls yet.</div>
            ) : (
              <div style={{ maxHeight: 200, overflowY: 'auto', fontSize: 10.5, fontFamily: 'monospace', color: INK }}>
                {state.history.slice(-30).reverse().map((h, i) => {
                  const wish = state.wishlist.includes(h.unit.id);
                  return (
                    <div key={i} style={{ padding: '1px 0', color: h.rarity === 5 ? (wish ? ACCENT : WARN) : h.rarity === 4 ? '#b89890' : '#7a5e56' }}>
                      #{state.history.length - i} &middot; &#9733;{h.rarity} {h.unit.name}{h.rarity === 5 ? (wish ? ' WISH' : ' random') : ''}
                    </div>
                  );
                })}
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
      <div style={{ fontSize: 9.5, letterSpacing: 0.12, textTransform: 'uppercase', color: '#b89890' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: accent ? ACCENT : '#fff', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}

function SidePanel({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: 14, background: 'rgba(0,0,0,0.4)', border: `1px solid ${accent}44`, borderRadius: 4 }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 11.5, letterSpacing: 0.12, textTransform: 'uppercase', color: accent }}>{title}</h3>
      {children}
    </div>
  );
}

function Btn({ children, onClick, disabled, primary, ghost }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; primary?: boolean; ghost?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: ghost ? '8px 12px' : '10px 18px', fontSize: 12.5, fontWeight: 700,
      letterSpacing: 0.06, textTransform: 'uppercase',
      background: primary ? `linear-gradient(180deg, ${WARN}, ${ACCENT})` : ghost ? 'transparent' : 'rgba(227,107,107,0.12)',
      color: primary ? '#0f0404' : INK,
      border: `1px solid ${primary ? WARN : ACCENT + '88'}`,
      borderRadius: 2, cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.35 : 1,
      boxShadow: primary ? `0 0 14px -2px ${WARN}88` : 'none',
    }}>{children}</button>
  );
}

const KEYFRAMES = `
@keyframes wp-throb {
  0%, 100% { box-shadow: 0 0 0 0 ${WARN}44; }
  50% { box-shadow: 0 0 24px 2px ${WARN}88; }
}
`;
