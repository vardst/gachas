// HAND-CRAFTED: Wishlist distribution + Spark.
// Vibe: wishlist + spark ticket. Spark targets the first wishlist entry (or first featured if empty).
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { featuredFor, fiveStars } from '../../data/roster';
import { useGachaEngine } from '../../lib/useGachaEngine';
import { UnitCard } from '../../lib/GachaFrame';

const ACCENT = '#c76d7e';
const DEEP = '#9e4a5a';
const SPARK = '#ffb0c0';
const INK = '#f5dde2';
const BG = '#180b10';
const TYPE_KEY = 'wishlist-spark';

interface Props { slug: string }

export default function WishlistSpark({ slug }: Props) {
  const navigate = useNavigate();
  const variants = useMemo(() => combosForType(TYPE_KEY), []);
  const combo = useMemo(() => variants.find(v => v.slug === slug) ?? variants[0], [variants, slug]);
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;
  const featured = featuredFor(combo.banner.id);
  const usesPity = combo.guarantee.id === 'spark_pity';
  const sparkProgress = state.sparkProgress / state.sparkThreshold;
  const pullsToSpark = Math.max(0, state.sparkThreshold - state.sparkProgress);
  const firstWish = state.wishlist[0];
  const firstWishUnit = firstWish ? fiveStars.find(u => u.id === firstWish) : null;
  const firstFeatured = featured.five[0];
  const sparkTarget = firstWishUnit ?? firstFeatured ?? null;

  return (
    <div style={{ minHeight: '100vh', background: `radial-gradient(ellipse at top, #2a1018 0%, ${BG} 70%)`, padding: 20, color: INK, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style>{KEYFRAMES}</style>
      <Link to="/" style={{ color: INK, fontSize: 13, opacity: 0.7, textDecoration: 'none' }}>&larr; Back to dashboard</Link>

      <header style={{ marginTop: 14, marginBottom: 16 }}>
        <div style={{ fontSize: 10.5, letterSpacing: 0.22, color: SPARK, textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 }}>Wishlist &middot; spark redemption</div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: 0.2 }}>Wishlist Spark</h1>
        <p style={{ margin: '4px 0 0', color: INK, fontSize: 13, opacity: 0.72, maxWidth: 680 }}>
          Pick up to 3. Top-rarity pulls resolve to your wishlist. Accumulate {state.sparkThreshold} pulls to redeem the spark ticket &mdash; it hands you the first wishlist entry.
        </p>
      </header>

      {variants.length > 1 && (
        <div style={{ padding: 10, background: `${ACCENT}0f`, border: `1px solid ${ACCENT}44`, borderRadius: 4, marginBottom: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: 0.15, textTransform: 'uppercase', color: ACCENT, marginBottom: 6 }}>Variant &middot; {variants.length} configurations</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {variants.map(v => {
              const active = v.slug === combo.slug;
              return (
                <button key={v.slug} onClick={() => navigate(`/play/${v.slug}`)} style={{ padding: '5px 10px', fontSize: 11, background: active ? ACCENT : 'transparent', color: active ? BG : INK, border: `1px solid ${active ? ACCENT : ACCENT + '66'}`, borderRadius: 2, cursor: 'pointer', fontWeight: active ? 700 : 400 }}>
                  {v.banner.name} &middot; {v.guarantee.name} &middot; {v.currency.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) 300px', gap: 16 }}>
        <div>
          {/* SPARK PANEL */}
          <div style={{ padding: 16, marginBottom: 14, background: `linear-gradient(135deg, ${ACCENT}18 0%, ${DEEP}11 100%)`, border: `1px solid ${ACCENT}`, borderRadius: 6, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at ${eng.canSpark ? '50% 50%' : '100% 100%'}, ${SPARK}22 0%, transparent 60%)`, animation: eng.canSpark ? 'ws-pulse 2s ease-in-out infinite' : 'none', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10.5, letterSpacing: 0.15, textTransform: 'uppercase', color: SPARK, fontWeight: 800 }}>Spark ticket</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{state.sparkProgress} / {state.sparkThreshold}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, letterSpacing: 0.15, textTransform: 'uppercase', color: ACCENT, opacity: 0.9 }}>{eng.canSpark ? 'Ready to redeem' : `${pullsToSpark} pulls away`}</div>
                  {sparkTarget && <div style={{ fontSize: 12, color: sparkTarget.color, fontWeight: 700, marginTop: 3 }}>targets: {sparkTarget.name}</div>}
                </div>
              </div>

              <div style={{ height: 16, background: 'rgba(0,0,0,0.4)', borderRadius: 8, overflow: 'hidden', border: `1px solid ${ACCENT}55` }}>
                <div style={{ height: '100%', width: `${Math.min(100, sparkProgress * 100)}%`, background: eng.canSpark ? `linear-gradient(90deg, ${SPARK}, ${ACCENT})` : `linear-gradient(90deg, ${DEEP}, ${ACCENT})`, transition: 'width 300ms', boxShadow: eng.canSpark ? `0 0 16px ${SPARK}` : 'none' }} />
              </div>

              <div style={{ marginTop: 10, padding: '8px 12px', background: firstWishUnit ? `${firstWishUnit.color}22` : 'rgba(255,176,192,0.1)', borderLeft: `3px solid ${firstWishUnit?.color ?? SPARK}`, fontSize: 12, color: INK }}>
                Spark redemption targets:&nbsp;
                {firstWishUnit ? (<b style={{ color: firstWishUnit.color }}>{firstWishUnit.name}</b>
                ) : firstFeatured ? (
                  <span><b style={{ color: firstFeatured.color }}>{firstFeatured.name}</b> <span style={{ opacity: 0.6 }}>(first featured &mdash; wishlist empty)</span></span>
                ) : (<span style={{ opacity: 0.6 }}>no target &mdash; set wishlist or pick a banner with featured</span>)}
              </div>
            </div>
          </div>

          {/* WISHLIST */}
          <div style={{ padding: 14, marginBottom: 14, background: 'rgba(199,109,126,0.05)', border: `1px solid ${ACCENT}44`, borderRadius: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 11, letterSpacing: 0.14, textTransform: 'uppercase', color: ACCENT, fontWeight: 700 }}>Wishlist &middot; pick up to 3 &middot; first entry = spark target</div>
              <div style={{ fontSize: 13, color: INK }}><b style={{ color: ACCENT }}>{state.wishlist.length}</b><span style={{ opacity: 0.55 }}> / 3</span></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 6 }}>
              {fiveStars.map(u => {
                const active = state.wishlist.includes(u.id);
                const order = state.wishlist.indexOf(u.id);
                const locked = !active && state.wishlist.length >= 3;
                const isSparkTarget = active && order === 0;
                return (
                  <button key={u.id} disabled={locked} onClick={() => eng.setWishlist(u.id, !active, 3)}
                    style={{ padding: '8px 10px', fontSize: 12.5, textAlign: 'left', background: active ? u.color : 'transparent', color: active ? '#0f0e13' : INK, border: `2px solid ${isSparkTarget ? SPARK : active ? u.color : ACCENT + '33'}`, borderRadius: 3, cursor: locked ? 'not-allowed' : 'pointer', fontWeight: active ? 700 : 500, opacity: locked ? 0.3 : 1, position: 'relative' }}>
                    {isSparkTarget && <span style={{ position: 'absolute', top: -6, right: -4, fontSize: 8.5, letterSpacing: 0.1, padding: '1px 5px', background: SPARK, color: BG, borderRadius: 2, fontWeight: 800 }}>SPARK</span>}
                    <span style={{ fontSize: 9.5, opacity: 0.7, marginRight: 4 }}>&#9733;5</span>{u.name}
                  </button>
                );
              })}
            </div>
          </div>

          {featured.five.length > 0 && (
            <div style={{ marginBottom: 12, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 10, letterSpacing: 0.12, textTransform: 'uppercase', color: INK, opacity: 0.5 }}>Banner:</span>
              {featured.five.map(u => <span key={u.id} style={{ padding: '4px 10px', fontSize: 11.5, fontWeight: 600, background: u.color, color: '#0f0e13', borderRadius: 18 }}>&#9733;5 {u.name}</span>)}
            </div>
          )}

          <div style={{ padding: 10, background: 'rgba(0,0,0,0.3)', border: `1px solid ${ACCENT}22`, borderRadius: 4, marginBottom: 12, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            <Stat label="Free" value={state.freeCurrency.toLocaleString()} />
            <Stat label="Pulls" value={state.totalPulls} />
            <Stat label="5★" value={state.fiveStarCount} accent />
            <Stat label="Spark" value={`${state.sparkProgress}/${state.sparkThreshold}`} warn={eng.canSpark} />
            <Stat label="Wish hits" value={state.history.filter(h => h.rarity === 5 && state.wishlist.includes(h.unit.id)).length} />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <Btn disabled={!eng.canPull1} onClick={eng.pull1}>Pull 1 &middot; {eng.pullCost.toLocaleString()}</Btn>
            <Btn primary disabled={!eng.canPull10} onClick={eng.pull10}>Pull 10 &middot; {(eng.pullCost * 10).toLocaleString()}</Btn>
            <Btn spark disabled={!eng.canSpark} onClick={eng.spark}>Spark &middot; {state.sparkProgress}/{state.sparkThreshold}</Btn>
            <Btn ghost onClick={() => eng.addFunds()}>+ Funds</Btn>
            <Btn ghost onClick={eng.reset}>Reset</Btn>
          </div>

          <div style={{ minHeight: 150, padding: 14, background: 'rgba(0,0,0,0.4)', border: `1px solid ${ACCENT}22`, borderRadius: 4 }}>
            {lastResults.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#8a6a74', fontSize: 13 }}>Pull to earn spark progress. Spark at {state.sparkThreshold} &rarr; pick your wishlist target.</div>
            ) : (
              <div key={eng.pullBurstKey} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
                {lastResults.map((r, i) => <UnitCard key={i} result={r} delay={i * 45} />)}
              </div>
            )}
          </div>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SidePanel title="Spark resolution" accent={SPARK}>
            <div style={{ fontSize: 11.5, color: INK, lineHeight: 1.6 }}>
              <div>1. Wishlist[0] if set</div>
              <div>2. Else first banner featured</div>
              <div>3. Else cannot redeem</div>
            </div>
            <div style={{ marginTop: 10, padding: 8, background: sparkTarget ? `${sparkTarget.color}22` : '#2a1a1e', border: `1px solid ${sparkTarget?.color ?? ACCENT}`, borderRadius: 3, fontSize: 11.5, fontWeight: 600, color: sparkTarget?.color ?? '#9a6a74' }}>
              Target: {sparkTarget?.name ?? 'unresolved'}
            </div>
          </SidePanel>

          <SidePanel title="Wishlist" accent={ACCENT}>
            {state.wishlist.length === 0 ? (
              <div style={{ fontSize: 11.5, color: '#9a6a74', fontStyle: 'italic' }}>No picks yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {state.wishlist.map((id, i) => {
                  const u = fiveStars.find(f => f.id === id);
                  if (!u) return null;
                  return (
                    <div key={id} style={{ padding: '5px 8px', background: `${u.color}22`, borderLeft: `3px solid ${i === 0 ? SPARK : u.color}`, fontSize: 12, fontWeight: 600 }}>
                      <span style={{ opacity: 0.6, marginRight: 6 }}>#{i + 1}{i === 0 ? ' ★' : ''}</span>
                      <span style={{ color: u.color }}>{u.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </SidePanel>

          {usesPity && (
            <SidePanel title="Pity" accent={ACCENT}>
              <div style={{ fontSize: 11.5, color: INK }}>Since 5★: <b>{state.pullsSinceFiveStar}</b> / {state.hardPityAt}</div>
              <div style={{ marginTop: 6, height: 6, background: '#2a1a1e', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, (state.pullsSinceFiveStar / state.hardPityAt) * 100)}%`, background: ACCENT }} />
              </div>
            </SidePanel>
          )}

          <SidePanel title={`Log · ${state.history.length}`} accent={ACCENT}>
            {state.history.length === 0 ? (
              <div style={{ fontSize: 11, color: '#6a4a54' }}>No pulls yet.</div>
            ) : (
              <div style={{ maxHeight: 200, overflowY: 'auto', fontSize: 10.5, fontFamily: 'monospace', color: INK }}>
                {state.history.slice(-30).reverse().map((h, i) => (
                  <div key={i} style={{ padding: '1px 0', color: h.rarity === 5 ? (h.sparkRedeemed ? SPARK : ACCENT) : h.rarity === 4 ? '#c8a8b0' : '#6a4a54' }}>
                    #{state.history.length - i} &middot; &#9733;{h.rarity} {h.unit.name}{h.sparkRedeemed && ' · SPARK'}
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
      <div style={{ fontSize: 9.5, letterSpacing: 0.1, textTransform: 'uppercase', color: '#a0808a' }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: warn ? SPARK : accent ? ACCENT : '#fff', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}

function SidePanel({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: 12, background: 'rgba(0,0,0,0.4)', border: `1px solid ${accent}44`, borderRadius: 4 }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 11, letterSpacing: 0.12, textTransform: 'uppercase', color: accent }}>{title}</h3>
      {children}
    </div>
  );
}

function Btn({ children, onClick, disabled, primary, ghost, spark }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; primary?: boolean; ghost?: boolean; spark?: boolean;
}) {
  const bg = spark ? (disabled ? 'transparent' : `linear-gradient(180deg, ${SPARK}, ${ACCENT})`)
    : primary ? `linear-gradient(180deg, ${ACCENT}, ${DEEP})`
    : ghost ? 'transparent' : `${ACCENT}15`;
  const color = (primary || (spark && !disabled)) ? BG : spark ? SPARK : INK;
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: ghost ? '8px 12px' : '10px 18px', fontSize: 12.5, fontWeight: 700, letterSpacing: 0.04, background: bg, color, border: `1px solid ${spark ? SPARK : primary ? ACCENT : ACCENT + '55'}`, borderRadius: 3, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.35 : 1, boxShadow: spark && !disabled ? `0 0 14px -2px ${SPARK}aa` : 'none' }}>{children}</button>
  );
}

const KEYFRAMES = `
@keyframes ws-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}
`;
