// HAND-CRAFTED: HoYoverse Standard (Honkai Star Rail / ZZZ / pre-5.0 Genshin).
// Cool holographic blue, starfield warp tunnel, thin white lines, crisp geometry.
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType, ALL_TYPES } from '../../data/types';
import { featuredFor } from '../../data/roster';
import { useGachaEngine } from '../../lib/useGachaEngine';
import { UnitCard } from '../../lib/GachaFrame';

const ACCENT = '#7EC4F5';
const TYPE_KEY = 'hoyoverse-standard';

interface Props { slug: string }

export default function HoyoverseStandard({ slug }: Props) {
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
  const softPityActive = state.pullsSinceFiveStar >= state.softPityStart;
  const pityPct = Math.min(100, (state.pullsSinceFiveStar / state.hardPityAt) * 100);
  const softPityPct = (state.softPityStart / state.hardPityAt) * 100;

  // Warp / celebrate state
  const [warping, setWarping] = useState(false);
  const [stellar, setStellar] = useState(false);
  useEffect(() => {
    if (eng.pullBurstKey === 0) return;
    setWarping(true);
    const t1 = setTimeout(() => setWarping(false), 700);
    if (hasFive) {
      setStellar(true);
      const t2 = setTimeout(() => setStellar(false), 1800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    return () => clearTimeout(t1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eng.pullBurstKey]);

  return (
    <div className="page">
      <style>{HSR_KEYFRAMES}</style>
      <Link to="/" className="back-link">← Back to dashboard</Link>

      {/* Ambient starfield */}
      <div style={styles.starfield} aria-hidden />

      <header style={styles.header}>
        <div style={styles.headerGrid} aria-hidden />
        <div style={styles.headerTag}>WARP · LIMITED EVENT</div>
        <h1 style={styles.title}>{type.title}</h1>
        <p style={styles.subtitle}>50/50 rate-up · Hard pity 90 · Soft pity ramp from 74 · Carry-over guarantee</p>
        <div style={styles.chipRow}>
          <Chip>{combo.banner.name}</Chip>
          <Chip>{combo.guarantee.name}</Chip>
          <Chip>{combo.currency.name}</Chip>
          <Chip accent>{combo.tag.text}</Chip>
        </div>
      </header>

      <div className="player-shell">
        <div style={styles.mainPanel}>
          {/* Variant picker */}
          {variants.length > 1 && (
            <VariantPicker
              variants={variants}
              currentSlug={combo.slug}
              onChange={(s) => navigate(`/play/${s}`)}
            />
          )}

          {/* Featured strip w/ circular wish icons */}
          <section style={styles.section}>
            <SectionLabel>Featured Warp</SectionLabel>
            <div style={styles.featuredRow}>
              {featured.five.map(u => (
                <div key={u.id} style={styles.featuredCard}>
                  <div style={{ ...styles.wishOrb, background: `radial-gradient(circle, ${u.color} 0%, ${u.color}44 60%, transparent 100%)` }}>
                    <span style={{ fontSize: 11, fontWeight: 700 }}>★5</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{u.name}</div>
                    <div style={{ fontSize: 10.5, color: ACCENT, letterSpacing: 0.08, textTransform: 'uppercase' }}>Rate-up 5★</div>
                  </div>
                </div>
              ))}
              {featured.four.map(u => (
                <div key={u.id} style={styles.featuredCardFour}>
                  <div style={styles.wishOrbFour}><span style={{ fontSize: 10 }}>★4</span></div>
                  <div style={{ fontSize: 12, color: 'var(--text)' }}>{u.name}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Holographic pity bar */}
          <section style={styles.section}>
            <div style={styles.pityHead}>
              <SectionLabel>Warp Pity</SectionLabel>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                <b style={{ color: softPityActive ? '#f4d874' : 'var(--text)' }}>{state.pullsSinceFiveStar}</b>
                <span style={{ opacity: 0.5 }}> / </span>
                <span>{state.hardPityAt}</span>
              </div>
            </div>
            <div style={styles.pityBarOuter}>
              <div style={styles.pityBarTrack}>
                {/* Soft pity marker */}
                <div style={{ ...styles.softPityMark, left: `${softPityPct}%` }} aria-hidden />
                <div
                  style={{
                    ...styles.pityBarFill,
                    width: `${pityPct}%`,
                    background: softPityActive
                      ? 'linear-gradient(90deg, #7EC4F5 0%, #c6a24a 50%, #f4d874 100%)'
                      : `linear-gradient(90deg, ${ACCENT} 0%, #b6e0fb 100%)`,
                    boxShadow: softPityActive
                      ? '0 0 12px rgba(244, 216, 116, 0.65)'
                      : `0 0 10px ${ACCENT}88`,
                  }}
                />
                <div style={styles.pityBarGloss} aria-hidden />
              </div>
              <div style={styles.pityTicks}>
                <span>0</span>
                <span style={{ color: softPityActive ? '#f4d874' : 'var(--text-muted)' }}>soft · 74</span>
                <span>hard · 90</span>
              </div>
            </div>
            <div style={styles.carryRow}>
              <div style={{
                ...styles.carryPill,
                color: state.carryOver ? '#0f0e13' : 'var(--text-muted)',
                background: state.carryOver ? ACCENT : 'transparent',
                borderColor: state.carryOver ? ACCENT : 'var(--border-strong)',
              }}>
                {state.carryOver ? 'CARRY-OVER ARMED · next 5★ is featured' : 'No carry-over'}
              </div>
            </div>
          </section>

          {/* Currency counters */}
          <div style={styles.counterRow}>
            <Counter label="Stellar Jade" value={state.freeCurrency.toLocaleString()} emphasis />
            <Counter label="Warps" value={state.totalPulls} />
            <Counter label="5★" value={state.fiveStarCount} />
            <Counter label="Featured" value={state.featuredObtained} />
          </div>

          {/* Buttons */}
          <div style={styles.buttonRow}>
            <HoyoButton disabled={!eng.canPull1} onClick={eng.pull1}>
              <span>Warp ×1</span>
              <span style={styles.btnCost}>{eng.pullCost.toLocaleString()}</span>
            </HoyoButton>
            <HoyoButton primary disabled={!eng.canPull10} onClick={eng.pull10}>
              <span>Warp ×10</span>
              <span style={styles.btnCost}>{(eng.pullCost * 10).toLocaleString()}</span>
            </HoyoButton>
            <HoyoButton ghost onClick={() => eng.addFunds()}>+ Jade</HoyoButton>
            <HoyoButton ghost onClick={eng.reset}>Reset</HoyoButton>
          </div>

          {/* Warp viewport */}
          <div style={styles.viewport}>
            {warping && <WarpTunnel />}
            {stellar && <StellarFlash />}
            {lastResults.length === 0 ? (
              <div style={styles.empty}>
                <div style={{ fontSize: 12, letterSpacing: 0.14, textTransform: 'uppercase', color: ACCENT, marginBottom: 6 }}>Awaiting Warp</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Press Warp ×10 for batch floor · 160 Jade per warp
                </div>
              </div>
            ) : (
              <div style={styles.resultsGrid} key={eng.pullBurstKey}>
                {lastResults.map((r, i) => (
                  <div key={i} style={{ animation: `hsrSlide 0.45s cubic-bezier(0.2,0.7,0.2,1) ${i * 60}ms both` }}>
                    <UnitCard result={r} delay={i * 60} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="player-meta">
          <div className="meta-card" style={{ borderColor: `${ACCENT}33` }}>
            <h3>Banner details</h3>
            <div className="detail-list">
              <div className="kv"><span>Distribution</span><span>{combo.dist.name}</span></div>
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
            {combo.example && (
              <div style={{ marginTop: 10, padding: 8, background: 'var(--surface-muted)', borderRadius: 4, fontSize: 11.5, color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.06, color: ACCENT, marginBottom: 2 }}>Real-world analogue</div>
                {combo.example}
              </div>
            )}
          </div>

          <div className="meta-card" style={{ borderColor: `${ACCENT}33` }}>
            <h3>Warp history · {state.history.length}</h3>
            {state.history.length === 0 ? (
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-subtle)' }}>No warps yet.</p>
            ) : (
              <div className="history-log">
                {state.history.slice(-30).reverse().map((h, i) => (
                  <div key={state.history.length - i} className={`entry r${h.rarity}`}>
                    #{state.history.length - i} · ★{h.rarity} {h.unit.name}
                    {h.hardPity && ' · hard'}{h.softPity && ' · soft'}
                    {h.rateUpHit && ' · rate-up'}{h.rateUpLoss && ' · lost 50/50'}
                    {h.carryOverConsumed && ' · carry'}{h.batchFloor && ' · batch'}
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

function Chip({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span style={{
      padding: '3px 10px',
      fontSize: 10.5,
      letterSpacing: 0.1,
      textTransform: 'uppercase',
      border: `1px solid ${accent ? ACCENT : 'var(--border-strong)'}`,
      borderRadius: 2,
      color: accent ? ACCENT : 'var(--text-muted)',
      background: accent ? `${ACCENT}14` : 'transparent',
    }}>{children}</span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10.5,
      letterSpacing: 0.18,
      textTransform: 'uppercase',
      color: ACCENT,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <span style={{ width: 6, height: 6, background: ACCENT, boxShadow: `0 0 6px ${ACCENT}`, transform: 'rotate(45deg)' }} />
      {children}
    </div>
  );
}

function Counter({ label, value, emphasis }: { label: string; value: string | number; emphasis?: boolean }) {
  return (
    <div style={{
      flex: 1,
      minWidth: 90,
      padding: '8px 12px',
      background: emphasis ? `linear-gradient(135deg, ${ACCENT}18, transparent)` : 'var(--surface-muted)',
      border: `1px solid ${emphasis ? `${ACCENT}55` : 'var(--border)'}`,
      borderRadius: 4,
    }}>
      <div style={{ fontSize: 9.5, letterSpacing: 0.1, textTransform: 'uppercase', color: emphasis ? ACCENT : 'var(--text-subtle)' }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}

function HoyoButton({
  children, onClick, disabled, primary, ghost,
}: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; primary?: boolean; ghost?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: ghost ? '8px 14px' : '10px 18px',
        fontSize: 12.5,
        letterSpacing: 0.06,
        textTransform: 'uppercase',
        fontWeight: 600,
        background: primary
          ? `linear-gradient(180deg, ${ACCENT} 0%, #5ba9dd 100%)`
          : ghost ? 'transparent' : 'var(--surface-2)',
        color: primary ? '#0f0e13' : ghost ? 'var(--text-muted)' : 'var(--text)',
        border: `1px solid ${primary ? ACCENT : ghost ? 'var(--border)' : `${ACCENT}55`}`,
        borderRadius: 3,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        position: 'relative',
        boxShadow: primary ? `0 0 16px ${ACCENT}55` : 'none',
        transition: 'transform 120ms, box-shadow 200ms',
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
    <div style={{ marginBottom: 14, padding: 10, background: 'var(--surface-muted)', border: `1px solid ${ACCENT}22`, borderRadius: 4 }}>
      <div style={{ fontSize: 10, letterSpacing: 0.14, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Currency variant</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {currencies.map(v => {
          const active = v.slug === currentSlug;
          return (
            <button key={v.slug} onClick={() => onChange(v.slug)} style={{
              padding: '4px 12px',
              fontSize: 11.5,
              background: active ? ACCENT : 'transparent',
              color: active ? '#0f0e13' : 'var(--text)',
              border: `1px solid ${active ? ACCENT : 'var(--border-strong)'}`,
              borderRadius: 2,
              cursor: 'pointer',
              fontWeight: active ? 600 : 400,
            }}>{v.currency.name}</button>
          );
        })}
      </div>
    </div>
  );
}

function WarpTunnel() {
  // 40 streak lines to evoke the HSR warp tunnel
  const streaks = useMemo(() => Array.from({ length: 40 }, () => ({
    top: Math.random() * 100,
    left: Math.random() * 100,
    len: 40 + Math.random() * 90,
    delay: Math.random() * 180,
    width: 1 + Math.random() * 1.4,
  })), []);
  return (
    <div style={styles.warpTunnel} aria-hidden>
      <div style={styles.warpCore} />
      {streaks.map((s, i) => (
        <span key={i} style={{
          position: 'absolute',
          top: `${s.top}%`,
          left: `${s.left}%`,
          width: s.len,
          height: s.width,
          background: `linear-gradient(90deg, transparent, ${ACCENT}, #fff)`,
          opacity: 0.85,
          transform: 'translate(-50%, -50%)',
          animation: `hsrStreak 0.65s ease-out ${s.delay}ms both`,
          borderRadius: 2,
        }} />
      ))}
    </div>
  );
}

function StellarFlash() {
  const particles = useMemo(() => Array.from({ length: 24 }, (_, i) => ({
    angle: (i / 24) * Math.PI * 2,
    dist: 80 + Math.random() * 120,
    delay: Math.random() * 200,
  })), []);
  return (
    <div style={styles.stellarWrap} aria-hidden>
      <div style={styles.stellarBlast} />
      <div style={styles.stellarLabel}>STELLAR ★5 GET</div>
      {particles.map((p, i) => (
        <span key={i} style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 4,
          height: 4,
          background: '#fff',
          boxShadow: `0 0 10px ${ACCENT}`,
          borderRadius: '50%',
          transform: `translate(-50%, -50%)`,
          ['--dx' as never]: `${Math.cos(p.angle) * p.dist}px`,
          ['--dy' as never]: `${Math.sin(p.angle) * p.dist}px`,
          animation: `hsrParticle 1.3s ease-out ${p.delay}ms both`,
        } as React.CSSProperties} />
      ))}
    </div>
  );
}

// -- styles --

const styles: Record<string, React.CSSProperties> = {
  starfield: {
    position: 'fixed',
    inset: 0,
    backgroundImage: [
      'radial-gradient(1px 1px at 20% 30%, #fff, transparent)',
      'radial-gradient(1px 1px at 70% 80%, #fff, transparent)',
      'radial-gradient(1.5px 1.5px at 45% 60%, #b6e0fb, transparent)',
      'radial-gradient(1px 1px at 85% 20%, #fff, transparent)',
      'radial-gradient(1px 1px at 12% 85%, #fff, transparent)',
      'radial-gradient(1.5px 1.5px at 60% 15%, #7EC4F5, transparent)',
      'radial-gradient(1200px 600px at 20% -10%, rgba(126, 196, 245, 0.14), transparent)',
      'radial-gradient(900px 500px at 90% 100%, rgba(126, 196, 245, 0.08), transparent)',
    ].join(','),
    pointerEvents: 'none',
    animation: 'hsrDrift 60s linear infinite',
    zIndex: 0,
  },
  header: {
    position: 'relative',
    padding: '28px 28px 22px',
    marginBottom: 18,
    border: `1px solid ${ACCENT}33`,
    borderRadius: 6,
    background: `linear-gradient(135deg, rgba(126, 196, 245, 0.08) 0%, transparent 50%, rgba(126, 196, 245, 0.04) 100%)`,
    overflow: 'hidden',
  },
  headerGrid: {
    position: 'absolute', inset: 0,
    backgroundImage: `
      linear-gradient(${ACCENT}10 1px, transparent 1px),
      linear-gradient(90deg, ${ACCENT}10 1px, transparent 1px)`,
    backgroundSize: '40px 40px',
    maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, #000 40%, transparent 90%)',
    opacity: 0.6,
    pointerEvents: 'none',
  },
  headerTag: {
    position: 'relative', display: 'inline-block',
    fontSize: 10, letterSpacing: 0.25, textTransform: 'uppercase',
    color: ACCENT, padding: '2px 8px',
    border: `1px solid ${ACCENT}55`,
    marginBottom: 8,
  },
  title: {
    position: 'relative', margin: 0,
    fontSize: 28, fontWeight: 700,
    letterSpacing: -0.5,
    color: '#fff',
    textShadow: `0 0 18px ${ACCENT}55`,
  },
  subtitle: { position: 'relative', margin: '4px 0 12px', color: 'var(--text-muted)', fontSize: 13 },
  chipRow: { position: 'relative', display: 'flex', gap: 6, flexWrap: 'wrap' },
  mainPanel: {
    position: 'relative',
    padding: 22,
    background: 'rgba(15, 14, 19, 0.72)',
    backdropFilter: 'blur(8px)',
    border: `1px solid ${ACCENT}22`,
    borderRadius: 6,
    boxShadow: `0 0 0 1px ${ACCENT}11 inset, 0 14px 40px -10px ${ACCENT}22`,
  },
  section: { marginBottom: 18 },
  featuredRow: { marginTop: 8, display: 'flex', gap: 10, flexWrap: 'wrap' },
  featuredCard: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 14px 8px 8px',
    background: 'var(--surface-muted)',
    border: `1px solid ${ACCENT}44`,
    borderRadius: 999,
  },
  featuredCardFour: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '6px 12px 6px 6px',
    background: 'transparent',
    border: '1px solid var(--rarity-4, #A88BE3)',
    borderRadius: 999,
  },
  wishOrb: {
    width: 38, height: 38,
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#0f0e13',
    boxShadow: `0 0 10px ${ACCENT}44, inset 0 0 10px rgba(255,255,255,0.3)`,
    animation: 'hsrPulse 3s ease-in-out infinite',
  },
  wishOrbFour: {
    width: 28, height: 28,
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(138, 111, 212, 0.3)',
    color: 'var(--rarity-4, #A88BE3)',
    border: '1px solid var(--rarity-4, #A88BE3)',
  },
  pityHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  pityBarOuter: { position: 'relative' },
  pityBarTrack: {
    position: 'relative',
    height: 14,
    background: 'rgba(126, 196, 245, 0.08)',
    border: `1px solid ${ACCENT}44`,
    borderRadius: 2,
    overflow: 'hidden',
  },
  pityBarFill: {
    height: '100%',
    transition: 'width 450ms cubic-bezier(0.2, 0.7, 0.2, 1)',
    position: 'relative',
  },
  pityBarGloss: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.25), transparent 50%, rgba(0,0,0,0.2))',
    pointerEvents: 'none',
  },
  softPityMark: {
    position: 'absolute',
    top: -3, bottom: -3,
    width: 1,
    background: '#f4d874',
    boxShadow: '0 0 6px #f4d874',
    zIndex: 2,
  },
  pityTicks: {
    display: 'flex', justifyContent: 'space-between',
    marginTop: 4,
    fontSize: 10, letterSpacing: 0.08, textTransform: 'uppercase',
    color: 'var(--text-subtle)',
  },
  carryRow: { marginTop: 10, display: 'flex' },
  carryPill: {
    fontSize: 10.5, letterSpacing: 0.08, textTransform: 'uppercase',
    padding: '4px 12px', border: '1px solid', borderRadius: 2,
  },
  counterRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 },
  buttonRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  btnCost: { fontSize: 10.5, opacity: 0.85, letterSpacing: 0.04, fontWeight: 500 },
  viewport: {
    position: 'relative',
    minHeight: 180,
    padding: 18,
    background: 'radial-gradient(ellipse 80% 70% at 50% 40%, rgba(126, 196, 245, 0.08), transparent 70%), var(--surface-muted)',
    border: `1px solid ${ACCENT}22`,
    borderRadius: 4,
    overflow: 'hidden',
  },
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: 8,
  },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: 140, textAlign: 'center',
  },
  warpTunnel: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(126, 196, 245, 0.25), transparent 70%)',
    pointerEvents: 'none',
    zIndex: 1,
    overflow: 'hidden',
  },
  warpCore: {
    position: 'absolute', top: '50%', left: '50%',
    width: 120, height: 120,
    background: `radial-gradient(circle, #fff 0%, ${ACCENT} 40%, transparent 70%)`,
    transform: 'translate(-50%, -50%)',
    animation: 'hsrCore 0.6s ease-out both',
    borderRadius: '50%',
    filter: 'blur(2px)',
  },
  stellarWrap: {
    position: 'absolute', inset: 0,
    zIndex: 10, pointerEvents: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  stellarBlast: {
    position: 'absolute', top: '50%', left: '50%',
    width: 200, height: 200,
    background: `radial-gradient(circle, ${ACCENT} 0%, rgba(255,255,255,0.8) 20%, transparent 70%)`,
    transform: 'translate(-50%, -50%)',
    animation: 'hsrStellarBurst 1.6s ease-out both',
    borderRadius: '50%',
    mixBlendMode: 'screen',
  },
  stellarLabel: {
    position: 'relative',
    fontSize: 32, fontWeight: 800,
    letterSpacing: 4,
    color: '#fff',
    textShadow: `0 0 20px ${ACCENT}, 0 0 40px ${ACCENT}, 0 2px 0 #000`,
    animation: 'hsrStellarLabel 1.6s ease-out both',
  },
};

const HSR_KEYFRAMES = `
@keyframes hsrSlide {
  from { opacity: 0; transform: translateX(32px) scale(0.97); }
  to { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes hsrDrift {
  from { background-position: 0 0, 0 0, 0 0, 0 0, 0 0, 0 0, 0 0, 0 0; }
  to   { background-position: -400px 200px, -200px 300px, 300px -200px, -500px 100px, 200px -300px, -100px 200px, 0 0, 0 0; }
}
@keyframes hsrStreak {
  0% { opacity: 0; transform: translate(-50%, -50%) scaleX(0.2); }
  40% { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, -50%) translateX(240px) scaleX(1.4); }
}
@keyframes hsrCore {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.4); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(2.2); }
}
@keyframes hsrStellarBurst {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
  30% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
  70% { opacity: 0.6; transform: translate(-50%, -50%) scale(2); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(3); }
}
@keyframes hsrStellarLabel {
  0% { opacity: 0; letter-spacing: -2px; transform: scale(0.7); }
  25% { opacity: 1; letter-spacing: 6px; transform: scale(1.08); }
  75% { opacity: 1; letter-spacing: 4px; transform: scale(1); }
  100% { opacity: 0; letter-spacing: 8px; transform: scale(1.1); }
}
@keyframes hsrParticle {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
  25% { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(0.2); }
}
@keyframes hsrPulse {
  0%, 100% { box-shadow: 0 0 10px ${ACCENT}44, inset 0 0 10px rgba(255,255,255,0.3); }
  50% { box-shadow: 0 0 20px ${ACCENT}88, inset 0 0 10px rgba(255,255,255,0.4); }
}
`;
