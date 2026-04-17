// HAND-CRAFTED: Sugoroku Track — tabletop board gacha.
// Warm orange, paper texture, dice + pawn on a 40-tile loop.
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType, ALL_TYPES } from '../../data/types';
import { featuredFor, fiveStars, type Unit } from '../../data/roster';
import { useGachaEngine } from '../../lib/useGachaEngine';

const ACCENT = '#FFA94D';
const ACCENT_DEEP = '#D6802E';
const PAPER = '#F5ECD7';
const PAPER_DEEP = '#E8D9B0';
const INK = '#3B2A14';
const TYPE_KEY = 'sugoroku-track';

// Board layout: snake in a 8-wide grid, reading rows alternating
const BOARD_COLS = 10;
const BOARD_ROWS = 4;

interface Props { slug: string }

// Convert tile index 0..39 into (col, row) in a snake pattern that loops visually.
function tileToXY(i: number): { col: number; row: number } {
  const row = Math.floor(i / BOARD_COLS);
  const col = row % 2 === 0 ? i % BOARD_COLS : BOARD_COLS - 1 - (i % BOARD_COLS);
  return { col, row };
}

function tileTier(i: number): 'start' | 'major' | 'minor' | 'base' {
  if (i === 0) return 'start';
  if (i % 10 === 0) return 'major';
  if (i % 5 === 0) return 'minor';
  return 'base';
}

function tileLabel(i: number, featuredUnit: Unit | undefined): string {
  const t = tileTier(i);
  if (t === 'start') return 'START';
  if (t === 'major') return featuredUnit ? featuredUnit.name : '5★';
  if (t === 'minor') return '4★';
  return i % 3 === 0 ? '4★' : 'COINS';
}

