// HAND-CRAFTED: Transparent Reveal (preview gacha).
// Calm green, minimalist compliance-style UI. Banking/regulatory vibe.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType, ALL_TYPES } from '../../data/types';
import { featuredFor, type Unit } from '../../data/roster';
import { useGachaEngine } from '../../lib/useGachaEngine';

const ACCENT = '#4FC98D';
const ACCENT_DEEP = '#2F8F63';
const INK = '#1C2A24';
const TYPE_KEY = 'transparent-reveal';

interface Props { slug: string }

export default function TransparentReveal({ slug }: Props) {
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

  // Estimate "next 5★ in X pulls" — min (soft start) to (hard pity remaining)
  const pullsToSoft = Math.max(0, state.softPityStart - state.pullsSinceFiveStar);
  const pullsToHard = Math.max(0, state.hardPityAt - state.pullsSinceFiveStar);

  // Preview queue animation — track what just left
  const [outgoing, setOutgoing] = useState<Unit | null>(null);
  const prevQueue = useRef<Unit[]>([]);
  useEffect(() => {
    if (eng.pullBurstKey === 0) { prevQueue.current = state.previewQueue.slice(); return; }
    const prev = prevQueue.current;
    if (prev.length > 0 && state.previewQueue.length > 0) {
      if (prev[0] !== state.previewQueue[0]) {
        setOutgoing(prev[0]);
        const t = setTimeout(() => setOutgoing(null), 520);
        prevQueue.current = state.previewQueue.slice();
        return () => clearTimeout(t);
      }
    }
    prevQueue.current = state.previewQueue.slice();
  }, [eng.pullBurstKey, state.previewQueue]);

  const hasFive = lastResults.some(r => r.rarity === 5);
  const [checkmark, setCheckmark] = useState(false);
  useEffect(() => {
    if (!hasFive) return;
    setCheckmark(true);
    const t = setTimeout(() => setCheckmark(false), 1500);
    return () => clearTimeout(t);
  }, [hasFive, eng.pullBurstKey]);

  return (
    <div className="page" style={styles.page}>
      <style>{TR_KEYFRAMES}</style>

      <Link to="/" className="back-link" style={{ color: ACCENT_DEEP }}>← Back to dashboard</Link>

      <header style={styles.header}>
        <div style={styles.certRow}>
          <span style={styles.certSeal}>
            <CertCheck />
          </span>
          <span style={styles.certText}>
            Certified disclosure · v2.1 · ISO-26000 compatible
          </span>
        </div>
        <h1 style={styles.title}>{type.title}</h1>
        <p style={styles.subtitle}>
          Every pull is revealed before you commit. No surprise, no regret.
          Monetization drops 20–40%, trust is priceless.
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
            <VariantPicker variants={variants} currentSlug={combo.slug} onChange={(s) => navigate(`/play/${s}`)} />
          )}

          {/* PREVIEW QUEUE — the star */}
          <section style={styles.section}>
            <div style={styles.labelRow}>
              <div style={styles.label}>Next 3 pulls</div>
              <div style={styles.labelMeta}>guaranteed · shown before commit</div>
            </div>
            <div style={styles.queueStage}>
              {outgoing && (
                <div style={{ ...styles.outgoingCard, ['--unit-color' as never]: outgoing.color } as React.CSSProperties}>
                  <PreviewCard unit={outgoing} index={0} leaving />
                </div>
              )}
              <div style={styles.queueRow}>
                {state.previewQueue.slice(0, 3).map((u, i) => (
                  <div
                    key={`${eng.pullBurstKey}-${i}-${u.id}`}
                    style={{
                      ...styles.queueSlot,
                      animation: `trSlide 0.45s cubic-bezier(0.2,0.8,0.2,1) ${i * 70}ms both`,
                    }}
                  >
                    <PreviewCard unit={u} index={i} />
                  </div>
                ))}
                {state.previewQueue.length === 0 && (
                  <div style={styles.queueEmpty}>Loading disclosure…</div>
                )}
              </div>
            </div>
          </section>

          {/* Transparency report */}
          <section style={styles.section}>
            <div style={styles.label}>Transparency report</div>
            <div style={styles.reportGrid}>
              <ReportRow
                label="Your next 5★"
                value={pullsToSoft > 0 ? `within ~${pullsToSoft}–${pullsToHard} pulls` : `within ~${pullsToHard} pulls`}
                hint="based on soft & hard pity"
              />
              <ReportRow
                label="Pity progress"
                value={`${state.pullsSinceFiveStar} / ${state.hardPityAt}`}
                hint={`soft ramp from ${state.softPityStart}`}
              />
              <ReportRow
                label="Published rate"
                value="0.60% · 5.10% · 94.30%"
                hint="no hidden multipliers"
              />
            </div>
            <div style={styles.pityMeter}>
              <div style={styles.pityMeterTrack}>
                <div style={{ ...styles.pityMeterFill, width: `${pityPct}%` }} />
                <div style={{ ...styles.pityMeterMark, left: `${(state.softPityStart / state.hardPityAt) * 100}%` }} />
              </div>
              <div style={styles.pityTicks}>
                <span>0</span>
                <span>soft · {state.softPityStart}</span>
                <span>hard · {state.hardPityAt}</span>
              </div>
            </div>
            {['spark_only', 'spark_pity'].includes(combo.guarantee.id) && (
              <div style={styles.sparkStripe}>
                <span style={styles.sparkStripeLabel}>Spark progress</span>
                <div style={styles.sparkStripeBar}>
                  <div style={{ ...styles.sparkStripeFill, width: `${Math.min(100, (state.sparkProgress / state.sparkThreshold) * 100)}%` }} />
                </div>
                <span style={styles.sparkStripeCount}>{state.sparkProgress}/{state.sparkThreshold}</span>
              </div>
            )}
          </section>

          {/* Featured */}
          {featured.five.length > 0 && (
            <section style={styles.section}>
              <div style={styles.label}>Featured on banner</div>
              <div style={styles.featuredRow}>
                {featured.five.map(u => (
                  <span key={u.id} style={styles.featuredPill}>
                    <span style={{ ...styles.featuredDot, background: u.color }} />
                    <span style={styles.featuredName}>{u.name}</span>
                    <span style={styles.featuredRank}>5★</span>
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Counters — clean and sober */}
          <div style={styles.counterRow}>
            <StatCard label="Balance" value={state.freeCurrency.toLocaleString()} emphasis />
            {combo.currency.id === 'dual' && <StatCard label="Paid" value={state.paidCurrency} />}
            <StatCard label="Pulls" value={state.totalPulls} />
            <StatCard label="5★" value={state.fiveStarCount} />
            <StatCard label="Featured" value={state.featuredObtained} />
          </div>

          {/* Actions */}
          <div style={styles.buttonRow}>
            <TRButton primary disabled={!eng.canPull1} onClick={eng.pull1}>
              Commit next pull <span style={styles.btnSub}>{eng.pullCost.toLocaleString()}</span>
            </TRButton>
            <TRButton disabled={!eng.canPull10} onClick={eng.pull10}>
              Commit ×10 <span style={styles.btnSub}>{(eng.pullCost * 10).toLocaleString()}</span>
            </TRButton>
            {['spark_only', 'spark_pity'].includes(combo.guarantee.id) && (
              <TRButton disabled={!eng.canSpark} onClick={eng.spark}>Redeem spark</TRButton>
            )}
            {['shards', 'shards_pity'].includes(combo.guarantee.id) && (
              <TRButton disabled={!eng.canShards} onClick={eng.shards}>Craft with shards</TRButton>
            )}
            <TRButton ghost onClick={() => eng.addFunds()}>+ Funds</TRButton>
            <TRButton ghost onClick={eng.reset}>Reset</TRButton>
          </div>

          {/* Result drop */}
          <section style={styles.resultSection}>
            <div style={styles.label}>Latest commit</div>
            <div style={styles.resultFrame}>
              {checkmark && (
                <div style={styles.checkOverlay}>
                  <div style={styles.checkRing}>
                    <CheckIcon />
                  </div>
                  <div style={styles.checkLabel}>5★ confirmed</div>
                </div>
              )}
              {lastResults.length === 0 ? (
                <div style={styles.empty}>
                  <div style={styles.emptyHeader}>Awaiting consent</div>
                  <div style={styles.emptyBody}>
                    Review the next 3 pulls above. When ready, press Commit. What you see is what you get.
                  </div>
                </div>
              ) : (
                <div style={styles.resultsRow} key={eng.pullBurstKey}>
                  {lastResults.map((r, i) => (
                    <div
                      key={i}
                      style={{
                        ...styles.resultCard,
                        ['--unit-color' as never]: r.unit.color,
                        borderColor: r.rarity === 5 ? ACCENT : r.rarity === 4 ? '#9c8dd6' : '#cfd9d4',
                        animation: `trDrop 0.4s cubic-bezier(0.2,0.8,0.2,1) ${i * 45}ms both`,
                      } as React.CSSProperties}
                    >
                      <div style={styles.resultDot} />
                      <div style={styles.resultRank}>★{r.rarity}</div>
                      <div style={styles.resultName}>{r.unit.name}</div>
                      {r.preview && <div style={styles.resultBadge}>as previewed</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="player-meta">
          <div className="meta-card" style={{ borderColor: '#d8e4de', background: '#fbfdfc' }}>
            <h3 style={{ color: ACCENT_DEEP }}>Disclosure sheet</h3>
            <div className="detail-list">
              <div className="kv"><span>Distribution</span><span>{combo.dist.name}</span></div>
              <div className="kv"><span>Banner</span><span>{combo.banner.name}</span></div>
              <div className="kv"><span>Guarantee</span><span>{combo.guarantee.name}</span></div>
              <div className="kv"><span>Currency</span><span>{combo.currency.name}</span></div>
              <div className="kv"><span>Tag</span><span className={`tag ${combo.tag.cls}`}>{combo.tag.text}</span></div>
            </div>
            <div style={styles.asideBlock}>
              <div style={styles.asideLabel}>Design note</div>
              <div style={styles.asideBody}>{type.flavor}</div>
            </div>
            {combo.example && (
              <div style={styles.exampleBlock}>
                <div style={styles.asideLabel}>Real-world analogue</div>
                <div>{combo.example}</div>
              </div>
            )}
          </div>

          <div className="meta-card" style={{ borderColor: '#d8e4de', background: '#fbfdfc' }}>
            <h3 style={{ color: ACCENT_DEEP }}>Audit log · {state.history.length}</h3>
            {state.history.length === 0 ? (
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-subtle)' }}>No commits recorded.</p>
            ) : (
              <div className="history-log">
                {state.history.slice(-30).reverse().map((h, i) => (
                  <div key={state.history.length - i} className={`entry r${h.rarity}`}>
                    #{state.history.length - i} · ★{h.rarity} {h.unit.name}
                    {h.preview && ' · prev'}
                    {h.hardPity && ' · hard'}{h.softPity && ' · soft'}
                    {h.sparkRedeemed && ' · spark'}
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

function PreviewCard({ unit, index, leaving }: { unit: Unit; index: number; leaving?: boolean }) {
  return (
    <div style={{
      ...styles.previewCard,
      background: leaving ? `${unit.color}26` : '#fff',
      borderColor: unit.rarity === 5 ? ACCENT : unit.rarity === 4 ? '#c8bcf2' : '#e4ece8',
      opacity: leaving ? 0.7 : 1,
    }}>
      <div style={styles.previewIndex}>{String(index + 1).padStart(2, '0')}</div>
      <div style={{ ...styles.previewToken, background: unit.color, boxShadow: `0 0 0 2px #fff, 0 0 0 3px ${unit.color}55` }} />
      <div style={styles.previewRank}>★{unit.rarity}</div>
      <div style={styles.previewName}>{unit.name}</div>
      {unit.rarity === 5 && <div style={styles.previewTag}>guaranteed 5★</div>}
    </div>
  );
}

function ReportRow({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div style={styles.reportRow}>
      <div style={styles.reportLabel}>{label}</div>
      <div style={styles.reportValue}>{value}</div>
      <div style={styles.reportHint}>{hint}</div>
    </div>
  );
}

function Chip({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span style={{
      padding: '3px 10px',
      fontSize: 10.5,
      letterSpacing: 0.08,
      textTransform: 'uppercase',
      border: `1px solid ${accent ? ACCENT : '#c4d4cd'}`,
      borderRadius: 999,
      color: accent ? ACCENT_DEEP : '#5d6d66',
      background: accent ? '#e7f6ee' : '#fff',
      fontWeight: 500,
    }}>{children}</span>
  );
}

function StatCard({ label, value, emphasis }: { label: string; value: string | number; emphasis?: boolean }) {
  return (
    <div style={{
      flex: 1,
      minWidth: 96,
      padding: '10px 14px',
      background: emphasis ? `linear-gradient(135deg, ${ACCENT}18, transparent)` : '#fff',
      border: `1px solid ${emphasis ? `${ACCENT}55` : '#d8e4de'}`,
      borderRadius: 10,
    }}>
      <div style={{ fontSize: 10.5, letterSpacing: 0.02, color: '#6d7d76', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: emphasis ? ACCENT_DEEP : INK, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>{value}</div>
    </div>
  );
}

function TRButton({ children, onClick, disabled, primary, ghost }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; primary?: boolean; ghost?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: ghost ? '9px 14px' : '11px 20px',
      fontSize: 13,
      letterSpacing: 0.02,
      fontWeight: 600,
      background: primary ? ACCENT : ghost ? 'transparent' : '#fff',
      color: primary ? '#0a1d14' : ghost ? '#6d7d76' : INK,
      border: `1px solid ${primary ? ACCENT_DEEP : ghost ? '#d8e4de' : '#c4d4cd'}`,
      borderRadius: 10,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      display: 'inline-flex', alignItems: 'center', gap: 10,
      boxShadow: primary ? `0 2px 10px -2px ${ACCENT}77` : 'none',
      transition: 'transform 100ms, filter 150ms, box-shadow 150ms',
    }}
      onMouseEnter={(e) => { if (!disabled && primary) e.currentTarget.style.filter = 'brightness(1.05)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
    >
      {children}
    </button>
  );
}

function VariantPicker({ variants, currentSlug, onChange }:
  { variants: ReturnType<typeof combosForType>; currentSlug: string; onChange: (slug: string) => void }) {
  const current = variants.find(v => v.slug === currentSlug)!;
  const guaranteeOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const v of variants) if (!seen.has(v.guarantee.id)) seen.set(v.guarantee.id, v.slug);
    return [...seen.entries()].map(([id, slug]) => ({ id, slug, name: variants.find(v => v.slug === slug)!.guarantee.name }));
  }, [variants]);
  const currencyOptions = variants.filter(v => v.guarantee.id === current.guarantee.id);

  if (guaranteeOptions.length <= 1 && currencyOptions.length <= 1) return null;
  return (
    <div style={styles.pickerWrap}>
      <div style={styles.pickerHead}>Configuration</div>
      {guaranteeOptions.length > 1 && (
        <div style={styles.pickerRow}>
          <span style={styles.pickerLabel}>Guarantee</span>
          <div style={styles.pickerOptions}>
            {guaranteeOptions.map(o => {
              const active = o.id === current.guarantee.id;
              return (
                <button key={o.id} onClick={() => onChange(o.slug)} style={{
                  ...styles.pickerButton,
                  ...(active ? styles.pickerButtonActive : {}),
                }}>{o.name}</button>
              );
            })}
          </div>
        </div>
      )}
      {currencyOptions.length > 1 && (
        <div style={styles.pickerRow}>
          <span style={styles.pickerLabel}>Currency</span>
          <div style={styles.pickerOptions}>
            {currencyOptions.map(v => {
              const active = v.slug === currentSlug;
              return (
                <button key={v.slug} onClick={() => onChange(v.slug)} style={{
                  ...styles.pickerButton,
                  ...(active ? styles.pickerButtonActive : {}),
                }}>{v.currency.name}</button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CertCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M5 12l5 5L20 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ animation: 'trCheckStroke 0.5s ease-out both' }}>
      <path d="M5 12l5 5L20 7" stroke={ACCENT_DEEP} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── styles ──────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    background: 'linear-gradient(180deg, #f6faf8 0%, #eaf3ee 100%)',
    minHeight: '100vh',
    color: INK,
  },
  header: {
    padding: '28px 30px 22px',
    marginBottom: 20,
    background: '#fff',
    border: '1px solid #d8e4de',
    borderRadius: 14,
    boxShadow: '0 2px 12px -4px rgba(79, 201, 141, 0.15)',
  },
  certRow: { display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  certSeal: {
    width: 22, height: 22, borderRadius: '50%',
    background: ACCENT,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: `0 0 0 2px ${ACCENT}33`,
  },
  certText: {
    fontSize: 10.5, letterSpacing: 0.12, textTransform: 'uppercase',
    color: ACCENT_DEEP, fontWeight: 600,
  },
  title: {
    margin: 0,
    fontSize: 28, fontWeight: 700, letterSpacing: -0.4,
    color: INK,
  },
  subtitle: { margin: '8px 0 14px', color: '#586660', fontSize: 14, lineHeight: 1.55, maxWidth: 620 },
  chipRow: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  mainPanel: {
    padding: 26,
    background: '#fff',
    border: '1px solid #d8e4de',
    borderRadius: 14,
    boxShadow: '0 1px 3px rgba(17, 30, 24, 0.04)',
  },
  section: { marginBottom: 26 },
  label: {
    fontSize: 11, letterSpacing: 0.14, textTransform: 'uppercase',
    color: '#5d6d66', fontWeight: 600,
    marginBottom: 10,
  },
  labelRow: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 },
  labelMeta: { fontSize: 10.5, color: '#8b9b94', letterSpacing: 0.04 },
  queueStage: { position: 'relative' },
  queueRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  queueSlot: {},
  queueEmpty: { padding: 24, textAlign: 'center', color: '#8b9b94', gridColumn: '1 / -1' },
  previewCard: {
    position: 'relative',
    padding: '18px 16px 16px',
    borderRadius: 12,
    border: '1px solid',
    minHeight: 120,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    transition: 'background 300ms, border-color 300ms',
  },
  previewIndex: {
    position: 'absolute', top: 10, left: 12,
    fontSize: 10, letterSpacing: 0.1,
    color: '#8b9b94', fontVariantNumeric: 'tabular-nums', fontWeight: 600,
  },
  previewToken: {
    width: 42, height: 42, borderRadius: '50%',
    marginBottom: 10, marginTop: 4,
  },
  previewRank: {
    fontSize: 10.5, letterSpacing: 0.18, textTransform: 'uppercase',
    color: '#6d7d76', marginBottom: 2, fontWeight: 600,
  },
  previewName: { fontSize: 14.5, fontWeight: 600, color: INK },
  previewTag: {
    marginTop: 8,
    fontSize: 9.5, letterSpacing: 0.12, textTransform: 'uppercase',
    color: ACCENT_DEEP, background: '#e7f6ee', border: `1px solid ${ACCENT}55`,
    padding: '2px 8px', borderRadius: 999, fontWeight: 600,
  },
  outgoingCard: {
    position: 'absolute',
    top: 0, left: 0, width: 'calc(33.333% - 8px)',
    animation: 'trOutgoing 0.5s cubic-bezier(0.4,0,1,1) both',
    pointerEvents: 'none',
    zIndex: 2,
  },
  reportGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 10,
    marginBottom: 14,
  },
  reportRow: {
    padding: '12px 14px',
    background: '#f6faf8',
    border: '1px solid #e0ebe5',
    borderRadius: 10,
  },
  reportLabel: { fontSize: 10.5, letterSpacing: 0.08, color: '#6d7d76', fontWeight: 600, textTransform: 'uppercase' },
  reportValue: { fontSize: 15, fontWeight: 600, color: INK, margin: '4px 0 2px', fontVariantNumeric: 'tabular-nums' },
  reportHint: { fontSize: 11, color: '#8b9b94' },
  pityMeter: {},
  pityMeterTrack: {
    position: 'relative',
    height: 10, background: '#eaf3ee', border: '1px solid #d8e4de', borderRadius: 999, overflow: 'hidden',
  },
  pityMeterFill: {
    height: '100%',
    background: `linear-gradient(90deg, ${ACCENT} 0%, ${ACCENT_DEEP} 100%)`,
    transition: 'width 500ms cubic-bezier(0.2,0.7,0.2,1)',
  },
  pityMeterMark: {
    position: 'absolute', top: -3, bottom: -3, width: 2,
    background: '#d0b84a', borderRadius: 1,
  },
  pityTicks: {
    display: 'flex', justifyContent: 'space-between',
    marginTop: 6, fontSize: 10.5, color: '#8b9b94',
    letterSpacing: 0.04,
  },
  sparkStripe: {
    marginTop: 14,
    padding: '10px 14px',
    background: '#fbfdfc', border: '1px solid #e0ebe5', borderRadius: 10,
    display: 'flex', alignItems: 'center', gap: 10,
  },
  sparkStripeLabel: { fontSize: 11, color: '#5d6d66', fontWeight: 600, letterSpacing: 0.08, textTransform: 'uppercase', minWidth: 100 },
  sparkStripeBar: { flex: 1, height: 6, background: '#e0ebe5', borderRadius: 999, overflow: 'hidden' },
  sparkStripeFill: { height: '100%', background: ACCENT, transition: 'width 400ms' },
  sparkStripeCount: { fontSize: 11.5, color: '#5d6d66', fontVariantNumeric: 'tabular-nums', minWidth: 60, textAlign: 'right' },
  featuredRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  featuredPill: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '6px 12px',
    background: '#fff', border: '1px solid #d8e4de', borderRadius: 999,
  },
  featuredDot: { width: 10, height: 10, borderRadius: '50%' },
  featuredName: { fontSize: 13, color: INK, fontWeight: 500 },
  featuredRank: { fontSize: 10, color: ACCENT_DEEP, fontWeight: 600, letterSpacing: 0.08 },
  counterRow: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 },
  buttonRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 },
  btnSub: { fontSize: 11, opacity: 0.75, fontWeight: 500 },
  resultSection: {},
  resultFrame: {
    position: 'relative',
    padding: 18,
    background: '#fbfdfc',
    border: '1px solid #e0ebe5',
    borderRadius: 12,
    minHeight: 140,
  },
  empty: {
    textAlign: 'center', padding: '20px 12px',
  },
  emptyHeader: {
    fontSize: 12, letterSpacing: 0.14, textTransform: 'uppercase',
    color: ACCENT_DEEP, marginBottom: 6, fontWeight: 600,
  },
  emptyBody: { fontSize: 13.5, color: '#586660', maxWidth: 440, margin: '0 auto', lineHeight: 1.55 },
  resultsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(128px, 1fr))',
    gap: 10,
  },
  resultCard: {
    position: 'relative',
    padding: '12px 12px 14px',
    background: '#fff',
    border: '1px solid',
    borderRadius: 10,
    minHeight: 96,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  resultDot: {
    width: 32, height: 32, borderRadius: '50%',
    background: 'var(--unit-color)',
    marginBottom: 6,
    boxShadow: '0 0 0 2px #fff, 0 0 0 3px var(--unit-color)44',
  },
  resultRank: { fontSize: 10.5, color: '#6d7d76', letterSpacing: 0.14, fontWeight: 600 },
  resultName: { fontSize: 13, color: INK, fontWeight: 600 },
  resultBadge: {
    marginTop: 4,
    fontSize: 9, letterSpacing: 0.1, textTransform: 'uppercase',
    color: ACCENT_DEEP, padding: '1px 6px', background: '#e7f6ee',
    border: `1px solid ${ACCENT}44`, borderRadius: 999,
  },
  checkOverlay: {
    position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(2px)',
    animation: 'trCheckFade 1.5s ease-out both',
    borderRadius: 12,
  },
  checkRing: {
    width: 60, height: 60, borderRadius: '50%',
    border: `2px solid ${ACCENT}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#fff',
    boxShadow: `0 0 0 8px ${ACCENT}22`,
    animation: 'trCheckRing 0.6s cubic-bezier(0.2,0.8,0.2,1) both',
  },
  checkLabel: {
    marginTop: 10, fontSize: 12, letterSpacing: 0.16, textTransform: 'uppercase',
    color: ACCENT_DEEP, fontWeight: 700,
  },
  asideBlock: { marginTop: 14, padding: 10, background: '#f6faf8', borderLeft: `2px solid ${ACCENT}`, borderRadius: 4 },
  asideLabel: { fontSize: 10, letterSpacing: 0.12, textTransform: 'uppercase', color: ACCENT_DEEP, marginBottom: 4, fontWeight: 600 },
  asideBody: { fontSize: 12, color: '#586660', lineHeight: 1.55 },
  exampleBlock: { marginTop: 10, padding: 10, background: '#eaf3ee', borderRadius: 6, fontSize: 12, color: '#586660' },
  pickerWrap: {
    padding: 14, marginBottom: 20,
    background: '#fbfdfc', border: '1px solid #e0ebe5', borderRadius: 10,
  },
  pickerHead: { fontSize: 10.5, letterSpacing: 0.14, textTransform: 'uppercase', color: '#6d7d76', fontWeight: 600, marginBottom: 8 },
  pickerRow: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 },
  pickerLabel: { fontSize: 11, color: '#5d6d66', minWidth: 80, fontWeight: 500 },
  pickerOptions: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  pickerButton: {
    padding: '5px 12px', fontSize: 11.5, borderRadius: 999,
    background: '#fff', color: '#586660',
    border: '1px solid #d8e4de', cursor: 'pointer', fontWeight: 500,
  },
  pickerButtonActive: {
    background: ACCENT, color: '#0a1d14', borderColor: ACCENT_DEEP, fontWeight: 600,
  },
};

const TR_KEYFRAMES = `
@keyframes trSlide {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes trOutgoing {
  0% { opacity: 1; transform: translateX(0) translateY(0); }
  60% { opacity: 0.6; }
  100% { opacity: 0; transform: translateY(60px) scale(0.92); }
}
@keyframes trDrop {
  from { opacity: 0; transform: translateY(-12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes trCheckRing {
  0% { opacity: 0; transform: scale(0.4); }
  60% { opacity: 1; transform: scale(1.15); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes trCheckStroke {
  0% { stroke-dasharray: 0 30; }
  100% { stroke-dasharray: 30 0; }
}
@keyframes trCheckFade {
  0% { opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
}
`;
