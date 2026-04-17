import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Combo } from '../data/primitives';
import type { PullResult } from '../engine/types';
import { featuredFor, fiveStars, type Unit } from '../data/roster';
import { useGachaEngine } from './useGachaEngine';

interface Props {
  combo: Combo;
  theme?: {
    title?: string;
    subtitle?: string;
    accent?: string;
    flavor?: string;
  };
}

export default function GachaFrame({ combo, theme }: Props) {
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;

  const featured = featuredFor(combo.banner.id);
  const usesPity = ['hard', 'soft', 'pity_5050', 'pity_7030', 'radiance', 'spark_pity', 'shards_pity', 'full_suite'].includes(combo.guarantee.id);
  const usesSpark = ['spark_only', 'spark_pity', 'full_suite'].includes(combo.guarantee.id);
  const usesShards = ['shards', 'shards_pity', 'full_suite'].includes(combo.guarantee.id);
  const title = theme?.title ?? combo.name;
  const accent = theme?.accent;

  const hasFive = lastResults.some(r => r.rarity === 5);
  const hasFour = lastResults.some(r => r.rarity === 4);

  return (
    <div className="page">
      <Link to="/" className="back-link">← Back to dashboard</Link>
      <header className="page-header">
        <h1 style={accent ? { color: accent } : undefined}>{title}</h1>
        <p>{theme?.subtitle ?? combo.dist.name + ' · ' + combo.banner.name + ' · ' + combo.guarantee.name + ' · ' + combo.currency.name}</p>
      </header>

      <div className="player-shell">
        <div className="player-main" style={accent ? { boxShadow: `0 0 0 1px ${accent}33, 0 14px 40px -10px ${accent}22` } : undefined}>
          {theme?.flavor && (
            <div style={{ marginBottom: 18, padding: 14, background: 'var(--surface-muted)', borderLeft: `3px solid ${accent ?? 'var(--accent)'}`, borderRadius: 4, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55 }}>
              {theme.flavor}
            </div>
          )}

          {featured.five.length > 0 && (
            <FeaturedStrip featured={featured} accent={accent} />
          )}

          {combo.dist.id === 'wishlist' && (
            <WishlistPicker wishlist={state.wishlist} onToggle={(id) => eng.setWishlist(id, !state.wishlist.includes(id))} accent={accent} />
          )}

          {combo.dist.id === 'preview' && (
            <PreviewQueue queue={state.previewQueue} accent={accent} />
          )}

          {combo.dist.id === 'sugoroku' && (
            <SugorokuTrack current={state.sugorokuTile} length={state.sugorokuLength} accent={accent} />
          )}

          {combo.dist.id === 'step_up' && (
            <StepCycleStrip step={state.stepIndex} length={state.stepLength} accent={accent} />
          )}

          <StatusBar combo={combo} eng={eng} />

          <div className="pull-row">
            <button className="btn" disabled={!eng.canPull1} onClick={eng.pull1}>
              Pull 1 · {eng.pullCost.toLocaleString()}
            </button>
            <button className="btn btn-primary" disabled={!eng.canPull10} onClick={eng.pull10}
              style={accent ? { background: accent, borderColor: accent, color: '#0f0e13' } : undefined}>
              Pull 10 · {(eng.pullCost * 10).toLocaleString()}
            </button>
            {usesSpark && (
              <button className="btn" disabled={!eng.canSpark} onClick={eng.spark}>
                Spark ({state.sparkProgress}/{state.sparkThreshold})
              </button>
            )}
            {usesShards && (
              <button className="btn" disabled={!eng.canShards} onClick={eng.shards}>
                Craft ({state.shards}/{state.shardsNeededForFive})
              </button>
            )}
            <button className="btn btn-ghost" onClick={() => eng.addFunds()}>+ Funds</button>
            <button className="btn btn-ghost" onClick={eng.reset}>Reset</button>
          </div>

          <PullResults key={eng.pullBurstKey} results={lastResults} hasFive={hasFive} hasFour={hasFour} accent={accent} />
        </div>

        <div className="player-meta">
          <div className="meta-card">
            <h3>Mechanics</h3>
            <div className="detail-list">
              <div className="kv"><span>Distribution</span><span>{combo.dist.name}</span></div>
              <div className="kv"><span>Banner</span><span>{combo.banner.name}</span></div>
              <div className="kv"><span>Currency</span><span>{combo.currency.name}</span></div>
              <div className="kv"><span>Tag</span><span className={`tag ${combo.tag.cls}`}>{combo.tag.text}</span></div>
              <div className="kv"><span>Generosity</span>
                <span style={{ display: 'inline-flex', gap: 3 }}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <span key={i} className={'pip' + (i < combo.generosity ? ' filled' : '')} style={accent && i < combo.generosity ? { background: accent, borderColor: accent } : undefined} />
                  ))}
                </span>
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 4 }}>Guarantee layers</div>
              {combo.guarantee.layers.length === 0 ? (
                <span style={{ color: 'var(--text-subtle)', fontSize: 12 }}>None — pure RNG</span>
              ) : (
                <div className="layers-list">
                  {combo.guarantee.layers.map((l, i) => <span key={i} className="tag tag-neutral">{l}</span>)}
                </div>
              )}
            </div>
          </div>

          {usesPity && (
            <div className="meta-card">
              <h3>Pity</h3>
              <div className="detail-list">
                <div className="kv"><span>Since last 5★</span><b>{state.pullsSinceFiveStar}</b></div>
                <div className="kv"><span>Soft pity at</span><span>{state.softPityStart}</span></div>
                <div className="kv"><span>Hard pity at</span><span>{state.hardPityAt}</span></div>
              </div>
              <div className={'bar ' + (state.pullsSinceFiveStar >= state.softPityStart ? 'warn' : '')}>
                <span style={{ width: `${Math.min(100, (state.pullsSinceFiveStar / state.hardPityAt) * 100)}%`, background: accent ?? undefined }} />
              </div>
              {['pity_5050', 'pity_7030', 'radiance', 'full_suite'].includes(combo.guarantee.id) && (
                <div style={{ marginTop: 8, fontSize: 11.5, color: state.carryOver ? 'var(--good)' : 'var(--text-muted)' }}>
                  {state.carryOver ? '✓ Carry-over armed: next 5★ is featured' : 'No carry-over active'}
                </div>
              )}
              {combo.guarantee.id === 'radiance' && state.radianceLossStreak > 0 && (
                <div style={{ marginTop: 6, padding: '6px 8px', background: 'var(--accent-bg)', borderRadius: 4, fontSize: 11.5, color: accent ?? 'var(--accent)' }}>
                  ✨ Capturing Radiance: +{state.radianceLossStreak * 10}% rate-up next roll
                </div>
              )}
            </div>
          )}

          <div className="meta-card">
            <h3>Notes</h3>
            {combo.notes.length === 0 ? (
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-subtle)' }}>No design notes.</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                {combo.notes.map((n, i) => <li key={i} style={{ marginBottom: 4 }}>{n}</li>)}
              </ul>
            )}
            {combo.example && (
              <div style={{ marginTop: 8, padding: 8, background: 'var(--surface-muted)', borderRadius: 4, fontSize: 11.5, color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.06, color: 'var(--text-subtle)', marginBottom: 2 }}>Real-world analogue</div>
                {combo.example}
              </div>
            )}
          </div>

          <div className="meta-card">
            <h3>History · {state.history.length}</h3>
            {state.history.length === 0 ? (
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-subtle)' }}>No pulls yet.</p>
            ) : (
              <div className="history-log">
                {state.history.slice(-25).reverse().map((h, i) => (
                  <div key={state.history.length - i} className={`entry r${h.rarity}`}>
                    #{state.history.length - i} · ★{h.rarity} {h.unit.name}
                    {h.hardPity && ' · hard'}
                    {h.softPity && ' · soft'}
                    {h.rateUpHit && ' · rate-up'}
                    {h.rateUpLoss && ' · lost 50/50'}
                    {h.sparkRedeemed && ' · spark'}
                    {h.carryOverConsumed && ' · carry'}
                    {h.batchFloor && ' · batch'}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatusBar({ combo, eng }: { combo: Combo; eng: ReturnType<typeof useGachaEngine> }) {
  const { state } = eng;
  return (
    <div className="counter-row">
      <div className="kv"><span>Free</span><b>{state.freeCurrency.toLocaleString()}</b></div>
      {combo.currency.id === 'dual' && <div className="kv"><span>Paid</span><b>{state.paidCurrency}</b></div>}
      {combo.currency.id === 'tickets' && <div className="kv"><span>Tickets</span><b>{state.tickets}</b></div>}
      <div className="kv"><span>Pulls</span><b>{state.totalPulls}</b></div>
      <div className="kv"><span>5★</span><b>{state.fiveStarCount}</b></div>
      <div className="kv"><span>Featured got</span><b>{state.featuredObtained}</b></div>
    </div>
  );
}

export function FeaturedStrip({ featured, accent }: { featured: { five: Unit[]; four: Unit[] }; accent?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.08, color: 'var(--text-muted)', marginBottom: 6 }}>
        Featured banner
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {featured.five.map(u => (
          <div key={u.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: `linear-gradient(90deg, ${u.color} 0%, ${u.color}cc 100%)`, color: '#0f0e13', borderRadius: 20, fontSize: 12.5, fontWeight: 600, boxShadow: `0 0 0 1px ${accent ?? u.color}`, letterSpacing: 0.02 }}>
            <span style={{ fontSize: 10 }}>★5</span>{u.name}
          </div>
        ))}
        {featured.four.map(u => (
          <div key={u.id} style={{ padding: '5px 12px', background: 'var(--surface-2)', color: 'var(--rarity-4)', borderRadius: 20, fontSize: 11.5, border: '1px solid var(--rarity-4)' }}>
            <span style={{ fontSize: 10, opacity: 0.8 }}>★4 </span>{u.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PullResults({ results, hasFive, hasFour, accent }: { results: PullResult[]; hasFive: boolean; hasFour: boolean; accent?: string }) {
  const [celebrate, setCelebrate] = useState<'five' | 'four' | null>(null);
  const prevKey = useRef(0);
  useEffect(() => {
    if (results.length === 0) return;
    prevKey.current += 1;
    if (hasFive) {
      setCelebrate('five');
      const t = setTimeout(() => setCelebrate(null), 1600);
      return () => clearTimeout(t);
    } else if (hasFour) {
      setCelebrate('four');
      const t = setTimeout(() => setCelebrate(null), 900);
      return () => clearTimeout(t);
    }
  }, [results, hasFive, hasFour]);

  if (results.length === 0) {
    return <div className="empty-state">Press Pull to start. Each pull consumes {160} free currency.</div>;
  }
  return (
    <div style={{ position: 'relative' }}>
      {celebrate === 'five' && <CelebrationFlash tier={5} accent={accent} />}
      {celebrate === 'four' && <CelebrationFlash tier={4} accent={accent} />}
      <div className="results-grid">
        {results.map((r, i) => (
          <UnitCard key={i} result={r} delay={i * 60} />
        ))}
      </div>
    </div>
  );
}

export function UnitCard({ result, delay = 0 }: { result: PullResult; delay?: number }) {
  const { unit, rarity } = result;
  const flags: string[] = [];
  if (result.hardPity) flags.push('hard');
  if (result.softPity) flags.push('soft');
  if (result.rateUpHit) flags.push('rate-up');
  if (result.rateUpLoss) flags.push('lost');
  if (result.batchFloor) flags.push('batch');
  if (result.sparkRedeemed) flags.push('spark');
  if (result.carryOverConsumed) flags.push('carry');
  if (result.preview) flags.push('preview');
  return (
    <div
      className={`unit-card r${rarity} reveal`}
      style={{
        ['--unit-color' as never]: unit.color,
        ['--delay' as never]: `${delay}ms`,
      } as React.CSSProperties}
    >
      <div className="unit-bg" />
      {rarity === 5 && <div className="shimmer" />}
      <div className="unit-rarity">★{rarity}</div>
      {flags.length > 0 && (
        <div className="flags">
          {flags.map((f, i) => <span key={i} className="flag">{f}</span>)}
        </div>
      )}
      <div className="unit-name">{unit.name}</div>
    </div>
  );
}

export function CelebrationFlash({ tier, accent }: { tier: 4 | 5; accent?: string }) {
  const color = tier === 5 ? (accent ?? 'var(--rarity-5)') : 'var(--rarity-4)';
  return (
    <div className={`celebration celebration-${tier}`} style={{ ['--cel-color' as never]: color } as React.CSSProperties}>
      <div className="cel-flash" />
      <div className="cel-label">★{tier} GET</div>
    </div>
  );
}

export function WishlistPicker({ wishlist, onToggle, accent }: { wishlist: string[]; onToggle: (id: string) => void; accent?: string }) {
  const options: Unit[] = fiveStars;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.08, color: 'var(--text-muted)', marginBottom: 6 }}>
        Wishlist · pick up to 3 · {wishlist.length}/3 selected
      </div>
      <div className="wishlist-picker">
        {options.map(u => {
          const active = wishlist.includes(u.id);
          return (
            <button
              key={u.id}
              className={'chip' + (active ? ' active' : '')}
              onClick={() => onToggle(u.id)}
              style={active && accent ? { background: accent, borderColor: accent } : undefined}
            >
              ★5 {u.name}
            </button>
          );
        })}
      </div>
      {wishlist.length === 0 && (
        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--warn)' }}>
          Pick at least one — 5★ pulls with no wishlist resolve to the standard pool.
        </div>
      )}
    </div>
  );
}

export function PreviewQueue({ queue, accent }: { queue: Unit[]; accent?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.08, color: 'var(--text-muted)', marginBottom: 6 }}>
        Next 3 pulls revealed
      </div>
      <div className="preview-queue">
        {queue.slice(0, 3).map((u, i) => (
          <div key={i} className="preview-slot reveal" style={{ ['--unit-color' as never]: u.color, ['--delay' as never]: `${i * 80}ms`, border: accent ? `1px dashed ${accent}` : undefined } as React.CSSProperties}>
            ★{u.rarity} {u.name}
          </div>
        ))}
        {queue.length === 0 && <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Loading…</div>}
      </div>
    </div>
  );
}

export function SugorokuTrack({ current, length, accent }: { current: number; length: number; accent?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.08, color: 'var(--text-muted)', marginBottom: 6 }}>
        Board · tile {current}/{length}
      </div>
      <div className="sugoroku-track">
        {Array.from({ length }).map((_, i) => {
          const major = i !== 0 && i % 10 === 0;
          const milestone = !major && i !== 0 && i % 5 === 0;
          const classes = ['tile', major && 'major', milestone && 'milestone', i === current && 'current'].filter(Boolean).join(' ');
          return (
            <div key={i} className={classes} style={i === current && accent ? { outlineColor: accent, color: accent } : undefined}>{i}</div>
          );
        })}
      </div>
    </div>
  );
}

export function StepCycleStrip({ step, length, accent }: { step: number; length: number; accent?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.08, color: 'var(--text-muted)', marginBottom: 6 }}>
        Step cycle
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length }).map((_, i) => {
          const isStep = i === step;
          const isMilestone = i === length - 1 || i === Math.floor(length / 2);
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 22,
                background: isStep ? (accent ?? 'var(--accent)') : isMilestone ? 'var(--surface-2)' : 'var(--surface-muted)',
                color: isStep ? '#0f0e13' : 'var(--text-subtle)',
                border: `1px solid ${isStep ? (accent ?? 'var(--accent)') : 'var(--border)'}`,
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {i + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
}
