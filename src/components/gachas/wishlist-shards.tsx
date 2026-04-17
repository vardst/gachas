// HAND-CRAFTED: Wishlist distribution + Shards.
// Vibe: crafting + wishlist. Dupe-to-shards, craft into wishlisted 5-stars.
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { featuredFor, fiveStars } from '../../data/roster';
import { useGachaEngine } from '../../lib/useGachaEngine';
import { UnitCard } from '../../lib/GachaFrame';

const ACCENT = '#d4a26f';
const DEEP = '#8a6139';
const ORE = '#c78a4e';
const INK = '#f2e2cc';
const BG = '#1a120a';
const TYPE_KEY = 'wishlist-shards';

interface Props { slug: string }

export default function WishlistShards({ slug }: Props) {
  const navigate = useNavigate();
  const variants = useMemo(() => combosForType(TYPE_KEY), []);
  const combo = useMemo(() => variants.find(v => v.slug === slug) ?? variants[0], [variants, slug]);
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;
  const featured = featuredFor(combo.banner.id);
  const usesPity = combo.guarantee.id === 'shards_pity';
  const shardProgress = state.shards / state.shardsNeededForFive;
  const shardsToCraft = Math.max(0, state.shardsNeededForFive - state.shards);
  const firstWish = state.wishlist[0];
  const firstWishUnit = firstWish ? fiveStars.find(u => u.id === firstWish) : null;
  const craftTarget = firstWishUnit ?? featured.five[0] ?? null;

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(180deg, #2a1d10 0%, ${BG} 70%, #0d0905 100%)`, padding: 20, color: INK, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style>{KEYFRAMES}</style>
      <Link to="/" style={{ color: INK, fontSize: 13, opacity: 0.7, textDecoration: 'none' }}>&larr; Back to dashboard</Link>

      <header style={{ marginTop: 14, marginBottom: 16 }}>
        <div style={{ fontSize: 10.5, letterSpacing: 0.22, color: ACCENT, textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 }}>Wishlist &middot; forge shards</div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: 0.2, fontFamily: 'Georgia, serif' }}>Wishlist Forge</h1>
        <p style={{ margin: '4px 0 0', color: INK, fontSize: 13, opacity: 0.75, maxWidth: 680 }}>
          Pick up to 3. Duplicates and low pulls yield shards. {state.shardsNeededForFive} shards forge a 5-star from your wishlist. Nothing goes to waste.
        </p>
      </header>

      {variants.length > 1 && (
        <div style={{ padding: 10, background: `${ACCENT}0e`, border: `1px solid ${ACCENT}44`, borderRadius: 4, marginBottom: 14 }}>
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
          {/* FORGE PANEL */}
          <div style={{ padding: 18, marginBottom: 14, background: `linear-gradient(135deg, ${DEEP}22 0%, ${BG} 100%)`, border: `2px solid ${ACCENT}`, borderRadius: 6, position: 'relative', overflow: 'hidden' }}>
            <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 120%, #c78a4e22 0%, transparent 60%)', animation: 'wsh-ember 3s ease-in-out infinite', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10.5, letterSpacing: 0.18, textTransform: 'uppercase', color: ORE, fontWeight: 800 }}>Shard forge</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
                    {state.shards}<span style={{ fontSize: 16, color: '#9a7a50', fontWeight: 500 }}> / {state.shardsNeededForFive}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, letterSpacing: 0.15, textTransform: 'uppercase', color: ACCENT, opacity: 0.85 }}>{eng.canShards ? 'Ready to craft' : `${shardsToCraft} shards left`}</div>
                  {craftTarget && <div style={{ fontSize: 12, color: craftTarget.color, fontWeight: 700, marginTop: 3 }}>craft target: {craftTarget.name}</div>}
                </div>
              </div>

              <div style={{ height: 20, background: 'rgba(0,0,0,0.5)', border: `1px solid ${ACCENT}66`, borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, shardProgress * 100)}%`, background: `linear-gradient(90deg, ${DEEP} 0%, ${ACCENT} 60%, ${ORE} 100%)`, transition: 'width 400ms', boxShadow: eng.canShards ? `0 0 16px ${ORE}` : 'none' }} />
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} style={{ position: 'absolute', left: `${((i + 1) * 10 / state.shardsNeededForFive) * 100}%`, top: 0, bottom: 0, width: 1, background: i === 3 ? `${ORE}88` : '#00000066' }} />
                ))}
              </div>

              <div style={{ marginTop: 10, padding: '8px 12px', background: craftTarget ? `${craftTarget.color}22` : 'rgba(212,162,111,0.1)', borderLeft: `3px solid ${craftTarget?.color ?? ACCENT}`, fontSize: 12, color: INK }}>
                Shards forge &rarr;&nbsp;
                {firstWishUnit ? <b style={{ color: firstWishUnit.color }}>{firstWishUnit.name}</b>
                  : featured.five[0] ? <span><b style={{ color: featured.five[0].color }}>{featured.five[0].name}</b> <span style={{ opacity: 0.6 }}>(featured fallback)</span></span>
                  : <span style={{ opacity: 0.6 }}>set a wishlist entry</span>}
              </div>
            </div>
          </div>

          {/* WISHLIST */}
          <div style={{ padding: 14, marginBottom: 14, background: `${ACCENT}08`, border: `1px solid ${ACCENT}44`, borderRadius: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 11, letterSpacing: 0.14, textTransform: 'uppercase', color: ACCENT, fontWeight: 700 }}>Craft roster &middot; pick up to 3</div>
              <div style={{ fontSize: 13, color: INK }}><b style={{ color: ACCENT }}>{state.wishlist.length}</b><span style={{ opacity: 0.55 }}> / 3</span></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 6 }}>
              {fiveStars.map(u => {
                const active = state.wishlist.includes(u.id);
                const locked = !active && state.wishlist.length >= 3;
                return (
                  <button key={u.id} disabled={locked} onClick={() => eng.setWishlist(u.id, !active, 3)}
                    style={{ padding: '8px 10px', fontSize: 12.5, textAlign: 'left', background: active ? u.color : 'transparent', color: active ? '#0f0e13' : INK, border: `1px solid ${active ? u.color : ACCENT + '33'}`, borderRadius: 3, cursor: locked ? 'not-allowed' : 'pointer', fontWeight: active ? 700 : 500, opacity: locked ? 0.3 : 1 }}>
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
            <Stat label="Shards" value={state.shards} warn={eng.canShards} />
            <Stat label="Crafts" value={state.history.filter(h => h.extra?.shardCraft).length} />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <Btn disabled={!eng.canPull1} onClick={eng.pull1}>Pull 1 &middot; {eng.pullCost.toLocaleString()}</Btn>
            <Btn primary disabled={!eng.canPull10} onClick={eng.pull10}>Pull 10 &middot; {(eng.pullCost * 10).toLocaleString()}</Btn>
            <Btn forge disabled={!eng.canShards} onClick={eng.shards}>Forge &middot; {state.shards}/{state.shardsNeededForFive}</Btn>
            <Btn ghost onClick={() => eng.addFunds()}>+ Funds</Btn>
            <Btn ghost onClick={eng.reset}>Reset</Btn>
          </div>

          <div style={{ minHeight: 150, padding: 14, background: 'rgba(0,0,0,0.4)', border: `1px solid ${ACCENT}22`, borderRadius: 4 }}>
            {lastResults.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#8a6a4a', fontSize: 13 }}>Pulls drop shards; dupes add more. Forge when the bar fills.</div>
            ) : (
              <div key={eng.pullBurstKey} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
                {lastResults.map((r, i) => <UnitCard key={i} result={r} delay={i * 45} />)}
              </div>
            )}
          </div>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SidePanel title="Forge recipe" accent={ACCENT}>
            <div style={{ fontSize: 11.5, color: INK, lineHeight: 1.6 }}>
              <div><span style={{ color: ACCENT }}>&#9733;</span> {state.shardsNeededForFive} shards &rarr; 1 wishlisted 5★</div>
              <div><span style={{ color: ACCENT }}>&#9733;</span> Dupe 5★ = bonus shards</div>
              <div><span style={{ color: ACCENT }}>&#9733;</span> Low pulls chip in</div>
              <div><span style={{ color: ACCENT }}>&#9733;</span> No progress wasted</div>
            </div>
          </SidePanel>

          <SidePanel title="Craft target" accent={ACCENT}>
            {craftTarget ? (
              <div style={{ padding: '10px 12px', background: `${craftTarget.color}22`, border: `1px solid ${craftTarget.color}88`, borderRadius: 3 }}>
                <div style={{ fontSize: 10, letterSpacing: 0.12, textTransform: 'uppercase', color: INK, opacity: 0.6 }}>{firstWishUnit ? 'Wishlist #1' : 'Featured fallback'}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: craftTarget.color }}>{craftTarget.name}</div>
              </div>
            ) : <div style={{ fontSize: 11.5, color: '#8a6a4a', fontStyle: 'italic' }}>No target. Set a wishlist entry.</div>}
          </SidePanel>

          {usesPity && (
            <SidePanel title="Pity" accent={ACCENT}>
              <div style={{ fontSize: 11.5, color: INK }}>Since 5★: <b>{state.pullsSinceFiveStar}</b> / {state.hardPityAt}</div>
              <div style={{ marginTop: 6, height: 6, background: '#2a1a0a', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, (state.pullsSinceFiveStar / state.hardPityAt) * 100)}%`, background: ACCENT }} />
              </div>
            </SidePanel>
          )}

          <SidePanel title={`Log · ${state.history.length}`} accent={ACCENT}>
            {state.history.length === 0 ? (
              <div style={{ fontSize: 11, color: '#6a4a2a' }}>No pulls yet.</div>
            ) : (
              <div style={{ maxHeight: 200, overflowY: 'auto', fontSize: 10.5, fontFamily: 'monospace', color: INK }}>
                {state.history.slice(-30).reverse().map((h, i) => {
                  const isCraft = !!h.extra?.shardCraft;
                  return (
                    <div key={i} style={{ padding: '1px 0', color: h.rarity === 5 ? (isCraft ? ORE : ACCENT) : h.rarity === 4 ? '#c8a888' : '#6a4a2a' }}>
                      #{state.history.length - i} &middot; &#9733;{h.rarity} {h.unit.name}{isCraft && ' · FORGED'}
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

function Stat({ label, value, accent, warn }: { label: string; value: string | number; accent?: boolean; warn?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 9.5, letterSpacing: 0.1, textTransform: 'uppercase', color: '#9a7a55' }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: warn ? ORE : accent ? ACCENT : '#fff', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
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

function Btn({ children, onClick, disabled, primary, ghost, forge }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; primary?: boolean; ghost?: boolean; forge?: boolean;
}) {
  const bg = forge ? (disabled ? 'transparent' : `linear-gradient(180deg, ${ORE}, ${DEEP})`)
    : primary ? `linear-gradient(180deg, ${ACCENT}, ${DEEP})`
    : ghost ? 'transparent' : `${ACCENT}15`;
  const color = (primary || (forge && !disabled)) ? BG : forge ? ORE : INK;
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: ghost ? '8px 12px' : '10px 18px', fontSize: 12.5, fontWeight: 700, letterSpacing: 0.04, background: bg, color, border: `1px solid ${forge ? ORE : primary ? ACCENT : ACCENT + '55'}`, borderRadius: 3, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.35 : 1, boxShadow: forge && !disabled ? `0 0 14px -2px ${ORE}aa` : 'none' }}>{children}</button>
  );
}

const KEYFRAMES = `
@keyframes wsh-ember {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
`;
