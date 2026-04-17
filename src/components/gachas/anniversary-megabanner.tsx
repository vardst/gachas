// HAND-CRAFTED: Anniversary Megabanner — max-generosity festival party.
// Rainbow gradient borders, confetti on every pull, full mechanic readout.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { featuredFor } from '../../data/roster';
import { useGachaEngine } from '../../lib/useGachaEngine';
import { UnitCard } from '../../lib/GachaFrame';

const ACCENT = '#FFD86F';
const TYPE_KEY = 'anniversary-megabanner';

interface Props { slug: string }

export default function AnniversaryMegabanner({ slug }: Props) {
  const navigate = useNavigate();
  const variants = useMemo(() => combosForType(TYPE_KEY), []);
  const combo = useMemo(
    () => variants.find(c => c.slug === slug) ?? variants[0],
    [variants, slug],
  );
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;

  const featured = featuredFor(combo.banner.id);
  const hasFive = lastResults.some(r => r.rarity === 5);

  const pityPct = Math.min(100, (state.pullsSinceFiveStar / state.hardPityAt) * 100);
  const sparkPct = Math.min(100, (state.sparkProgress / state.sparkThreshold) * 100);
  const shardPct = Math.min(100, (state.shards / state.shardsNeededForFive) * 100);
  const radiancePct = Math.min(100, state.radianceLossStreak * 20);

  const [confetti, setConfetti] = useState(0);
  const [jackpot, setJackpot] = useState(false);
  const prevBurst = useRef(0);
  useEffect(() => {
    if (eng.pullBurstKey === 0 || eng.pullBurstKey === prevBurst.current) return;
    prevBurst.current = eng.pullBurstKey;
    setConfetti(eng.pullBurstKey);
    if (hasFive) {
      setJackpot(true);
      const t = setTimeout(() => setJackpot(false), 2200);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eng.pullBurstKey]);

  return (
    <div className="page" style={{ position: 'relative' }}>
      <style>{ANNI_KEYFRAMES}</style>

      {/* Celebration ambient sparkles */}
      <AmbientSparkles />

      <Link to="/" className="back-link">← Back to dashboard</Link>

      <header style={styles.header}>
        <div style={styles.rainbowBorder} aria-hidden />
        <div style={styles.rainbowBorderInner} aria-hidden />

        <div style={styles.headerInner}>
          <div style={styles.pretitle}>
            <span style={styles.confetti}>✦</span>
            <span>LIMITED · ONCE PER YEAR</span>
            <span style={styles.confetti}>✦</span>
          </div>
          <h1 style={styles.title}>ANNIVERSARY MEGA BANNER</h1>
          <p style={styles.tagline}>
            Doubled rates · 50/50 + Radiance · Spark 200 · Shards · Carry-over · Dupe-to-shards
          </p>
          <div style={styles.chipRow}>
            <Chip>{combo.banner.name}</Chip>
            <Chip>{combo.guarantee.name}</Chip>
            <Chip>{combo.currency.name}</Chip>
            <Chip hot>FULL SUITE</Chip>
          </div>
        </div>
      </header>

      <div className="player-shell">
        <div style={styles.mainPanel}>
          {variants.length > 1 && (
            <VariantPicker
              variants={variants}
              currentSlug={combo.slug}
              onChange={(s) => navigate(`/play/${s}`)}
            />
          )}

          {/* Featured */}
          <section style={styles.section}>
            <Heading>Featured Anniversary Lineup</Heading>
            <div style={styles.featuredRow}>
              {featured.five.map(u => (
                <div key={u.id} style={{
                  ...styles.featuredBadge,
                  background: `linear-gradient(135deg, ${u.color}, ${u.color}cc)`,
                  boxShadow: `0 0 20px ${u.color}99, 0 0 40px ${ACCENT}55`,
                }}>
                  <span style={styles.starBadge}>★5</span>
                  <span>{u.name}</span>
                </div>
              ))}
              {featured.four.map(u => (
                <div key={u.id} style={styles.featuredFour}>★4 {u.name}</div>
              ))}
            </div>
          </section>

          {/* Mechanics dashboard — all at once */}
          <section style={styles.section}>
            <Heading>Every mechanic · enabled</Heading>
            <div style={styles.meterGrid}>
              <MeterCard
                label="Pity"
                value={state.pullsSinceFiveStar}
                max={state.hardPityAt}
                pct={pityPct}
                barGradient="linear-gradient(90deg, #FFD86F, #FF8FB1, #9B6CFF)"
                note={`Soft ${state.softPityStart} · Hard ${state.hardPityAt}`}
              />
              <MeterCard
                label="Spark"
                value={state.sparkProgress}
                max={state.sparkThreshold}
                pct={sparkPct}
                barGradient="linear-gradient(90deg, #7EC4F5, #FFD86F)"
                note={`Redeem at ${state.sparkThreshold}`}
                ready={state.sparkProgress >= state.sparkThreshold}
              />
              <MeterCard
                label="Shards"
                value={state.shards}
                max={state.shardsNeededForFive}
                pct={shardPct}
                barGradient="linear-gradient(90deg, #4FC98D, #E8B84A)"
                note={`Craft at ${state.shardsNeededForFive}`}
                ready={state.shards >= state.shardsNeededForFive}
              />
              <MeterCard
                label="Radiance"
                value={`${radiancePct}%`}
                max={100}
                pct={radiancePct}
                barGradient="linear-gradient(90deg, #E36B6B, #FFD86F)"
                note={state.radianceLossStreak > 0 ? `${state.radianceLossStreak} loss${state.radianceLossStreak > 1 ? 'es' : ''} stacked` : 'No bonus'}
              />
            </div>
            <div style={styles.carryStrip}>
              <div style={{
                ...styles.carryChip,
                background: state.carryOver ? `linear-gradient(135deg, ${ACCENT}, #FF8FB1)` : 'var(--surface-muted)',
                color: state.carryOver ? '#1a1006' : 'var(--text-muted)',
                borderColor: state.carryOver ? ACCENT : 'var(--border)',
              }}>
                <span style={{ fontSize: 10, letterSpacing: 0.16, textTransform: 'uppercase', opacity: 0.85 }}>
                  {state.carryOver ? 'Carry armed' : 'Carry inactive'}
                </span>
                <span style={{ fontSize: 12 }}>
                  {state.carryOver ? 'Next 5★ guaranteed featured' : 'Win 50/50 to skip · Radiance compensates on loss'}
                </span>
              </div>
            </div>
          </section>

          {/* Counters */}
          <div style={styles.counterRow}>
            <Counter label="Currency" value={state.freeCurrency.toLocaleString()} hot />
            <Counter label="Pulls" value={state.totalPulls} />
            <Counter label="5★" value={state.fiveStarCount} />
            <Counter label="Featured" value={state.featuredObtained} />
            <Counter label="Shards" value={state.shards} />
          </div>

          {/* Button flotilla */}
          <div style={styles.buttonRow}>
            <FesButton onClick={eng.pull1} disabled={!eng.canPull1}>
              Pull ×1 <span style={styles.costSmall}>{eng.pullCost.toLocaleString()}</span>
            </FesButton>
            <FesButton primary onClick={eng.pull10} disabled={!eng.canPull10}>
              Pull ×10 <span style={styles.costSmall}>{(eng.pullCost * 10).toLocaleString()}</span>
            </FesButton>
            <FesButton special onClick={eng.spark} disabled={!eng.canSpark}>
              Spark · {state.sparkProgress}/{state.sparkThreshold}
            </FesButton>
            <FesButton special onClick={eng.shards} disabled={!eng.canShards}>
              Craft · {state.shards}/{state.shardsNeededForFive}
            </FesButton>
            <FesButton ghost onClick={() => eng.addFunds()}>+ Funds</FesButton>
            <FesButton ghost onClick={eng.reset}>Reset</FesButton>
          </div>

          {/* Viewport */}
          <div style={styles.viewport}>
            {confetti > 0 && <ConfettiBurst seed={confetti} big={hasFive} />}
            {jackpot && <JackpotOverlay />}
            {lastResults.length === 0 ? (
              <div style={styles.empty}>
                <div style={styles.emptyTitle}>Anniversary Celebration Ready</div>
                <div style={styles.emptySub}>Pity · Spark · Shards · Radiance · Carry-over — all active.</div>
              </div>
            ) : (
              <div style={styles.resultsGrid} key={eng.pullBurstKey}>
                {lastResults.map((r, i) => (
                  <div key={i} style={{ animation: `anniPop 0.55s cubic-bezier(0.3, 1.4, 0.4, 1) ${i * 45}ms both` }}>
                    <UnitCard result={r} delay={i * 60} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="player-meta">
          <div className="meta-card" style={styles.rainbowCard}>
            <h3 style={{ color: ACCENT }}>Anniversary details</h3>
            <div className="detail-list">
              <div className="kv"><span>Banner</span><span>{combo.banner.name}</span></div>
              <div className="kv"><span>Guarantee</span><span>{combo.guarantee.name}</span></div>
              <div className="kv"><span>Currency</span><span>{combo.currency.name}</span></div>
              <div className="kv"><span>Generosity</span>
                <span style={{ display: 'inline-flex', gap: 3 }}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <span key={i} style={{
                      width: 10, height: 10, borderRadius: 2,
                      background: i < combo.generosity
                        ? `hsl(${45 + i * 8}, 85%, ${55 + i * 3}%)`
                        : 'var(--surface-muted)',
                      border: '1px solid var(--border-strong)',
                      boxShadow: i < combo.generosity ? `0 0 6px hsl(${45 + i * 8}, 85%, 60%)` : 'none',
                    }} />
                  ))}
                </span>
              </div>
              <div className="kv"><span>Tag</span><span className={`tag ${combo.tag.cls}`}>{combo.tag.text}</span></div>
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 4 }}>All guarantee layers</div>
              <div className="layers-list">
                {combo.guarantee.layers.map((l, i) => <span key={i} className="tag tag-accent" style={{ background: `${ACCENT}22`, color: ACCENT }}>{l}</span>)}
              </div>
            </div>
          </div>

          <div className="meta-card" style={styles.rainbowCard}>
            <h3 style={{ color: ACCENT }}>Celebration log · {state.history.length}</h3>
            {state.history.length === 0 ? (
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-subtle)' }}>No pulls yet.</p>
            ) : (
              <div className="history-log">
                {state.history.slice(-30).reverse().map((h, i) => (
                  <div key={state.history.length - i} className={`entry r${h.rarity}`}>
                    #{state.history.length - i} · ★{h.rarity} {h.unit.name}
                    {h.hardPity && ' · hard'}{h.softPity && ' · soft'}
                    {h.rateUpHit && ' · rate-up'}{h.rateUpLoss && ' · lost'}
                    {h.sparkRedeemed && ' · spark'}{h.carryOverConsumed && ' · carry'}
                    {h.radianceTrigger && ' · radiance'}{h.batchFloor && ' · batch'}
                    {(h.extra as { shardCraft?: boolean } | undefined)?.shardCraft && ' · craft'}
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

// -- subcomponents --

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, letterSpacing: 0.2, textTransform: 'uppercase',
      fontWeight: 700,
      background: 'linear-gradient(90deg, #FFD86F, #FF8FB1, #7EC4F5)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: 10,
    }}>{children}</div>
  );
}

function Chip({ children, hot }: { children: React.ReactNode; hot?: boolean }) {
  return (
    <span style={{
      padding: '3px 10px',
      fontSize: 10.5,
      letterSpacing: 0.1,
      textTransform: 'uppercase',
      border: `1px solid ${hot ? ACCENT : 'var(--border-strong)'}`,
      borderRadius: 12,
      color: hot ? '#1a1006' : 'var(--text-muted)',
      background: hot ? `linear-gradient(135deg, ${ACCENT}, #FF8FB1)` : 'transparent',
      fontWeight: hot ? 700 : 400,
    }}>{children}</span>
  );
}

function Counter({ label, value, hot }: { label: string; value: string | number; hot?: boolean }) {
  return (
    <div style={{
      flex: 1, minWidth: 90,
      padding: '10px 14px',
      background: hot
        ? `linear-gradient(135deg, ${ACCENT}22, #FF8FB122)`
        : 'var(--surface-muted)',
      border: `1px solid ${hot ? ACCENT : 'var(--border)'}`,
      borderRadius: 6,
    }}>
      <div style={{
        fontSize: 9.5, letterSpacing: 0.14, textTransform: 'uppercase',
        color: hot ? ACCENT : 'var(--text-subtle)',
      }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}

function MeterCard({
  label, value, max, pct, barGradient, note, ready,
}: {
  label: string; value: number | string; max: number; pct: number; barGradient: string; note: string; ready?: boolean;
}) {
  return (
    <div style={{
      padding: 12,
      background: 'var(--surface-muted)',
      border: `1px solid ${ready ? ACCENT : 'var(--border)'}`,
      borderRadius: 6,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: ready ? `0 0 16px ${ACCENT}55` : 'none',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <div style={{
          fontSize: 10, letterSpacing: 0.12, textTransform: 'uppercase',
          color: ready ? ACCENT : 'var(--text-muted)', fontWeight: 700,
        }}>
          {label}{ready && ' · READY'}
        </div>
        <div style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', color: 'var(--text)' }}>
          <b>{value}</b><span style={{ opacity: 0.4 }}> / {max}</span>
        </div>
      </div>
      <div style={{
        height: 8,
        background: 'rgba(255,255,255,0.06)',
        borderRadius: 999,
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: barGradient,
          borderRadius: 999,
          transition: 'width 420ms cubic-bezier(0.2, 0.7, 0.2, 1)',
          boxShadow: ready ? '0 0 8px rgba(255, 216, 111, 0.8)' : 'none',
        }} />
      </div>
      <div style={{ marginTop: 4, fontSize: 10, color: 'var(--text-subtle)' }}>{note}</div>
    </div>
  );
}

function FesButton({
  children, onClick, disabled, primary, special, ghost,
}: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; primary?: boolean; special?: boolean; ghost?: boolean;
}) {
  const bg = primary
    ? `linear-gradient(135deg, ${ACCENT} 0%, #FF8FB1 100%)`
    : special
    ? `linear-gradient(135deg, #7EC4F5, #9B6CFF)`
    : ghost
    ? 'transparent'
    : 'var(--surface-2)';
  const color = primary ? '#1a1006' : special ? '#fff' : ghost ? 'var(--text-muted)' : 'var(--text)';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: ghost ? '8px 14px' : '10px 18px',
        fontSize: 13, fontWeight: 700,
        letterSpacing: 0.06,
        background: bg,
        color,
        border: `1px solid ${primary ? ACCENT : special ? '#9B6CFF' : ghost ? 'var(--border)' : 'var(--border-strong)'}`,
        borderRadius: 6,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.38 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        boxShadow: primary
          ? `0 4px 16px ${ACCENT}66`
          : special
          ? `0 4px 16px #9B6CFF55`
          : 'none',
        transition: 'transform 140ms, box-shadow 220ms',
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {children}
    </button>
  );
}

function VariantPicker({
  variants, currentSlug, onChange,
}: { variants: ReturnType<typeof combosForType>; currentSlug: string; onChange: (slug: string) => void }) {
  const current = variants.find(v => v.slug === currentSlug)!;
  const currencies = variants.filter(v => v.banner.id === current.banner.id && v.guarantee.id === current.guarantee.id);
  if (currencies.length <= 1) return null;
  return (
    <div style={{ marginBottom: 14, padding: 10, background: 'rgba(255, 216, 111, 0.08)', border: `1px solid ${ACCENT}33`, borderRadius: 6 }}>
      <div style={{ fontSize: 10, letterSpacing: 0.14, textTransform: 'uppercase', color: ACCENT, marginBottom: 6, fontWeight: 700 }}>Currency variant</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {currencies.map(v => {
          const active = v.slug === currentSlug;
          return (
            <button key={v.slug} onClick={() => onChange(v.slug)} style={{
              padding: '4px 12px',
              fontSize: 11.5,
              background: active ? `linear-gradient(135deg, ${ACCENT}, #FF8FB1)` : 'transparent',
              color: active ? '#1a1006' : 'var(--text)',
              border: `1px solid ${active ? ACCENT : 'var(--border-strong)'}`,
              borderRadius: 12,
              cursor: 'pointer',
              fontWeight: active ? 700 : 400,
            }}>{v.currency.name}</button>
          );
        })}
      </div>
    </div>
  );
}

function AmbientSparkles() {
  const sparkles = useMemo(() => Array.from({ length: 14 }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 3000,
    dur: 2 + Math.random() * 2,
  })), []);
  return (
    <div style={styles.ambientWrap} aria-hidden>
      {sparkles.map((s, i) => (
        <span key={i} style={{
          position: 'absolute',
          left: `${s.left}%`, top: `${s.top}%`,
          fontSize: 14,
          color: ACCENT,
          opacity: 0.5,
          animation: `anniTwinkle ${s.dur}s ease-in-out ${s.delay}ms infinite`,
          textShadow: `0 0 6px ${ACCENT}`,
        }}>✦</span>
      ))}
    </div>
  );
}

function ConfettiBurst({ seed, big }: { seed: number; big: boolean }) {
  const pieces = useMemo(() => {
    const n = big ? 70 : 28;
    const colors = ['#FFD86F', '#FF8FB1', '#7EC4F5', '#9B6CFF', '#4FC98D', '#FFB6E6'];
    return Array.from({ length: n }, (_, i) => ({
      key: i + seed * 1000,
      angle: Math.random() * Math.PI * 2,
      dist: 80 + Math.random() * 220,
      delay: Math.random() * 200,
      hue: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 720 - 360,
      size: 4 + Math.random() * 8,
      shape: Math.random() > 0.5 ? '50%' : '2px',
      dur: 1.1 + Math.random() * 0.8,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, big]);
  return (
    <div style={styles.confettiWrap} aria-hidden>
      {pieces.map(p => (
        <span key={p.key} style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: p.size, height: p.size,
          background: p.hue,
          borderRadius: p.shape,
          transform: 'translate(-50%, -50%)',
          boxShadow: `0 0 6px ${p.hue}88`,
          ['--dx' as never]: `${Math.cos(p.angle) * p.dist}px`,
          ['--dy' as never]: `${Math.sin(p.angle) * p.dist}px`,
          ['--rot' as never]: `${p.rot}deg`,
          animation: `anniConfetti ${p.dur}s cubic-bezier(0.1, 0.8, 0.3, 1) ${p.delay}ms both`,
        } as React.CSSProperties} />
      ))}
    </div>
  );
}

function JackpotOverlay() {
  return (
    <div style={styles.jackpotWrap} aria-hidden>
      <div style={styles.jackpotFlash} />
      <div style={styles.jackpotRainbow} />
      <div style={styles.jackpotText}>★5 JACKPOT</div>
      <div style={styles.jackpotSub}>ANNIVERSARY CELEBRATION</div>
    </div>
  );
}

// -- styles --

const styles: Record<string, React.CSSProperties> = {
  ambientWrap: {
    position: 'fixed', inset: 0,
    pointerEvents: 'none',
    zIndex: 1,
  },
  header: {
    position: 'relative',
    padding: 2,
    marginBottom: 18,
    borderRadius: 10,
    overflow: 'hidden',
  },
  rainbowBorder: {
    position: 'absolute', inset: 0,
    background: 'conic-gradient(from 0deg, #FFD86F, #FF8FB1, #7EC4F5, #9B6CFF, #4FC98D, #FFD86F)',
    animation: 'anniRotate 6s linear infinite',
    borderRadius: 10,
  },
  rainbowBorderInner: {
    position: 'absolute', inset: 2,
    background: 'linear-gradient(135deg, rgba(30, 20, 10, 0.96), rgba(26, 16, 34, 0.96))',
    borderRadius: 8,
  },
  headerInner: {
    position: 'relative',
    padding: '24px 28px',
    zIndex: 1,
  },
  pretitle: {
    display: 'inline-flex', alignItems: 'center', gap: 10,
    fontSize: 10, letterSpacing: 0.3, textTransform: 'uppercase',
    color: ACCENT, marginBottom: 8,
    fontWeight: 700,
  },
  confetti: { fontSize: 12, color: '#FF8FB1' },
  title: {
    margin: 0,
    fontSize: 34, fontWeight: 900,
    letterSpacing: -0.5,
    background: 'linear-gradient(90deg, #FFD86F 0%, #FF8FB1 40%, #9B6CFF 80%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    filter: `drop-shadow(0 0 16px ${ACCENT}44)`,
  },
  tagline: {
    margin: '4px 0 12px', color: 'var(--text-muted)', fontSize: 13,
  },
  chipRow: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  mainPanel: {
    position: 'relative',
    padding: 22,
    background: 'rgba(15, 14, 19, 0.88)',
    backdropFilter: 'blur(6px)',
    border: `1px solid ${ACCENT}33`,
    borderRadius: 8,
    boxShadow: `0 14px 50px -10px ${ACCENT}44`,
  },
  section: { marginBottom: 18 },
  featuredRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  featuredBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 10,
    padding: '8px 16px',
    color: '#1a1006',
    borderRadius: 24,
    fontSize: 13, fontWeight: 700,
    animation: 'anniPulseBadge 2.5s ease-in-out infinite',
  },
  starBadge: {
    fontSize: 10, padding: '2px 6px',
    background: '#fff', color: '#1a1006',
    borderRadius: 3, fontWeight: 800, letterSpacing: 0.08,
  },
  featuredFour: {
    padding: '6px 14px',
    background: 'rgba(138, 111, 212, 0.2)',
    color: '#D1B3FF',
    borderRadius: 24,
    fontSize: 12,
    border: '1px solid rgba(138, 111, 212, 0.5)',
  },
  meterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 10,
  },
  carryStrip: { marginTop: 12 },
  carryChip: {
    padding: '8px 14px',
    borderRadius: 6,
    border: '1px solid',
    display: 'flex', alignItems: 'center', gap: 10,
  },
  counterRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 },
  buttonRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  costSmall: { fontSize: 10.5, opacity: 0.85, fontWeight: 500 },
  viewport: {
    position: 'relative',
    minHeight: 220,
    padding: 20,
    background: `
      radial-gradient(ellipse 80% 60% at 30% 30%, rgba(255, 143, 177, 0.1), transparent 70%),
      radial-gradient(ellipse 80% 60% at 70% 70%, rgba(126, 196, 245, 0.1), transparent 70%),
      var(--surface-muted)`,
    border: `1px solid ${ACCENT}33`,
    borderRadius: 8,
    overflow: 'hidden',
  },
  resultsGrid: {
    position: 'relative', zIndex: 2,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: 8,
  },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: 180, textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 14, fontWeight: 700, letterSpacing: 0.16,
    textTransform: 'uppercase',
    background: 'linear-gradient(90deg, #FFD86F, #FF8FB1)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: 6,
  },
  emptySub: { fontSize: 12, color: 'var(--text-muted)' },
  confettiWrap: {
    position: 'absolute', inset: 0,
    pointerEvents: 'none', zIndex: 5,
    overflow: 'hidden',
  },
  jackpotWrap: {
    position: 'absolute', inset: 0,
    zIndex: 20, pointerEvents: 'none',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  jackpotFlash: {
    position: 'absolute', inset: 0,
    background: `radial-gradient(ellipse at center, ${ACCENT}cc 0%, rgba(255, 143, 177, 0.5) 30%, transparent 70%)`,
    animation: 'anniJackpotFlash 2.2s ease-out both',
    mixBlendMode: 'screen',
  },
  jackpotRainbow: {
    position: 'absolute', top: '50%', left: '50%',
    width: 600, height: 600,
    background: 'conic-gradient(from 0deg, #FFD86F, #FF8FB1, #9B6CFF, #7EC4F5, #4FC98D, #FFD86F)',
    transform: 'translate(-50%, -50%)',
    animation: 'anniJackpotRainbow 2.2s ease-out both',
    mixBlendMode: 'screen',
    borderRadius: '50%',
    filter: 'blur(30px)',
    opacity: 0.6,
  },
  jackpotText: {
    position: 'relative',
    fontSize: 42, fontWeight: 900,
    letterSpacing: 4,
    color: '#fff',
    textShadow: `0 0 20px ${ACCENT}, 0 0 40px #FF8FB1, 0 2px 0 #000`,
    animation: 'anniJackpotText 2.2s ease-out both',
  },
  jackpotSub: {
    position: 'relative',
    marginTop: 8,
    fontSize: 12, letterSpacing: 0.3, textTransform: 'uppercase',
    color: '#fff',
    opacity: 0.92,
    textShadow: `0 0 8px ${ACCENT}`,
    animation: 'anniJackpotText 2.2s ease-out 0.2s both',
  },
  rainbowCard: {
    background: 'var(--surface)',
    borderImage: 'linear-gradient(135deg, #FFD86F, #FF8FB1, #7EC4F5) 1',
    borderStyle: 'solid',
    borderWidth: 1,
  },
};

const ANNI_KEYFRAMES = `
@keyframes anniRotate {
  from { transform: rotate(0); }
  to { transform: rotate(360deg); }
}
@keyframes anniTwinkle {
  0%, 100% { opacity: 0.2; transform: scale(0.6); }
  50% { opacity: 0.9; transform: scale(1.2); }
}
@keyframes anniPop {
  0% { opacity: 0; transform: translateY(12px) scale(0.85); }
  60% { opacity: 1; transform: translateY(-3px) scale(1.04); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes anniPulseBadge {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.15); }
}
@keyframes anniConfetti {
  0% { opacity: 0; transform: translate(-50%, -50%) rotate(0) scale(0.5); }
  15% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
  100% { opacity: 0; transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) rotate(var(--rot)) scale(0.6); }
}
@keyframes anniJackpotFlash {
  0% { opacity: 0; }
  15% { opacity: 1; }
  50% { opacity: 0.8; }
  100% { opacity: 0; }
}
@keyframes anniJackpotRainbow {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.2) rotate(0); }
  30% { opacity: 0.7; transform: translate(-50%, -50%) scale(1) rotate(90deg); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(1.6) rotate(360deg); }
}
@keyframes anniJackpotText {
  0% { opacity: 0; transform: scale(0.5); letter-spacing: -4px; }
  25% { opacity: 1; transform: scale(1.12); letter-spacing: 8px; }
  50% { opacity: 1; transform: scale(1); letter-spacing: 4px; }
  75% { opacity: 1; transform: scale(1.03); }
  100% { opacity: 0; transform: scale(1.1); letter-spacing: 10px; }
}
`;
