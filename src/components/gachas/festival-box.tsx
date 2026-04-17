// HAND-CRAFTED: Festival Box — anniversary/festival-scale box banner.
// Fireworks, doubled rates, 2+ featured 5★s within the finite 90-slot pool.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { featuredFor } from '../../data/roster';
import { useGachaEngine } from '../../lib/useGachaEngine';
import type { Combo } from '../../data/primitives';

const ACCENT = '#FF9FD5';
const GOLD = '#FFD86F';
const MAGENTA = '#FF4E9E';
const CYAN = '#7EE6FF';
const PURPLE = '#B88BFF';

export default function FestivalBox({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const variants = combosForType('festival-box');
  const combo = useMemo(() => variants.find(c => c.slug === slug) ?? variants[0], [variants, slug]);
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;
  const featured = featuredFor(combo.banner.id);

  const snapRef = useRef<{ gold: number; purple: number; grey: number } | null>(null);
  const [fw, setFw] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const fwIdRef = useRef(0);

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
    const hadFive = lastResults.some(r => r.rarity === 5);
    const n = lastResults.length >= 10 ? (hadFive ? 12 : 8) : (hadFive ? 6 : 3);
    const cols = [ACCENT, GOLD, MAGENTA, CYAN, PURPLE];
    const burst = Array.from({ length: n }).map(() => ({ id: fwIdRef.current++, x: 10 + Math.random() * 80, y: 10 + Math.random() * 50, color: cols[Math.floor(Math.random() * cols.length)] }));
    setFw(p => [...p, ...burst]);
    const t = setTimeout(() => setFw(p => p.filter(f => !burst.includes(f))), 1500);
    return () => clearTimeout(t);
  }, [eng.pullBurstKey, lastResults]);

  const box = state.boxRemaining;
  const remG = box ? box.filter(u => u.rarity === 5).length : 5;
  const remP = box ? box.filter(u => u.rarity === 4).length : 20;
  const remN = box ? box.filter(u => u.rarity === 3).length : 65;
  const remaining = box ? box.length : 90;
  const pulled = 90 - remaining;
  const nextFive = remaining > 0 ? (remG / remaining) * 100 : 0;
  const snap = snapRef.current ?? { gold: 5, purple: 20, grey: 65 };
  const depG = snap.gold - remG, depP = snap.purple - remP, depN = snap.grey - remN;

  const slots = useMemo(() => {
    const arr: { rarity: 3 | 4 | 5; idx: number; featured?: number }[] = [];
    const featCount = Math.min(snap.gold, featured.five.length * 2);
    for (let i = 0; i < snap.gold; i++) arr.push({ rarity: 5, idx: i, featured: i < featCount ? (i % Math.max(1, featured.five.length)) : undefined });
    for (let i = 0; i < snap.purple; i++) arr.push({ rarity: 4, idx: i });
    for (let i = 0; i < snap.grey; i++) arr.push({ rarity: 3, idx: i });
    while (arr.length < 90) arr.push({ rarity: 3, idx: arr.length });
    return arr.slice(0, 90);
  }, [snap.gold, snap.purple, snap.grey, featured.five.length]);

  const isDep = (s: { rarity: 3 | 4 | 5; idx: number }) =>
    s.rarity === 5 ? s.idx >= snap.gold - depG
    : s.rarity === 4 ? s.idx >= snap.purple - depP
    : s.idx >= snap.grey - depN;

  const usesShards = ['shards', 'shards_pity', 'full_suite'].includes(combo.guarantee.id);

  return (
    <div className="page">
      <style>{KF}</style>
      <Link to="/" className="back-link" style={{ color: ACCENT }}>← Back to dashboard</Link>
      <header className="page-header" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 30, background: `linear-gradient(90deg, ${ACCENT}, ${GOLD}, ${CYAN}, ${ACCENT})`, backgroundSize: '300% 100%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'fbox-shimmer 4s linear infinite' }}>Festival Grand Chest</h1>
          <span style={{ padding: '3px 10px', background: `linear-gradient(90deg, ${MAGENTA}, ${ACCENT})`, color: '#1f0a14', borderRadius: 12, fontSize: 11, fontWeight: 700, letterSpacing: 0.05, boxShadow: `0 0 12px ${ACCENT}66` }}>FESTIVAL · ends in 3d 14h</span>
        </div>
        <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Anniversary-scale box · {combo.banner.name} · {combo.guarantee.name} · doubled rates</p>
      </header>

      <VariantBar variants={variants} current={combo.slug} onPick={(s) => navigate(`/play/${s}`)} />

      <div className="player-shell">
        <div className="player-main" style={{
          position: 'relative',
          background: 'linear-gradient(165deg, #2a1a2e 0%, #1a1422 50%, #221628 100%)',
          border: `1px solid ${ACCENT}55`,
          boxShadow: `0 0 0 1px ${ACCENT}22, 0 24px 60px -12px ${ACCENT}33, inset 0 0 60px rgba(255,159,213,0.05)`,
          borderRadius: 10, padding: 22, overflow: 'hidden',
        }}>
          <StringLights />

          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
            {fw.map(f => <Firework key={f.id} x={f.x} y={f.y} color={f.color} />)}
          </div>

          <div style={{ position: 'relative', zIndex: 3 }}>
            <div style={{ marginBottom: 14, padding: '12px 16px', background: 'rgba(255,159,213,0.08)', borderLeft: `3px solid ${ACCENT}`, borderRadius: 4, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55 }}>
              Festival-scale box. Doubled rates, 2+ featured 5★s in the finite pool. Every pull is guaranteed progress toward something special.
            </div>

            {featured.five.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.12, color: ACCENT, marginBottom: 8, fontWeight: 600 }}>Festival headliners · {featured.five.length} featured 5★</div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(2, featured.five.length)}, 1fr)`, gap: 10 }}>
                  {featured.five.map((u, i) => (
                    <div key={u.id} style={{
                      position: 'relative', padding: '14px 16px', borderRadius: 10,
                      background: `linear-gradient(135deg, ${u.color} 0%, ${u.color}aa 100%)`,
                      border: `2px solid ${GOLD}`,
                      boxShadow: `0 0 20px ${u.color}88, inset 0 0 20px rgba(255,255,255,0.15)`,
                      color: '#0f0e13', fontWeight: 700,
                      animation: 'fbox-float 3s ease-in-out infinite', animationDelay: `${i * 0.4}s`,
                    }}>
                      <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.1, opacity: 0.6, marginBottom: 2 }}>★5 Featured</div>
                      <div style={{ fontSize: 17 }}>{u.name}</div>
                      <div style={{ position: 'absolute', top: 6, right: 10, fontSize: 10, fontWeight: 800, color: GOLD, textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>×2 slots</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
              <Stat label="Remaining" value={`${remaining}/90`} color={ACCENT} />
              <Stat label="Pulled" value={`${pulled}`} color="#dcd0e4" />
              <Stat label="Next 5★" value={`${nextFive.toFixed(2)}%`} color={GOLD} />
              <Stat label="5★ left" value={`${remG}`} color={GOLD} />
            </div>

            <div style={{ marginBottom: 16, padding: 10, background: 'rgba(0,0,0,0.3)', border: `1px solid ${ACCENT}55`, borderRadius: 8, boxShadow: 'inset 0 0 20px rgba(255,159,213,0.08)' }}>
              <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.1, color: 'var(--text-muted)', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                <span>Grand chest inventory</span>
                <span style={{ color: ACCENT }}>★ = featured · gold = 5★ · purple = 4★ · grey = 3★</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: 3 }}>
                {slots.map((s, i) => {
                  const dep = isDep(s);
                  const baseColor = s.rarity === 5 ? GOLD : s.rarity === 4 ? PURPLE : '#6E7582';
                  const color = s.featured !== undefined && featured.five[s.featured] ? featured.five[s.featured].color : baseColor;
                  const fF = s.featured !== undefined;
                  return (
                    <div key={i} style={{
                      aspectRatio: '1 / 1', borderRadius: 3, position: 'relative',
                      background: dep ? 'rgba(30,20,35,0.65)' : color,
                      boxShadow: dep ? 'inset 0 0 0 1px rgba(0,0,0,0.45)' : fF ? `inset 0 0 0 1.5px ${GOLD}, 0 0 8px ${color}88` : `inset 0 0 0 1px rgba(0,0,0,0.3), 0 0 4px ${color}44`,
                      opacity: dep ? 0.4 : 1,
                      transition: 'background 260ms, opacity 260ms',
                    }}>
                      {fF && !dep && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: GOLD, fontWeight: 900, animation: 'fbox-pulse 1.8s ease-in-out infinite' }}>★</div>}
                      {dep && <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#888', opacity: 0.7 }}>·</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12, padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${ACCENT}33`, borderRadius: 6 }}>
              <Pip label="Free" value={state.freeCurrency.toLocaleString()} color={ACCENT} />
              <Pip label="Pulls" value={state.totalPulls} color="#dcd0e4" />
              <Pip label="5★" value={state.fiveStarCount} color={GOLD} />
              <Pip label="Featured" value={state.featuredObtained} color={MAGENTA} />
              {usesShards && <Pip label="Shards" value={`${state.shards}/${state.shardsNeededForFive}`} color={CYAN} />}
            </div>

            <div className="pull-row" style={{ gap: 8, flexWrap: 'wrap' }}>
              <Btn disabled={!eng.canPull1} onClick={eng.pull1}>Pull 1 · {eng.pullCost}</Btn>
              <Btn primary disabled={!eng.canPull10} onClick={eng.pull10}>Pull 10 · {(eng.pullCost * 10).toLocaleString()}</Btn>
              {usesShards && <Btn disabled={!eng.canShards} onClick={eng.shards}>Craft ({state.shards}/{state.shardsNeededForFive})</Btn>}
              <Btn onClick={() => eng.addFunds()}>+ Funds</Btn>
              <Btn onClick={() => { snapRef.current = null; eng.reset(); }}>Reset</Btn>
            </div>

            <div key={eng.pullBurstKey} style={{ marginTop: 16 }}>
              {lastResults.length === 0 ? (
                <div style={{ padding: 20, color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>The festival awaits. Light the chest with your first pull.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
                  {lastResults.map((r, i) => <FCard key={i} rarity={r.rarity} name={r.unit.name} color={r.unit.color} rateUpHit={!!r.rateUpHit} delay={i * 55} />)}
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="player-meta">
          <div className="meta-card">
            <h3 style={{ color: ACCENT }}>Festival composition</h3>
            <div className="detail-list">
              <div className="kv"><span>Pool</span><b>90 slots</b></div>
              <div className="kv"><span>Featured 5★</span><b style={{ color: GOLD }}>{featured.five.length}</b></div>
              <div className="kv"><span>Gold (5★)</span><b style={{ color: GOLD }}>{snap.gold}</b></div>
              <div className="kv"><span>Purple (4★)</span><b style={{ color: PURPLE }}>{snap.purple}</b></div>
              <div className="kv"><span>Grey (3★)</span><b>{snap.grey}</b></div>
            </div>
            <div style={{ marginTop: 10, padding: 8, background: `${ACCENT}15`, borderRadius: 4, fontSize: 11.5 }}>
              Next 5★ chance: <b style={{ color: GOLD }}>{nextFive.toFixed(2)}%</b>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, nextFive * 4)}%`, background: `linear-gradient(90deg, ${ACCENT}, ${GOLD})`, transition: 'width 400ms' }} />
              </div>
            </div>
          </div>

          <div className="meta-card">
            <h3 style={{ color: ACCENT }}>History · {state.history.length}</h3>
            {state.history.length === 0 ? (
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-subtle)' }}>No pulls yet.</p>
            ) : (
              <div className="history-log">
                {state.history.slice(-25).reverse().map((h, i) => (
                  <div key={state.history.length - i} className={`entry r${h.rarity}`}>
                    #{state.history.length - i} · ★{h.rarity} {h.unit.name}{h.rateUpHit && ' · featured'}
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

function Firework({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <div style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: 2, height: 2 }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute', left: 0, top: 0, width: 3, height: 40,
          transformOrigin: 'center top',
          transform: `rotate(${(i * 360) / 10}deg)`,
          background: `linear-gradient(to bottom, ${color}, transparent)`,
          animation: 'fbox-spoke 1.4s ease-out forwards',
          boxShadow: `0 0 8px ${color}`,
        }} />
      ))}
      <div style={{ position: 'absolute', left: -8, top: -8, width: 16, height: 16, borderRadius: '50%', background: `radial-gradient(circle, ${color} 0%, transparent 70%)`, animation: 'fbox-core 1.4s ease-out forwards' }} />
    </div>
  );
}

function StringLights() {
  const lights = Array.from({ length: 18 }).map((_, i) => ({ left: (i / 17) * 100, color: [ACCENT, GOLD, CYAN, MAGENTA, PURPLE][i % 5] }));
  return (
    <div style={{ position: 'absolute', top: 6, left: 0, right: 0, pointerEvents: 'none', zIndex: 1, height: 24 }}>
      <svg width="100%" height="16" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0 }}>
        <path d="M0 2 Q 25% 14, 50% 4 T 100% 2" stroke="rgba(255,255,255,0.25)" strokeWidth="1" fill="none" />
      </svg>
      {lights.map((l, i) => (
        <div key={i} style={{
          position: 'absolute', top: 4 + Math.sin((l.left / 100) * Math.PI * 2) * 4,
          left: `${l.left}%`, width: 7, height: 7, borderRadius: '50%',
          background: l.color, boxShadow: `0 0 8px ${l.color}, 0 0 16px ${l.color}88`,
          transform: 'translateX(-50%)', animation: 'fbox-twinkle 1.6s ease-in-out infinite',
          animationDelay: `${(i % 7) * 0.2}s`,
        }} />
      ))}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.35)', border: `1px solid ${color}33`, borderRadius: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.1, color: 'var(--text-muted)' }}>{label}</span>
      <b style={{ color, fontSize: 16 }}>{value}</b>
    </div>
  );
}

function Pip({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.1, color: 'var(--text-muted)' }}>{label}</span>
      <b style={{ color }}>{value}</b>
    </div>
  );
}

function Btn({ children, onClick, disabled, primary }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; primary?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '9px 16px',
      background: primary ? `linear-gradient(90deg, ${MAGENTA} 0%, ${ACCENT} 100%)` : 'rgba(255,159,213,0.08)',
      color: primary ? '#1f0a14' : ACCENT,
      border: primary ? `1px solid ${GOLD}` : `1px solid ${ACCENT}55`,
      borderRadius: 6, fontWeight: 600, fontSize: 12.5,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1,
      boxShadow: primary ? `0 0 16px ${ACCENT}66` : 'none',
    }}>{children}</button>
  );
}

function FCard({ rarity, name, color, rateUpHit, delay }: { rarity: number; name: string; color: string; rateUpHit: boolean; delay: number }) {
  const bg = rarity === 5 ? `linear-gradient(135deg, ${color} 0%, ${GOLD} 100%)` : rarity === 4 ? `linear-gradient(135deg, ${color} 0%, ${PURPLE} 100%)` : `linear-gradient(135deg, ${color} 0%, #4a4a54 100%)`;
  return (
    <div style={{
      position: 'relative', aspectRatio: '4 / 5', borderRadius: 8, background: bg,
      border: rarity === 5 ? `2px solid ${GOLD}` : rarity === 4 ? `1px solid ${PURPLE}` : '1px solid rgba(255,255,255,0.1)',
      boxShadow: rarity === 5 ? `0 0 18px ${color}aa, 0 0 36px ${GOLD}55` : '0 2px 8px rgba(0,0,0,0.4)',
      padding: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      animation: 'fbox-pop 420ms ease-out both', animationDelay: `${delay}ms`, overflow: 'hidden',
    }}>
      {rarity === 5 && (
        <>
          <div style={{ position: 'absolute', inset: 0, background: 'conic-gradient(from 45deg, transparent 0deg, rgba(255,255,255,0.3) 90deg, transparent 180deg, rgba(255,255,255,0.3) 270deg, transparent 360deg)', animation: 'fbox-spin 5s linear infinite', mixBlendMode: 'overlay' }} />
          {rateUpHit && <div style={{ position: 'absolute', top: 6, right: 6, padding: '1px 6px', background: GOLD, color: '#1f0a14', borderRadius: 10, fontSize: 9, fontWeight: 800 }}>FEATURED</div>}
        </>
      )}
      <div style={{ fontSize: 12, fontWeight: 700, color: '#0f0e13' }}>★{rarity}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f0e13', position: 'relative' }}>{name}</div>
    </div>
  );
}

function VariantBar({ variants, current, onPick }: { variants: Combo[]; current: string; onPick: (slug: string) => void }) {
  const cur = variants.find(v => v.slug === current)!;
  const guarantees = Array.from(new Set(variants.map(v => v.guarantee.id)));
  const currencies = Array.from(new Set(variants.filter(v => v.guarantee.id === cur.guarantee.id).map(v => v.currency.id)));
  const Chip = ({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) => (
    <button onClick={onClick} style={{ padding: '4px 10px', fontSize: 11.5, background: active ? ACCENT : 'transparent', color: active ? '#1f0a14' : ACCENT, border: `1px solid ${active ? ACCENT : ACCENT + '55'}`, borderRadius: 4, cursor: 'pointer' }}>{children}</button>
  );
  return (
    <div style={{ marginBottom: 14, padding: 10, background: 'rgba(255,159,213,0.05)', border: `1px solid ${ACCENT}33`, borderRadius: 6, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
      {guarantees.length > 1 && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.08, color: 'var(--text-muted)' }}>Guarantee</span>
          {guarantees.map(g => { const m = variants.find(v => v.guarantee.id === g)!; return <Chip key={g} active={cur.guarantee.id === g} onClick={() => onPick(m.slug)}>{m.guarantee.name}</Chip>; })}
        </div>
      )}
      {currencies.length > 1 && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.08, color: 'var(--text-muted)' }}>Currency</span>
          {currencies.map(c => { const m = variants.find(v => v.guarantee.id === cur.guarantee.id && v.currency.id === c)!; return <Chip key={c} active={cur.currency.id === c} onClick={() => onPick(m.slug)}>{m.currency.name}</Chip>; })}
        </div>
      )}
    </div>
  );
}

const KF = `
@keyframes fbox-shimmer { 0%{background-position:0% 50%}100%{background-position:300% 50%} }
@keyframes fbox-float { 0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)} }
@keyframes fbox-pulse { 0%,100%{opacity:.5;transform:scale(.9)}50%{opacity:1;transform:scale(1.1)} }
@keyframes fbox-twinkle { 0%,100%{opacity:.6;transform:translateX(-50%) scale(1)}50%{opacity:1;transform:translateX(-50%) scale(1.2)} }
@keyframes fbox-pop { 0%{transform:scale(.5) translateY(10px);opacity:0}100%{transform:scale(1) translateY(0);opacity:1} }
@keyframes fbox-spoke { 0%{transform:rotate(var(--r,0deg)) scaleY(0);opacity:1}100%{transform:rotate(var(--r,0deg)) scaleY(1) translateY(-20px);opacity:0} }
@keyframes fbox-core { 0%{transform:scale(.4);opacity:1}100%{transform:scale(3);opacity:0} }
@keyframes fbox-spin { 0%{transform:rotate(0deg)}100%{transform:rotate(360deg)} }
`;
