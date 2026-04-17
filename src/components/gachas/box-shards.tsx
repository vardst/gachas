// HAND-CRAFTED: Box + Shards — alchemy + box. Dupes → shards, even in finite pool.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { featuredFor } from '../../data/roster';
import { useGachaEngine } from '../../lib/useGachaEngine';
import type { Combo } from '../../data/primitives';

const ACCENT = '#d4a26f';
const ACCENT_D = '#a67346';
const TEXT = '#f1e4d1';
const DIM = '#a89780';
const SUB = '#7b6c58';
const PANEL = '#211710';
const PANEL_D = '#18100a';
const BORDER = '#402d1f';
const BG = '#120c08';
const GOLD = '#e8c27c';
const COPPER = '#c77d48';
const IRON = '#6a5a4a';
const CYAN = '#6fb8c4';

export default function BoxShards({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const variants = combosForType('box-shards');
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

  const [flash, setFlash] = useState(0);
  const prev = useRef(state.shards);
  useEffect(() => {
    if (state.shards > prev.current) setFlash(k => k + 1);
    prev.current = state.shards;
  }, [state.shards]);

  const box = state.boxRemaining;
  const iG = snap.current?.gold ?? 3, iP = snap.current?.purple ?? 17, iY = snap.current?.grey ?? 70;
  const rG = box ? box.filter(u => u.rarity === 5).length : iG;
  const rP = box ? box.filter(u => u.rarity === 4).length : iP;
  const rY = box ? box.filter(u => u.rarity === 3).length : iY;
  const rem = box ? box.length : 90;
  const pulled = 90 - rem;

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

  const dupeFive = useMemo(() => {
    const seen = new Set<string>();
    let d = 0;
    for (const h of state.history) {
      if (h.rarity !== 5) continue;
      if (seen.has(h.unit.id)) d++;
      else seen.add(h.unit.id);
    }
    return d;
  }, [state.history]);

  const shardPct = Math.min(100, (state.shards / state.shardsNeededForFive) * 100);

  return (
    <div style={{
      minHeight: '100vh',
      background: `radial-gradient(ellipse at 20% 10%, #2a1a0c 0%, ${BG} 55%), radial-gradient(ellipse at 80% 90%, #1a241c 0%, ${BG} 60%)`,
      color: TEXT, fontFamily: '"Cormorant Garamond", Georgia, serif', padding: '28px 24px 60px',
    }}>
      <style>{KF}</style>
      <Link to="/" style={{ color: ACCENT, textDecoration: 'none', fontSize: 13, fontStyle: 'italic' }}>← return to the workshop</Link>

      <header style={{ marginTop: 14, marginBottom: 22, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: `1px solid ${BORDER}`, paddingBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 0.24, textTransform: 'uppercase', color: ACCENT_D, marginBottom: 4 }}>
            Volume III · folio {combo.slug.slice(-6)}
          </div>
          <h1 style={{ margin: 0, fontSize: 34, color: ACCENT, fontWeight: 500, textShadow: `0 2px 0 rgba(0,0,0,0.6)`, fontStyle: 'italic' }}>
            The Reliquary <span style={{ color: TEXT, fontStyle: 'normal' }}>·</span> Box Transmutation
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: DIM, maxWidth: 640, lineHeight: 1.5, fontStyle: 'italic' }}>
            A finite reliquary of ninety relics. Duplicates are not waste — pound them to dust, and the dust compounds to a craft. Even in a bounded pool, nothing spills.
          </p>
        </div>
        <Sigil />
      </header>

      <VariantBar variants={variants} current={combo.slug} onPick={(s) => navigate(`/play/${s}`)} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 310px', gap: 20, alignItems: 'start' }}>
        <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 22, boxShadow: `0 0 50px -20px ${ACCENT}55` }}>
          {featured.five.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: ACCENT_D, textTransform: 'uppercase', letterSpacing: 0.14, marginBottom: 6 }}>Headline relics</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {featured.five.map(u => (
                  <span key={u.id} style={{ padding: '4px 12px', borderRadius: 18, background: `linear-gradient(90deg, ${u.color}33, ${u.color}18)`, color: u.color, border: `1px solid ${u.color}`, fontSize: 12.5, fontStyle: 'italic' }}>★5 {u.name}</span>
                ))}
              </div>
            </div>
          )}

          {/* Shard crucible + box grid, side-by-side */}
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 14, marginBottom: 16 }}>
            <div style={{ padding: 16, borderRadius: 8, background: `linear-gradient(180deg, #2d1a0e 0%, ${PANEL_D} 100%)`, border: `1px solid ${BORDER}`, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(circle at 50% 50%, ${CYAN}18, transparent 65%)` }} />
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: 11, color: ACCENT_D, textTransform: 'uppercase', letterSpacing: 0.2, marginBottom: 8 }}>Shard Crucible</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span key={flash} style={{ fontSize: 56, fontWeight: 600, color: ACCENT, lineHeight: 1, animation: 'sf 520ms ease-out', textShadow: `0 0 24px ${ACCENT}88` }}>{state.shards}</span>
                  <span style={{ fontSize: 16, color: DIM }}>/ {state.shardsNeededForFive}</span>
                </div>
                <div style={{ marginTop: 4, fontSize: 11.5, color: DIM, fontStyle: 'italic' }}>dust of ninety, bound by patience</div>
                <div style={{ position: 'relative', height: 14, marginTop: 12, borderRadius: 3, background: PANEL_D, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${shardPct}%`, background: `linear-gradient(90deg, ${ACCENT_D} 0%, ${ACCENT} 50%, ${CYAN} 100%)`, transition: 'width 380ms' }}>
                    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`, backgroundSize: '200% 100%', animation: 'sh 2.4s linear infinite' }} />
                  </div>
                </div>
                <div style={{ marginTop: 12, padding: '6px 10px', background: eng.canShards ? `${ACCENT}22` : PANEL_D, border: `1px solid ${eng.canShards ? ACCENT : BORDER}`, borderRadius: 4, fontSize: 11.5, color: eng.canShards ? ACCENT : DIM, fontStyle: 'italic' }}>
                  {eng.canShards ? 'the crucible is full — craft any time' : `${state.shardsNeededForFive - state.shards} more dust needed`}
                </div>
                <div style={{ marginTop: 10, fontSize: 11, color: DIM }}>★5 duplicates recovered: <b style={{ color: ACCENT }}>{dupeFive}</b></div>
              </div>
            </div>

            <div style={{ padding: 12, borderRadius: 8, background: PANEL_D, border: `1px solid ${BORDER}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: ACCENT_D, textTransform: 'uppercase', letterSpacing: 0.14 }}>Reliquary · {rem}/90 remain</span>
                <span style={{ fontSize: 11, color: DIM, fontStyle: 'italic' }}>dupes melt to dust</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: 3 }}>
                {slots.map((r, i) => {
                  const d = dep(i, r);
                  const c = r === 5 ? GOLD : r === 4 ? COPPER : IRON;
                  return (
                    <div key={i} style={{ aspectRatio: '1 / 1', minWidth: 20, borderRadius: 3, background: d ? `linear-gradient(135deg, ${CYAN}22, transparent 60%)` : `linear-gradient(135deg, ${c} 0%, ${c}aa 100%)`, border: `1px solid ${d ? BORDER : 'rgba(0,0,0,0.4)'}`, opacity: d ? 0.65 : 1, position: 'relative', transition: 'all 280ms', boxShadow: d ? `inset 0 0 6px ${CYAN}44` : `inset 0 1px 0 rgba(255,240,200,0.25)` }}>
                      {d && <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: CYAN, opacity: 0.8 }}>◆</span>}
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, fontSize: 11 }}>
                <Leg color={GOLD} label="★5" r={rG} i={iG} />
                <Leg color={COPPER} label="★4" r={rP} i={iP} />
                <Leg color={IRON} label="★3" r={rY} i={iY} />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(33,23,16,0.7)', borderLeft: `3px solid ${ACCENT}`, borderRadius: 4, fontSize: 13, color: TEXT, fontStyle: 'italic', lineHeight: 1.6 }}>
            "The pool is finite, yet the alchemy is not. Dupes condense; dust compounds. Even the hollow pull enriches the crucible."
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '10px 14px', marginBottom: 12, background: PANEL_D, border: `1px solid ${BORDER}`, borderRadius: 6 }}>
            <Pip label="Aurum" value={state.freeCurrency.toLocaleString()} color={ACCENT} />
            <Pip label="Pulls" value={state.totalPulls} color={TEXT} />
            <Pip label="★5 got" value={state.fiveStarCount} color={GOLD} />
            <Pip label="Dust" value={state.shards} color={CYAN} />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Btn disabled={!eng.canPull1} onClick={eng.pull1}>Draw 1 · {eng.pullCost}</Btn>
            <Btn primary disabled={!eng.canPull10} onClick={eng.pull10}>Draw 10 · {(eng.pullCost * 10).toLocaleString()}</Btn>
            <Btn shard disabled={!eng.canShards} onClick={eng.shards}>Craft ({state.shards}/{state.shardsNeededForFive})</Btn>
            <Btn onClick={() => eng.addFunds()}>+ Aurum</Btn>
            <Btn onClick={() => { eng.reset(); snap.current = null; }}>Reset</Btn>
          </div>

          <div key={eng.pullBurstKey} style={{ marginTop: 20 }}>
            {lastResults.length === 0 ? (
              <div style={{ padding: 20, fontSize: 14, color: DIM, textAlign: 'center', border: `1px solid ${BORDER}`, borderRadius: 6, fontStyle: 'italic', background: 'rgba(24,16,10,0.5)' }}>
                The reliquary is closed. Draw, and its contents settle into your hand.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                {lastResults.map((r, i) => {
                  const owned = state.history.slice(0, -lastResults.length + i).some(h => h.unit.id === r.unit.id);
                  const isDupe = r.rarity === 5 && owned;
                  const ring = r.rarity === 5 ? GOLD : r.rarity === 4 ? COPPER : IRON;
                  return (
                    <div key={i} style={{ position: 'relative', aspectRatio: '3 / 4', borderRadius: 6, background: `linear-gradient(145deg, ${r.unit.color}44 0%, ${PANEL_D} 100%)`, border: `1px solid ${ring}`, padding: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', animation: 'sp 480ms ease-out both', animationDelay: `${i * 55}ms`, overflow: 'hidden', boxShadow: r.rarity === 5 ? `0 0 16px ${GOLD}55` : '0 2px 8px rgba(0,0,0,0.4)' }}>
                      {r.rarity === 5 && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(circle at 30% 30%, rgba(255,240,200,0.35), transparent 60%)` }} />}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 12, color: ring, fontWeight: 700, fontStyle: 'italic' }}>★{r.rarity}</span>
                        {isDupe && <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 10, background: CYAN, color: '#0e1c1f', fontWeight: 700 }}>+25 DUST</span>}
                      </div>
                      <div style={{ fontSize: 14, color: TEXT, fontStyle: 'italic', fontWeight: 500 }}>{r.unit.name}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card title="Transmutation ledger">
            <R label="Dust earned" value={state.shards} color={CYAN} />
            <R label="Dust per ★5 dupe" value="25" color={ACCENT} />
            <R label="Dust per ★3 drop" value="1" color={IRON} />
            <R label="Craft threshold" value={state.shardsNeededForFive} color={GOLD} />
            <div style={{ height: 1, background: BORDER, margin: '6px 0' }} />
            <R label="★5 dupes so far" value={dupeFive} color={ACCENT} />
            <R label="★5 unique" value={state.fiveStarCount - dupeFive} color={GOLD} />
          </Card>
          <Card title="Reliquary">
            <R label="Remaining" value={`${rem}/90`} color={ACCENT} />
            <R label="Pulled" value={pulled} color={TEXT} />
            <R label="★5 left" value={`${rG}/${iG}`} color={GOLD} />
            <R label="★4 left" value={`${rP}/${iP}`} color={COPPER} />
            <R label="★3 left" value={`${rY}/${iY}`} color={IRON} />
            <div style={{ marginTop: 10, padding: '6px 10px', borderRadius: 4, background: 'rgba(111,184,196,0.1)', border: `1px solid ${CYAN}44`, fontSize: 11, color: CYAN, fontStyle: 'italic' }}>
              Even in a finite pool, dupes are useful. Nothing spills.
            </div>
          </Card>
          <Card title={`Journal · ${state.history.length}`}>
            {state.history.length === 0 ? <p style={{ margin: 0, fontSize: 11.5, color: DIM, fontStyle: 'italic' }}>Pages yet unwritten.</p> : (
              <div style={{ maxHeight: 220, overflowY: 'auto', fontSize: 11.5 }}>
                {state.history.slice(-25).reverse().map((h, i) => {
                  const c = h.rarity === 5 ? GOLD : h.rarity === 4 ? COPPER : IRON;
                  return (
                    <div key={state.history.length - i} style={{ padding: '3px 0', borderBottom: `1px dotted ${BORDER}`, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: SUB, fontStyle: 'italic' }}>§{state.history.length - i}</span>
                      <span style={{ color: c }}>★{h.rarity} {h.unit.name}{h.extra?.shardCraft ? ' · crafted' : ''}</span>
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

function Leg({ color, label, r, i }: { color: string; label: string; r: number; i: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px', borderRadius: 3, background: 'rgba(24,16,10,0.6)', border: `1px solid ${BORDER}` }}>
      <span style={{ display: 'inline-block', width: 10, height: 10, background: color, borderRadius: 2 }} />
      <span style={{ color: DIM, fontSize: 11 }}>{label}</span>
      <b style={{ color: TEXT, fontSize: 11.5, marginLeft: 'auto' }}>{r}/{i}</b>
    </div>
  );
}
function Pip({ label, value, color }: { label: string; value: string | number; color: string }) {
  return <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}><span style={{ fontSize: 10.5, color: DIM, textTransform: 'uppercase', letterSpacing: 0.1 }}>{label}</span><b style={{ color, fontSize: 16 }}>{value}</b></div>;
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 14 }}><h3 style={{ margin: '0 0 10px', color: ACCENT, fontSize: 13, fontWeight: 500, letterSpacing: 0.1, textTransform: 'uppercase', fontStyle: 'italic', borderBottom: `1px solid ${BORDER}`, paddingBottom: 6 }}>{title}</h3>{children}</div>;
}
function R({ label, value, color }: { label: string; value: string | number; color: string }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0' }}><span style={{ color: DIM, fontStyle: 'italic' }}>{label}</span><b style={{ color, fontWeight: 500 }}>{value}</b></div>;
}
function Btn({ children, onClick, disabled, primary, shard }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; primary?: boolean; shard?: boolean }) {
  const bg = primary ? `linear-gradient(180deg, ${ACCENT} 0%, ${ACCENT_D} 100%)` : shard ? `linear-gradient(180deg, ${CYAN} 0%, #4a8a96 100%)` : `linear-gradient(180deg, ${PANEL} 0%, ${PANEL_D} 100%)`;
  const color = (primary || shard) ? '#22160a' : ACCENT;
  return <button onClick={onClick} disabled={disabled} style={{ padding: '10px 16px', fontSize: 13, fontWeight: 500, fontFamily: '"Cormorant Garamond", Georgia, serif', background: bg, color, border: `1px solid ${primary ? ACCENT_D : shard ? '#4a8a96' : BORDER}`, borderRadius: 4, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1, boxShadow: (primary || shard) ? 'inset 0 1px 0 rgba(255,240,200,0.35), 0 2px 0 rgba(0,0,0,0.4)' : 'inset 0 1px 0 rgba(255,220,170,0.08), 0 2px 0 rgba(0,0,0,0.3)' }}>{children}</button>;
}
function Sigil() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 6, border: `1px solid ${BORDER}`, background: 'rgba(33,23,16,0.6)' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: `radial-gradient(circle, ${ACCENT} 0%, ${ACCENT_D} 70%, #2a1a0e 100%)`, boxShadow: `inset 0 0 8px rgba(0,0,0,0.6), 0 0 16px ${ACCENT}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22160a', fontWeight: 700, fontSize: 18 }}>◈</div>
      <div>
        <div style={{ fontSize: 10, color: DIM, textTransform: 'uppercase', letterSpacing: 0.2 }}>Sigil</div>
        <div style={{ fontSize: 12.5, color: ACCENT, fontStyle: 'italic' }}>dupe → dust → relic</div>
      </div>
    </div>
  );
}
function VariantBar({ variants, current, onPick }: { variants: Combo[]; current: string; onPick: (slug: string) => void }) {
  const cur = variants.find(v => v.slug === current)!;
  const banners = Array.from(new Set(variants.map(v => v.banner.id)));
  const gs = Array.from(new Set(variants.filter(v => v.banner.id === cur.banner.id).map(v => v.guarantee.id)));
  const curr = Array.from(new Set(variants.filter(v => v.banner.id === cur.banner.id && v.guarantee.id === cur.guarantee.id).map(v => v.currency.id)));
  return (
    <div style={{ marginBottom: 16, padding: 10, background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 6, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
      {banners.length > 1 && <G label="Banner">{banners.map(b => { const m = variants.find(v => v.banner.id === b)!; return <Chip key={b} active={cur.banner.id === b} onClick={() => onPick(m.slug)}>{m.banner.name}</Chip>; })}</G>}
      {gs.length > 1 && <G label="Layer">{gs.map(g => { const m = variants.find(v => v.banner.id === cur.banner.id && v.guarantee.id === g)!; return <Chip key={g} active={cur.guarantee.id === g} onClick={() => onPick(m.slug)}>{m.guarantee.name}</Chip>; })}</G>}
      {curr.length > 1 && <G label="Currency">{curr.map(c => { const m = variants.find(v => v.banner.id === cur.banner.id && v.guarantee.id === cur.guarantee.id && v.currency.id === c)!; return <Chip key={c} active={cur.currency.id === c} onClick={() => onPick(m.slug)}>{m.currency.name}</Chip>; })}</G>}
    </div>
  );
}
function G({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><span style={{ fontSize: 10.5, textTransform: 'uppercase', color: DIM, letterSpacing: 0.1, fontStyle: 'italic' }}>{label}</span>{children}</div>;
}
function Chip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return <button onClick={onClick} style={{ padding: '3px 10px', fontSize: 12, background: active ? ACCENT : 'transparent', color: active ? '#22160a' : DIM, border: `1px solid ${active ? ACCENT : BORDER}`, borderRadius: 14, cursor: 'pointer', fontFamily: '"Cormorant Garamond", Georgia, serif', fontStyle: active ? 'normal' : 'italic' }}>{children}</button>;
}
const KF = `
@keyframes sp { 0% { transform: translateY(14px) scale(0.9); opacity: 0; } 60% { transform: translateY(-2px) scale(1.03); opacity: 1; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
@keyframes sh { 0% { background-position: 0% 0; } 100% { background-position: 200% 0; } }
@keyframes sf { 0% { transform: scale(1.4); color: #fff; text-shadow: 0 0 32px #fff; } 100% { transform: scale(1); color: #d4a26f; text-shadow: 0 0 24px #d4a26f88; } }
`;