export default function SugorokuTrack({ slug }: Props) {
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
  const majorUnits = useMemo(() => {
    // Assign a 5★ to each major tile deterministically
    return [1, 2, 3].map(i => fiveStars[(i * 2) % fiveStars.length]);
  }, []);

  // Dice roll animation
  const [diceFace, setDiceFace] = useState(1);
  const [diceRolling, setDiceRolling] = useState(false);
  const [milestoneConfetti, setMilestoneConfetti] = useState<{ tile: number; unit: Unit } | null>(null);

  useEffect(() => {
    if (eng.pullBurstKey === 0) return;
    setDiceRolling(true);
    const count = lastResults.length;
    // animate dice face changes
    let step = 0;
    const interval = setInterval(() => {
      setDiceFace(1 + Math.floor(Math.random() * 6));
      step++;
      if (step >= 8) {
        clearInterval(interval);
        setDiceFace(count === 10 ? 6 : Math.max(1, count));
        setDiceRolling(false);
      }
    }, 55);

    // Check for milestone landing
    const fiveRes = lastResults.find(r => r.rarity === 5);
    if (fiveRes && state.sugorokuTile % 10 === 0 && state.sugorokuTile !== 0) {
      setMilestoneConfetti({ tile: state.sugorokuTile, unit: fiveRes.unit });
      const t = setTimeout(() => setMilestoneConfetti(null), 2800);
      return () => { clearInterval(interval); clearTimeout(t); };
    }
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eng.pullBurstKey]);

  // Pawn position
  const pawnPos = tileToXY(state.sugorokuTile);

  const currentTile = state.sugorokuTile;
  const currentTier = tileTier(currentTile);

  return (
    <div className="page" style={styles.page}>
      <style>{SG_KEYFRAMES}</style>
      <div aria-hidden style={styles.paperBg} />
      <Link to="/" className="back-link" style={{ color: ACCENT_DEEP }}>← Back to dashboard</Link>

      <header style={styles.header}>
        <div style={styles.headerStamp}>
          <span style={styles.stampDot} />
          Event Banner · Issue 23
        </div>
        <h1 style={styles.title}>
          <span style={styles.titleKanji}>双六</span>
          {type.title}
        </h1>
        <p style={styles.subtitle}>
          Every pull = one tile. Board payouts are deterministic — you can plan. Event-scale only.
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

          {/* Featured */}
          {featured.five.length > 0 && (
            <section style={styles.section}>
              <SectionLabel>Featured 5★ · milestone prizes</SectionLabel>
              <div style={styles.featuredRow}>
                {featured.five.map(u => (
                  <span key={u.id} style={styles.featuredPill}>
                    <span style={{ ...styles.featuredDot, background: u.color }} />
                    <span>{u.name}</span>
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* The Board */}
          <section style={styles.section}>
            <SectionLabel>Board · tile {currentTile} of {state.sugorokuLength}</SectionLabel>
            <div style={styles.boardFrame}>
              <div aria-hidden style={styles.boardPaper} />
              <div style={styles.board}>
                {Array.from({ length: state.sugorokuLength }).map((_, i) => {
                  const tier = tileTier(i);
                  const { col, row } = tileToXY(i);
                  const isCurrent = i === currentTile;
                  const majorIdx = i === 10 ? 0 : i === 20 ? 1 : i === 30 ? 2 : -1;
                  const majorUnit = majorIdx >= 0 ? majorUnits[majorIdx] : undefined;
                  return (
                    <div
                      key={i}
                      style={{
                        ...styles.tile,
                        ...(tier === 'major' ? styles.tileMajor : {}),
                        ...(tier === 'minor' ? styles.tileMinor : {}),
                        ...(tier === 'start' ? styles.tileStart : {}),
                        gridColumn: col + 1,
                        gridRow: row + 1,
                        ...(isCurrent ? styles.tileCurrent : {}),
                      }}
                    >
                      <div style={styles.tileNum}>{i}</div>
                      {tier === 'major' && majorUnit && (
                        <div style={{ ...styles.tileUnitDot, background: majorUnit.color }} />
                      )}
                      <div style={{
                        ...styles.tileLabel,
                        color: tier === 'major' ? '#fff' : tier === 'minor' ? ACCENT_DEEP : tier === 'start' ? '#fff' : '#7a5d32',
                      }}>
                        {tileLabel(i, majorUnit)}
                      </div>
                      {/* Row connector arrow on non-turn tiles */}
                      {(i % BOARD_COLS !== BOARD_COLS - 1) && (
                        <div style={{
                          ...styles.tileArrow,
                          borderLeftColor: row % 2 === 0 ? '#b79c64' : 'transparent',
                          borderRightColor: row % 2 === 0 ? 'transparent' : '#b79c64',
                          ...(row % 2 === 0 ? { right: -8 } : { left: -8 }),
                        }} />
                      )}
                    </div>
                  );
                })}

                {/* Pawn */}
                <div
                  aria-hidden
                  style={{
                    ...styles.pawn,
                    gridColumn: pawnPos.col + 1,
                    gridRow: pawnPos.row + 1,
                  }}
                >
                  <div style={styles.pawnShadow} />
                  <div style={styles.pawnBody}>
                    <div style={styles.pawnHead} />
                    <div style={styles.pawnCrown} />
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div style={styles.legend}>
                <LegendDot tier="major" label="5★ milestone" />
                <LegendDot tier="minor" label="4★ milestone" />
                <LegendDot tier="base" label="Coins / 4★ chance" />
              </div>
            </div>
          </section>

          {/* Dice + Pull zone */}
          <section style={styles.diceSection}>
            <div style={styles.diceCol}>
              <div style={styles.diceWrap}>
                <div style={{ ...styles.dice, animation: diceRolling ? 'sgDiceShake 0.45s ease-in-out infinite' : undefined }}>
                  <DiceFace face={diceFace} />
                </div>
                <div style={styles.diceLabel}>
                  {diceRolling ? 'ROLLING…' : lastResults.length === 10 ? '×10 STEPS' : lastResults.length > 0 ? `+${lastResults.length} TILES` : 'READY'}
                </div>
              </div>
            </div>

            <div style={styles.diceInfo}>
              <div style={styles.diceInfoRow}>
                <div style={styles.diceInfoLabel}>Current tile</div>
                <div style={styles.diceInfoValue}>
                  #{currentTile}
                  <span style={styles.tierTag}>
                    {currentTier === 'major' ? 'MILESTONE · 5★' :
                      currentTier === 'minor' ? 'MILESTONE · 4★' :
                        currentTier === 'start' ? 'START' : 'REGULAR'}
                  </span>
                </div>
              </div>
              <div style={styles.diceInfoRow}>
                <div style={styles.diceInfoLabel}>Next 5★ at tile</div>
                <div style={styles.diceInfoValue}>
                  #{nextMajorTile(currentTile)}
                  <span style={styles.tierTag}>in {(nextMajorTile(currentTile) - currentTile + 40) % 40 || 40} pulls</span>
                </div>
              </div>
              <div style={styles.diceInfoRow}>
                <div style={styles.diceInfoLabel}>Lap</div>
                <div style={styles.diceInfoValue}>
                  {Math.floor(state.totalPulls / state.sugorokuLength) + 1}
                  <span style={styles.tierTag}>pawn cycles</span>
                </div>
              </div>
            </div>
          </section>

          {/* Counters */}
          <div style={styles.counterRow}>
            <Counter label="Coins" value={state.freeCurrency.toLocaleString()} emphasis />
            {combo.currency.id === 'dual' && <Counter label="Paid" value={state.paidCurrency} />}
            {combo.currency.id === 'tickets' && <Counter label="Tickets" value={state.tickets} />}
            <Counter label="Pulls" value={state.totalPulls} />
            <Counter label="5★" value={state.fiveStarCount} />
            <Counter label="Featured" value={state.featuredObtained} />
          </div>

          {/* Actions */}
          <div style={styles.buttonRow}>
            <SGButton primary disabled={!eng.canPull1} onClick={eng.pull1}>
              Roll ×1 <span style={styles.btnSub}>{eng.pullCost.toLocaleString()}</span>
            </SGButton>
            <SGButton disabled={!eng.canPull10} onClick={eng.pull10}>
              Roll ×10 <span style={styles.btnSub}>{(eng.pullCost * 10).toLocaleString()}</span>
            </SGButton>
            {['spark_only', 'spark_pity'].includes(combo.guarantee.id) && (
              <SGButton disabled={!eng.canSpark} onClick={eng.spark}>Redeem ({state.sparkProgress}/{state.sparkThreshold})</SGButton>
            )}
            {['shards', 'shards_pity'].includes(combo.guarantee.id) && (
              <SGButton disabled={!eng.canShards} onClick={eng.shards}>Craft ({state.shards}/{state.shardsNeededForFive})</SGButton>
            )}
            <SGButton ghost onClick={() => eng.addFunds()}>+ Coins</SGButton>
            <SGButton ghost onClick={eng.reset}>Reset</SGButton>
          </div>

          {/* Results */}
          <section style={styles.resultSection}>
            <SectionLabel>Journey log · last roll</SectionLabel>
            <div style={styles.resultsFrame}>
              {lastResults.length === 0 ? (
                <div style={styles.empty}>
                  <div style={styles.emptyHeader}>Roll to advance your pawn</div>
                  <div style={styles.emptyBody}>
                    Pulls move you one tile at a time around the 40-tile loop.
                    Land on tiles 10, 20, 30, 40 for guaranteed 5★.
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
                        borderColor: r.rarity === 5 ? ACCENT_DEEP : r.rarity === 4 ? '#a97d3a' : '#b79c64',
                        animation: `sgHop 0.55s cubic-bezier(0.2,0.9,0.3,1) ${i * 40}ms both`,
                      } as React.CSSProperties}
                    >
                      <div style={styles.resultDot} />
                      <div style={styles.resultRank}>★{r.rarity}</div>
                      <div style={styles.resultName}>{r.unit.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="player-meta">
          <div className="meta-card" style={{ borderColor: '#d8bf85', background: PAPER }}>
            <h3 style={{ color: ACCENT_DEEP }}>Board details</h3>
            <div className="detail-list">
              <div className="kv"><span>Distribution</span><span>{combo.dist.name}</span></div>
              <div className="kv"><span>Banner</span><span>{combo.banner.name}</span></div>
              <div className="kv"><span>Guarantee</span><span>{combo.guarantee.name}</span></div>
              <div className="kv"><span>Currency</span><span>{combo.currency.name}</span></div>
              <div className="kv"><span>Tag</span><span className={`tag ${combo.tag.cls}`}>{combo.tag.text}</span></div>
            </div>
            <div style={{ marginTop: 10, padding: 10, background: PAPER_DEEP, borderRadius: 4, fontSize: 12, color: '#5d4521', lineHeight: 1.55 }}>
              {type.flavor}
            </div>
            {combo.example && (
              <div style={{ marginTop: 8, padding: 8, background: '#fff6e4', borderRadius: 4, fontSize: 11.5, color: '#7a5d32' }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.08, color: ACCENT_DEEP, marginBottom: 2, fontWeight: 600 }}>Real-world analogue</div>
                {combo.example}
              </div>
            )}
          </div>

          <div className="meta-card" style={{ borderColor: '#d8bf85', background: PAPER }}>
            <h3 style={{ color: ACCENT_DEEP }}>Journey log · {state.history.length}</h3>
            {state.history.length === 0 ? (
              <p style={{ margin: 0, fontSize: 12, color: '#8b7543' }}>No tiles traversed.</p>
            ) : (
              <div className="history-log">
                {state.history.slice(-30).reverse().map((h, i) => {
                  const tileAt = (state.totalPulls - (state.history.length - 1 - (state.history.length - i))) % 40;
                  return (
                    <div key={state.history.length - i} className={`entry r${h.rarity}`}>
                      tile #{tileAt} · ★{h.rarity} {h.unit.name}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Milestone confetti overlay */}
      {milestoneConfetti && <MilestoneOverlay tile={milestoneConfetti.tile} unit={milestoneConfetti.unit} />}
    </div>
  );
}

function nextMajorTile(current: number): number {
  const candidates = [10, 20, 30, 0];
  for (const c of candidates) {
    if (c > current) return c;
  }
  return 10;
}

function MilestoneOverlay({ tile, unit }: { tile: number; unit: Unit }) {
  const pieces = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    left: 50 + (Math.random() - 0.5) * 80,
    top: 50 + (Math.random() - 0.5) * 40,
    color: i % 3 === 0 ? ACCENT : i % 3 === 1 ? unit.color : '#f4d874',
    angle: Math.random() * 360,
    delay: Math.random() * 150,
    dist: 80 + Math.random() * 140,
  })), [unit]);
  return (
    <div style={styles.milestoneOverlay} aria-hidden>
      {pieces.map((p, i) => (
        <span key={i} style={{
          position: 'absolute',
          left: `${p.left}%`, top: `${p.top}%`,
          width: 10, height: 14,
          background: p.color,
          transform: `rotate(${p.angle}deg)`,
          ['--dx' as never]: `${Math.cos(p.angle) * p.dist}px`,
          ['--dy' as never]: `${Math.sin(p.angle) * p.dist + 200}px`,
          animation: `sgConfetti 2.5s ease-out ${p.delay}ms both`,
          borderRadius: 1,
        } as React.CSSProperties} />
      ))}
      <div style={styles.milestoneCard}>
        <div style={styles.milestoneStamp}>MILESTONE REWARD</div>
        <div style={styles.milestoneTile}>TILE {tile}</div>
        <div style={{ ...styles.milestoneDot, background: unit.color }} />
        <div style={styles.milestoneName}>{unit.name}</div>
        <div style={styles.milestoneRank}>★5 GUARANTEED</div>
      </div>
    </div>
  );
}

function DiceFace({ face }: { face: number }) {
  const dots = dotPositions(face);
  return (
    <div style={styles.diceFace}>
      {dots.map(([x, y], i) => (
        <span key={i} style={{
          position: 'absolute',
          top: `${y}%`, left: `${x}%`,
          width: 10, height: 10,
          borderRadius: '50%',
          background: INK,
          transform: 'translate(-50%, -50%)',
          boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.2)',
        }} />
      ))}
    </div>
  );
}

function dotPositions(face: number): Array<[number, number]> {
  const c = 50, m = 25, f = 75;
  switch (face) {
    case 1: return [[c, c]];
    case 2: return [[m, m], [f, f]];
    case 3: return [[m, m], [c, c], [f, f]];
    case 4: return [[m, m], [f, m], [m, f], [f, f]];
    case 5: return [[m, m], [f, m], [c, c], [m, f], [f, f]];
    case 6: return [[m, m], [f, m], [m, c], [f, c], [m, f], [f, f]];
    default: return [[c, c]];
  }
}

function LegendDot({ tier, label }: { tier: 'major' | 'minor' | 'base'; label: string }) {
  const bg = tier === 'major' ? ACCENT_DEEP : tier === 'minor' ? ACCENT : '#b79c64';
  return (
    <div style={styles.legendItem}>
      <span style={{ width: 10, height: 10, background: bg, borderRadius: 2 }} />
      <span>{label}</span>
    </div>
  );
}

function Chip({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span style={{
      padding: '3px 10px',
      fontSize: 10.5, letterSpacing: 0.1, textTransform: 'uppercase',
      border: `1px solid ${accent ? ACCENT_DEEP : '#c5a878'}`,
      borderRadius: 2,
      color: accent ? '#fff' : '#6e521f',
      background: accent ? ACCENT_DEEP : 'transparent',
      fontWeight: 600,
    }}>{children}</span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10.5, letterSpacing: 0.16, textTransform: 'uppercase',
      color: ACCENT_DEEP, fontWeight: 700,
      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
    }}>
      <span style={{ width: 6, height: 6, background: ACCENT_DEEP, borderRadius: '50%' }} />
      {children}
    </div>
  );
}

function Counter({ label, value, emphasis }: { label: string; value: string | number; emphasis?: boolean }) {
  return (
    <div style={{
      flex: 1, minWidth: 90,
      padding: '8px 12px',
      background: emphasis ? `linear-gradient(135deg, ${ACCENT}26, transparent)` : '#fff8e8',
      border: `1px solid ${emphasis ? ACCENT : '#d8bf85'}`,
      borderRadius: 4,
    }}>
      <div style={{ fontSize: 10, letterSpacing: 0.1, textTransform: 'uppercase', color: emphasis ? ACCENT_DEEP : '#8b7543', fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: INK, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}

function SGButton({ children, onClick, disabled, primary, ghost }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; primary?: boolean; ghost?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: ghost ? '8px 14px' : '11px 20px',
      fontSize: 13, letterSpacing: 0.04, fontWeight: 700,
      background: primary ? ACCENT : ghost ? 'transparent' : '#fff8e8',
      color: primary ? '#2b1c08' : ghost ? '#8b7543' : INK,
      border: `1px solid ${primary ? ACCENT_DEEP : ghost ? '#d8bf85' : '#c5a878'}`,
      borderRadius: 4,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      display: 'inline-flex', alignItems: 'center', gap: 8,
      boxShadow: primary ? `0 2px 0 ${ACCENT_DEEP}, 0 0 0 1px ${ACCENT_DEEP}` : 'inset 0 -2px 0 rgba(160, 110, 50, 0.12)',
      transition: 'transform 100ms, box-shadow 150ms',
    }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'translateY(1px)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {children}
    </button>
  );
}

function VariantPicker({ variants, currentSlug, onChange }:
  { variants: ReturnType<typeof combosForType>; currentSlug: string; onChange: (slug: string) => void }) {
  const current = variants.find(v => v.slug === currentSlug)!;
  const banners = useMemo(() => {
    const seen = new Map<string, string>();
    for (const v of variants) if (!seen.has(v.banner.id)) seen.set(v.banner.id, v.slug);
    return [...seen.entries()].map(([id, slug]) => ({ id, slug, name: variants.find(v => v.slug === slug)!.banner.name }));
  }, [variants]);
  const currencies = variants.filter(v => v.banner.id === current.banner.id && v.guarantee.id === current.guarantee.id);

  if (banners.length <= 1 && currencies.length <= 1) return null;
  return (
    <div style={styles.pickerWrap}>
      <div style={styles.pickerHead}>Event configuration</div>
      {banners.length > 1 && (
        <div style={styles.pickerRow}>
          <span style={styles.pickerLabel}>Banner</span>
          <div style={styles.pickerOptions}>
            {banners.map(b => {
              const active = b.id === current.banner.id;
              return (
                <button key={b.id} onClick={() => onChange(b.slug)} style={{
                  ...styles.pickerButton, ...(active ? styles.pickerButtonActive : {}),
                }}>{b.name}</button>
              );
            })}
          </div>
        </div>
      )}
      {currencies.length > 1 && (
        <div style={styles.pickerRow}>
          <span style={styles.pickerLabel}>Currency</span>
          <div style={styles.pickerOptions}>
            {currencies.map(v => {
              const active = v.slug === currentSlug;
              return (
                <button key={v.slug} onClick={() => onChange(v.slug)} style={{
                  ...styles.pickerButton, ...(active ? styles.pickerButtonActive : {}),
                }}>{v.currency.name}</button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── styles ──────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: { position: 'relative', color: INK, minHeight: '100vh' },
  paperBg: {
    position: 'fixed', inset: 0,
    background: [
      'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255, 169, 77, 0.2), transparent 70%)',
      `repeating-linear-gradient(45deg, transparent 0 10px, rgba(139, 117, 67, 0.02) 10px 11px)`,
      `linear-gradient(180deg, ${PAPER} 0%, #efe3c3 100%)`,
    ].join(','),
    zIndex: 0,
    pointerEvents: 'none',
  },
  header: {
    position: 'relative',
    padding: '26px 28px 20px',
    marginBottom: 18,
    background: '#fff8e8',
    border: '2px solid #c5a878',
    borderRadius: 6,
    boxShadow: `4px 4px 0 ${ACCENT_DEEP}, inset 0 0 0 1px rgba(160, 110, 50, 0.12)`,
  },
  headerStamp: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    fontSize: 10, letterSpacing: 0.18, textTransform: 'uppercase',
    color: ACCENT_DEEP, fontWeight: 700,
    padding: '3px 10px', background: '#fff', border: `1px solid ${ACCENT_DEEP}`, borderRadius: 2,
    marginBottom: 10,
  },
  stampDot: { width: 6, height: 6, borderRadius: '50%', background: ACCENT_DEEP },
  title: {
    margin: 0,
    fontSize: 30, fontWeight: 900, letterSpacing: -0.4,
    color: INK,
    display: 'flex', alignItems: 'center', gap: 12,
  },
  titleKanji: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 44, height: 44,
    background: ACCENT_DEEP, color: '#fff',
    borderRadius: 4,
    fontSize: 22, fontWeight: 900,
    boxShadow: `2px 2px 0 #8b5a1f`,
    fontFamily: 'serif',
  },
  subtitle: { margin: '10px 0 14px', color: '#5d4521', fontSize: 13.5, maxWidth: 620 },
  chipRow: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  mainPanel: {
    position: 'relative',
    padding: 24,
    background: 'linear-gradient(180deg, #fff8e8 0%, #fdefc5 100%)',
    border: '2px solid #c5a878',
    borderRadius: 6,
    boxShadow: `4px 4px 0 #b79c64`,
  },
  section: { marginBottom: 20 },
  featuredRow: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  featuredPill: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '4px 10px',
    background: '#fff', border: `1px solid ${ACCENT_DEEP}`,
    borderRadius: 999,
    fontSize: 12.5, color: INK, fontWeight: 600,
  },
  featuredDot: { width: 10, height: 10, borderRadius: '50%' },
  boardFrame: {
    position: 'relative',
    padding: 16,
    background: '#fbf2d4',
    border: '2px solid #b79c64',
    borderRadius: 4,
    boxShadow: 'inset 0 0 30px rgba(139, 94, 31, 0.1)',
    overflow: 'hidden',
  },
  boardPaper: {
    position: 'absolute', inset: 0,
    background: [
      'radial-gradient(ellipse 300px 200px at 20% 20%, rgba(139, 94, 31, 0.08), transparent)',
      'radial-gradient(ellipse 200px 150px at 80% 80%, rgba(139, 94, 31, 0.08), transparent)',
      'repeating-linear-gradient(0deg, transparent 0 19px, rgba(139, 94, 31, 0.03) 19px 20px)',
      'repeating-linear-gradient(90deg, transparent 0 19px, rgba(139, 94, 31, 0.03) 19px 20px)',
    ].join(','),
    pointerEvents: 'none',
  },
  board: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: `repeat(${BOARD_COLS}, 1fr)`,
    gridTemplateRows: `repeat(${BOARD_ROWS}, 68px)`,
    gap: 6,
  },
  tile: {
    position: 'relative',
    padding: '6px 4px',
    background: '#fff8e8',
    border: '1.5px solid #b79c64',
    borderRadius: 3,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    boxShadow: 'inset 0 -2px 0 rgba(160, 110, 50, 0.1)',
    transition: 'transform 200ms',
  },
  tileStart: {
    background: `linear-gradient(135deg, ${ACCENT_DEEP}, #8b5a1f)`,
    borderColor: '#8b5a1f',
    color: '#fff',
  },
  tileMinor: {
    background: `linear-gradient(135deg, ${ACCENT}, #f0a754)`,
    borderColor: ACCENT_DEEP,
  },
  tileMajor: {
    background: `linear-gradient(135deg, ${ACCENT_DEEP}, #b85d1e)`,
    borderColor: '#8b3e0a',
    boxShadow: `inset 0 -2px 0 #8b3e0a, 0 0 0 2px ${ACCENT}44`,
  },
  tileCurrent: {
    transform: 'scale(1.08)',
    zIndex: 3,
    outline: `3px solid ${ACCENT}`,
    outlineOffset: 2,
    animation: 'sgTileGlow 1.6s ease-in-out infinite',
  },
  tileNum: {
    fontSize: 9, letterSpacing: 0.06,
    color: 'inherit',
    opacity: 0.65,
    fontVariantNumeric: 'tabular-nums', fontWeight: 700,
  },
  tileLabel: {
    fontSize: 10, fontWeight: 700, letterSpacing: 0.04,
    marginTop: 2, textAlign: 'center', lineHeight: 1.1,
  },
  tileUnitDot: {
    width: 14, height: 14, borderRadius: '50%',
    marginTop: 2,
    boxShadow: '0 0 0 2px #fff, 0 0 0 3px rgba(0,0,0,0.25)',
  },
  tileArrow: {
    position: 'absolute', top: '50%', marginTop: -4,
    width: 0, height: 0,
    borderTop: '4px solid transparent', borderBottom: '4px solid transparent',
    borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
    opacity: 0.5, pointerEvents: 'none',
  },
  pawn: {
    position: 'relative',
    justifySelf: 'center', alignSelf: 'center',
    width: 32, height: 40,
    pointerEvents: 'none',
    zIndex: 5,
    transition: 'all 500ms cubic-bezier(0.3, 1.6, 0.4, 1)',
    animation: 'sgPawnHop 600ms ease-out',
  },
  pawnShadow: {
    position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)',
    width: 22, height: 6, borderRadius: '50%',
    background: 'radial-gradient(ellipse, rgba(0,0,0,0.3), transparent 70%)',
  },
  pawnBody: {
    position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
    width: 22, height: 32,
    background: `linear-gradient(180deg, #e54b3c 0%, #a82a1e 100%)`,
    borderRadius: '11px 11px 4px 4px',
    boxShadow: 'inset -3px -2px 6px rgba(0,0,0,0.3), inset 2px 2px 4px rgba(255,255,255,0.25)',
    border: '1px solid #8b1d14',
  },
  pawnHead: {
    position: 'absolute', top: 2, left: '50%', transform: 'translateX(-50%)',
    width: 10, height: 10, borderRadius: '50%',
    background: '#fff', boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.2)',
  },
  pawnCrown: {
    position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%)',
    width: 8, height: 5,
    background: ACCENT, borderRadius: '2px 2px 0 0',
    boxShadow: `0 0 6px ${ACCENT}`,
  },
  legend: {
    marginTop: 12,
    display: 'flex', gap: 16, flexWrap: 'wrap',
    padding: '6px 10px',
    background: 'rgba(255, 255, 255, 0.5)',
    border: '1px dashed #b79c64',
    borderRadius: 3,
  },
  legendItem: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontSize: 10.5, color: '#5d4521', letterSpacing: 0.06, fontWeight: 600, textTransform: 'uppercase',
  },
  diceSection: {
    display: 'grid',
    gridTemplateColumns: '120px 1fr',
    gap: 16,
    marginBottom: 20,
    padding: 14,
    background: '#fff8e8',
    border: '1.5px solid #c5a878',
    borderRadius: 4,
  },
  diceCol: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  diceWrap: { textAlign: 'center' },
  dice: {
    position: 'relative',
    width: 72, height: 72,
    background: '#fff',
    border: '2px solid #5d4521',
    borderRadius: 10,
    boxShadow: '3px 3px 0 #5d4521, inset 0 0 0 2px #fff, inset 0 0 8px rgba(160, 110, 50, 0.18)',
    margin: '0 auto 8px',
    transform: 'rotate(-4deg)',
  },
  diceFace: { position: 'absolute', inset: 0 },
  diceLabel: {
    fontSize: 10.5, letterSpacing: 0.18, textTransform: 'uppercase',
    color: ACCENT_DEEP, fontWeight: 800,
  },
  diceInfo: { display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' },
  diceInfoRow: {
    display: 'flex', alignItems: 'baseline', gap: 10,
    padding: '6px 10px',
    background: PAPER,
    borderRadius: 3,
    border: '1px solid #d8bf85',
  },
  diceInfoLabel: {
    fontSize: 10, letterSpacing: 0.12, textTransform: 'uppercase',
    color: '#8b7543', fontWeight: 700, minWidth: 120,
  },
  diceInfoValue: {
    fontSize: 14, fontWeight: 700, color: INK, fontVariantNumeric: 'tabular-nums',
    display: 'inline-flex', alignItems: 'center', gap: 8,
  },
  tierTag: {
    fontSize: 9.5, letterSpacing: 0.1, textTransform: 'uppercase',
    color: ACCENT_DEEP, fontWeight: 600,
    padding: '1px 6px', background: '#fff', border: `1px solid ${ACCENT_DEEP}`, borderRadius: 2,
  },
  counterRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 },
  buttonRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 },
  btnSub: { fontSize: 10.5, opacity: 0.8, fontWeight: 500 },
  resultSection: {},
  resultsFrame: {
    padding: 14,
    background: '#fff8e8',
    border: '1.5px dashed #c5a878',
    borderRadius: 4,
    minHeight: 120,
  },
  empty: { textAlign: 'center', padding: '10px 8px' },
  emptyHeader: {
    fontSize: 12, letterSpacing: 0.14, textTransform: 'uppercase',
    color: ACCENT_DEEP, fontWeight: 700, marginBottom: 4,
  },
  emptyBody: { fontSize: 13, color: '#5d4521', maxWidth: 460, margin: '0 auto', lineHeight: 1.5 },
  resultsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(116px, 1fr))',
    gap: 8,
  },
  resultCard: {
    padding: '10px 10px 12px',
    background: '#fff',
    border: '1.5px solid',
    borderRadius: 4,
    textAlign: 'center',
    boxShadow: 'inset 0 -2px 0 rgba(160, 110, 50, 0.14)',
  },
  resultDot: {
    width: 30, height: 30, borderRadius: '50%',
    background: 'var(--unit-color)',
    margin: '0 auto 6px',
    boxShadow: '0 0 0 2px #fff, 0 0 0 3px rgba(0,0,0,0.25)',
  },
  resultRank: { fontSize: 10, letterSpacing: 0.12, color: ACCENT_DEEP, fontWeight: 700 },
  resultName: { fontSize: 12.5, fontWeight: 700, color: INK },
  milestoneOverlay: {
    position: 'fixed', inset: 0, zIndex: 90, pointerEvents: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.35)',
    animation: 'sgFade 2.8s ease-out both',
  },
  milestoneCard: {
    position: 'relative',
    padding: '24px 40px',
    background: `linear-gradient(180deg, #fff8e8 0%, ${PAPER_DEEP} 100%)`,
    border: `3px solid ${ACCENT_DEEP}`,
    borderRadius: 6,
    boxShadow: `6px 6px 0 ${ACCENT_DEEP}, 0 0 40px ${ACCENT}`,
    textAlign: 'center',
    animation: 'sgMilestonePop 2.8s cubic-bezier(0.3, 1.5, 0.4, 1) both',
  },
  milestoneStamp: {
    fontSize: 11, letterSpacing: 0.3, textTransform: 'uppercase',
    color: ACCENT_DEEP, fontWeight: 800,
    padding: '2px 10px', border: `1px solid ${ACCENT_DEEP}`,
    borderRadius: 2, display: 'inline-block', marginBottom: 8,
    background: '#fff',
  },
  milestoneTile: {
    fontSize: 48, fontWeight: 900, letterSpacing: -1,
    color: ACCENT_DEEP, lineHeight: 1,
    textShadow: `2px 2px 0 ${ACCENT}44`,
  },
  milestoneDot: {
    width: 48, height: 48, borderRadius: '50%',
    margin: '12px auto 8px',
    boxShadow: `0 0 0 3px #fff, 0 0 0 5px ${ACCENT_DEEP}, 0 0 24px ${ACCENT}`,
  },
  milestoneName: {
    fontSize: 22, fontWeight: 800, color: INK, marginTop: 4,
  },
  milestoneRank: {
    marginTop: 4, fontSize: 11, letterSpacing: 0.2, textTransform: 'uppercase',
    color: ACCENT_DEEP, fontWeight: 700,
  },
  pickerWrap: {
    padding: 12, marginBottom: 16,
    background: PAPER, border: '1.5px solid #c5a878', borderRadius: 4,
  },
  pickerHead: { fontSize: 10.5, letterSpacing: 0.12, textTransform: 'uppercase', color: ACCENT_DEEP, fontWeight: 700, marginBottom: 6 },
  pickerRow: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 },
  pickerLabel: { fontSize: 11, color: '#5d4521', minWidth: 70, fontWeight: 600 },
  pickerOptions: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  pickerButton: {
    padding: '4px 10px', fontSize: 11.5,
    background: '#fff', color: '#5d4521',
    border: '1px solid #c5a878', borderRadius: 2,
    cursor: 'pointer', fontWeight: 600,
  },
  pickerButtonActive: {
    background: ACCENT_DEEP, color: '#fff', borderColor: ACCENT_DEEP,
  },
};

