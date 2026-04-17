// HAND-CRAFTED: Wishlist distribution + Full suite (pity + spark + shards + Radiance).
// Vibe: everything. Calm gold. Systems panel with check-off list.
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { featuredFor, fiveStars } from '../../data/roster';
import { useGachaEngine } from '../../lib/useGachaEngine';
import { UnitCard } from '../../lib/GachaFrame';

const ACCENT = '#ffd86f';
const DEEP = '#b5902e';
const RAD = '#ffeea8';
const MUTED = '#a39070';
const INK = '#f5ecce';
const BG = '#14110a';
const TYPE_KEY = 'wishlist-full';

interface Props { slug: string }

export default function WishlistFull({ slug }: Props) {
  const navigate = useNavigate();
  const variants = useMemo(() => combosForType(TYPE_KEY), []);
  const combo = useMemo(() => variants.find(v => v.slug === slug) ?? variants[0], [variants, slug]);
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;
  const featured = featuredFor(combo.banner.id);
  const pityProgress = state.pullsSinceFiveStar / state.hardPityAt;
  const inSoftPity = state.pullsSinceFiveStar >= state.softPityStart;
  const sparkProgress = state.sparkProgress / state.sparkThreshold;
  const shardProgress = state.shards / state.shardsNeededForFive;
  const firstWish = state.wishlist[0];
  const firstWishUnit = firstWish ? fiveStars.find(u => u.id === firstWish) : null;
  const craftTarget = firstWishUnit ?? featured.five[0] ?? null;

  return (
    <div style={{ minHeight: '100vh', background: `radial-gradient(ellipse at 50% -20%, #3a2d10 0%, ${BG} 60%, #070503 100%)`, padding: 20, color: INK, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style>{KEYFRAMES}</style>
      <Link to="/" style={{ color: INK, fontSize: 13, opacity: 0.65, textDecoration: 'none' }}>&larr; Back to dashboard</Link>

      <header style={{ marginTop: 14, marginBottom: 18, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10.5, letterSpacing: 0.25, color: ACCENT, textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 }}>Wishlist &middot; full suite &middot; anniversary-tier</div>
          <h1 style={{ margin: 0, fontSize: 36, fontWeight: 800, letterSpacing: 0.3, color: '#fffbe6', fontFamily: 'Georgia, serif', textShadow: `0 0 18px ${ACCENT}44` }}>Radiant Wishlist</h1>
          <p style={{ margin: '4px 0 0', color: INK, fontSize: 13, opacity: 0.7, maxWidth: 680 }}>
            Every safety net stacked: wishlist + soft/hard pity + 50/50 carry-over + Capturing Radiance + spark + shard forge. Unsustainable outside a milestone event.
          </p>
        </div>
        <div style={{ padding: '10px 14px', minWidth: 200, background: `${ACCENT}14`, border: `1px solid ${ACCENT}`, borderRadius: 4, textAlign: 'right' }}>
          <div style={{ fontSize: 10, letterSpacing: 0.14, textTransform: 'uppercase', color: ACCENT }}>Generosity</div>
          <div style={{ display: 'inline-flex', gap: 3, marginTop: 4 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ width: 14, height: 14, borderRadius: 2, background: i < combo.generosity ? ACCENT : 'transparent', border: `1px solid ${ACCENT}88` }} />
            ))}
          </div>
          <div style={{ fontSize: 11, color: ACCENT, marginTop: 4 }}>6/6 &middot; maxed</div>
        </div>
      </header>

      {variants.length > 1 && (
        <div style={{ padding: 10, background: `${ACCENT}09`, border: `1px solid ${ACCENT}44`, borderRadius: 4, marginBottom: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: 0.15, textTransform: 'uppercase', color: ACCENT, marginBottom: 6 }}>Variant &middot; {variants.length} configurations</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {variants.map(v => {
              const active = v.slug === combo.slug;
              return (
                <button key={v.slug} onClick={() => navigate(`/play/${v.slug}`)} style={{ padding: '5px 10px', fontSize: 11, background: active ? ACCENT : 'transparent', color: active ? BG : INK, border: `1px solid ${active ? ACCENT : ACCENT + '66'}`, borderRadius: 2, cursor: 'pointer', fontWeight: active ? 700 : 400 }}>
                  {v.banner.name} &middot; {v.currency.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) 320px', gap: 16 }}>
        <div>
          {/* WISHLIST HERO */}
          <div style={{ padding: 18, marginBottom: 14, background: `linear-gradient(135deg, ${ACCENT}11 0%, ${DEEP}08 100%)`, border: `1px solid ${ACCENT}88`, borderRadius: 8, boxShadow: `inset 0 0 30px -10px ${ACCENT}55` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: 0.2, textTransform: 'uppercase', color: ACCENT, fontWeight: 800 }}>Wishlist &middot; the heart of the suite</div>
                <div style={{ fontSize: 12.5, color: INK, opacity: 0.75, marginTop: 2 }}>Pick up to 3. Pity, spark, and shards all target this list.</div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: ACCENT, fontVariantNumeric: 'tabular-nums' }}>{state.wishlist.length}/3</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
              {fiveStars.map(u => {
                const active = state.wishlist.includes(u.id);
                const order = state.wishlist.indexOf(u.id);
                const locked = !active && state.wishlist.length >= 3;
                return (
                  <button key={u.id} disabled={locked} onClick={() => eng.setWishlist(u.id, !active, 3)}
                    style={{ padding: '10px 12px', background: active ? `linear-gradient(135deg, ${u.color}, ${u.color}cc)` : 'rgba(0,0,0,0.35)', border: `2px solid ${active ? ACCENT : ACCENT + '33'}`, color: active ? '#0f0e13' : INK, borderRadius: 4, cursor: locked ? 'not-allowed' : 'pointer', fontSize: 13, textAlign: 'left', fontWeight: active ? 800 : 500, opacity: locked ? 0.3 : 1, boxShadow: active ? `0 0 16px -3px ${u.color}` : 'none', position: 'relative' }}>
                    {active && <span style={{ position: 'absolute', top: 4, right: 6, fontSize: 9.5, letterSpacing: 0.08, color: '#0f0e13', opacity: 0.7, fontWeight: 800 }}>#{order + 1}</span>}
                    <div style={{ fontSize: 10, letterSpacing: 0.12, opacity: 0.7 }}>&#9733;5</div>
                    <div>{u.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {featured.five.length > 0 && (
            <div style={{ marginBottom: 12, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 10, letterSpacing: 0.12, textTransform: 'uppercase', color: INK, opacity: 0.5 }}>Banner featured:</span>
              {featured.five.map(u => <span key={u.id} style={{ padding: '4px 10px', fontSize: 11.5, fontWeight: 600, background: `linear-gradient(90deg, ${u.color}, ${u.color}bb)`, color: '#0f0e13', borderRadius: 18, border: `1px solid ${ACCENT}` }}>&#9733;5 {u.name}</span>)}
            </div>
          )}

          {/* METERS */}
          <div style={{ padding: 14, marginBottom: 14, background: 'rgba(0,0,0,0.35)', border: `1px solid ${ACCENT}44`, borderRadius: 6 }}>
            <div style={{ fontSize: 11, letterSpacing: 0.15, textTransform: 'uppercase', color: ACCENT, marginBottom: 10, fontWeight: 700 }}>Live system meters</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <Meter label="Pity" value={`${state.pullsSinceFiveStar}/${state.hardPityAt}`} progress={pityProgress} hot={inSoftPity} />
              <Meter label="Spark" value={`${state.sparkProgress}/${state.sparkThreshold}`} progress={sparkProgress} hot={eng.canSpark} />
              <Meter label="Shards" value={`${state.shards}/${state.shardsNeededForFive}`} progress={shardProgress} hot={eng.canShards} />
            </div>
          </div>

          <div style={{ padding: 10, background: 'rgba(0,0,0,0.3)', border: `1px solid ${ACCENT}22`, borderRadius: 4, marginBottom: 12, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
            <Stat label="Free" value={state.freeCurrency.toLocaleString()} />
            <Stat label="Pulls" value={state.totalPulls} />
            <Stat label="5★" value={state.fiveStarCount} accent />
            <Stat label="Featured" value={state.featuredObtained} />
            <Stat label="Carry" value={state.carryOver ? 'armed' : '—'} />
            <Stat label="Wish hits" value={state.history.filter(h => h.rarity === 5 && state.wishlist.includes(h.unit.id)).length} accent />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <Btn disabled={!eng.canPull1} onClick={eng.pull1}>Pull 1 &middot; {eng.pullCost.toLocaleString()}</Btn>
            <Btn primary disabled={!eng.canPull10} onClick={eng.pull10}>Pull 10 &middot; {(eng.pullCost * 10).toLocaleString()}</Btn>
            <Btn disabled={!eng.canSpark} onClick={eng.spark}>Spark</Btn>
            <Btn disabled={!eng.canShards} onClick={eng.shards}>Forge</Btn>
            <Btn ghost onClick={() => eng.addFunds()}>+ Funds</Btn>
            <Btn ghost onClick={eng.reset}>Reset</Btn>
          </div>

          <div style={{ minHeight: 150, padding: 14, background: 'rgba(0,0,0,0.4)', border: `1px solid ${ACCENT}22`, borderRadius: 4 }}>
            {lastResults.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: MUTED, fontSize: 13 }}>Every system is live. Pull, spark, or forge &mdash; all paths lead to your wishlist.</div>
            ) : (
              <div key={eng.pullBurstKey} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
                {lastResults.map((r, i) => <UnitCard key={i} result={r} delay={i * 45} />)}
              </div>
            )}
          </div>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ padding: 14, background: `${ACCENT}0a`, border: `1px solid ${ACCENT}55`, borderRadius: 6 }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 11, letterSpacing: 0.15, textTransform: 'uppercase', color: ACCENT, fontWeight: 800 }}>Systems active</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <CheckItem label="Wishlist targeting (all paths)" />
              <CheckItem label="Soft pity from 74" />
              <CheckItem label="Hard pity at 90" />
              <CheckItem label="50/50 featured + carry-over" />
              <CheckItem label="Capturing Radiance (adaptive)" />
              <CheckItem label="Spark tickets" />
              <CheckItem label="Shard forge from dupes" />
              <CheckItem label="10x batch floor" />
            </div>
            <div style={{ marginTop: 10, padding: 8, background: `${ACCENT}11`, borderLeft: `3px solid ${ACCENT}`, fontSize: 11, color: INK, lineHeight: 1.5 }}>
              Every 5-star acquisition route is backed by your wishlist.
            </div>
          </div>

          <SidePanel title="Wishlist" accent={ACCENT}>
            {state.wishlist.length === 0 ? (
              <div style={{ fontSize: 11.5, color: MUTED, fontStyle: 'italic' }}>No picks yet &mdash; systems still run but won&rsquo;t target.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {state.wishlist.map((id, i) => {
                  const u = fiveStars.find(f => f.id === id);
                  if (!u) return null;
                  return (
                    <div key={id} style={{ padding: '6px 8px', background: `${u.color}22`, borderLeft: `3px solid ${u.color}`, fontSize: 12, fontWeight: 600 }}>
                      <span style={{ opacity: 0.55, marginRight: 6 }}>#{i + 1}</span>
                      <span style={{ color: u.color }}>{u.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </SidePanel>

          <SidePanel title="Target resolution" accent={ACCENT}>
            <div style={{ fontSize: 11.5, color: INK, lineHeight: 1.5 }}>
              <div><b style={{ color: ACCENT }}>5★:</b> wishlist[rand]</div>
              <div><b style={{ color: ACCENT }}>Spark:</b> wishlist[0] &rarr; featured[0]</div>
              <div><b style={{ color: ACCENT }}>Forge:</b> wishlist[0] &rarr; featured[0]</div>
              <div><b style={{ color: ACCENT }}>Hard pity:</b> wishlist[rand]</div>
            </div>
            {craftTarget && (
              <div style={{ marginTop: 8, padding: '6px 10px', background: `${craftTarget.color}22`, borderLeft: `3px solid ${craftTarget.color}`, fontSize: 11.5, color: craftTarget.color, fontWeight: 700 }}>
                All paths &rarr; {craftTarget.name}
              </div>
            )}
          </SidePanel>

          {state.radianceLossStreak > 0 && (
            <div style={{ padding: 10, background: `${RAD}14`, border: `1px solid ${RAD}`, borderRadius: 4, animation: 'wf-shimmer 2.4s ease-in-out infinite' }}>
              <div style={{ fontSize: 10, letterSpacing: 0.15, textTransform: 'uppercase', color: RAD, fontWeight: 800 }}>Capturing Radiance</div>
              <div style={{ fontSize: 13, color: '#fff', marginTop: 3 }}>+{state.radianceLossStreak * 10}% rate-up on next roll</div>
            </div>
          )}

          <SidePanel title={`Log · ${state.history.length}`} accent={ACCENT}>
            {state.history.length === 0 ? (
              <div style={{ fontSize: 11, color: '#6a5530' }}>No pulls yet.</div>
            ) : (
              <div style={{ maxHeight: 200, overflowY: 'auto', fontSize: 10.5, fontFamily: 'monospace', color: INK }}>
                {state.history.slice(-30).reverse().map((h, i) => {
                  const wish = state.wishlist.includes(h.unit.id);
                  return (
                    <div key={i} style={{ padding: '1px 0', color: h.rarity === 5 ? (wish ? ACCENT : RAD) : h.rarity === 4 ? '#c8b080' : '#6a5530' }}>
                      #{state.history.length - i} &middot; &#9733;{h.rarity} {h.unit.name}
                      {h.hardPity && ' · HARD'}{h.sparkRedeemed && ' · SPARK'}{h.extra?.shardCraft ? ' · FORGE' : ''}
                      {h.rateUpHit && ' · rate-up'}{h.carryOverConsumed && ' · carry'}
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

function Meter({ label, value, progress, hot }: { label: string; value: string; progress: number; hot?: boolean }) {
  return (
    <div style={{ padding: 10, background: 'rgba(0,0,0,0.4)', border: `1px solid ${hot ? ACCENT : ACCENT + '33'}`, borderRadius: 3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
        <div style={{ fontSize: 10, letterSpacing: 0.12, textTransform: 'uppercase', color: hot ? ACCENT : MUTED }}>{label}</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: hot ? ACCENT : '#fff', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      </div>
      <div style={{ height: 6, background: '#1a1408', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(100, progress * 100)}%`, background: hot ? `linear-gradient(90deg, ${ACCENT}, ${RAD})` : `linear-gradient(90deg, ${DEEP}, ${ACCENT})`, transition: 'width 300ms', boxShadow: hot ? `0 0 10px ${ACCENT}` : 'none' }} />
      </div>
    </div>
  );
}

function CheckItem({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: INK }}>
      <span style={{ width: 14, height: 14, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: 2, color: BG, fontSize: 11, fontWeight: 900 }}>{'\u2713'}</span>
      {label}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 9.5, letterSpacing: 0.1, textTransform: 'uppercase', color: MUTED }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: accent ? ACCENT : '#fff', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
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

function Btn({ children, onClick, disabled, primary, ghost }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; primary?: boolean; ghost?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: ghost ? '8px 12px' : '10px 18px', fontSize: 12.5, fontWeight: 700, letterSpacing: 0.04, background: primary ? `linear-gradient(180deg, ${ACCENT}, ${DEEP})` : ghost ? 'transparent' : `${ACCENT}15`, color: primary ? BG : INK, border: `1px solid ${primary ? ACCENT : ACCENT + '55'}`, borderRadius: 3, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.35 : 1, boxShadow: primary ? `0 0 14px -2px ${ACCENT}88` : 'none' }}>{children}</button>
  );
}

const KEYFRAMES = `
@keyframes wf-shimmer {
  0%, 100% { box-shadow: 0 0 0 0 ${RAD}00; }
  50% { box-shadow: 0 0 22px -4px ${RAD}bb; }
}
`;
