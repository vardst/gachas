// HAND-CRAFTED: Genshin Impact 5.0+ with Capturing Radiance (adaptive 50/50).
// Warm parchment gold, starfall particles, elemental fantasy vibe.
// Prominent Radiance aurora that strengthens with each lost 50/50.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType, ALL_TYPES } from '../../data/types';
import { featuredFor } from '../../data/roster';
import { useGachaEngine } from '../../lib/useGachaEngine';
import { UnitCard } from '../../lib/GachaFrame';

const ACCENT = '#E8B84A';
const TYPE_KEY = 'genshin-radiance';

interface Props { slug: string }

export default function GenshinRadiance({ slug }: Props) {
  const navigate = useNavigate();
  const type = ALL_TYPES[TYPE_KEY];
  const variants = useMemo(() => combosForType(TYPE_KEY), []);
  const combo = useMemo(
    () => variants.find(c => c.slug === slug) ?? variants[0],
    [variants, slug],
  );
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;

  const featured = featuredFor(combo.banner.id);
  const hasFive = lastResults.some(r => r.rarity === 5);
  const rateUpHitNow = lastResults.some(r => r.rateUpHit);
  const pityPct = Math.min(100, (state.pullsSinceFiveStar / state.hardPityAt) * 100);
  const softPityPct = (state.softPityStart / state.hardPityAt) * 100;
  const softPityActive = state.pullsSinceFiveStar >= state.softPityStart;

  const radianceStreak = state.radianceLossStreak;
  const radianceBoost = radianceStreak * 10;
  const radianceIntensity = Math.min(1, radianceStreak / 3);

  // Celebrate
  const [petals, setPetals] = useState(false);
  const [secured, setSecured] = useState(false);
  const [starfall, setStarfall] = useState(0);
  const prevBurst = useRef(0);
  useEffect(() => {
    if (eng.pullBurstKey === 0 || eng.pullBurstKey === prevBurst.current) return;
    prevBurst.current = eng.pullBurstKey;
    setStarfall(eng.pullBurstKey);
    if (hasFive) {
      setPetals(true);
      const t1 = setTimeout(() => setPetals(false), 1900);
      if (rateUpHitNow) {
        setSecured(true);
        const t2 = setTimeout(() => setSecured(false), 1700);
        return () => { clearTimeout(t1); clearTimeout(t2); };
      }
      return () => clearTimeout(t1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eng.pullBurstKey]);

  return (
    <div className="page">
      <style>{GEN_KEYFRAMES}</style>

      {/* Radiance aurora — strengthens w/ loss streak */}
      <RadianceAurora intensity={radianceIntensity} streak={radianceStreak} boost={radianceBoost} />

      <div style={styles.parchmentBg} aria-hidden />

      <Link to="/" className="back-link">← Back to dashboard</Link>

      <header style={styles.header}>
        <div style={styles.headerOrnament} aria-hidden />
        <h1 style={styles.title}>{type.title}</h1>
        <p style={styles.subtitle}>
          Adaptive 50/50 — next rate-up chance grows after losses · Carry-over guaranteed
        </p>
        <div style={styles.chipRow}>
          <Chip>{combo.banner.name}</Chip>
          <Chip>{combo.guarantee.name}</Chip>
          <Chip>{combo.currency.name}</Chip>
          <Chip accent>{combo.tag.text}</Chip>
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
            <Heading>Featured Wish · Rate-Up</Heading>
            <div style={styles.featuredRow}>
              {featured.five.map(u => (
                <div key={u.id} style={{
                  ...styles.featuredBadge,
                  background: `linear-gradient(135deg, ${u.color} 0%, ${u.color}cc 100%)`,
                  boxShadow: `0 0 14px ${ACCENT}44, 0 4px 12px ${u.color}55`,
                }}>
                  <span style={styles.gold5}>★5</span>
                  <span>{u.name}</span>
                </div>
              ))}
              {featured.four.map(u => (
                <div key={u.id} style={styles.featuredFour}>
                  <span style={{ fontSize: 10, opacity: 0.7 }}>★4</span> {u.name}
                </div>
              ))}
            </div>
          </section>

          {/* Pity */}
          <section style={styles.section}>
            <div style={styles.pityHead}>
              <Heading>Wish Pity</Heading>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                <b style={{ color: softPityActive ? ACCENT : 'var(--text)' }}>{state.pullsSinceFiveStar}</b>
                <span style={{ opacity: 0.5 }}> / </span>{state.hardPityAt}
              </div>
            </div>
            <div style={styles.pityTrack}>
              <div style={{ ...styles.softMark, left: `${softPityPct}%` }} />
              <div style={{
                ...styles.pityFill,
                width: `${pityPct}%`,
                background: softPityActive
                  ? 'linear-gradient(90deg, #E8B84A 0%, #FFE48A 50%, #FFF6C7 100%)'
                  : 'linear-gradient(90deg, #B8902C 0%, #E8B84A 100%)',
              }} />
              <div style={styles.pityShine} aria-hidden />
            </div>
            <div style={styles.pityTicks}>
              <span>0</span>
              <span>soft · {state.softPityStart}</span>
              <span>hard · {state.hardPityAt}</span>
            </div>

            {/* Carry-over indicator */}
            <div style={{
              ...styles.carryCard,
              borderColor: state.carryOver ? ACCENT : 'var(--border-strong)',
              background: state.carryOver ? `${ACCENT}18` : 'transparent',
              color: state.carryOver ? ACCENT : 'var(--text-muted)',
            }}>
              <span style={{ fontSize: 10, letterSpacing: 0.18, textTransform: 'uppercase', opacity: 0.8 }}>
                {state.carryOver ? 'Guaranteed' : 'Standard'}
              </span>
              <span style={{ fontSize: 12.5 }}>
                {state.carryOver
                  ? 'Next 5★ is the featured unit'
                  : `50/50 chance · next 5★ is featured ${radianceStreak > 0 ? `(+${radianceBoost}% Radiance)` : ''}`}
              </span>
            </div>
          </section>

          {/* Counters */}
          <div style={styles.counterRow}>
            <Counter label="Primogems" value={state.freeCurrency.toLocaleString()} />
            <Counter label="Wishes" value={state.totalPulls} />
            <Counter label="5★ Total" value={state.fiveStarCount} />
            <Counter label="Featured" value={state.featuredObtained} />
          </div>

          {/* Buttons */}
          <div style={styles.buttonRow}>
            <GenButton disabled={!eng.canPull1} onClick={eng.pull1}>
              <span>Wish ×1</span>
              <span style={styles.btnCost}>{eng.pullCost.toLocaleString()}</span>
            </GenButton>
            <GenButton primary disabled={!eng.canPull10} onClick={eng.pull10}>
              <span>Wish ×10</span>
              <span style={styles.btnCost}>{(eng.pullCost * 10).toLocaleString()}</span>
            </GenButton>
            <GenButton ghost onClick={() => eng.addFunds()}>+ Primogems</GenButton>
            <GenButton ghost onClick={eng.reset}>Reset</GenButton>
          </div>

          {/* Wish viewport */}
          <div style={styles.viewport}>
            <Starfall key={starfall} />
            {secured && <FeaturedSecuredBanner />}
            {petals && <PetalBurst />}
            {lastResults.length === 0 ? (
              <div style={styles.empty}>
                <div style={{ fontSize: 12, letterSpacing: 0.14, textTransform: 'uppercase', color: ACCENT, marginBottom: 6 }}>
                  Awaiting Wish
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Adaptive 50/50 · 160 primogems per wish
                </div>
              </div>
            ) : (
              <div style={styles.resultsGrid} key={eng.pullBurstKey}>
                {lastResults.map((r, i) => (
                  <div key={i} style={{ animation: `genFade 0.5s ease-out ${i * 55}ms both` }}>
                    <UnitCard result={r} delay={i * 60} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="player-meta">
          <div className="meta-card" style={{ borderColor: `${ACCENT}33` }}>
            <h3>Wish details</h3>
            <div className="detail-list">
              <div className="kv"><span>Banner</span><span>{combo.banner.name}</span></div>
              <div className="kv"><span>Guarantee</span><span>{combo.guarantee.name}</span></div>
              <div className="kv"><span>Currency</span><span>{combo.currency.name}</span></div>
              <div className="kv"><span>Tag</span><span className={`tag ${combo.tag.cls}`}>{combo.tag.text}</span></div>
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 4 }}>Guarantee layers</div>
              <div className="layers-list">
                {combo.guarantee.layers.map((l, i) => <span key={i} className="tag tag-neutral">{l}</span>)}
              </div>
            </div>
            <div style={{ marginTop: 10, padding: 10, background: `${ACCENT}14`, borderRadius: 4, fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.55, border: `1px dashed ${ACCENT}55` }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.1, color: ACCENT, marginBottom: 4 }}>Capturing Radiance</div>
              After losing a 50/50, the next rate-up roll gets ~10% per consecutive loss. Softens streakbreaker fatigue without removing the 50/50.
            </div>
          </div>

          <div className="meta-card" style={{ borderColor: `${ACCENT}33` }}>
            <h3>Wish history · {state.history.length}</h3>
            {state.history.length === 0 ? (
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-subtle)' }}>No wishes yet.</p>
            ) : (
              <div className="history-log">
                {state.history.slice(-30).reverse().map((h, i) => (
                  <div key={state.history.length - i} className={`entry r${h.rarity}`}>
                    #{state.history.length - i} · ★{h.rarity} {h.unit.name}
                    {h.hardPity && ' · hard'}{h.softPity && ' · soft'}
                    {h.rateUpHit && ' · rate-up'}{h.rateUpLoss && ' · lost'}
                    {h.carryOverConsumed && ' · carry'}{h.radianceTrigger && ' · radiance'}
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

// -- subcomponents --

function RadianceAurora({ intensity, streak, boost }: { intensity: number; streak: number; boost: number }) {
  if (streak === 0) return null;
  // Wider glow and more saturation as streak grows
  const height = 70 + intensity * 90;
  const saturation = 0.35 + intensity * 0.55;
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      height,
      zIndex: 20,
      pointerEvents: 'none',
      background: `linear-gradient(180deg,
        rgba(232, 184, 74, ${saturation}) 0%,
        rgba(255, 230, 140, ${saturation * 0.7}) 30%,
        rgba(232, 184, 74, ${saturation * 0.3}) 70%,
        transparent 100%)`,
      animation: 'genAurora 4s ease-in-out infinite',
      filter: `blur(${4 + intensity * 6}px)`,
    }} aria-hidden>
      <div style={{
        position: 'absolute',
        top: 10, left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 0.2,
        textTransform: 'uppercase',
        color: '#fff',
        textShadow: '0 0 12px #E8B84A, 0 0 24px #E8B84A',
        filter: 'blur(0)',
        pointerEvents: 'none',
      }}>
        Capturing Radiance · +{boost}% next rate-up
      </div>
    </div>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: 13, fontStyle: 'italic',
      color: ACCENT,
      letterSpacing: 0.08,
      display: 'flex', alignItems: 'center', gap: 10,
      marginBottom: 8,
    }}>
      <span style={{
        display: 'inline-block',
        width: 20, height: 1,
        background: `linear-gradient(90deg, transparent, ${ACCENT})`,
      }} />
      {children}
      <span style={{
        display: 'inline-block',
        flex: 1, height: 1,
        background: `linear-gradient(90deg, ${ACCENT}, transparent)`,
      }} />
    </div>
  );
}

function Chip({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span style={{
      padding: '3px 10px',
      fontSize: 10.5,
      letterSpacing: 0.1,
      textTransform: 'uppercase',
      border: `1px solid ${accent ? ACCENT : 'var(--border-strong)'}`,
      borderRadius: 12,
      color: accent ? ACCENT : 'var(--text-muted)',
      background: accent ? `${ACCENT}14` : 'transparent',
    }}>{children}</span>
  );
}

function Counter({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{
      flex: 1,
      minWidth: 90,
      padding: '10px 14px',
      background: 'linear-gradient(135deg, rgba(232, 184, 74, 0.1), rgba(232, 184, 74, 0.02))',
      border: `1px solid ${ACCENT}33`,
      borderRadius: 6,
    }}>
      <div style={{
        fontSize: 10, letterSpacing: 0.14, textTransform: 'uppercase',
        color: ACCENT, opacity: 0.85,
      }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}

function GenButton({
  children, onClick, disabled, primary, ghost,
}: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; primary?: boolean; ghost?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: ghost ? '8px 14px' : '10px 20px',
        fontSize: 13,
        fontWeight: 600,
        fontFamily: 'Georgia, serif',
        background: primary
          ? `linear-gradient(180deg, ${ACCENT} 0%, #B8902C 100%)`
          : ghost ? 'transparent' : 'rgba(232, 184, 74, 0.12)',
        color: primary ? '#3e2e0a' : ghost ? 'var(--text-muted)' : ACCENT,
        border: `1px solid ${primary ? ACCENT : ghost ? 'var(--border)' : `${ACCENT}66`}`,
        borderRadius: 6,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: primary ? `0 4px 14px ${ACCENT}44` : 'none',
        transition: 'all 160ms',
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.transform = 'translateY(-1px)'; }}
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
    <div style={{ marginBottom: 14, padding: 10, background: `${ACCENT}0E`, border: `1px solid ${ACCENT}33`, borderRadius: 6 }}>
      <div style={{ fontSize: 10, letterSpacing: 0.14, textTransform: 'uppercase', color: ACCENT, marginBottom: 6, fontFamily: 'Georgia, serif' }}>Currency variant</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {currencies.map(v => {
          const active = v.slug === currentSlug;
          return (
            <button key={v.slug} onClick={() => onChange(v.slug)} style={{
              padding: '4px 12px',
              fontSize: 11.5,
              background: active ? ACCENT : 'transparent',
              color: active ? '#3e2e0a' : 'var(--text)',
              border: `1px solid ${active ? ACCENT : 'var(--border-strong)'}`,
              borderRadius: 12,
              cursor: 'pointer',
              fontWeight: active ? 600 : 400,
            }}>{v.currency.name}</button>
          );
        })}
      </div>
    </div>
  );
}

function Starfall() {
  const stars = useMemo(() => Array.from({ length: 18 }, () => ({
    left: Math.random() * 100,
    delay: Math.random() * 300,
    size: 2 + Math.random() * 3,
    dur: 1.1 + Math.random() * 0.8,
  })), []);
  return (
    <div style={styles.starfallWrap} aria-hidden>
      {stars.map((s, i) => (
        <span key={i} style={{
          position: 'absolute',
          top: -10,
          left: `${s.left}%`,
          width: s.size, height: s.size,
          background: '#fff',
          boxShadow: `0 0 8px ${ACCENT}, 0 0 2px #fff`,
          borderRadius: '50%',
          animation: `genStarfall ${s.dur}s ease-in ${s.delay}ms both`,
        }} />
      ))}
    </div>
  );
}

function PetalBurst() {
  const petals = useMemo(() => Array.from({ length: 22 }, () => ({
    angle: Math.random() * Math.PI * 2,
    dist: 100 + Math.random() * 130,
    delay: Math.random() * 180,
    hue: 30 + Math.random() * 20,
  })), []);
  return (
    <div style={styles.petalsWrap} aria-hidden>
      <div style={styles.petalGlow} />
      {petals.map((p, i) => (
        <span key={i} style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: 8, height: 14,
          background: `hsl(${p.hue}, 78%, 62%)`,
          borderRadius: '50% 50% 50% 50% / 70% 70% 30% 30%',
          transform: 'translate(-50%, -50%)',
          boxShadow: `0 0 8px ${ACCENT}`,
          ['--dx' as never]: `${Math.cos(p.angle) * p.dist}px`,
          ['--dy' as never]: `${Math.sin(p.angle) * p.dist}px`,
          ['--rot' as never]: `${Math.random() * 720}deg`,
          animation: `genPetal 1.8s ease-out ${p.delay}ms both`,
        } as React.CSSProperties} />
      ))}
    </div>
  );
}

function FeaturedSecuredBanner() {
  return (
    <div style={styles.securedBanner} aria-hidden>
      <div style={styles.securedText}>FEATURED UNIT SECURED</div>
      <div style={styles.securedSub}>★5 rate-up acquired</div>
    </div>
  );
}

// -- styles --

const styles: Record<string, React.CSSProperties> = {
  parchmentBg: {
    position: 'fixed', inset: 0,
    background: `
      radial-gradient(1000px 600px at 20% 0%, rgba(232, 184, 74, 0.06), transparent),
      radial-gradient(900px 500px at 90% 100%, rgba(232, 184, 74, 0.04), transparent),
      radial-gradient(ellipse at center, rgba(40, 30, 15, 0.3), transparent 70%)`,
    pointerEvents: 'none',
    zIndex: 0,
  },
  header: {
    position: 'relative', padding: '28px 28px 22px', marginBottom: 18,
    border: `1px solid ${ACCENT}33`,
    borderRadius: 8,
    background: `linear-gradient(135deg, rgba(232, 184, 74, 0.08) 0%, transparent 60%),
                 repeating-linear-gradient(45deg, transparent 0, transparent 20px, rgba(232, 184, 74, 0.02) 20px, rgba(232, 184, 74, 0.02) 21px)`,
    overflow: 'hidden',
  },
  headerOrnament: {
    position: 'absolute',
    top: 8, right: 8, bottom: 8,
    width: 60,
    opacity: 0.35,
    backgroundImage: `radial-gradient(circle at 50% 50%, ${ACCENT} 0%, transparent 50%)`,
    filter: 'blur(8px)',
  },
  title: {
    position: 'relative', margin: 0,
    fontSize: 28, fontWeight: 700,
    fontFamily: 'Georgia, "Times New Roman", serif',
    color: '#fff',
    textShadow: `0 0 18px ${ACCENT}55`,
  },
  subtitle: {
    position: 'relative', margin: '4px 0 12px',
    color: 'var(--text-muted)', fontSize: 13,
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
  },
  chipRow: { position: 'relative', display: 'flex', gap: 6, flexWrap: 'wrap' },
  mainPanel: {
    position: 'relative',
    padding: 22,
    background: 'linear-gradient(180deg, rgba(26, 20, 12, 0.85) 0%, rgba(15, 14, 19, 0.95) 100%)',
    border: `1px solid ${ACCENT}33`,
    borderRadius: 8,
    boxShadow: `0 14px 40px -10px ${ACCENT}22`,
  },
  section: { marginBottom: 18 },
  featuredRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  featuredBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 10,
    padding: '8px 16px',
    color: '#2a1e08',
    borderRadius: 24,
    fontSize: 13, fontWeight: 600,
    fontFamily: 'Georgia, serif',
  },
  gold5: {
    fontSize: 10, padding: '2px 6px',
    background: '#fff',
    color: '#5a3f0a',
    borderRadius: 3,
    fontWeight: 700,
    letterSpacing: 0.08,
  },
  featuredFour: {
    padding: '6px 14px',
    background: 'rgba(138, 111, 212, 0.15)',
    color: '#D1B3FF',
    borderRadius: 24,
    fontSize: 12,
    border: '1px solid rgba(138, 111, 212, 0.5)',
  },
  pityHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  pityTrack: {
    position: 'relative',
    height: 12,
    background: 'rgba(232, 184, 74, 0.1)',
    border: `1px solid ${ACCENT}44`,
    borderRadius: 999,
    overflow: 'hidden',
  },
  pityFill: {
    height: '100%',
    borderRadius: 999,
    transition: 'width 500ms cubic-bezier(0.2, 0.7, 0.2, 1)',
    boxShadow: `0 0 10px ${ACCENT}66`,
  },
  pityShine: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.25), transparent 50%)',
    borderRadius: 999,
    pointerEvents: 'none',
  },
  softMark: {
    position: 'absolute', top: -3, bottom: -3,
    width: 1, background: ACCENT,
    boxShadow: `0 0 6px ${ACCENT}`, zIndex: 2,
  },
  pityTicks: {
    display: 'flex', justifyContent: 'space-between',
    marginTop: 4,
    fontSize: 10, letterSpacing: 0.06, textTransform: 'uppercase',
    color: 'var(--text-subtle)',
    fontFamily: 'Georgia, serif',
  },
  carryCard: {
    marginTop: 12, padding: '8px 14px',
    display: 'flex', alignItems: 'center', gap: 10,
    border: '1px solid',
    borderRadius: 6,
    fontFamily: 'Georgia, serif',
  },
  counterRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 },
  buttonRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  btnCost: { fontSize: 10.5, opacity: 0.75, letterSpacing: 0.04, fontWeight: 500 },
  viewport: {
    position: 'relative',
    minHeight: 200,
    padding: 20,
    background: `radial-gradient(ellipse 90% 80% at 50% 40%, rgba(232, 184, 74, 0.08), transparent 70%),
                 rgba(26, 20, 12, 0.6)`,
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
    justifyContent: 'center', minHeight: 160, textAlign: 'center',
  },
  starfallWrap: {
    position: 'absolute', inset: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
    zIndex: 1,
  },
  petalsWrap: {
    position: 'absolute', inset: 0,
    pointerEvents: 'none',
    zIndex: 5,
    overflow: 'hidden',
  },
  petalGlow: {
    position: 'absolute', top: '50%', left: '50%',
    width: 200, height: 200,
    background: `radial-gradient(circle, ${ACCENT}88 0%, transparent 60%)`,
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    animation: 'genGlow 1.8s ease-out both',
    mixBlendMode: 'screen',
  },
  securedBanner: {
    position: 'absolute', top: 16, left: '50%',
    transform: 'translateX(-50%)',
    padding: '10px 24px',
    background: `linear-gradient(90deg, transparent, ${ACCENT} 30%, ${ACCENT} 70%, transparent)`,
    color: '#2a1e08',
    zIndex: 12,
    animation: 'genBanner 1.7s ease-out both',
    textAlign: 'center',
    boxShadow: `0 0 24px ${ACCENT}aa`,
  },
  securedText: {
    fontSize: 16, fontWeight: 800,
    letterSpacing: 0.2,
  },
  securedSub: {
    fontSize: 10, letterSpacing: 0.14,
    opacity: 0.8,
    marginTop: 2,
  },
};

const GEN_KEYFRAMES = `
@keyframes genFade {
  from { opacity: 0; transform: translateY(10px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes genStarfall {
  0% { opacity: 0; transform: translateY(-10px); }
  20% { opacity: 1; }
  100% { opacity: 0; transform: translateY(240px); }
}
@keyframes genPetal {
  0% { opacity: 0; transform: translate(-50%, -50%) rotate(0); }
  20% { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) rotate(var(--rot)); }
}
@keyframes genGlow {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
  30% { opacity: 1; transform: translate(-50%, -50%) scale(1.3); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(2.2); }
}
@keyframes genAurora {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}
@keyframes genBanner {
  0% { opacity: 0; transform: translateX(-50%) translateY(-12px) scaleX(0.4); }
  25% { opacity: 1; transform: translateX(-50%) translateY(0) scaleX(1); }
  75% { opacity: 1; transform: translateX(-50%) translateY(0) scaleX(1); }
  100% { opacity: 0; transform: translateX(-50%) translateY(-8px); }
}
`;