const SG_KEYFRAMES = `
@keyframes sgTileGlow {
  0%, 100% { outline-color: ${ACCENT}; box-shadow: 0 0 12px ${ACCENT}aa; }
  50% { outline-color: #fff4cc; box-shadow: 0 0 22px ${ACCENT}, 0 0 32px ${ACCENT}88; }
}
@keyframes sgPawnHop {
  0% { transform: translateY(-14px) rotate(-6deg); }
  55% { transform: translateY(0) rotate(3deg); }
  75% { transform: translateY(-3px) rotate(-1deg); }
  100% { transform: translateY(0) rotate(0); }
}
@keyframes sgDiceShake {
  0%, 100% { transform: rotate(-4deg); }
  25% { transform: rotate(18deg) translate(2px, -2px); }
  50% { transform: rotate(-20deg) translate(-2px, 3px); }
  75% { transform: rotate(8deg) translate(1px, -1px); }
}
@keyframes sgHop {
  0% { opacity: 0; transform: translateY(-10px) scale(0.96); }
  55% { opacity: 1; transform: translateY(3px) scale(1.02); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes sgFade {
  0% { opacity: 0; }
  10% { opacity: 1; }
  85% { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes sgMilestonePop {
  0% { opacity: 0; transform: scale(0.5) rotate(-6deg); }
  20% { opacity: 1; transform: scale(1.08) rotate(2deg); }
  35% { transform: scale(1) rotate(-1deg); }
  80% { opacity: 1; transform: scale(1) rotate(0); }
  100% { opacity: 0; transform: scale(1.05) rotate(0) translateY(-10px); }
}
@keyframes sgConfetti {
  0% { opacity: 0; transform: translate(0, 0) rotate(0); }
  15% { opacity: 1; }
  100% { opacity: 0; transform: translate(var(--dx), var(--dy)) rotate(720deg); }
}
`;
