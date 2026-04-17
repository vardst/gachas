// Generic "type" player used by bucketed gacha-type files.
// Exposes a variant picker across all combos in the same type, plus a polished
// pull UI shared by every generic type. Named types can import this too or roll
// their own custom UI.

import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Combo } from '../data/primitives';
import { ALL_TYPES, combosForType, type GachaType } from '../data/types';
import { featuredFor } from '../data/roster';
import { useGachaEngine } from './useGachaEngine';
import {
  FeaturedStrip, WishlistPicker, PreviewQueue, SugorokuTrack, StepCycleStrip,
  StatusBar, PullResults,
} from './GachaFrame';

interface Props {
  type: GachaType;
  variants: Combo[];
  currentSlug: string;
  /** Optional: render a custom hero/flavor block (replaces the default). */
  customHero?: (combo: Combo) => React.ReactNode;
  /** Optional: wrap the main content with a type-specific theme shell. */
  wrapMain?: (children: React.ReactNode, combo: Combo) => React.ReactNode;
}

export default function TypePlayer({ type, variants, currentSlug, customHero, wrapMain }: Props) {
  const navigate = useNavigate();
  const combo = useMemo(() => variants.find(v => v.slug === currentSlug) ?? variants[0], [variants, currentSlug]);
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;

  const featured = featuredFor(combo.banner.id);
  const usesPity = ['hard', 'soft', 'pity_5050', 'pity_7030', 'radiance', 'spark_pity', 'shards_pity', 'full_suite'].includes(combo.guarantee.id);
  const usesSpark = ['spark_only', 'spark_pity', 'full_suite'].includes(combo.guarantee.id);
  const usesShards = ['shards', 'shards_pity', 'full_suite'].includes(combo.guarantee.id);
  const accent = type.accent;

  const hasFive = lastResults.some(r => r.rarity === 5);
  const hasFour = lastResults.some(r => r.rarity === 4);

  const main = (
    <div className="player-main" style={{ boxShadow: `0 0 0 1px ${accent}33, 0 14px 40px -10px ${accent}22` }}>
      {customHero ? customHero(combo) : (
        <>
          <div style={{ marginBottom: 16, padding: 14, background: 'var(--surface-muted)', borderLeft: `3px solid ${accent}`, borderRadius: 4, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55 }}>
            {type.flavor}
          </div>
        </>
      )}

      {variants.length > 1 && (
        <VariantPicker variants={variants} currentSlug={combo.slug} onChange={(slug) => navigate(`/play/${slug}`)} accent={accent} />
      )}

      {featured.five.length > 0 && <FeaturedStrip featured={featured} accent={accent} />}

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
          style={{ background: accent, borderColor: accent, color: '#0f0e13' }}>
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
  );

  return (
    <div className="page">
      <Link to="/" className="back-link">← Back to dashboard</Link>
      <header className="page-header">
        <h1 style={{ color: accent }}>{type.title}</h1>
        <p>{type.subtitle}</p>
        <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center' }}>
          <span className="tag tag-neutral">{combo.dist.name}</span>
          <span className="tag tag-neutral">{combo.banner.name}</span>
          <span className="tag tag-neutral">{combo.guarantee.name}</span>
          <span className="tag tag-neutral">{combo.currency.name}</span>
          <span className={`tag ${combo.tag.cls}`}>{combo.tag.text}</span>
        </div>
      </header>

      <div className="player-shell">
        {wrapMain ? wrapMain(main, combo) : main}

        <aside className="player-meta">
          <div className="meta-card">
            <h3>Mechanics</h3>
            <div className="detail-list">
              <div className="kv"><span>Distribution</span><span>{combo.dist.name}</span></div>
              <div className="kv"><span>Banner</span><span>{combo.banner.name}</span></div>
              <div className="kv"><span>Guarantee</span><span>{combo.guarantee.name}</span></div>
              <div className="kv"><span>Currency</span><span>{combo.currency.name}</span></div>
              <div className="kv"><span>Tag</span><span className={`tag ${combo.tag.cls}`}>{combo.tag.text}</span></div>
              <div className="kv"><span>Generosity</span>
                <span style={{ display: 'inline-flex', gap: 3 }}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <span key={i} className={'pip' + (i < combo.generosity ? ' filled' : '')} style={i < combo.generosity ? { background: accent, borderColor: accent } : undefined} />
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
                <span style={{ width: `${Math.min(100, (state.pullsSinceFiveStar / state.hardPityAt) * 100)}%`, background: accent }} />
              </div>
              {['pity_5050', 'pity_7030', 'radiance', 'full_suite'].includes(combo.guarantee.id) && (
                <div style={{ marginTop: 8, fontSize: 11.5, color: state.carryOver ? 'var(--good)' : 'var(--text-muted)' }}>
                  {state.carryOver ? '✓ Carry-over armed: next 5★ is featured' : 'No carry-over active'}
                </div>
              )}
              {combo.guarantee.id === 'radiance' && state.radianceLossStreak > 0 && (
                <div style={{ marginTop: 6, padding: '6px 8px', background: 'var(--accent-bg)', borderRadius: 4, fontSize: 11.5, color: accent }}>
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
        </aside>
      </div>
    </div>
  );
}

function VariantPicker({ variants, currentSlug, onChange, accent }: {
  variants: Combo[];
  currentSlug: string;
  onChange: (slug: string) => void;
  accent: string;
}) {
  // Collect unique banners and currencies.
  const banners = useMemo(() => {
    const seen = new Map<string, { id: string; name: string; combos: Combo[] }>();
    for (const v of variants) {
      if (!seen.has(v.banner.id)) seen.set(v.banner.id, { id: v.banner.id, name: v.banner.name, combos: [] });
      seen.get(v.banner.id)!.combos.push(v);
    }
    return [...seen.values()];
  }, [variants]);

  const guaranteesForBanner = useMemo(() => {
    const current = variants.find(v => v.slug === currentSlug)!;
    const same = variants.filter(v => v.banner.id === current.banner.id);
    const seen = new Map<string, { id: string; name: string; combos: Combo[] }>();
    for (const v of same) {
      if (!seen.has(v.guarantee.id)) seen.set(v.guarantee.id, { id: v.guarantee.id, name: v.guarantee.name, combos: [] });
      seen.get(v.guarantee.id)!.combos.push(v);
    }
    return [...seen.values()];
  }, [variants, currentSlug]);

  const currenciesForBannerGuarantee = useMemo(() => {
    const current = variants.find(v => v.slug === currentSlug)!;
    const same = variants.filter(v => v.banner.id === current.banner.id && v.guarantee.id === current.guarantee.id);
    return same;
  }, [variants, currentSlug]);

  const current = variants.find(v => v.slug === currentSlug)!;

  const showBanners = banners.length > 1;
  const showGuarantees = guaranteesForBanner.length > 1;
  const showCurrencies = currenciesForBannerGuarantee.length > 1;

  if (!showBanners && !showGuarantees && !showCurrencies) return null;

  return (
    <div style={{ marginBottom: 16, padding: 12, background: 'var(--surface-muted)', borderRadius: 8, border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.08, color: 'var(--text-muted)', marginBottom: 8 }}>
        Variants · {variants.length} in this type
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {showBanners && (
          <PickerRow
            label="Banner"
            options={banners.map(b => ({ value: b.id, label: b.name }))}
            value={current.banner.id}
            accent={accent}
            onChange={(bannerId) => {
              const next = variants.find(v => v.banner.id === bannerId) ?? current;
              onChange(next.slug);
            }}
          />
        )}
        {showGuarantees && (
          <PickerRow
            label="Guarantee"
            options={guaranteesForBanner.map(g => ({ value: g.id, label: g.name }))}
            value={current.guarantee.id}
            accent={accent}
            onChange={(guaranteeId) => {
              const next = variants.find(v => v.banner.id === current.banner.id && v.guarantee.id === guaranteeId) ?? current;
              onChange(next.slug);
            }}
          />
        )}
        {showCurrencies && (
          <PickerRow
            label="Currency"
            options={currenciesForBannerGuarantee.map(v => ({ value: v.currency.id, label: v.currency.name }))}
            value={current.currency.id}
            accent={accent}
            onChange={(currencyId) => {
              const next = variants.find(v => v.banner.id === current.banner.id && v.guarantee.id === current.guarantee.id && v.currency.id === currencyId) ?? current;
              onChange(next.slug);
            }}
          />
        )}
      </div>
    </div>
  );
}

function PickerRow({ label, options, value, onChange, accent }: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  accent: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.06, color: 'var(--text-muted)', minWidth: 70 }}>{label}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {options.map(o => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              onClick={() => onChange(o.value)}
              style={{
                padding: '4px 10px',
                fontSize: 11.5,
                borderRadius: 4,
                background: active ? accent : 'var(--surface)',
                color: active ? '#0f0e13' : 'var(--text)',
                border: `1px solid ${active ? accent : 'var(--border-strong)'}`,
                cursor: 'pointer',
                fontWeight: active ? 500 : 400,
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Thin shim for the 39 generic/named files. Each file imports this and passes its own typeKey.
export function buildTypeEntry(typeKey: string) {
  return function TypeEntry({ slug }: { slug: string }) {
    const type = ALL_TYPES[typeKey];
    const variants = combosForType(typeKey);
    return <TypePlayer type={type} variants={variants} currentSlug={slug} />;
  };
}
