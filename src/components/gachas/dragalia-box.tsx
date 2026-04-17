// HAND-CRAFTED: Dragalia Box — medieval-fantasy treasure-chest box gacha.
// Finite 90-slot pool, pulls drain the chest, every pull tightens the odds.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { featuredFor } from '../../data/roster';
import { useGachaEngine } from '../../lib/useGachaEngine';
import type { Combo } from '../../data/primitives';

const ACCENT = '#A0D468';
const GOLD = '#E8B84A';
const PURPLE = '#8A6FD4';
const GREY = '#6E7582';

export default function DragaliaBox({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const variants = combosForType('dragalia-box');
  const combo = useMemo(() => variants.find(c => c.slug === slug) ?? variants[0], [variants, slug]);
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;
  const featured = featuredFor(combo.banner.id);

  const snapRef = useRef<{ gold: number; purple: number; grey: number } | null>(null);
  const [chestOpen, setChestOpen] = useState(false);
  const [fiveHit, setFiveHit] = useState(false);

  useEffect(() => {
    if (state.boxRemaining && !snapRef.current) {
      const gold = state.boxRemaining.filter(u => u.rarity === 5).length + lastResults.filter(r => r.rarity === 5).length;
      const purple = state.boxRemaining.filter(u => u.rarity === 4).length + lastResults.filter(r => r.rarity === 4).length;
      const grey = state.boxRemaining.filter(u => u.rarity === 3).length + lastResults.filter(r => r.rarity === 3).length;
      snapRef.current = { gold, purple, grey };
    }
  }, [state.boxRemaining, lastResults]);

  useEffect(() => {
    if (eng.pullBurstKey === 0) return;
    setChestOpen(true);
    const hadFive = lastResults.some(r => r.rarity === 5);
    setFiveHit(hadFive);
    const t1 = setTimeout(() => setChestOpen(false), 1400);
    const t2 = setTimeout(() => setFiveHit(false), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [eng.pullBurstKey, lastResults]);

  const box = state.boxRemaining;
  const remG = box ? box.filter(u => u.rarity === 5).length : 5;
  const remP = box ? box.filter(u => u.rarity === 4).length : 20;
  const remN = box ? box.filter(u => u.rarity === 3).length : 65;
  const remaining = box ? box.length : 90;
  const pulled = 90 - remaining;
  const nextFiveOdds = remaining > 0 ? (remG / remaining) * 100 : 0;
  const snap = snapRef.current ?? { gold: 5, purple: 20, grey: 65 };
  const depG = snap.gold - remG, depP = snap.purple - remP, depN = snap.grey - remN;

  const slots = useMemo(() => {
    const arr: { rarity: 3 | 4 | 5; idx: number }[] = [];
    for (let i = 0; i < snap.gold; i++) arr.push({ rarity: 5, idx: i });
    for (let i = 0; i < snap.purple; i++) arr.push({ rarity: 4, idx: i });
    for (let i = 0; i < snap.grey; i++) arr.push({ rarity: 3, idx: i });
    while (arr.length < 90) arr.push({ rarity: 3, idx: arr.length });
    return arr.slice(0, 90);
  }, [snap.gold, snap.purple, snap.grey]);

  const isDep = (s: { rarity: 3 | 4 | 5; idx: number }) =>
    s.rarity === 5 ? s.idx >= snap.gold - depG
    : s.rarity === 4 ? s.idx >= snap.purple - depP
    : s.idx >= snap.grey - depN;

  const resetBox = () => { eng.reset(); snapRef.current = null; };
  const parchment = 'linear-gradient(135deg, #3a2d1e 0%, #2a2114 55%, #1f1810 100%)';
  const woodGrain = 'repeating-linear-gradient(90deg, rgba(80,56,30,0.45) 0px, rgba(60,42,22,0.25) 6px, rgba(80,56,30,0.45) 14px)';
  const cardBg = { background: 'rgba(42,30,14,0.9)', border: '1px solid #5a4528', color: '#e6d5ab' };

  return (
    <div className="page" style={{ color: '#f3e4c4' }}>
      <style>{KF}</style>
      <Link to="/" className="back-link" style={{ color: ACCENT }}>← Back to dashboard</Link>
      <header className="page-header" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <h1 style={{ color: ACCENT, fontSize: 30, letterSpacing: 0.02, textShadow: '0 2px 0 rgba(0,0,0,0.4)', fontFamily: 'Georgia, serif' }}>The Adventurer's Chest</h1>
          <span style={{ fontSize: 12, color: '#c9b98a', fontStyle: 'italic' }}>— box draws without replacement</span>
        </div>
        <p style={{ color: '#c9b98a', marginTop: 4 }}>Dragalia-style box · {combo.banner.name} · {combo.guarantee.name} · {combo.currency.name}</p>
      </header>

      <VariantBar variants={variants} current={combo.slug} onPick={(s) => navigate(`/play/${s}`)} />

      <div className="player-shell">
        <div className="player-main" style={{
          background: parchment, border: '1px solid #5a4528',
          boxShadow: `inset 0 0 0 2px #3a2d1e, 0 0 0 1px ${ACCENT}33, 0 18px 40px -10px rgba(0,0,0,0.55)`,
          borderRadius: 10, padding: 22,
        }}>
          <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(20,14,6,0.55)', borderLeft: `4px solid ${ACCENT}`, borderRadius: 4, fontSize: 13, color: '#e6d5ab', lineHeight: 1.6, fontStyle: 'italic' }}>
            Draws without replacement. Max whale spend = box cost. The box DEPLETES — every pull tightens the odds on what's left.
          </div>

          {featured.five.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.1, color: '#c9b98a', marginBottom: 6 }}>Legendary rewards in this chest</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {featured.five.map(u => (
                  <div key={u.id} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12.5, fontWeight: 600, background: `linear-gradient(90deg, ${u.color}, ${u.color}cc)`, color: '#2a1e0a', boxShadow: `0 0 14px ${u.color}88, inset 0 0 0 1px #3a2d1e` }}>★5 {u.name}</div>
                ))}
              </div>
            </div>
          )}

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '18px 0 22px' }}>
            <Chest open={chestOpen} fiveHit={fiveHit} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
            <Stat label="Remaining" value={`${remaining}/90`} accent={ACCENT} />
            <Stat label="Pulled" value={`${pulled}`} accent="#c9b98a" />
            <Stat label="Next 5★ odds" value={`${nextFiveOdds.toFixed(2)}%`} accent={GOLD} />
            <Stat label="5★ left" value={`${remG}`} accent={GOLD} />
          </div>

          <div style={{ marginBottom: 16, padding: 10, background: woodGrain, border: '2px solid #5a4528', borderRadius: 8, boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6)' }}>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.1, color: '#e6d5ab', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span>Chest inventory · slot-by-slot</span>
              <span style={{ color: '#c9b98a' }}>gold = 5★ · purple = 4★ · grey = 3★</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: 3 }}>
              {slots.map((s, i) => {
                const dep = isDep(s);
                const color = s.rarity === 5 ? GOLD : s.rarity === 4 ? PURPLE : GREY;
                return (
                  <div key={i} style={{
                    aspectRatio: '1 / 1', borderRadius: 3, position: 'relative',
                    background: dep ? 'rgba(40,30,18,0.6)' : color,
                    boxShadow: dep ? 'inset 0 0 0 1px rgba(0,0,0,0.5)' : `inset 0 0 0 1px rgba(0,0,0,0.5), 0 0 6px ${color}55`,
                    opacity: dep ? 0.45 : 1,
                    transition: 'background 280ms, opacity 280ms',
                  }}>
                    {dep && <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#000', opacity: 0.6, fontWeight: 700 }}>×</span>}
                    {!dep && s.rarity === 5 && <div style={{ position: 'absolute', inset: 0, borderRadius: 3, animation: 'dragbox-glint 2.4s ease-in-out infinite', background: 'radial-gradient(circle at 30% 30%, rgba(255,230,150,0.7), transparent 60%)' }} />}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12, padding: '10px 14px', background: 'rgba(20,14,6,0.5)', borderRadius: 6, border: '1px solid #5a4528' }}>
            <Pip label="Mana" value={state.freeCurrency.toLocaleString()} color={ACCENT} />
            <Pip label="Pulls" value={state.totalPulls} color="#c9b98a" />
            <Pip label="5★" value={state.fiveStarCount} color={GOLD} />
          </div>

          <div className="pull-row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <Btn disabled={!eng.canPull1} onClick={eng.pull1}>Draw 1 · {eng.pullCost}</Btn>
            <Btn primary disabled={!eng.canPull10} onClick={eng.pull10}>Draw 10 · {(eng.pullCost * 10).toLocaleString()}</Btn>
            <Btn onClick={() => eng.addFunds()}>+ Mana</Btn>
            <Btn onClick={resetBox} title="Refills the chest.">Reset Box</Btn>
            <Btn onClick={eng.reset} title="Reset everything.">Reset All</Btn>
          </div>

          <div key={eng.pullBurstKey} style={{ marginTop: 16 }}>
            {lastResults.length === 0 ? (
              <div style={{ padding: 14, color: '#c9b98a', fontStyle: 'italic', textAlign: 'center' }}>The chest sits locked. Draw to see what spills out.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
                {lastResults.map((r, i) => <Medal key={i} rarity={r.rarity} name={r.unit.name} color={r.unit.color} delay={i * 55} />)}
              </div>
            )}
          </div>
        </div>

        <aside className="player-meta">
          <div className="meta-card" style={cardBg}>
            <h3 style={{ color: ACCENT }}>Chest composition</h3>
            <div className="detail-list">
              <div className="kv"><span>Pool size</span><b>90 slots</b></div>
              <div className="kv"><span>Gold (5★)</span><b style={{ color: GOLD }}>{snap.gold}</b></div>
              <div className="kv"><span>Purple (4★)</span><b style={{ color: PURPLE }}>{snap.purple}</b></div>
              <div className="kv"><span>Grey (3★)</span><b>{snap.grey}</b></div>
            </div>
            <div style={{ marginTop: 10, padding: 8, background: 'rgba(160,212,104,0.1)', borderRadius: 4, fontSize: 11.5, color: '#d6e5b8' }}>
              Odds of <b>next</b> 5★: {nextFiveOdds.toFixed(2)}%
              <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, nextFiveOdds * 4)}%`, background: GOLD, transition: 'width 400ms' }} />
              </div>
            </div>
          </div>

          <div className="meta-card" style={cardBg}>
            <h3 style={{ color: ACCENT }}>Adventurer's log · {state.history.length}</h3>
            {state.history.length === 0 ? (
              <p style={{ margin: 0, fontSize: 12, color: '#b2a17a' }}>No draws yet.</p>
            ) : (
              <div className="history-log">
                {state.history.slice(-20).reverse().map((h, i) => (
                  <div key={state.history.length - i} style={{ fontSize: 11.5, padding: '4px 6px', borderLeft: `3px solid ${h.rarity === 5 ? GOLD : h.rarity === 4 ? PURPLE : GREY}`, marginBottom: 3, background: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
                    #{state.history.length - i} · ★{h.rarity} {h.unit.name}
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

function Stat({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div style={{ padding: '8px 10px', background: 'rgba(20,14,6,0.6)', border: '1px solid #5a4528', borderRadius: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.1, color: '#c9b98a' }}>{label}</span>
      <b style={{ color: accent, fontSize: 16, fontFamily: 'Georgia, serif' }}>{value}</b>
    </div>
  );
}

function Pip({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.1, color: '#c9b98a' }}>{label}</span>
      <b style={{ color, fontFamily: 'Georgia, serif' }}>{value}</b>
    </div>
  );
}

function Btn({ children, onClick, disabled, primary, title }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; primary?: boolean; title?: string }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title} style={{
      padding: '9px 16px',
      background: primary ? `linear-gradient(180deg, ${ACCENT} 0%, #7fb858 100%)` : 'linear-gradient(180deg, #3a2d1e 0%, #2a2114 100%)',
      color: primary ? '#16220a' : '#e6d5ab',
      border: `1px solid ${primary ? '#557d33' : '#5a4528'}`,
      borderRadius: 5, fontWeight: 600, fontSize: 12.5, letterSpacing: 0.03,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1,
      boxShadow: primary ? 'inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 0 rgba(0,0,0,0.4)' : 'inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 0 rgba(0,0,0,0.4)',
      fontFamily: 'Georgia, serif',
    }}>{children}</button>
  );
}

