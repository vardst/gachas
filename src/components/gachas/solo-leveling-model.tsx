// HAND-CRAFTED: Solo Leveling: Arise wishlist mechanic.
// Dark arena, violet neon, magic-circle runes, shadow-monarch aesthetic.
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType, ALL_TYPES } from '../../data/types';
import { fiveStars, featuredFor, type Unit } from '../../data/roster';
import { useGachaEngine } from '../../lib/useGachaEngine';

const ACCENT = '#9B6CFF';
const ACCENT_HOT = '#C49BFF';
const ACCENT_DEEP = '#5A3D9E';
const TYPE_KEY = 'solo-leveling-model';
const MAX_WISHES = 3;

interface Props { slug: string }

export default function SoloLevelingModel({ slug }: Props) {
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

  const pityPct = Math.min(100, (state.pullsSinceFiveStar / state.hardPityAt) * 100);

  // Shadow extraction cinematic
  const [extracted, setExtracted] = useState<Unit | null>(null);
  useEffect(() => {
    if (eng.pullBurstKey === 0) return;
    const firstFive = lastResults.find(r => r.rarity === 5);
    if (firstFive && state.wishlist.includes(firstFive.unit.id)) {
      setExtracted(firstFive.unit);
      const t = setTimeout(() => setExtracted(null), 2200);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eng.pullBurstKey]);

  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    if (eng.pullBurstKey === 0) return;
    setGlitch(true);
    const t = setTimeout(() => setGlitch(false), 420);
    return () => clearTimeout(t);
  }, [eng.pullBurstKey]);

  const wishlistSet = new Set(state.wishlist);

  return (
    <div className="page" style={styles.page}>
      <style>{SL_KEYFRAMES}</style>
      <div aria-hidden style={styles.voidBg} />
      <div aria-hidden style={styles.runeCircle} />
      <div aria-hidden style={styles.runeCircleInner} />
      <Link to="/" className="back-link" style={{ color: ACCENT }}>← Back to dashboard</Link>

      <header style={styles.header}>
        <div style={styles.headerBadge}>SYSTEM · MONARCH AUTHORITY</div>
        <h1 style={{ ...styles.title, textShadow: `0 0 22px ${ACCENT}88, 0 0 4px #fff` }}>
          <span style={glitch ? styles.titleGlitch : undefined}>{type.title}</span>
        </h1>
        <p style={styles.subtitle}>Top-rarity pulls resolve to your chosen pool of 3. Dupe pain dissolves.</p>
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
            <VariantPicker variants={variants} currentSlug={combo.slug} onChange={(s) => navigate(`/play/${s}`)} />
          )}

          {/* WISHLIST — central experience */}
          <section style={styles.section}>
            <div style={styles.sectionHead}>
              <SectionLabel>Shadow Array</SectionLabel>
              <div style={styles.wishCount}>
                {state.wishlist.length} / {MAX_WISHES} summoned
              </div>
            </div>
            <div style={styles.wishHint}>
              Tap shadows to arm them. All 5★ pulls resolve from your array.
            </div>
            <div style={styles.shadowGrid}>
              {fiveStars.map(u => {
                const active = wishlistSet.has(u.id);
                const locked = !active && state.wishlist.length >= MAX_WISHES;
                return (
                  <button
                    key={u.id}
                    disabled={locked}
                    onClick={() => eng.setWishlist(u.id, !active, MAX_WISHES)}
                    style={{
                      ...styles.shadowCard,
                      ...(active ? styles.shadowCardActive : {}),
                      ...(locked ? styles.shadowCardLocked : {}),
                      ['--unit-color' as never]: u.color,
                    } as React.CSSProperties}
                    title={active ? 'Release shadow' : locked ? 'Array full — release one first' : 'Extract shadow'}
                  >
                    <div style={styles.shadowHalo} aria-hidden />
                    <div style={styles.shadowToken}>
                      <span style={{ ...styles.shadowCore, background: active ? u.color : '#1a1624' }} />
                      <span style={styles.shadowRing} aria-hidden />
                    </div>
                    <div style={styles.shadowName}>{u.name}</div>
                    <div style={styles.shadowRank}>★5 {active ? 'ARMED' : 'DORMANT'}</div>
                    {active && <div style={styles.shadowIndex}>{String(state.wishlist.indexOf(u.id) + 1).padStart(2, '0')}</div>}
                  </button>
                );
              })}
            </div>
            {state.wishlist.length === 0 && (
              <div style={styles.wishlistWarn}>
                <span style={styles.warnDot} />
                NO SHADOWS SUMMONED — 5★ will resolve to the standard pool.
              </div>
            )}
          </section>

          {/* Featured */}
          {featured.five.length > 0 && (
            <section style={styles.sectionTight}>
              <SectionLabel>Monarch Banner</SectionLabel>
              <div style={styles.featuredRow}>
                {featured.five.map(u => (
                  <span key={u.id} style={styles.featuredPill}>
                    <span style={{ ...styles.featuredOrb, background: u.color }} /> {u.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Pity + Spark */}
          <section style={styles.section}>
            <div style={styles.pityHead}>
              <SectionLabel>System Pity</SectionLabel>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                <b style={{ color: state.pullsSinceFiveStar >= state.softPityStart ? ACCENT_HOT : 'var(--text)' }}>
                  {state.pullsSinceFiveStar}
                </b>
                <span style={{ opacity: 0.5 }}> / {state.hardPityAt}</span>
              </div>
            </div>
            <div style={styles.pityBarTrack}>
              <div style={{ ...styles.pityBarFill, width: `${pityPct}%` }} />
              <div style={{ ...styles.pityMark, left: `${(state.softPityStart / state.hardPityAt) * 100}%` }} />
            </div>
            <div style={styles.sparkRow}>
              <div style={styles.sparkLabel}>Spark · {state.sparkProgress} / {state.sparkThreshold}</div>
              <div style={styles.sparkBarTrack}>
                <div style={{ ...styles.sparkBarFill, width: `${Math.min(100, (state.sparkProgress / state.sparkThreshold) * 100)}%` }} />
              </div>
            </div>
          </section>

          {/* Counters */}
          <div style={styles.counterRow}>
            <Counter label="Mana" value={state.freeCurrency.toLocaleString()} hot />
            {combo.currency.id === 'dual' && <Counter label="Paid Crystals" value={state.paidCurrency} />}
            {combo.currency.id === 'tickets' && <Counter label="Tickets" value={state.tickets} />}
            <Counter label="Summons" value={state.totalPulls} />
            <Counter label="5★" value={state.fiveStarCount} />
            <Counter label="Wishes hit" value={state.featuredObtained} />
          </div>

          {/* Buttons */}
          <div style={styles.buttonRow}>
            <MonarchButton disabled={!eng.canPull1} onClick={eng.pull1}>
              Summon ×1 <span style={styles.btnCost}>{eng.pullCost.toLocaleString()}</span>
            </MonarchButton>
            <MonarchButton primary disabled={!eng.canPull10} onClick={eng.pull10}>
              Arise ×10 <span style={styles.btnCost}>{(eng.pullCost * 10).toLocaleString()}</span>
            </MonarchButton>
            <MonarchButton disabled={!eng.canSpark} onClick={eng.spark}>
              Spark Extract
            </MonarchButton>
            <MonarchButton ghost onClick={() => eng.addFunds()}>+ Mana</MonarchButton>
            <MonarchButton ghost onClick={eng.reset}>Reset</MonarchButton>
          </div>

          {/* Results viewport */}
          <div style={styles.viewport}>
            {lastResults.length === 0 ? (
              <div style={styles.empty}>
                <div style={{ fontSize: 11, letterSpacing: 0.2, textTransform: 'uppercase', color: ACCENT, marginBottom: 6 }}>
                  Gate dormant
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Arm your shadows, then Summon. Each 5★ resolves from your array of {state.wishlist.length || 3}.
                </div>
              </div>
            ) : (
              <div style={styles.resultsGrid} key={eng.pullBurstKey}>
                {lastResults.map((r, i) => {
                  const isWish = r.rarity === 5 && state.wishlist.includes(r.unit.id);
                  return (
                    <div key={i} style={{
                      ...styles.resultCard,
                      ['--unit-color' as never]: r.unit.color,
                      animation: `slRise 0.55s cubic-bezier(0.2,0.8,0.2,1) ${i * 55}ms both`,
                      borderColor: r.rarity === 5 ? ACCENT : r.rarity === 4 ? 'var(--rarity-4)' : 'var(--border)',
                      boxShadow: r.rarity === 5
                        ? `0 0 0 1px ${ACCENT}, 0 0 28px -4px ${ACCENT}`
                        : r.rarity === 4 ? '0 0 0 1px var(--rarity-4)' : 'none',
                    } as React.CSSProperties}>
                      <div style={styles.resultBg} />
                      <div style={styles.resultRarity}>★{r.rarity}</div>
                      {isWish && <div style={styles.resultWishBadge}>EXTRACTED</div>}
                      <div style={styles.resultToken} />
                      <div style={styles.resultName}>{r.unit.name}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <aside className="player-meta">
          <div className="meta-card" style={{ borderColor: `${ACCENT}33` }}>
            <h3 style={{ color: ACCENT }}>Monarch Notes</h3>
            <div className="detail-list">
              <div className="kv"><span>Distribution</span><span>{combo.dist.name}</span></div>
              <div className="kv"><span>Banner</span><span>{combo.banner.name}</span></div>
              <div className="kv"><span>Guarantee</span><span>{combo.guarantee.name}</span></div>
              <div className="kv"><span>Currency</span><span>{combo.currency.name}</span></div>
              <div className="kv"><span>Tag</span><span className={`tag ${combo.tag.cls}`}>{combo.tag.text}</span></div>
            </div>
            <div style={{ marginTop: 12, padding: 10, border: `1px dashed ${ACCENT}55`, borderRadius: 4, fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {type.flavor}
            </div>
            {combo.example && (
              <div style={{ marginTop: 10, padding: 8, background: `${ACCENT}11`, borderRadius: 4, fontSize: 11.5, color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.08, color: ACCENT, marginBottom: 2 }}>Real-world analogue</div>
                {combo.example}
              </div>
            )}
          </div>

          <div className="meta-card" style={{ borderColor: `${ACCENT}33` }}>
            <h3 style={{ color: ACCENT }}>Summon Log · {state.history.length}</h3>
            {state.history.length === 0 ? (
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-subtle)' }}>The gate has not opened.</p>
            ) : (
              <div className="history-log">
                {state.history.slice(-30).reverse().map((h, i) => {
                  const wish = h.rarity === 5 && state.wishlist.includes(h.unit.id);
                  return (
                    <div key={state.history.length - i} className={`entry r${h.rarity}`}>
                      #{state.history.length - i} · ★{h.rarity} {h.unit.name}
                      {wish && ' · EXTRACT'}
                      {h.hardPity && ' · hard'}{h.softPity && ' · soft'}
                      {h.sparkRedeemed && ' · spark'}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>

      {extracted && <ExtractionCinematic unit={extracted} />}
    </div>
  );
}

function ExtractionCinematic({ unit }: { unit: Unit }) {
  return (
    <div style={styles.cinematicWrap} aria-hidden>
      <div style={styles.cinematicScrim} />
      <div style={{ ...styles.cinematicPillar, background: `linear-gradient(to top, transparent, ${ACCENT}ff 20%, #fff 50%, ${ACCENT}ff 80%, transparent)` }} />
      <div style={{ ...styles.cinematicPillar, ...styles.cinematicPillarWide, background: `linear-gradient(to top, transparent, ${unit.color}88 40%, ${ACCENT}88 100%)` }} />
      <div style={styles.cinematicFloor} />
      <div style={styles.cinematicSigil}>
        <div style={styles.cinematicSigilRing} />
        <div style={{ ...styles.cinematicSigilRing, ...styles.cinematicSigilRingTwo }} />
      </div>
      <div style={styles.cinematicText}>
        <div style={styles.cinematicKicker}>SHADOW EXTRACTED</div>
        <div style={{ ...styles.cinematicName, color: '#fff', textShadow: `0 0 24px ${ACCENT}, 0 0 48px ${unit.color}` }}>
          {unit.name}
        </div>
        <div style={styles.cinematicSub}>ARISE</div>
      </div>
    </div>
  );
}

function Chip({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span style={{
      padding: '3px 10px',
      fontSize: 10.5,
      letterSpacing: 0.18,
      textTransform: 'uppercase',
      border: `1px solid ${accent ? ACCENT : `${ACCENT}44`}`,
      borderRadius: 2,
      color: accent ? ACCENT_HOT : 'var(--text-muted)',
      background: accent ? `${ACCENT}18` : 'transparent',
    }}>{children}</span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10.5,
      letterSpacing: 0.22,
      textTransform: 'uppercase',
      color: ACCENT,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontWeight: 600,
    }}>
      <span style={{ width: 8, height: 8, background: ACCENT, boxShadow: `0 0 8px ${ACCENT}`, transform: 'rotate(45deg)' }} />
      {children}
    </div>
  );
}

function Counter({ label, value, hot }: { label: string; value: string | number; hot?: boolean }) {
  return (
    <div style={{
      flex: 1,
      minWidth: 92,
      padding: '8px 12px',
      background: hot ? `linear-gradient(135deg, ${ACCENT}20, transparent)` : 'rgba(30, 22, 48, 0.6)',
      border: `1px solid ${hot ? `${ACCENT}66` : `${ACCENT}22`}`,
      borderRadius: 3,
    }}>
      <div style={{ fontSize: 9.5, letterSpacing: 0.16, textTransform: 'uppercase', color: hot ? ACCENT_HOT : 'var(--text-subtle)' }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}

function MonarchButton({
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
        letterSpacing: 0.12,
        textTransform: 'uppercase',
        fontWeight: 600,
        background: primary
          ? `linear-gradient(180deg, ${ACCENT} 0%, ${ACCENT_DEEP} 100%)`
          : ghost ? 'transparent' : 'rgba(30, 22, 48, 0.8)',
        color: primary ? '#0f0a1c' : ghost ? 'var(--text-muted)' : '#fff',
        border: `1px solid ${primary ? ACCENT_HOT : ghost ? `${ACCENT}33` : `${ACCENT}55`}`,
        borderRadius: 2,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: primary ? `0 0 18px ${ACCENT}88, inset 0 0 12px ${ACCENT}33` : 'none',
        transition: 'transform 120ms, box-shadow 200ms, filter 200ms',
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
  const currencyOptions = variants.filter(v => v.banner.id === current.banner.id && v.guarantee.id === current.guarantee.id);
  if (currencyOptions.length <= 1) return null;
  return (
    <div style={{ marginBottom: 14, padding: 10, background: 'rgba(30, 22, 48, 0.6)', border: `1px solid ${ACCENT}33`, borderRadius: 3 }}>
      <div style={{ fontSize: 10, letterSpacing: 0.16, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Currency variant</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {currencyOptions.map(v => {
          const active = v.slug === currentSlug;
          return (
            <button key={v.slug} onClick={() => onChange(v.slug)} style={{
              padding: '4px 12px',
              fontSize: 11.5,
              background: active ? ACCENT : 'transparent',
              color: active ? '#0f0a1c' : 'var(--text)',
              border: `1px solid ${active ? ACCENT : `${ACCENT}33`}`,
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

// ─── styles ─────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: { position: 'relative', overflow: 'visible' },
  voidBg: {
    position: 'fixed', inset: 0,
    background: [
      `radial-gradient(ellipse 60% 45% at 50% 40%, ${ACCENT}22, transparent 70%)`,
      `radial-gradient(ellipse 30% 30% at 80% 80%, ${ACCENT}11, transparent 70%)`,
      `linear-gradient(180deg, #0a0612 0%, #05030a 100%)`,
    ].join(','),
    zIndex: 0,
    pointerEvents: 'none',
  },
  runeCircle: {
    position: 'fixed', top: -200, left: '50%', transform: 'translateX(-50%)',
    width: 900, height: 900,
    borderRadius: '50%',
    border: `1px solid ${ACCENT}22`,
    boxShadow: `inset 0 0 80px ${ACCENT}11`,
    animation: 'slSpin 80s linear infinite',
    zIndex: 0,
    pointerEvents: 'none',
  },
  runeCircleInner: {
    position: 'fixed', top: -100, left: '50%', transform: 'translateX(-50%)',
    width: 700, height: 700,
    borderRadius: '50%',
    border: `1px dashed ${ACCENT}33`,
    animation: 'slSpinRev 60s linear infinite',
    zIndex: 0,
    pointerEvents: 'none',
  },
  header: {
    position: 'relative', padding: '26px 28px 20px', marginBottom: 18,
    border: `1px solid ${ACCENT}33`,
    borderRadius: 4,
    background: 'linear-gradient(135deg, rgba(155, 108, 255, 0.08), transparent 60%)',
    backdropFilter: 'blur(4px)',
  },
  headerBadge: {
    display: 'inline-block',
    fontSize: 10, letterSpacing: 0.28, textTransform: 'uppercase',
    color: ACCENT_HOT,
    padding: '2px 8px',
    border: `1px solid ${ACCENT}66`,
    marginBottom: 8,
    background: `${ACCENT}14`,
  },
  title: { margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: -0.5, color: '#fff', fontFamily: 'inherit' },
  titleGlitch: {
    animation: 'slGlitch 0.42s steps(4, end)',
    display: 'inline-block',
  },
  subtitle: { margin: '6px 0 12px', color: 'var(--text-muted)', fontSize: 13 },
  chipRow: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  mainPanel: {
    position: 'relative',
    padding: 22,
    background: 'rgba(10, 6, 18, 0.8)',
    backdropFilter: 'blur(8px)',
    border: `1px solid ${ACCENT}22`,
    borderRadius: 4,
    boxShadow: `0 0 0 1px ${ACCENT}11 inset, 0 18px 60px -20px ${ACCENT}44`,
  },
  section: { marginBottom: 20 },
  sectionTight: { marginBottom: 14 },
  sectionHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  wishCount: {
    fontSize: 10.5, letterSpacing: 0.16, textTransform: 'uppercase',
    color: ACCENT_HOT, fontVariantNumeric: 'tabular-nums',
  },
  wishHint: { fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 10 },
  shadowGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: 10,
  },
  shadowCard: {
    position: 'relative',
    padding: '14px 10px 10px',
    background: 'linear-gradient(180deg, #120a22 0%, #07040f 100%)',
    border: `1px solid ${ACCENT}22`,
    borderRadius: 4,
    cursor: 'pointer',
    color: 'var(--text)',
    textAlign: 'center',
    overflow: 'hidden',
    transition: 'transform 200ms cubic-bezier(0.2,0.8,0.2,1), border-color 200ms, box-shadow 300ms',
  },
  shadowCardActive: {
    borderColor: ACCENT,
    boxShadow: `0 0 0 1px ${ACCENT}, 0 0 22px -4px ${ACCENT}, inset 0 0 20px ${ACCENT}22`,
    transform: 'translateY(-2px)',
  },
  shadowCardLocked: {
    opacity: 0.35,
    cursor: 'not-allowed',
  },
  shadowHalo: {
    position: 'absolute', inset: -10,
    background: `radial-gradient(circle at 50% 40%, ${ACCENT}44 0%, transparent 60%)`,
    opacity: 0, pointerEvents: 'none',
    animation: 'slHaloPulse 3s ease-in-out infinite',
  },
  shadowToken: {
    position: 'relative',
    width: 54, height: 54, margin: '4px auto 8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  shadowCore: {
    width: 28, height: 28, borderRadius: '50%',
    boxShadow: `0 0 14px ${ACCENT}88, inset 0 0 8px rgba(255,255,255,0.2)`,
    transition: 'background 300ms',
  },
  shadowRing: {
    position: 'absolute', inset: 0,
    border: `1px solid ${ACCENT}44`,
    borderRadius: '50%',
    animation: 'slSpin 12s linear infinite',
  },
  shadowName: { fontSize: 12.5, fontWeight: 600, color: '#fff', letterSpacing: 0.04 },
  shadowRank: { fontSize: 9.5, letterSpacing: 0.14, textTransform: 'uppercase', color: ACCENT_HOT, marginTop: 2 },
  shadowIndex: {
    position: 'absolute', top: 6, right: 8,
    fontSize: 9.5, fontWeight: 700, color: ACCENT, fontVariantNumeric: 'tabular-nums',
    background: '#0a0612', padding: '1px 5px', borderRadius: 2, border: `1px solid ${ACCENT}55`,
  },
  wishlistWarn: {
    marginTop: 10, padding: '8px 12px',
    background: 'rgba(244, 180, 64, 0.08)',
    border: '1px solid rgba(244, 180, 64, 0.4)',
    borderRadius: 3,
    fontSize: 11, letterSpacing: 0.1, textTransform: 'uppercase',
    color: '#f4b440',
    display: 'flex', alignItems: 'center', gap: 8,
  },
  warnDot: { width: 8, height: 8, borderRadius: '50%', background: '#f4b440', boxShadow: '0 0 8px #f4b440' },
  featuredRow: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 },
  featuredPill: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '5px 12px 5px 6px',
    background: 'rgba(155,108,255,0.12)',
    border: `1px solid ${ACCENT}66`,
    borderRadius: 999,
    fontSize: 12, color: '#fff',
  },
  featuredOrb: { width: 14, height: 14, borderRadius: '50%', boxShadow: `0 0 8px ${ACCENT}` },
  pityHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  pityBarTrack: {
    position: 'relative',
    height: 8,
    background: 'rgba(155,108,255,0.1)',
    border: `1px solid ${ACCENT}33`,
    borderRadius: 2,
    overflow: 'hidden',
  },
  pityBarFill: {
    height: '100%',
    background: `linear-gradient(90deg, ${ACCENT_DEEP}, ${ACCENT}, ${ACCENT_HOT})`,
    boxShadow: `0 0 8px ${ACCENT}`,
    transition: 'width 400ms cubic-bezier(0.2,0.7,0.2,1)',
  },
  pityMark: {
    position: 'absolute', top: -2, bottom: -2, width: 1,
    background: ACCENT_HOT, boxShadow: `0 0 4px ${ACCENT_HOT}`,
  },
  sparkRow: { marginTop: 10 },
  sparkLabel: {
    fontSize: 10.5, letterSpacing: 0.16, textTransform: 'uppercase',
    color: 'var(--text-muted)', marginBottom: 4,
  },
  sparkBarTrack: {
    height: 4, background: 'rgba(155,108,255,0.08)',
    border: `1px solid ${ACCENT}22`, borderRadius: 2, overflow: 'hidden',
  },
  sparkBarFill: {
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${ACCENT_HOT})`,
    transition: 'width 400ms',
  },
  counterRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 },
  buttonRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  btnCost: { fontSize: 10.5, opacity: 0.8, letterSpacing: 0.04, fontWeight: 500 },
  viewport: {
    position: 'relative',
    minHeight: 200,
    padding: 18,
    background: `radial-gradient(ellipse 70% 60% at 50% 40%, ${ACCENT}14, transparent 70%), rgba(10, 6, 18, 0.6)`,
    border: `1px solid ${ACCENT}22`,
    borderRadius: 4,
    overflow: 'hidden',
  },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: 160, textAlign: 'center',
  },
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(128px, 1fr))',
    gap: 8,
  },
  resultCard: {
    position: 'relative',
    padding: '12px 10px',
    borderRadius: 3,
    background: 'linear-gradient(180deg, rgba(20,14,34,0.95), rgba(6,3,12,0.95))',
    border: '1px solid',
    minHeight: 110,
    overflow: 'hidden',
  },
  resultBg: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse 80% 60% at 50% 40%, var(--unit-color), transparent 70%)',
    opacity: 0.25, pointerEvents: 'none',
  },
  resultToken: {
    position: 'relative',
    width: 36, height: 36, margin: '6px auto 6px',
    borderRadius: '50%',
    background: 'var(--unit-color)',
    boxShadow: `0 0 14px var(--unit-color), inset 0 0 8px rgba(255,255,255,0.3)`,
  },
  resultRarity: {
    position: 'relative',
    fontSize: 10, letterSpacing: 0.14, textTransform: 'uppercase',
    color: ACCENT_HOT, textAlign: 'center',
  },
  resultName: {
    position: 'relative',
    textAlign: 'center', fontSize: 12.5, fontWeight: 600, color: '#fff',
  },
  resultWishBadge: {
    position: 'absolute', top: 4, right: 4,
    fontSize: 8.5, letterSpacing: 0.14, textTransform: 'uppercase',
    background: ACCENT, color: '#0f0a1c',
    padding: '1px 5px', borderRadius: 2, fontWeight: 700,
  },
  cinematicWrap: {
    position: 'fixed', inset: 0, zIndex: 100, pointerEvents: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  cinematicScrim: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(10,6,18,0.6), rgba(0,0,0,0.95) 80%)',
    animation: 'slFadeIn 0.25s ease-out both',
  },
  cinematicPillar: {
    position: 'absolute', top: 0, bottom: 0, left: '50%',
    width: 6,
    transform: 'translateX(-50%)',
    filter: 'blur(2px)',
    animation: 'slPillar 2.2s cubic-bezier(0.2,0.9,0.2,1) both',
  },
  cinematicPillarWide: {
    width: 180,
    filter: 'blur(40px)',
    opacity: 0.8,
  },
  cinematicFloor: {
    position: 'absolute', bottom: '18%', left: '50%',
    transform: 'translateX(-50%)',
    width: 360, height: 10,
    background: `radial-gradient(ellipse, ${ACCENT} 0%, transparent 70%)`,
    animation: 'slFloor 2.2s ease-out both',
  },
  cinematicSigil: {
    position: 'absolute', bottom: '18%', left: '50%',
    transform: 'translate(-50%, 50%)',
    width: 280, height: 280,
    animation: 'slSigil 2.2s ease-out both',
  },
  cinematicSigilRing: {
    position: 'absolute', inset: 0,
    border: `2px solid ${ACCENT}`,
    borderRadius: '50%',
    boxShadow: `0 0 30px ${ACCENT}88, inset 0 0 30px ${ACCENT}55`,
    animation: 'slSpin 8s linear infinite',
  },
  cinematicSigilRingTwo: {
    inset: 20,
    borderStyle: 'dashed',
    borderColor: `${ACCENT_HOT}99`,
    animation: 'slSpinRev 6s linear infinite',
  },
  cinematicText: {
    position: 'relative',
    textAlign: 'center',
    animation: 'slText 2.2s cubic-bezier(0.2,0.8,0.2,1) both',
  },
  cinematicKicker: {
    fontSize: 13, letterSpacing: 0.4, textTransform: 'uppercase',
    color: ACCENT_HOT, marginBottom: 10,
    textShadow: `0 0 12px ${ACCENT}`,
  },
  cinematicName: {
    fontSize: 64, fontWeight: 900, letterSpacing: -1,
    lineHeight: 1,
  },
  cinematicSub: {
    marginTop: 12,
    fontSize: 14, letterSpacing: 0.6, textTransform: 'uppercase',
    color: '#fff', fontWeight: 700,
    textShadow: `0 0 10px ${ACCENT}`,
  },
};

const SL_KEYFRAMES = `
@keyframes slSpin { to { transform: translateX(-50%) rotate(360deg); } }
@keyframes slSpinRev { to { transform: translateX(-50%) rotate(-360deg); } }
@keyframes slHaloPulse {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 0.6; }
}
@keyframes slGlitch {
  0% { transform: translate(0); text-shadow: 0 0 22px ${ACCENT}88; }
  20% { transform: translate(-2px, 1px); text-shadow: 2px 0 0 ${ACCENT_HOT}, -2px 0 0 #ff4488; }
  40% { transform: translate(2px, -1px); text-shadow: -2px 0 0 ${ACCENT_HOT}, 2px 0 0 #ff4488; }
  60% { transform: translate(-1px, 0); text-shadow: 0 0 22px ${ACCENT}88; }
  100% { transform: translate(0); text-shadow: 0 0 22px ${ACCENT}88; }
}
@keyframes slRise {
  from { opacity: 0; transform: translateY(16px) scale(0.96); filter: blur(4px); }
  to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}
@keyframes slFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slPillar {
  0% { opacity: 0; transform: translateX(-50%) scaleY(0); }
  25% { opacity: 1; transform: translateX(-50%) scaleY(1); }
  85% { opacity: 1; }
  100% { opacity: 0; transform: translateX(-50%) scaleY(1); }
}
@keyframes slFloor {
  0% { opacity: 0; transform: translateX(-50%) scale(0.2); }
  30% { opacity: 1; transform: translateX(-50%) scale(1); }
  100% { opacity: 0; transform: translateX(-50%) scale(1.6); }
}
@keyframes slSigil {
  0% { opacity: 0; transform: translate(-50%, 50%) scale(0.3) rotate(-20deg); }
  35% { opacity: 1; transform: translate(-50%, 50%) scale(1) rotate(0deg); }
  85% { opacity: 0.9; }
  100% { opacity: 0; transform: translate(-50%, 50%) scale(1.1) rotate(10deg); }
}
@keyframes slText {
  0% { opacity: 0; transform: translateY(30px) scale(0.9); letter-spacing: -4px; }
  30% { opacity: 1; transform: translateY(0) scale(1.05); letter-spacing: 0; }
  70% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-10px) scale(1); }
}
`;
