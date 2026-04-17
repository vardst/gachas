// HAND-CRAFTED: Box + Pure RNG — brutal, scientific, clinical.
// Heavy red warnings. Shows odds shifting as the box depletes. No mitigation.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { featuredFor } from '../../data/roster';
import { useGachaEngine } from '../../lib/useGachaEngine';
import type { Combo } from '../../data/primitives';

const ACCENT = '#e36b6b';
const BG = '#0b0708';
const PANEL = '#140d0e';
const BORDER = '#3a1e20';
const TEXT = '#e9d8d7';
const DIM = '#a78384';
const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

export default function BoxPure({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const variants = combosForType('box-pure');
  const combo = useMemo(() => variants.find(c => c.slug === slug) ?? variants[0], [variants, slug]);
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;
  const featured = featuredFor(combo.banner.id);

  const snap = useRef<{ gold: number; purple: number; grey: number } | null>(null);
  const [flashKey, setFlashKey] = useState(0);
  useEffect(() => {
    if (state.boxRemaining && !snap.current) {
      const g = state.boxRemaining.filter(u => u.rarity === 5).length + lastResults.filter(r => r.rarity === 5).length;
      const p = state.boxRemaining.filter(u => u.rarity === 4).length + lastResults.filter(r => r.rarity === 4).length;
      const y = state.boxRemaining.filter(u => u.rarity === 3).length + lastResults.filter(r => r.rarity === 3).length;
      snap.current = { gold: g, purple: p, grey: y };
    }
  }, [state.boxRemaining, lastResults]);
  useEffect(() => { if (eng.pullBurstKey) setFlashKey(k => k + 1); }, [eng.pullBurstKey]);

  const box = state.boxRemaining;
  const iG = snap.current?.gold ?? 3, iP = snap.current?.purple ?? 17, iY = snap.current?.grey ?? 70;
  const rG = box ? box.filter(u => u.rarity === 5).length : iG;
  const rP = box ? box.filter(u => u.rarity === 4).length : iP;
  const rY = box ? box.filter(u => u.rarity === 3).length : iY;
  const rem = box ? box.length : 90;
  const pulled = 90 - rem;
  const p5 = rem > 0 ? (rG / rem) * 100 : 0;
  const p4 = rem > 0 ? (rP / rem) * 100 : 0;
  const exhausted = box && box.length === 0;

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

  return (
    <div style={{ minHeight: '100vh', background: `radial-gradient(ellipse at top, #1a0b0d 0%, ${BG} 60%)`, color: TEXT, fontFamily: MONO, padding: '28px 24px 60px' }}>
      <style>{KF}</style>
      <Link to="/" style={{ color: ACCENT, textDecoration: 'none', fontSize: 12, letterSpacing: 0.08, textTransform: 'uppercase' }}>← RETURN / ABORT</Link>

      <header style={{ marginTop: 16, marginBottom: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 0.25, color: DIM, textTransform: 'uppercase' }}>Specimen · {combo.slug}</div>
          <h1 style={{ margin: '4px 0 2px', color: ACCENT, fontSize: 28, letterSpacing: 0.02, textShadow: `0 0 18px ${ACCENT}55` }}>BOX / PURE RNG</h1>
          <p style={{ margin: 0, fontSize: 12, color: DIM }}>Finite pool · no pity · no batch floor · no spark · no shards</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <div style={{ padding: '6px 10px', border: `1px solid ${ACCENT}`, color: ACCENT, fontSize: 10, letterSpacing: 0.22, textTransform: 'uppercase', background: 'rgba(227,107,107,0.08)', animation: 'pw 1.6s ease-in-out infinite' }}>
            Player-hate risk · regulatory risk
          </div>
          <div style={{ fontSize: 10.5, color: DIM }}>No guarantees. Pool reset on exhaustion.</div>
        </div>
      </header>

      <VariantBar variants={variants} current={combo.slug} onPick={(s) => navigate(`/play/${s}`)} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 18, alignItems: 'start' }}>
        <div style={{ background: PANEL, border: `1px solid ${BORDER}`, padding: 22, position: 'relative', boxShadow: `0 0 40px -14px ${ACCENT}55` }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.08, background: 'repeating-linear-gradient(180deg, transparent 0 2px, rgba(227,107,107,0.4) 2px 3px)' }} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 18, position: 'relative' }}>
            <Metric label="REMAINING" value={`${rem}/90`} color={ACCENT} big />
            <Metric label="PULLED" value={pulled} color={TEXT} />
            <Metric label="5★ LEFT" value={`${rG}/${iG}`} color="#E8B84A" />
            <Metric label="P(5★)" value={`${p5.toFixed(2)}%`} color="#E8B84A" />
            <Metric label="P(4★)" value={`${p4.toFixed(2)}%`} color="#8A6FD4" />
          </div>

          {featured.five.length > 0 && (
            <div style={{ marginBottom: 14, padding: '8px 10px', border: `1px dashed ${BORDER}`, background: 'rgba(26,11,13,0.5)', fontSize: 11.5, color: DIM }}>
              <span style={{ color: ACCENT, marginRight: 8, textTransform: 'uppercase' }}>Target payload:</span>
              {featured.five.map(u => <span key={u.id} style={{ color: '#E8B84A', marginRight: 10 }}>★5 {u.name}</span>)}
            </div>
          )}

          <div key={flashKey} style={{ marginBottom: 14, padding: '10px 12px', background: '#1a0d0e', border: `1px solid ${BORDER}`, fontSize: 12, animation: 'pf 400ms ease-out' }}>
            <div style={{ fontSize: 9.5, color: DIM, letterSpacing: 0.2, textTransform: 'uppercase', marginBottom: 4 }}>Odds next pull (no mitigation)</div>
            <div><span style={{ color: '#E8B84A' }}>P(5★)</span> = <span style={{ color: ACCENT }}>{rG}</span><span style={{ color: DIM }}> / </span><span style={{ color: ACCENT }}>{rem}</span><span style={{ color: DIM }}> = </span><b style={{ color: '#E8B84A' }}>{p5.toFixed(3)}%</b></div>
            <div style={{ marginTop: 2 }}><span style={{ color: '#8A6FD4' }}>P(4★)</span> = {rP} / {rem} = <b style={{ color: '#8A6FD4' }}>{p4.toFixed(3)}%</b></div>
            <div style={{ marginTop: 2, color: DIM }}>P(3★) = {rY} / {rem} = <b>{rem > 0 ? ((rY / rem) * 100).toFixed(3) : '0.000'}%</b></div>
          </div>

          <div style={{ marginBottom: 14, padding: 10, background: '#0d0506', border: `1px solid ${BORDER}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 10, letterSpacing: 0.2, textTransform: 'uppercase', color: DIM }}>
              <span>POOL · SLOT MAP</span><span>DEPLETION {((pulled / 90) * 100).toFixed(1)}%</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(18, 1fr)', gap: 2 }}>
              {slots.map((r, i) => {
                const d = dep(i, r);
                const c = r === 5 ? '#E8B84A' : r === 4 ? '#8A6FD4' : '#4a4145';
                return (
                  <div key={i} style={{ aspectRatio: '1 / 1', minWidth: 18, background: d ? 'transparent' : c, border: `1px solid ${d ? '#2a1416' : 'rgba(0,0,0,0.5)'}`, position: 'relative', opacity: d ? 0.35 : 1, transition: 'all 220ms' }}>
                    {d && <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ACCENT, fontSize: 11, fontWeight: 700, opacity: 0.7 }}>×</span>}
                  </div>
                );
              })}
            </div>
            <div style={{ height: 3, marginTop: 8, background: '#1a0d0e', border: `1px solid ${BORDER}`, position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, width: `${(pulled / 90) * 100}%`, background: `linear-gradient(90deg, ${ACCENT} 0%, #c74d4d 100%)`, transition: 'width 320ms' }} />
            </div>
          </div>

          {exhausted && (
            <div style={{ marginBottom: 12, padding: '10px 12px', border: `1px solid ${ACCENT}`, color: ACCENT, background: 'rgba(227,107,107,0.08)', fontSize: 12, letterSpacing: 0.05, textTransform: 'uppercase', animation: 'pw 0.8s ease-in-out infinite' }}>
              POOL EXHAUSTED · next pull rebuilds the box from scratch
            </div>
          )}

          <div style={{ marginBottom: 14, padding: '9px 12px', background: 'rgba(227,107,107,0.08)', border: `1px solid ${ACCENT}`, fontSize: 11.5, color: ACCENT, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>!</span>
            <span>NO GUARANTEES · pool reset on exhaustion · pure hypergeometric draw</span>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', padding: '10px 14px', marginBottom: 12, background: '#0d0506', border: `1px solid ${BORDER}` }}>
            <Pip label="FUNDS" value={state.freeCurrency.toLocaleString()} color={ACCENT} />
            <Pip label="PULLS" value={state.totalPulls} color={TEXT} />
            <Pip label="5★ GOT" value={state.fiveStarCount} color="#E8B84A" />
            <Pip label="FEAT." value={state.featuredObtained} color="#E8B84A" />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Btn disabled={!eng.canPull1} onClick={eng.pull1}>PULL ×1 [{eng.pullCost}]</Btn>
            <Btn primary disabled={!eng.canPull10} onClick={eng.pull10}>PULL ×10 [{(eng.pullCost * 10).toLocaleString()}]</Btn>
            <Btn onClick={() => eng.addFunds()}>+ FUNDS</Btn>
            <Btn onClick={() => { eng.reset(); snap.current = null; }}>RESET</Btn>
          </div>

          <div key={eng.pullBurstKey} style={{ marginTop: 18 }}>
            {lastResults.length === 0 ? (
              <div style={{ padding: 16, fontSize: 12, color: DIM, border: `1px dashed ${BORDER}`, textAlign: 'center' }}>AWAITING FIRST DRAW — sample space: 90</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
                {lastResults.map((r, i) => {
                  const ring = r.rarity === 5 ? '#E8B84A' : r.rarity === 4 ? '#8A6FD4' : DIM;
                  return (
                    <div key={i} style={{ position: 'relative', aspectRatio: '4 / 5', background: `linear-gradient(180deg, ${r.unit.color}33 0%, #0d0506 100%)`, border: `1px solid ${ring}`, padding: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', animation: 'pp 380ms ease-out both', animationDelay: `${i * 40}ms` }}>
                      <div style={{ fontSize: 10, color: ring, fontWeight: 700 }}>★{r.rarity}</div>
                      <div style={{ fontSize: 12, color: TEXT }}>{r.unit.name}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card title="POOL COMPOSITION">
            <L label="Total slots" value="90" color={TEXT} />
            <L label="★5 initial" value={iG} color="#E8B84A" />
            <L label="★4 initial" value={iP} color="#8A6FD4" />
            <L label="★3 initial" value={iY} color={DIM} />
            <div style={{ height: 1, background: BORDER, margin: '8px 0' }} />
            <L label="★5 remaining" value={`${rG}/${iG}`} color="#E8B84A" bold />
            <L label="★4 remaining" value={`${rP}/${iP}`} color="#8A6FD4" />
            <L label="★3 remaining" value={`${rY}/${iY}`} color={DIM} />
          </Card>
          <Card title="HYPOTHESIS">
            <p style={{ margin: 0, fontSize: 11.5, lineHeight: 1.55, color: DIM }}>
              H<sub>0</sub>: the finite pool provides no effective safety net for players who roll into the grey tail.<br /><br />
              Expected pulls to one ★5 (fresh box, 3/90): <b style={{ color: TEXT }}>~30.3</b>. Pools without ★5 left still charge full cost.
            </p>
          </Card>
          <Card title={`LOG · ${state.history.length}`}>
            {state.history.length === 0 ? <p style={{ margin: 0, fontSize: 11.5, color: DIM }}>No pulls recorded.</p> : (
              <div style={{ maxHeight: 260, overflowY: 'auto', fontSize: 11 }}>
                {state.history.slice(-30).reverse().map((h, i) => {
                  const c = h.rarity === 5 ? '#E8B84A' : h.rarity === 4 ? '#8A6FD4' : DIM;
                  return (
                    <div key={state.history.length - i} style={{ padding: '3px 0', borderBottom: '1px dashed #1f1011', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: DIM }}>#{String(state.history.length - i).padStart(3, '0')}</span>
                      <span style={{ color: c }}>★{h.rarity} {h.unit.name}</span>
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

function Metric({ label, value, color, big }: { label: string; value: string | number; color: string; big?: boolean }) {
  return (
    <div style={{ padding: '8px 10px', background: '#0d0506', border: `1px solid ${BORDER}` }}>
      <div style={{ fontSize: 9, letterSpacing: 0.2, color: DIM, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: big ? 20 : 16, color, fontWeight: 600, lineHeight: 1.1, marginTop: 2 }}>{value}</div>
    </div>
  );
}
function Pip({ label, value, color }: { label: string; value: string | number; color: string }) {
  return <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}><span style={{ fontSize: 9.5, color: DIM, letterSpacing: 0.18, textTransform: 'uppercase' }}>{label}</span><b style={{ color, fontSize: 13 }}>{value}</b></div>;
}
function L({ label, value, color, bold }: { label: string; value: string | number; color: string; bold?: boolean }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 11.5 }}><span style={{ color: DIM }}>{label}</span><span style={{ color, fontWeight: bold ? 700 : 400 }}>{value}</span></div>;
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div style={{ background: PANEL, border: `1px solid ${BORDER}`, padding: 14 }}><h3 style={{ margin: '0 0 10px', color: ACCENT, fontSize: 11, letterSpacing: 0.2, textTransform: 'uppercase' }}>{title}</h3>{children}</div>;
}
function Btn({ children, onClick, disabled, primary }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; primary?: boolean }) {
  return <button onClick={onClick} disabled={disabled} style={{ padding: '9px 14px', fontSize: 11.5, letterSpacing: 0.08, textTransform: 'uppercase', fontFamily: MONO, fontWeight: 600, background: primary ? ACCENT : 'transparent', color: primary ? '#1a0708' : ACCENT, border: `1px solid ${ACCENT}`, borderRadius: 2, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.35 : 1, boxShadow: primary ? `0 0 16px ${ACCENT}66` : 'none' }}>{children}</button>;
}
function VariantBar({ variants, current, onPick }: { variants: Combo[]; current: string; onPick: (slug: string) => void }) {
  const cur = variants.find(v => v.slug === current)!;
  const banners = Array.from(new Set(variants.map(v => v.banner.id)));
  const curr = Array.from(new Set(variants.filter(v => v.banner.id === cur.banner.id).map(v => v.currency.id)));
  return (
    <div style={{ marginBottom: 16, padding: 10, background: PANEL, border: `1px solid ${BORDER}`, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', fontSize: 11 }}>
      {banners.length > 1 && <Group label="BANNER">{banners.map(b => { const m = variants.find(v => v.banner.id === b)!; return <Chip key={b} active={cur.banner.id === b} onClick={() => onPick(m.slug)}>{m.banner.name}</Chip>; })}</Group>}
      {curr.length > 1 && <Group label="CURRENCY">{curr.map(c => { const m = variants.find(v => v.banner.id === cur.banner.id && v.currency.id === c)!; return <Chip key={c} active={cur.currency.id === c} onClick={() => onPick(m.slug)}>{m.currency.name}</Chip>; })}</Group>}
    </div>
  );
}
function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><span style={{ color: DIM, textTransform: 'uppercase' }}>{label}</span>{children}</div>;
}
function Chip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return <button onClick={onClick} style={{ padding: '3px 9px', fontSize: 11, fontFamily: MONO, background: active ? ACCENT : 'transparent', color: active ? '#1a0708' : ACCENT, border: `1px solid ${ACCENT}`, borderRadius: 2, cursor: 'pointer' }}>{children}</button>;
}
const KF = `
@keyframes pw { 0%, 100% { opacity: 0.85; } 50% { opacity: 0.45; } }
@keyframes pf { 0% { background: #2a0e10; } 100% { background: #1a0d0e; } }
@keyframes pp { 0% { transform: translateY(8px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
`;