function Chest({ open, fiveHit }: { open: boolean; fiveHit: boolean }) {
  return (
    <div style={{ position: 'relative', width: 180, height: 140 }}>
      {open && <div style={{ position: 'absolute', inset: -30, pointerEvents: 'none', background: `radial-gradient(circle, ${fiveHit ? GOLD : ACCENT}88 0%, transparent 60%)`, animation: 'dragbox-burst 1.2s ease-out' }} />}
      <div style={{ position: 'absolute', bottom: 0, left: 10, right: 10, height: 88, background: 'linear-gradient(180deg, #6b4a26 0%, #4a3218 100%)', borderRadius: '4px 4px 8px 8px', border: '2px solid #2a1c0e', boxShadow: 'inset 0 4px 8px rgba(255,215,130,0.2), 0 4px 8px rgba(0,0,0,0.5)' }}>
        {[0, 1, 2].map(i => <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: i * 28 + 6, height: 1, background: 'rgba(0,0,0,0.35)' }} />)}
        <div style={{ position: 'absolute', left: 10, right: 10, top: 6, height: 6, background: 'linear-gradient(90deg, #3a2c1a, #5a4527, #3a2c1a)', borderRadius: 2 }} />
        <div style={{ position: 'absolute', left: 10, right: 10, bottom: 6, height: 6, background: 'linear-gradient(90deg, #3a2c1a, #5a4527, #3a2c1a)', borderRadius: 2 }} />
        <div style={{ position: 'absolute', left: '50%', top: -6, transform: 'translateX(-50%)', width: 22, height: 18, background: 'linear-gradient(180deg, #c9a95e, #8a6c28)', border: '2px solid #2a1c0e', borderRadius: '2px 2px 4px 4px', boxShadow: 'inset 0 1px 0 rgba(255,235,180,0.6)' }} />
      </div>
      <div style={{ position: 'absolute', top: 10, left: 10, right: 10, height: 46, background: 'linear-gradient(180deg, #7a5528 0%, #5a3e1c 100%)', borderRadius: '40px 40px 4px 4px', border: '2px solid #2a1c0e', transformOrigin: 'bottom center', transform: open ? 'rotateX(-110deg)' : 'rotateX(0deg)', transition: 'transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1)', boxShadow: 'inset 0 4px 10px rgba(255,215,130,0.3)' }}>
        <div style={{ position: 'absolute', left: 10, right: 10, top: '50%', height: 6, transform: 'translateY(-50%)', background: 'linear-gradient(90deg, #3a2c1a, #6b4e26, #3a2c1a)', borderRadius: 2 }} />
      </div>
      {fiveHit && (
        <div style={{
          position: 'absolute', left: '50%', bottom: 40, width: 54, height: 54, borderRadius: '50%',
          transform: 'translateX(-50%)', background: `radial-gradient(circle, ${GOLD} 0%, #a97b24 75%, #5a3e11 100%)`,
          boxShadow: `0 0 30px ${GOLD}, 0 0 60px ${GOLD}88`, border: '3px solid #f4d97a',
          animation: 'dragbox-rise 1.6s ease-out',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#5a3e11', fontWeight: 900, fontSize: 20, fontFamily: 'Georgia, serif',
        }}>★</div>
      )}
    </div>
  );
}

