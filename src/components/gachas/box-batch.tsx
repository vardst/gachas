// HAND-CRAFTED: Box + Batch floor — the Dragalia-adjacent honest design.
// Muted, clean. Batch-floor callout every 10 pulls. Box depletes visibly.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { featuredFor } from '../../data/roster';
import { useGachaEngine } from '../../lib/useGachaEngine';
import type { Combo } from '../../data/primitives';

const ACCENT = '#a0d468';
const MUTED = '#8a9a80';
const TEXT = '#e8efe0';
const DIM = '#7f8678';
const PANEL = '#181c15';
const PANEL_D = '#12150f';
const BORDER = '#2a3021';
const BG = '#0d100a';
const GOLD = '#d4b45f';
const PURPLE = '#8A6FD4';

export default function BoxBatch({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const variants = combosForType('box-batch');
  const combo = useMemo(() => variants.find(c => c.slug === slug) ?? variants[0], [variants, slug]);
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;
  const featured = featuredFor(combo.banner.id);

  const snap = useRef<{ gold: number; purple: number; grey: number } | null>(null);
  useEffect(() => {
    if (state.boxRemaining && !snap.current) {
      const g = state.boxRemaining.filter(u => u.rarity === 5).length + lastResults.filter(r => r.rarity === 5).length;
      const p = state.boxRemaining.filter(u => u.rarity === 4).length + lastResults.filter(r => r.rarity === 4).length;
      const y = state.boxRemaining.filter(u => u.rarity === 3).length + lastResults.filter(r => r.rarity === 3).length;
      snap.current = { gold: g, purple: p, grey: y };
    }
  }, [state.boxRemaining, lastResults]);

  const [celebrate, setCelebrate] = useState(false);
  useEffect(() => {
    if (lastResults.some(r => r.batchFloor)) {
      setCelebrate(true);
      const t = setTimeout(() => setCelebrate(false), 1600);
      return () => clearTimeout(t);
    }
  }, [lastResults, eng.pullBurstKey]);

  const box = state.boxRemaining;
  const iG = snap.current?.gold ?? 3, iP = snap.current?.purple ?? 17, iY = snap.current?.grey ?? 70;
  const rG = box ? box.filter(u => u.rarity === 5).length : iG;
  const rP = box ? box.filter(u => u.rarity === 4).length : iP;
  const rY = box ? box.filter(u => u.rarity === 3).length : iY;
  const rem = box ? box.length : 90;
  const pulled = 90 - rem;
  const p5 = rem > 0 ? (rG / rem) * 100 : 0;

  const slots = useMemo(() => {
    const arr: Array<3 | 4 | 5> = [];
    for (let i = 0; i < iG; i++) arr.push(5);
    for (let i = 0; i < iP; i++) arr.push(4);
    for (let i = 0; i < iY; i++) arr.push(3);
    while (arr.length < 90) arr.push(3);
    return arr.slice(0, 90);
  }, [iG, iP, iY]);
  const dG = iG - rG, dP = iP - rP, dY = iY - rY;
  function dep(i: number, r: 3 | 4 | 5): boolean {
    let c = 0;
    for (let k = 0; k <= i; k++) if (slots[k] === r) c++;
    if (r === 5) return c > iG - dG;
    if (r === 4) return c > iP - dP;
    return c > iY - dY;
  }

  const since = state.pullsSinceBatchFloor;
  const until = Math.max(0, 10 - since);

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT, fontFamily: '"Inter", system-ui, sans-serif', padding: '28px 24px 60px' }}>
      <style>{KF}</style>
      <Link to="/" style={{ color: MUTED, textDecoration: 'none', fontSize: 12.5 }}>← back to dashboard</Link>

      <header style={{ marginTop: 14, marginBottom: 22, borderBottom: `1px solid ${BORDER}`, paddingBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 6, height: 22, background: ACCENT, borderRadius: 2 }} />
          <h1 style={{ margin: 0, fontSize: 22, color: TEXT, fontWeight: 600 }}>Box Banner <span style={{ color: ACCENT }}>·</span> Batch Floor</h1>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: MUTED, lineHeight: 1.45, maxWidth: 640 }}>
          Finite 90-unit pool, drawn without replacement. Every 10-pull guarantees at least one ★4 or better.
          Nothing more, nothing less. The box depletes. The math is simple.
        </p>
      </header>

      <VariantBar variants={variants} current={combo.slug} onPick={(s) => navigate(`/play/${s}`)} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: 20, alignItems: 'start' }}>
        <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 22 }}>
          {featured.five.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.1, color: DIM, marginBottom: 6 }}>In this box</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {featured.five.map(u => (
                  <span key={u.id} style={{ padding: '4px 10px', borderRadius: 14, background: `${u.color}22`, color: u.color, border: `1px solid ${u.color}55`, fontSize: 12 }}>★5 {u.name}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 16, padding: '12px 14px', background: celebrate ? `${ACCENT}22` : PANEL_D, border: `1px solid ${celebrate ? ACCENT : BORDER}`, borderRadius: 6, transition: 'all 300ms' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 12, color: ACCENT, fontWeight: 600 }}>10-pull batch floor</div>
              <div style={{ fontSize: 11.5, color: MUTED }}>
                {until === 0 ? 'Next pull is the floor' : `${until} pull${until === 1 ? '' : 's'} until floor`}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4 }}>
              {Array.from({ length: 10 }).map((_, i) => {
                const f = i < since, last = i === 9;
                return <div key={i} style={{ height: 10, borderRadius: 2, background: f ? ACCENT : PANEL_D, border: `1px solid ${last ? ACCENT : BORDER}`, opacity: f ? 1 : last ? 0.9 : 0.5, transition: 'background 220ms' }} />;
              })}
            </div>
            <div style={{ marginTop: 8, fontSize: 11.5, color: MUTED, lineHeight: 1.4 }}>
              Each 10-pull guarantees at least one ★4+. Since a Box draws without replacement, the floor also trims the grey tail of the pool faster — a benign interaction.
            </div>
            {celebrate && <div style={{ marginTop: 8, fontSize: 11.5, color: ACCENT, fontWeight: 600 }}>✓ Batch floor triggered</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
            <Tile label="Remaining" value={`${rem}/90`} accent={ACCENT} />
            <Tile label="Pulled" value={pulled} accent={TEXT} />
            <Tile label="★5 left" value={`${rG}`} accent={GOLD} />
            <Tile label="P(★5)" value={`${p5.toFixed(2)}%`} accent={GOLD} />
          </div>

          <div style={{ marginBottom: 14, padding: 12, background: PANEL_D, border: `1px solid ${BORDER}`, borderRadius: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.1, color: DIM }}>
              <span>Pool · {rem} of 90 left</span>
              <span><Sw c={GOLD} />★5 <Sw c={PURPLE} />★4 <Sw c="#4a5040" />★3</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: 3 }}>
              {slots.map((r, i) => {
                const d = dep(i, r);
                const c = r === 5 ? GOLD : r === 4 ? PURPLE : '#4a5040';
                return (
                  <div key={i} style={{ aspectRatio: '1 / 1', minWidth: 20, borderRadius: 3, background: d ? 'transparent' : c, border: `1px solid ${d ? BORDER : 'rgba(0,0,0,0.25)'}`, opacity: d ? 0.35 : 1, position: 'relative', transition: 'all 260ms', boxShadow: d ? 'none' : `inset 0 1px 0 rgba(255,255,255,0.15)` }}>
                    {d && <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: DIM, fontSize: 10 }}>—</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '10px 14px', marginBottom: 12, background: PANEL_D, border: `1px solid ${BORDER}`, borderRadius: 6 }}>
            <S label="Funds" value={state.freeCurrency.toLocaleString()} color={ACCENT} />
            <S label="Pulls" value={state.totalPulls} color={TEXT} />
            <S label="★5" value={state.fiveStarCount} color={GOLD} />
            <S label="★4" value={state.history.filter(h => h.rarity === 4).length} color={PURPLE} />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Btn disabled={!eng.canPull1} onClick={eng.pull1}>Pull 1 · {eng.pullCost}</Btn>
            <Btn primary disabled={!eng.canPull10} onClick={eng.pull10}>Pull 10 · {(eng.pullCost * 10).toLocaleString()}</Btn>
            <Btn onClick={() => eng.addFunds()}>+ Funds</Btn>
            <Btn onClick={() => { eng.reset(); snap.current = null; }}>Reset</Btn>
          </div>

          <div key={eng.pullBurstKey} style={{ marginTop: 18, position: 'relative' }}>
            {celebrate && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(circle at center, ${ACCENT}33, transparent 70%)`, animation: 'bg 1.2s ease-out' }} />}
            {lastResults.length === 0 ? (
              <div style={{ padding: 20, fontSize: 13, color: DIM, textAlign: 'center', border: `1px dashed ${BORDER}`, borderRadius: 6 }}>
                The box is sealed. Pull to crack it open.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(118px, 1fr))', gap: 8 }}>
                {lastResults.map((r, i) => {
                  const ring = r.rarity === 5 ? GOLD : r.rarity === 4 ? PURPLE : '#4a5040';
                  return (
                    <div key={i} style={{ position: 'relative', aspectRatio: '4 / 5', borderRadius: 6, background: `linear-gradient(180deg, ${r.unit.color}44 0%, ${PANEL_D} 100%)`, border: `1px solid ${ring}`, padding: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', animation: 'bp 380ms ease-out both', animationDelay: `${i * 45}ms` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 11, color: ring, fontWeight: 700 }}>★{r.rarity}</span>
                        {r.batchFloor && <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 10, background: ACCENT, color: '#0f1a08', fontWeight: 700, letterSpacing: 0.04 }}>FLOOR</span>}
                      </div>
                      <div style={{ fontSize: 13, color: TEXT }}>{r.unit.name}</div>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ flex: 1, height: 6, background: PANEL_D, border: `1px solid ${BORDER}`, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(since / 10) * 100}%`, background: ACCENT, transition: 'width 340ms' }} />
              </div>
              <span style={{ fontSize: 11, color: DIM }}>{since} / 10 toward floor</span>
            </div>
          </div>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card title="Pool composition">
            <R label="Total slots" value="90" color={TEXT} />
            <R label="★5 initial" value={iG} color={GOLD} />
            <R label="★4 initial" value={iP} color={PURPLE} />
            <R label="★3 initial" value={iY} color={DIM} />
            <div style={{ height: 1, background: BORDER, margin: '6px 0' }} />
            <R label="★5 remaining" value={`${rG}/${iG}`} color={GOLD} />
            <R label="★4 remaining" value={`${rP}/${iP}`} color={PURPLE} />
            <R label="★3 remaining" value={`${rY}/${iY}`} color={DIM} />
          </Card>
          <Card title="Design notes">
            <p style={{ margin: 0, fontSize: 11.5, color: MUTED, lineHeight: 1.55 }}>
              Batch-floor on a box is a kind honesty — bounded whale spend plus a rhythmic minimum. Dragalia did this for its signature box.
            </p>
            {combo.example && <div style={{ marginTop: 8, padding: 8, background: PANEL_D, borderRadius: 4, fontSize: 11, color: DIM, border: `1px solid ${BORDER}` }}>{combo.example}</div>}
          </Card>
          <Card title={`History · ${state.history.length}`}>
            {state.history.length === 0 ? <p style={{ margin: 0, fontSize: 11.5, color: DIM }}>No pulls yet.</p> : (
              <div style={{ maxHeight: 220, overflowY: 'auto', fontSize: 11.5 }}>
                {state.history.slice(-25).reverse().map((h, i) => {
                  const c = h.rarity === 5 ? GOLD : h.rarity === 4 ? PURPLE : DIM;
                  return (
                    <div key={state.history.length - i} style={{ padding: '3px 0', borderBottom: `1px dashed ${BORDER}`, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: DIM }}>#{state.history.length - i}</span>
                      <span style={{ color: c }}>★{h.rarity} {h.unit.name}{h.batchFloor ? ' · floor' : ''}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Tile({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return <div style={{ padding: '10px 12px', borderRadius: 6, background: PANEL_D, border: `1px solid ${BORDER}` }}><span style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.08, color: DIM }}>{label}</span><div style={{ color: accent, fontSize: 18, fontWeight: 600 }}>{value}</div></div>;
}
function S({ label, value, color }: { label: string; value: string | number; color: string }) {
  return <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}><span style={{ fontSize: 10.5, color: DIM, textTransform: 'uppercase', letterSpacing: 0.08 }}>{label}</span><b style={{ color, fontSize: 14 }}>{value}</b></div>;
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 14 }}><h3 style={{ margin: '0 0 10px', color: ACCENT, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.1 }}>{title}</h3>{children}</div>;
}
function R({ label, value, color }: { label: string; value: string | number; color: string }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, padding: '3px 0' }}><span style={{ color: DIM }}>{label}</span><b style={{ color, fontWeight: 500 }}>{value}</b></div>;
}
function Btn({ children, onClick, disabled, primary }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; primary?: boolean }) {
  return <button onClick={onClick} disabled={disabled} style={{ padding: '9px 16px', fontSize: 12.5, fontWeight: 500, background: primary ? ACCENT : 'transparent', color: primary ? '#0f1a08' : ACCENT, border: `1px solid ${primary ? ACCENT : BORDER}`, borderRadius: 5, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1 }}>{children}</button>;
}
function Sw({ c }: { c: string }) {
  return <span style={{ display: 'inline-block', width: 9, height: 9, background: c, verticalAlign: 'middle', marginRight: 3, marginLeft: 6, borderRadius: 2 }} />;
}
function VariantBar({ variants, current, onPick }: { variants: Combo[]; current: string; onPick: (slug: string) => void }) {
  const cur = variants.find(v => v.slug === current)!;
  const banners = Array.from(new Set(variants.map(v => v.banner.id)));
  const curr = Array.from(new Set(variants.filter(v => v.banner.id === cur.banner.id).map(v => v.currency.id)));
  return (
    <div style={{ marginBottom: 16, padding: 10, background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 6, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
      {banners.length > 1 && <Group label="Banner">{banners.map(b => { const m = variants.find(v => v.banner.id === b)!; return <Chip key={b} active={cur.banner.id === b} onClick={() => onPick(m.slug)}>{m.banner.name}</Chip>; })}</Group>}
      {curr.length > 1 && <Group label="Currency">{curr.map(c => { const m = variants.find(v => v.banner.id === cur.banner.id && v.currency.id === c)!; return <Chip key={c} active={cur.currency.id === c} onClick={() => onPick(m.slug)}>{m.currency.name}</Chip>; })}</Group>}
    </div>
  );
}
function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><span style={{ fontSize: 10.5, textTransform: 'uppercase', color: DIM, letterSpacing: 0.08 }}>{label}</span>{children}</div>;
}
function Chip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return <button onClick={onClick} style={{ padding: '3px 10px', fontSize: 11.5, background: active ? ACCENT : 'transparent', color: active ? '#0f1a08' : MUTED, border: `1px solid ${active ? ACCENT : BORDER}`, borderRadius: 4, cursor: 'pointer' }}>{children}</button>;
}
const KF = `
@keyframes bp { 0% { transform: translateY(10px) scale(0.96); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
@keyframes bg { 0% { opacity: 0; } 30% { opacity: 1; } 100% { opacity: 0; } }
`;
