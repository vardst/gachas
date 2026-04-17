// HAND-CRAFTED: Box + Pity — NOVEL: pity on a box is unusual.
// Experimental UI: dashed borders, "EXPERIMENTAL" chip, graph-paper aesthetic.
import { useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { featuredFor } from '../../data/roster';
import { useGachaEngine } from '../../lib/useGachaEngine';
import type { Combo } from '../../data/primitives';

const ACCENT = '#8f7cd4';
const ACCENT_B = '#b8a8ff';
const TEXT = '#e9e4f5';
const DIM = '#9b94b3';
const SUB = '#6f6788';
const PANEL = '#181525';
const PANEL_D = '#11101c';
const DASH = '#4a3f78';
const GRID = '#211d38';
const BG = '#0c0b18';
const GOLD = '#E8B84A';
const PURPLE = '#a087e8';
const WARN = '#e8a04a';

export default function BoxPity({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const variants = combosForType('box-pity');
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

  const pityPct = (state.pullsSinceFiveStar / state.hardPityAt) * 100;
  const soft = state.pullsSinceFiveStar >= state.softPityStart;
  const useRateUp = ['pity_5050', 'pity_7030', 'radiance'].includes(combo.guarantee.id);

  return (
    <div style={{
      minHeight: '100vh',
      background: `${BG} repeating-linear-gradient(0deg, transparent 0 39px, ${GRID} 39px 40px), ${BG} repeating-linear-gradient(90deg, transparent 0 39px, ${GRID} 39px 40px)`,
      color: TEXT, fontFamily: '"Space Grotesk", "Inter", sans-serif', padding: '28px 24px 60px',
    }}>
      <style>{KF}</style>
      <Link to="/" style={{ color: ACCENT, textDecoration: 'none', fontSize: 12.5 }}>← back to lab dashboard</Link>

      <header style={{ marginTop: 14, marginBottom: 22 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ padding: '3px 9px', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.2, textTransform: 'uppercase', background: 'transparent', border: `1.5px dashed ${ACCENT}`, color: ACCENT, borderRadius: 3, animation: 'pp 2.4s ease-in-out infinite' }}>
            Experimental · v0.3
          </span>
          <span style={{ fontSize: 10.5, color: SUB }}>sketch #BX-P-{combo.slug.slice(-8)}</span>
        </div>
        <h1 style={{ margin: 0, fontSize: 26, color: TEXT, fontWeight: 600 }}>
          Box <span style={{ color: ACCENT }}>×</span> Pity — <span style={{ color: DIM, fontWeight: 400 }}>does this even work?</span>
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: DIM, maxWidth: 640, lineHeight: 1.5 }}>
          Pity on a finite box is rarely shipped. The pool already guarantees depletion; piling pity on top doubles the safety net. We sketch it here to see how the two mechanics overlap.
        </p>
      </header>

      <VariantBar variants={variants} current={combo.slug} onPick={(s) => navigate(`/play/${s}`)} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 20, alignItems: 'start' }}>
        <div style={{ background: PANEL, border: `1.5px dashed ${DASH}`, borderRadius: 10, padding: 22 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            {/* PITY */}
            <div style={{ padding: 14, borderRadius: 8, background: PANEL_D, border: `1.5px dashed ${DASH}`, position: 'relative' }}>
              <Corner>PITY TRACK</Corner>
              <div style={{ fontSize: 11, color: DIM, marginBottom: 10 }}>Pulls since last ★5</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 36, fontWeight: 700, color: soft ? WARN : ACCENT, lineHeight: 1 }}>{state.pullsSinceFiveStar}</span>
                <span style={{ fontSize: 13, color: SUB }}>/ {state.hardPityAt}</span>
              </div>
              <div style={{ position: 'relative', height: 10, borderRadius: 3, background: PANEL, border: `1px dashed ${DASH}`, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ position: 'absolute', inset: 0, width: `${pityPct}%`, background: soft ? `linear-gradient(90deg, ${ACCENT} 0%, ${WARN} 100%)` : ACCENT, transition: 'width 320ms' }} />
                <div style={{ position: 'absolute', top: -3, bottom: -3, left: `${(state.softPityStart / state.hardPityAt) * 100}%`, width: 2, background: WARN }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: SUB }}>
                <span>soft @ {state.softPityStart}</span>
                <span>hard @ {state.hardPityAt}</span>
              </div>
              {soft && <div style={{ marginTop: 10, padding: '6px 9px', borderRadius: 4, background: `${WARN}22`, color: WARN, fontSize: 11.5, border: `1px dashed ${WARN}` }}>SOFT PITY ACTIVE · rate ramping</div>}
              {useRateUp && (
                <div style={{ marginTop: 10, fontSize: 11.5, color: state.carryOver ? '#8fd490' : SUB }}>
                  {state.carryOver ? '● carry-over armed' : '○ no carry-over'}
                </div>
              )}
            </div>
            {/* BOX */}
            <div style={{ padding: 14, borderRadius: 8, background: PANEL_D, border: `1.5px dashed ${DASH}`, position: 'relative' }}>
              <Corner>BOX STATE</Corner>
              <div style={{ fontSize: 11, color: DIM, marginBottom: 10 }}>Remaining in pool</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 36, fontWeight: 700, color: ACCENT, lineHeight: 1 }}>{rem}</span>
                <span style={{ fontSize: 13, color: SUB }}>/ 90</span>
              </div>
              <div style={{ position: 'relative', height: 10, borderRadius: 3, background: PANEL, border: `1px dashed ${DASH}`, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ position: 'absolute', inset: 0, width: `${(pulled / 90) * 100}%`, background: `linear-gradient(90deg, ${ACCENT} 0%, ${ACCENT_B} 100%)`, transition: 'width 320ms' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, fontSize: 10.5, color: SUB }}>
                <span><b style={{ color: GOLD }}>{rG}</b> ★5</span>
                <span><b style={{ color: PURPLE }}>{rP}</b> ★4</span>
                <span><b style={{ color: SUB }}>{rY}</b> ★3</span>
              </div>
              <div style={{ marginTop: 10, padding: '6px 9px', borderRadius: 4, background: PANEL, color: ACCENT_B, fontSize: 11.5, border: `1px dashed ${DASH}` }}>
                P(★5 next) = <b>{p5.toFixed(2)}%</b>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 14, padding: '10px 14px', background: `${ACCENT}14`, border: `1.5px dashed ${ACCENT}`, borderRadius: 6, fontSize: 12, color: TEXT, lineHeight: 1.5 }}>
            <span style={{ color: ACCENT_B, fontWeight: 600 }}>Note from the lab — </span>
            both systems bound the worst-case. On a fresh 90-slot box, hard pity at {state.hardPityAt} barely fires before the pool exhausts on its own. Which ceiling hits first depends on whether the box is refreshed.
          </div>

          {featured.five.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10.5, color: DIM, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.1 }}>Rate-up targets</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {featured.five.map(u => (
                  <span key={u.id} style={{ padding: '4px 10px', borderRadius: 14, background: `${u.color}22`, color: u.color, border: `1.5px dashed ${u.color}`, fontSize: 12 }}>★5 {u.name}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 14, padding: 12, background: PANEL_D, border: `1.5px dashed ${DASH}`, borderRadius: 8, position: 'relative' }}>
            <Corner>SLOT MAP · 90</Corner>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: 3, marginTop: 8 }}>
              {slots.map((r, i) => {
                const d = dep(i, r);
                const c = r === 5 ? GOLD : r === 4 ? PURPLE : '#3e3660';
                return (
                  <div key={i} style={{ aspectRatio: '1 / 1', minWidth: 20, borderRadius: 3, background: d ? 'transparent' : c, border: `1.5px dashed ${d ? DASH : 'rgba(0,0,0,0.3)'}`, opacity: d ? 0.4 : 1, position: 'relative', transition: 'all 260ms', boxShadow: d ? 'none' : `0 0 6px ${c}66` }}>
                    {d && <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: DASH }}>✕</span>}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 8, fontSize: 10.5, color: SUB, fontStyle: 'italic' }}>fig. 1 — depletion map; dashed = pulled</div>
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '10px 14px', marginBottom: 12, background: PANEL_D, border: `1.5px dashed ${DASH}`, borderRadius: 6 }}>
            <Pip label="Funds" value={state.freeCurrency.toLocaleString()} color={ACCENT} />
            <Pip label="Pulls" value={state.totalPulls} color={TEXT} />
            <Pip label="★5" value={state.fiveStarCount} color={GOLD} />
            <Pip label="Feat." value={state.featuredObtained} color={ACCENT_B} />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Btn disabled={!eng.canPull1} onClick={eng.pull1}>Pull 1 · {eng.pullCost}</Btn>
            <Btn primary disabled={!eng.canPull10} onClick={eng.pull10}>Pull 10 · {(eng.pullCost * 10).toLocaleString()}</Btn>
            <Btn onClick={() => eng.addFunds()}>+ Funds</Btn>
            <Btn onClick={() => { eng.reset(); snap.current = null; }}>Reset</Btn>
          </div>

          <div key={eng.pullBurstKey} style={{ marginTop: 18 }}>
            {lastResults.length === 0 ? (
              <div style={{ padding: 20, fontSize: 13, color: DIM, textAlign: 'center', border: `1.5px dashed ${DASH}`, borderRadius: 6 }}>
                no trials recorded. pull to begin the experiment.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
                {lastResults.map((r, i) => {
                  const ring = r.rarity === 5 ? GOLD : r.rarity === 4 ? PURPLE : DASH;
                  const flags: string[] = [];
                  if (r.hardPity) flags.push('hard');
                  if (r.softPity) flags.push('soft');
                  if (r.rateUpHit) flags.push('up');
                  return (
                    <div key={i} style={{ position: 'relative', aspectRatio: '4 / 5', borderRadius: 6, background: `linear-gradient(180deg, ${r.unit.color}44 0%, ${PANEL_D} 100%)`, border: `1.5px dashed ${ring}`, padding: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', animation: 'pop 420ms ease-out both', animationDelay: `${i * 45}ms` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 11, color: ring, fontWeight: 700 }}>★{r.rarity}</span>
                        {flags.length > 0 && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: ACCENT, color: '#1a1030', fontWeight: 700 }}>{flags.join(' · ')}</span>}
                      </div>
                      <div style={{ fontSize: 13, color: TEXT }}>{r.unit.name}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card title="Config">
            <R label="Pool size" value="90" color={TEXT} />
            <R label="Soft pity" value={state.softPityStart} color={WARN} />
            <R label="Hard pity" value={state.hardPityAt} color={ACCENT_B} />
            <R label="Guarantee" value={combo.guarantee.name} color={ACCENT} />
            <R label="Banner" value={combo.banner.name} color={DIM} />
          </Card>
          <Card title="Overlap diagram">
            <div style={{ fontSize: 11.5, color: DIM, lineHeight: 1.5, marginBottom: 10 }}>pulls to guaranteed ★5:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
              <Ov label="via box" value={`≤ ${90 - iG + 1}`} color={ACCENT} />
              <Ov label="via hard pity" value={`≤ ${state.hardPityAt}`} color={ACCENT_B} />
              <Ov label="tighter" value={`= ${Math.min(90 - iG + 1, state.hardPityAt)}`} color={GOLD} />
            </div>
            <div style={{ marginTop: 10, fontSize: 10.5, color: SUB, fontStyle: 'italic' }}>the box ceiling usually wins on a fresh pool.</div>
          </Card>
          <Card title={`Log · ${state.history.length}`}>
            {state.history.length === 0 ? <p style={{ margin: 0, fontSize: 11.5, color: DIM }}>empty.</p> : (
              <div style={{ maxHeight: 220, overflowY: 'auto', fontSize: 11.5 }}>
                {state.history.slice(-25).reverse().map((h, i) => {
                  const c = h.rarity === 5 ? GOLD : h.rarity === 4 ? PURPLE : DIM;
                  return (
                    <div key={state.history.length - i} style={{ padding: '3px 0', borderBottom: `1px dashed ${DASH}`, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: SUB }}>#{state.history.length - i}</span>
                      <span style={{ color: c }}>★{h.rarity} {h.unit.name}{h.softPity && ' · soft'}{h.hardPity && ' · hard'}{h.rateUpHit && ' · up'}</span>
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

function Corner({ children }: { children: React.ReactNode }) {
  return <span style={{ position: 'absolute', top: -9, left: 12, padding: '1px 8px', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.18, textTransform: 'uppercase', background: PANEL, color: ACCENT, border: `1.5px dashed ${DASH}`, borderRadius: 3 }}>{children}</span>;
}
function Pip({ label, value, color }: { label: string; value: string | number; color: string }) {
  return <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}><span style={{ fontSize: 10.5, color: DIM, textTransform: 'uppercase', letterSpacing: 0.08 }}>{label}</span><b style={{ color, fontSize: 14 }}>{value}</b></div>;
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div style={{ background: PANEL, border: `1.5px dashed ${DASH}`, borderRadius: 8, padding: 14, position: 'relative' }}><Corner>{title}</Corner><div style={{ marginTop: 4 }}>{children}</div></div>;
}
function R({ label, value, color }: { label: string; value: string | number; color: string }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, padding: '3px 0' }}><span style={{ color: DIM }}>{label}</span><b style={{ color, fontWeight: 500 }}>{value}</b></div>;
}
function Ov({ label, value, color }: { label: string; value: string; color: string }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: PANEL_D, border: `1px dashed ${DASH}`, borderRadius: 3 }}><span style={{ color: DIM }}>{label}</span><b style={{ color }}>{value}</b></div>;
}
function Btn({ children, onClick, disabled, primary }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; primary?: boolean }) {
  return <button onClick={onClick} disabled={disabled} style={{ padding: '9px 16px', fontSize: 12.5, fontWeight: 500, background: primary ? ACCENT : 'transparent', color: primary ? '#1a1030' : ACCENT, border: `1.5px dashed ${primary ? ACCENT : DASH}`, borderRadius: 5, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1 }}>{children}</button>;
}
function VariantBar({ variants, current, onPick }: { variants: Combo[]; current: string; onPick: (slug: string) => void }) {
  const cur = variants.find(v => v.slug === current)!;
  const banners = Array.from(new Set(variants.map(v => v.banner.id)));
  const gs = Array.from(new Set(variants.filter(v => v.banner.id === cur.banner.id).map(v => v.guarantee.id)));
  const curr = Array.from(new Set(variants.filter(v => v.banner.id === cur.banner.id && v.guarantee.id === cur.guarantee.id).map(v => v.currency.id)));
  return (
    <div style={{ marginBottom: 16, padding: 10, background: PANEL, border: `1.5px dashed ${DASH}`, borderRadius: 6, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
      {banners.length > 1 && <G label="Banner">{banners.map(b => { const m = variants.find(v => v.banner.id === b)!; return <Chip key={b} active={cur.banner.id === b} onClick={() => onPick(m.slug)}>{m.banner.name}</Chip>; })}</G>}
      {gs.length > 1 && <G label="Pity">{gs.map(g => { const m = variants.find(v => v.banner.id === cur.banner.id && v.guarantee.id === g)!; return <Chip key={g} active={cur.guarantee.id === g} onClick={() => onPick(m.slug)}>{m.guarantee.name}</Chip>; })}</G>}
      {curr.length > 1 && <G label="Currency">{curr.map(c => { const m = variants.find(v => v.banner.id === cur.banner.id && v.guarantee.id === cur.guarantee.id && v.currency.id === c)!; return <Chip key={c} active={cur.currency.id === c} onClick={() => onPick(m.slug)}>{m.currency.name}</Chip>; })}</G>}
    </div>
  );
}
function G({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><span style={{ fontSize: 10.5, textTransform: 'uppercase', color: DIM, letterSpacing: 0.08 }}>{label}</span>{children}</div>;
}
function Chip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return <button onClick={onClick} style={{ padding: '3px 10px', fontSize: 11.5, background: active ? ACCENT : 'transparent', color: active ? '#1a1030' : DIM, border: `1.5px dashed ${active ? ACCENT : DASH}`, borderRadius: 4, cursor: 'pointer' }}>{children}</button>;
}
const KF = `
@keyframes pp { 0%, 100% { opacity: 0.8; } 50% { opacity: 1; } }
@keyframes pop { 0% { transform: translateY(10px) rotate(-1deg); opacity: 0; } 100% { transform: translateY(0) rotate(0); opacity: 1; } }
`;