function Medal({ rarity, name, color, delay }: { rarity: number; name: string; color: string; delay: number }) {
  const bg = rarity === 5 ? `linear-gradient(145deg, ${color} 0%, #a97b24 100%)` : rarity === 4 ? `linear-gradient(145deg, ${color} 0%, #5a3e7d 100%)` : `linear-gradient(145deg, ${color} 0%, #3a3a44 100%)`;
  return (
    <div style={{
      position: 'relative', aspectRatio: '4 / 5', borderRadius: 6, background: bg,
      border: rarity === 5 ? '2px solid #f4d97a' : '1px solid rgba(0,0,0,0.4)',
      boxShadow: rarity === 5 ? `0 0 20px ${GOLD}88` : '0 2px 8px rgba(0,0,0,0.4)',
      padding: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      animation: 'dragbox-pop 420ms ease-out both', animationDelay: `${delay}ms`, overflow: 'hidden',
    }}>
      {rarity === 5 && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 30% 30%, rgba(255,250,220,0.5), transparent 60%)', animation: 'dragbox-glint 2s ease-in-out infinite' }} />}
      <div style={{ fontSize: 12, fontWeight: 700, color: '#1f1408', fontFamily: 'Georgia, serif' }}>★{rarity}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1f1408', fontFamily: 'Georgia, serif' }}>{name}</div>
    </div>
  );
}

