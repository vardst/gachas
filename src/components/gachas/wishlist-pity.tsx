// HAND-CRAFTED: Wishlist distribution + Pity (hard/soft).
// Vibe: wishlist + pity. Show "pity → wishlist resolves on next 5*".
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { featuredFor, fiveStars } from '../../data/roster';
import { useGachaEngine } from '../../lib/useGachaEngine';
import { UnitCard } from '../../lib/GachaFrame';

const ACCENT = '#8CA4E5';
const DEEP = '#5e77c0';
const GOOD = '#b8d0ff';
const INK = '#dfe6f5';
const BG = '#0c111c';
const TYPE_KEY = 'wishlist-pity';

interface Props { slug: string }

export default function WishlistPity({ slug }: Props) {
  const navigate = useNavigate();
  const variants = useMemo(() => combosForType(TYPE_KEY), []);
  const combo = useMemo(() => variants.find(v => v.slug === slug) ?? variants[0], [variants, slug]);
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;
  const featured = featuredFor(combo.banner.id);

  const pityProgress = state.pullsSinceFiveStar / state.hardPityAt;
  const inSoftPity = state.pullsSinceFiveStar >= state.softPityStart;
  const pullsToHard = Math.max(0, state.hardPityAt - state.pullsSinceFiveStar);

  const firstWishlist = state.wishlist[0];
  const firstWishlistUnit = firstWishlist ? fiveStars.find(u => u.id === firstWishlist) : null;

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(180deg, #141a2c 0%, ${BG} 100%)`,
      padding: 20, color: INK,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <style>{KEYFRAMES}</style>

      <Link to="/" style={{ color: INK, fontSize: 13, opacity: 0.7, textDecoration: 'none' }}>
        &larr; Back to dashboard
      </Link>

      <header style={{ marginTop: 14, marginBottom: 16 }}>
        <div style={{ fontSize: 10.5, letterSpacing: 0.22, color: ACCENT, textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 }}>Wishlist &middot; pity guarantee</div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: '#fff' }}>Wishlist Pity</h1>
        <p style={{ margin: '4px 0 0', color: INK, fontSize: 13, opacity: 0.72, maxWidth: 680 }}>
          Pick up to 3. The pity counter is ticking: after soft pity the 5-star rate ramps, and hard pity guarantees a drop at {state.hardPityAt}. When pity triggers, your wishlist resolves it.
        </p>
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
                  border: `1px solid ${active ? ACCENT : ACCENT + '55'}`,
                  borderRadius: 2, cursor: 'pointer', fontWeight: active ? 700 : 400,
                }}>{v.banner.name} &middot; {v.guarantee.name} &middot; {v.currency.name}</button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) 300px', gap: 16 }}>
        <div>
          {/* PITY GAUGE HERO */}
          <div style={{
            padding: 16, marginBottom: 14,
            background: 'linear-gradient(180deg, rgba(140,164,229,0.08) 0%, rgba(140,164,229,0.02) 100%)',
            border: `1px solid ${ACCENT}55`, borderRadius: 6,
            animation: inSoftPity ? 'wp2-hum 2.6s ease-in-out infinite' : 'none',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 10.5, letterSpacing: 0.15, textTransform: 'uppercase', color: ACCENT, fontWeight: 700 }}>
                  Pity tracker
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: inSoftPity ? GOOD : '#fff', marginTop: 2 }}>
                  {state.pullsSinceFiveStar} / {state.hardPityAt}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, letterSpacing: 0.15, textTransform: 'uppercase', color: ACCENT, opacity: 0.8 }}>
                  {inSoftPity ? 'Soft pity active' : `${pullsToHard} to hard`}
                </div>
                {firstWishlistUnit && (
                  <div style={{ fontSize: 12.5, color: firstWishlistUnit.color, fontWeight: 700, marginTop: 3 }}>
                    pity resolves to: {firstWishlistUnit.name}
                  </div>
                )}
              </div>
            </div>

            <div style={{
              position: 'relative', height: 14,
              background: '#1a2040', borderRadius: 7, overflow: 'hidden',
              border: `1px solid ${ACCENT}44`,
            }}>
              <div style={{
                position: 'absolute', left: `${(state.softPityStart / state.hardPityAt) * 100}%`,
                top: 0, bottom: 0, width: 2, background: ACCENT, opacity: 0.5,
              }} title="soft pity start" />
              <div style={{
                height: '100%', width: `${Math.min(100, pityProgress * 100)}%`,
                background: inSoftPity
                  ? `linear-gradient(90deg, ${DEEP}, ${GOOD})`
                  : `linear-gradient(90deg, ${DEEP}, ${ACCENT})`,
                transition: 'width 300ms',
                boxShadow: inSoftPity ? `0 0 12px ${GOOD}` : 'none',
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: INK, opacity: 0.5, marginTop: 4 }}>
              <span>0</span>
              <span>soft @ {state.softPityStart}</span>
              <span>hard @ {state.hardPityAt}</span>
            </div>

            {state.wishlist.length === 0 ? (
              <div style={{
                marginTop: 10, padding: '8px 10px',
                background: '#2a1d14', border: `1px solid #c68a55`, borderRadius: 3,
                fontSize: 11.5, color: '#f5c88a',
              }}>
                Wishlist empty. Pity guarantees a 5-star but it will come from the standard pool.
              </div>
            ) : (
              <div style={{
                marginTop: 10, padding: '8px 10px',
                background: `${ACCENT}15`, border: `1px solid ${ACCENT}`, borderRadius: 3,
                fontSize: 12, color: GOOD,
              }}>
                Pity &rarr; wishlist resolves on next 5-star &middot; top pick: <b>{firstWishlistUnit?.name ?? 'random'}</b>
              </div>
            )}
          </div>

          {/* WISHLIST PICKER */}
          <div style={{
            padding: 14, marginBottom: 14,
            background: 'rgba(140,164,229,0.04)',
            border: `1px solid ${ACCENT}33`, borderRadius: 6,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 11, letterSpacing: 0.14, textTransform: 'uppercase', color: ACCENT, fontWeight: 700 }}>
                Wishlist &middot; pick up to 3
              </div>
              <div style={{ fontSize: 13, color: INK }}>
                <b style={{ color: ACCENT }}>{state.wishlist.length}</b>
                <span style={{ opacity: 0.55 }}> / 3</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 6 }}>
              {fiveStars.map(u => {
                const active = state.wishlist.includes(u.id);
                const locked = !active && state.wishlist.length >= 3;
                return (
                  <button key={u.id}
                    disabled={locked}
                    onClick={() => eng.setWishlist(u.id, !active, 3)}
                    style={{
                      padding: '8px 10px', fontSize: 12.5, textAlign: 'left',
                      background: active ? u.color : 'transparent',
                      color: active ? '#0f0e13' : INK,
                      border: `1px solid ${active ? u.color : ACCENT + '33'}`,
                      borderRadius: 3, cursor: locked ? 'not-allowed' : 'pointer',
                      fontWeight: active ? 700 : 500,
                      opacity: locked ? 0.3 : 1,
                    }}>
                    <span style={{ fontSize: 9.5, opacity: 0.7, marginRight: 4 }}>&#9733;5</span>{u.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* FEATURED */}
          {featured.five.length > 0 && (
            <div style={{ marginBottom: 12, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 10, letterSpacing: 0.12, textTransform: 'uppercase', color: INK, opacity: 0.5 }}>Banner:</span>
              {featured.five.map(u => (
                <span key={u.id} style={{
                  padding: '4px 10px', fontSize: 11.5, fontWeight: 600,
                  background: u.color, color: '#0f0e13', borderRadius: 18,
                }}>&#9733;5 {u.name}</span>
              ))}
            </div>
          )}

          {/* STATUS BAR */}
          <div style={{
            padding: 10, background: 'rgba(0,0,0,0.3)',
            border: `1px solid ${ACCENT}22`, borderRadius: 4, marginBottom: 12,
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8,
          }}>
            <Stat label="Free" value={state.freeCurrency.toLocaleString()} />
            <Stat label="Pulls" value={state.totalPulls} />
            <Stat label="5★" value={state.fiveStarCount} accent />
            <Stat label="Since 5★" value={state.pullsSinceFiveStar} warn={inSoftPity} />
            <Stat label="Wish hits" value={state.history.filter(h => h.rarity === 5 && state.wishlist.includes(h.unit.id)).length} />
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
              <div style={{ padding: 24, textAlign: 'center', color: '#7080a0', fontSize: 13 }}>
                Pull to advance pity. Soft pity begins at {state.softPityStart}, hard at {state.hardPityAt}.
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
          <SidePanel title="Wishlist" accent={ACCENT}>
            {state.wishlist.length === 0 ? (
              <div style={{ fontSize: 11.5, color: '#7a8aa8', fontStyle: 'italic' }}>No picks yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {state.wishlist.map((id, i) => {
                  const u = fiveStars.find(f => f.id === id);
                  if (!u) return null;
                  return (
                    <div key={id} style={{
                      padding: '5px 8px', background: `${u.color}22`,
                      borderLeft: `3px solid ${u.color}`, fontSize: 12, fontWeight: 600,
                    }}>
                      <span style={{ opacity: 0.6, marginRight: 6 }}>#{i + 1}</span>
                      <span style={{ color: u.color }}>{u.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </SidePanel>

          <SidePanel title="Pity mechanics" accent={ACCENT}>
            <div style={{ fontSize: 11.5, color: INK, lineHeight: 1.6 }}>
              <div><span style={{ color: ACCENT }}>&#9679;</span> Soft pity from <b>{state.softPityStart}</b></div>
              <div><span style={{ color: ACCENT }}>&#9679;</span> Hard pity at <b>{state.hardPityAt}</b></div>
              <div><span style={{ color: ACCENT }}>&#9679;</span> 5★ picks from wishlist</div>
              <div><span style={{ color: ACCENT }}>&#9679;</span> Counter resets on hit</div>
            </div>
            <div style={{
              marginTop: 10, padding: 8,
              background: `${ACCENT}11`, borderRadius: 3, fontSize: 11, color: GOOD, fontFamily: 'monospace',
            }}>
              soft? {inSoftPity ? 'true' : 'false'} &middot; remaining {pullsToHard}
            </div>
          </SidePanel>

          <SidePanel title={`Log · ${state.history.length}`} accent={ACCENT}>
            {state.history.length === 0 ? (
              <div style={{ fontSize: 11, color: '#5a6a90' }}>No pulls yet.</div>
            ) : (
              <div style={{ maxHeight: 200, overflowY: 'auto', fontSize: 10.5, fontFamily: 'monospace', color: INK }}>
                {state.history.slice(-30).reverse().map((h, i) => (
                  <div key={i} style={{
                    padding: '1px 0',
                    color: h.rarity === 5 ? (h.hardPity ? GOOD : ACCENT) : h.rarity === 4 ? '#a8b8d8' : '#5a6a90',
                  }}>
                    #{state.history.length - i} &middot; &#9733;{h.rarity} {h.unit.name}
                    {h.hardPity && ' · HARD'}
                    {h.softPity && ' · soft'}
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

function Stat({ label, value, accent, warn }: { label: string; value: string | number; accent?: boolean; warn?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 9.5, letterSpacing: 0.1, textTransform: 'uppercase', color: '#7a8aa8' }}>{label}</div>
      <div style={{
        fontSize: 16, fontWeight: 700,
        color: warn ? GOOD : accent ? ACCENT : '#fff',
        fontVariantNumeric: 'tabular-nums',
      }}>{value}</div>
    </div>
  );
}

function SidePanel({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: 12, background: 'rgba(0,0,0,0.35)', border: `1px solid ${accent}33`, borderRadius: 4 }}>
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
      padding: ghost ? '8px 12px' : '10px 18px', fontSize: 12.5, fontWeight: 600, letterSpacing: 0.04,
      background: primary ? `linear-gradient(180deg, ${ACCENT}, ${DEEP})` : ghost ? 'transparent' : `${ACCENT}14`,
      color: primary ? BG : INK,
      border: `1px solid ${primary ? ACCENT : ACCENT + '55'}`,
      borderRadius: 3, cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.35 : 1,
    }}>{children}</button>
  );
}

const KEYFRAMES = `
@keyframes wp2-hum {
  0%, 100% { box-shadow: 0 0 0 0 ${ACCENT}00; }
  50% { box-shadow: 0 0 22px -4px ${ACCENT}88; }
}
`;