function VariantBar({ variants, current, onPick }: { variants: Combo[]; current: string; onPick: (slug: string) => void }) {
  const cur = variants.find(v => v.slug === current)!;
  const banners = Array.from(new Set(variants.map(v => v.banner.id)));
  const currencies = Array.from(new Set(variants.filter(v => v.banner.id === cur.banner.id).map(v => v.currency.id)));
  const Chip = ({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) => (
    <button onClick={onClick} style={{ padding: '4px 10px', fontSize: 11.5, background: active ? ACCENT : 'transparent', color: active ? '#16220a' : '#e6d5ab', border: `1px solid ${active ? ACCENT : '#5a4528'}`, borderRadius: 3, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>{children}</button>
  );
  return (
    <div style={{ marginBottom: 14, padding: 10, background: 'rgba(26,18,8,0.5)', border: '1px solid #5a4528', borderRadius: 6, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', color: '#e6d5ab' }}>
      {banners.length > 1 && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.08 }}>Banner</span>
          {banners.map(b => { const m = variants.find(v => v.banner.id === b)!; return <Chip key={b} active={cur.banner.id === b} onClick={() => onPick(m.slug)}>{m.banner.name}</Chip>; })}
        </div>
      )}
      {currencies.length > 1 && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.08 }}>Currency</span>
          {currencies.map(c => { const m = variants.find(v => v.banner.id === cur.banner.id && v.currency.id === c)!; return <Chip key={c} active={cur.currency.id === c} onClick={() => onPick(m.slug)}>{m.currency.name}</Chip>; })}
        </div>
      )}
    </div>
  );
}

const KF = `
@keyframes dragbox-burst { 0%{transform:scale(.5);opacity:.9}60%{transform:scale(1.4);opacity:.5}100%{transform:scale(1.8);opacity:0} }
@keyframes dragbox-rise { 0%{transform:translateX(-50%) translateY(30px) scale(.4);opacity:0}40%{transform:translateX(-50%) translateY(-30px) scale(1.1);opacity:1}100%{transform:translateX(-50%) translateY(-70px) scale(1);opacity:0} }
@keyframes dragbox-pop { 0%{transform:scale(.6) translateY(12px);opacity:0}100%{transform:scale(1) translateY(0);opacity:1} }
@keyframes dragbox-glint { 0%,100%{opacity:.35;transform:translate(0,0)}50%{opacity:.85;transform:translate(1px,1px)} }
`;
