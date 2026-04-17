// HAND-CRAFTED: Festival Step-Up — J-pop festival step cycle with per-step rewards.
// Shorter 8-step cycle. Confetti + ribbon swirls + extra-large sparkle on 5★.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { featuredFor } from '../../data/roster';
import { useGachaEngine } from '../../lib/useGachaEngine';
import type { Combo } from '../../data/primitives';

const ACCENT = '#FFB6E6';
const LAVENDER = '#C4A6FF';
const MINT = '#A6F0D4';
const LEMON = '#FFE58A';
const CORAL = '#FF8F9E';
const GOLD = '#FFD86F';

const STEPS = [
  { label: 'Step 1', sublabel: 'Intro discount',   cost: 0.5,  reward: 'Half price · 10 pulls',      color: MINT,     icon: 'i' },
  { label: 'Step 2', sublabel: 'Standard',         cost: 1.0,  reward: '10 pulls · normal rates',    color: LEMON,    icon: 'ii' },
  { label: 'Step 3', sublabel: '4★ Guaranteed',    cost: 1.0,  reward: 'Guaranteed 4★+ in batch',    color: CORAL,    icon: 'iii' },
  { label: 'Step 4', sublabel: 'Rate Up',          cost: 1.0,  reward: 'Doubled featured rate',      color: LAVENDER, icon: 'iv' },
  { label: 'Step 5', sublabel: '5★ Featured',      cost: 1.0,  reward: 'Guaranteed featured 5★',     color: GOLD,     icon: 'v' },
  { label: 'Step 6', sublabel: 'Encore 10×',       cost: 10.0, reward: '10× price · mega haul',      color: '#FF8CC3', icon: 'vi' },
  { label: 'Step 7', sublabel: 'Victory Lap',      cost: 1.0,  reward: 'Bonus 4★ token',             color: MINT,     icon: 'vii' },
  { label: 'Step 8', sublabel: 'Finale',           cost: 1.0,  reward: 'Cycle complete — loop',      color: ACCENT,   icon: 'viii' },
];

export default function FestivalStepUp({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const variants = combosForType('festival-step-up');
  const combo = useMemo(() => variants.find(c => c.slug === slug) ?? variants[0], [variants, slug]);
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;
  const featured = featuredFor(combo.banner.id);

  const [conf, setConf] = useState<{ id: number; x: number; color: string; rot: number; delay: number }[]>([]);
  const [rkey, setRkey] = useState(0);
  const [sparkle, setSparkle] = useState(false);
  const idRef = useRef(0);

  useEffect(() => {
    if (eng.pullBurstKey === 0) return;
    setRkey(k => k + 1);
    const hadFive = lastResults.some(r => r.rarity === 5);
    setSparkle(hadFive);
    const cols = [ACCENT, LAVENDER, MINT, LEMON, CORAL, GOLD];
    const n = hadFive ? 40 : lastResults.length >= 10 ? 26 : 14;
    const pcs = Array.from({ length: n }).map(() => ({ id: idRef.current++, x: Math.random() * 100, color: cols[Math.floor(Math.random() * cols.length)], rot: Math.random() * 360, delay: Math.random() * 150 }));
    setConf(c => [...c, ...pcs]);
    const t1 = setTimeout(() => setConf(c => c.filter(p => !pcs.includes(p))), 2200);
    const t2 = setTimeout(() => setSparkle(false), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [eng.pullBurstKey, lastResults]);

  const stepLen = 8;
  const curStep = state.stepIndex % stepLen;
  const next = STEPS[curStep];
  const usesShards = ['shards', 'shards_pity', 'full_suite'].includes(combo.guarantee.id);
  const usesSpark = ['spark_only', 'spark_pity', 'full_suite'].includes(combo.guarantee.id);

  return (
    <div className="page">
      <style>{KF}</style>
      <Link to="/" className="back-link" style={{ color: ACCENT }}>← Back to dashboard</Link>
      <header className="page-header" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 30, background: `linear-gradient(90deg, ${ACCENT}, ${LAVENDER}, ${MINT}, ${LEMON}, ${CORAL}, ${ACCENT})`, backgroundSize: '300% 100%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'fsu-rainbow 6s linear infinite', fontWeight: 700 }}>Festival Step-Up</h1>
          <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: `linear-gradient(90deg, ${CORAL}, ${ACCENT})`, color: '#2a0a1a' }}>8-STEP CYCLE</span>
        </div>
        <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>{combo.banner.name} · {combo.guarantee.name} · {combo.currency.name}</p>
      </header>

      <VariantBar variants={variants} current={combo.slug} onPick={(s) => navigate(`/play/${s}`)} />

      <div className="player-shell">
        <div className="player-main" style={{
          position: 'relative',
          background: `radial-gradient(1200px 600px at 10% -10%, ${LAVENDER}22, transparent 60%), radial-gradient(900px 500px at 100% 0%, ${ACCENT}1f, transparent 60%), radial-gradient(1000px 500px at 50% 110%, ${MINT}15, transparent 60%), linear-gradient(165deg, #1d1625 0%, #15111d 100%)`,
          border: `1px solid ${ACCENT}55`,
          boxShadow: `0 0 0 1px ${ACCENT}22, 0 24px 60px -12px ${ACCENT}33`,
          borderRadius: 12, padding: 22, overflow: 'hidden',
        }}>
          <Ribbons rkey={rkey} />

          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }}>
            {conf.map(p => (
              <div key={p.id} style={{
                position: 'absolute', left: `${p.x}%`, top: -12, width: 8, height: 12,
                background: p.color, transform: `rotate(${p.rot}deg)`, borderRadius: 1,
                animation: 'fsu-confetti 2s ease-in forwards', animationDelay: `${p.delay}ms`,
                boxShadow: `0 0 4px ${p.color}66`,
              }} />
            ))}
          </div>

          {sparkle && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 340, height: 340, background: `radial-gradient(circle, ${GOLD}aa 0%, ${ACCENT}55 30%, transparent 70%)`, animation: 'fsu-sparkle 1.8s ease-out forwards' }} />
              <div style={{ position: 'absolute', fontSize: 92, fontWeight: 900, letterSpacing: 0.1, background: `linear-gradient(90deg, ${GOLD}, ${ACCENT})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'fsu-sparkle-text 1.8s ease-out forwards', textShadow: `0 0 40px ${GOLD}` }}>★5</div>
            </div>
          )}

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ marginBottom: 14, padding: '12px 16px', background: 'rgba(255,182,230,0.08)', borderLeft: `3px solid ${ACCENT}`, borderRadius: 4, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55 }}>
              Festival step-up: each step in the 8-pull cycle escalates. Engagement-per-pull is exceptional.
            </div>

            {featured.five.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.12, color: ACCENT, marginBottom: 6, fontWeight: 600 }}>Festival headliners</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {featured.five.map(u => (
                    <div key={u.id} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12.5, fontWeight: 700, background: `linear-gradient(90deg, ${u.color}, ${u.color}cc)`, color: '#1f0a14', boxShadow: `0 0 16px ${u.color}88` }}>★5 {u.name}</div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ position: 'relative', marginBottom: 16, padding: '14px 12px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${ACCENT}44`, borderRadius: 10 }}>
              <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.12, color: 'var(--text-muted)', marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span>Step cycle · now at step {curStep + 1}/8</span>
                <span style={{ color: ACCENT }}>Loops on completion</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stepLen}, 1fr)`, gap: 6 }}>
                {STEPS.map((s, i) => {
                  const isCur = i === curStep;
                  const done = curStep > i;
                  return (
                    <div key={i} style={{
                      position: 'relative', padding: '10px 8px', borderRadius: 8,
                      background: isCur ? `linear-gradient(180deg, ${s.color} 0%, ${s.color}cc 100%)` : done ? `${s.color}22` : 'rgba(255,255,255,0.02)',
                      border: isCur ? `2px solid ${GOLD}` : done ? `1px solid ${s.color}55` : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: isCur ? `0 0 24px ${s.color}aa, inset 0 0 20px rgba(255,255,255,0.2)` : 'none',
                      color: isCur ? '#1f0a14' : done ? s.color : 'var(--text-muted)',
                      display: 'flex', flexDirection: 'column', gap: 4,
                      transform: isCur ? 'translateY(-3px) scale(1.02)' : 'translateY(0)',
                      transition: 'all 280ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                      minHeight: 96,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.06 }}>{s.label}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.1 }}>{s.icon}</span>
                      </div>
                      <div style={{ fontSize: 11.5, fontWeight: 700, lineHeight: 1.2 }}>{s.sublabel}</div>
                      <div style={{ fontSize: 10, opacity: 0.75, lineHeight: 1.35 }}>{s.reward}</div>
                      <div style={{ marginTop: 'auto', fontSize: 10, fontWeight: 700, opacity: isCur ? 1 : 0.65 }}>
                        {s.cost === 1 ? 'x1 price' : s.cost === 0.5 ? '50% OFF' : `×${s.cost} price`}
                      </div>
                      {isCur && <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', padding: '1px 8px', background: GOLD, color: '#1f0a14', borderRadius: 10, fontSize: 9, fontWeight: 800, letterSpacing: 0.1, animation: 'fsu-bounce 1.6s ease-in-out infinite' }}>NOW</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{
              position: 'relative', overflow: 'hidden',
              marginBottom: 16, padding: '14px 18px',
              background: `linear-gradient(90deg, ${next.color}22 0%, ${next.color}0a 100%)`,
              border: `1px solid ${next.color}88`, borderRadius: 10,
              boxShadow: `0 0 20px ${next.color}22, inset 0 0 20px ${next.color}08`,
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(300px 100px at 0% 50%, ${next.color}33, transparent)`, animation: 'fsu-slide 3s ease-in-out infinite', pointerEvents: 'none' }} />
              <div style={{
                width: 54, height: 54, borderRadius: '50%',
                background: `radial-gradient(circle, ${next.color} 0%, ${next.color}66 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#1f0a14', fontWeight: 900, fontSize: 18, fontStyle: 'italic',
                border: `2px solid ${GOLD}`, boxShadow: `0 0 20px ${next.color}aa`, flexShrink: 0,
              }}>{next.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.12, color: 'var(--text-muted)' }}>Next step preview</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: next.color, marginTop: 2 }}>{next.label}: {next.sublabel}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>If you pull now → {next.reward}</div>
              </div>
              <div style={{
                textAlign: 'right', padding: '6px 12px',
                background: next.cost !== 1 ? `linear-gradient(135deg, ${GOLD}, ${CORAL})` : 'rgba(255,255,255,0.05)',
                color: next.cost !== 1 ? '#1f0a14' : 'var(--text)',
                borderRadius: 6, fontWeight: 700, fontSize: 13,
              }}>
                {next.cost === 1 ? '×1' : next.cost === 0.5 ? '50% OFF' : `×${next.cost}`}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12, padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${ACCENT}33`, borderRadius: 6 }}>
              <Pip label="Free" value={state.freeCurrency.toLocaleString()} color={ACCENT} />
              <Pip label="Pulls" value={state.totalPulls} color={LAVENDER} />
              <Pip label="5★" value={state.fiveStarCount} color={GOLD} />
              <Pip label="Featured" value={state.featuredObtained} color={CORAL} />
              {usesSpark && <Pip label="Spark" value={`${state.sparkProgress}/${state.sparkThreshold}`} color={MINT} />}
              {usesShards && <Pip label="Shards" value={`${state.shards}/${state.shardsNeededForFive}`} color={LEMON} />}
            </div>

            <div className="pull-row" style={{ gap: 8, flexWrap: 'wrap' }}>
              <Btn disabled={!eng.canPull1} onClick={eng.pull1}>Pull 1 · {eng.pullCost}</Btn>
              <Btn primary disabled={!eng.canPull10} onClick={eng.pull10}>Pull 10 · {(eng.pullCost * 10).toLocaleString()}</Btn>
              {usesSpark && <Btn disabled={!eng.canSpark} onClick={eng.spark}>Spark ({state.sparkProgress}/{state.sparkThreshold})</Btn>}
              {usesShards && <Btn disabled={!eng.canShards} onClick={eng.shards}>Craft ({state.shards}/{state.shardsNeededForFive})</Btn>}
              <Btn onClick={() => eng.addFunds()}>+ Funds</Btn>
              <Btn onClick={eng.reset}>Reset</Btn>
            </div>

            <div key={eng.pullBurstKey} style={{ marginTop: 16 }}>
              {lastResults.length === 0 ? (
                <div style={{ padding: 20, color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>Curtain rises. Pull to start the festival cycle.</div>
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
            <h3 style={{ color: ACCENT }}>Step cycle</h3>
            <div className="detail-list">
              <div className="kv"><span>Length</span><b>{stepLen} steps</b></div>
              <div className="kv"><span>Now at</span><b style={{ color: next.color }}>{next.label}</b></div>
              <div className="kv"><span>Total pulls</span><b>{state.totalPulls}</b></div>
              <div className="kv"><span>Cycles completed</span><b>{Math.floor(state.totalPulls / stepLen)}</b></div>
            </div>
            <div style={{ marginTop: 10, padding: 8, background: `${ACCENT}15`, borderRadius: 4, fontSize: 11.5, borderLeft: `3px solid ${ACCENT}` }}>
              Stop at Step 5 for guaranteed featured 5★. Step 6 is the whale accelerator — x10 price for a mega haul.
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

function Ribbons({ rkey }: { rkey: number }) {
  return (
    <div key={rkey} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
      {[0, 1, 2].map(i => (
        <svg key={i} style={{ position: 'absolute', left: `${-10 + i * 30}%`, top: `${10 + i * 20}%`, width: 500, height: 40, animation: `fsu-ribbon ${10 + i * 2}s linear infinite`, opacity: 0.25 }} viewBox="0 0 500 40" preserveAspectRatio="none">
          <path d="M0 20 Q 50 0, 100 20 T 200 20 T 300 20 T 400 20 T 500 20" stroke={[ACCENT, LAVENDER, MINT][i]} strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      ))}
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
      padding: '10px 18px',
      background: primary ? `linear-gradient(90deg, ${CORAL}, ${ACCENT}, ${LAVENDER})` : 'rgba(255,182,230,0.08)',
      backgroundSize: primary ? '200% 100%' : undefined,
      color: primary ? '#1f0a14' : ACCENT,
      border: primary ? `1px solid ${GOLD}` : `1px solid ${ACCENT}55`,
      borderRadius: 20, fontWeight: 700, fontSize: 12.5, letterSpacing: 0.03,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
      boxShadow: primary ? `0 0 20px ${ACCENT}66, 0 4px 12px rgba(0,0,0,0.4)` : 'none',
      animation: primary && !disabled ? 'fsu-btn 3s linear infinite' : undefined,
    }}>{children}</button>
  );
}

function FCard({ rarity, name, color, rateUpHit, delay }: { rarity: number; name: string; color: string; rateUpHit: boolean; delay: number }) {
  const bg = rarity === 5 ? `linear-gradient(135deg, ${color} 0%, ${GOLD} 50%, ${ACCENT} 100%)` : rarity === 4 ? `linear-gradient(135deg, ${color} 0%, ${LAVENDER} 100%)` : `linear-gradient(135deg, ${color} 0%, #4a4a54 100%)`;
  return (
    <div style={{
      position: 'relative', aspectRatio: '4 / 5', borderRadius: 10, background: bg,
      border: rarity === 5 ? `2px solid ${GOLD}` : rarity === 4 ? `1px solid ${LAVENDER}` : '1px solid rgba(255,255,255,0.1)',
      boxShadow: rarity === 5 ? `0 0 20px ${color}aa, 0 0 42px ${GOLD}66` : '0 2px 8px rgba(0,0,0,0.4)',
      padding: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      animation: 'fsu-pop 480ms cubic-bezier(0.34, 1.56, 0.64, 1) both', animationDelay: `${delay}ms`,
      overflow: 'hidden',
    }}>
      {rarity >= 4 && (
        <div style={{
          position: 'absolute', top: -30, left: -30, right: -30, bottom: -30,
          background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.25) 60deg, transparent 120deg, transparent 240deg, rgba(255,255,255,0.25) 300deg, transparent 360deg)',
          animation: rarity === 5 ? 'fsu-spin 4s linear infinite' : 'fsu-spin 8s linear infinite',
          mixBlendMode: 'overlay',
        }} />
      )}
      {rateUpHit && rarity === 5 && <div style={{ position: 'absolute', top: 6, right: 6, padding: '1px 6px', background: GOLD, color: '#1f0a14', borderRadius: 10, fontSize: 9, fontWeight: 800 }}>FEATURED</div>}
      <div style={{ fontSize: 12, fontWeight: 800, color: '#0f0e13', position: 'relative' }}>★{rarity}</div>
      <div style={{ fontSize: 13, fontWeight: 800, color: '#0f0e13', position: 'relative' }}>{name}</div>
    </div>
  );
}

function VariantBar({ variants, current, onPick }: { variants: Combo[]; current: string; onPick: (slug: string) => void }) {
  const cur = variants.find(v => v.slug === current)!;
  const guarantees = Array.from(new Set(variants.map(v => v.guarantee.id)));
  const currencies = Array.from(new Set(variants.filter(v => v.guarantee.id === cur.guarantee.id).map(v => v.currency.id)));
  const Chip = ({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) => (
    <button onClick={onClick} style={{ padding: '4px 10px', fontSize: 11.5, background: active ? ACCENT : 'transparent', color: active ? '#1f0a14' : ACCENT, border: `1px solid ${active ? ACCENT : ACCENT + '55'}`, borderRadius: 16, cursor: 'pointer', fontWeight: 600 }}>{children}</button>
  );
  return (
    <div style={{ marginBottom: 14, padding: 10, background: 'rgba(255,182,230,0.05)', border: `1px solid ${ACCENT}33`, borderRadius: 6, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
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
@keyframes fsu-rainbow { 0%{background-position:0% 50%}100%{background-position:300% 50%} }
@keyframes fsu-confetti { 0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(720px) rotate(720deg);opacity:0} }
@keyframes fsu-sparkle { 0%{transform:scale(.3);opacity:0}35%{transform:scale(1.2);opacity:1}100%{transform:scale(2.2);opacity:0} }
@keyframes fsu-sparkle-text { 0%{transform:scale(.2);opacity:0;letter-spacing:.5em}35%{transform:scale(1.05);opacity:1;letter-spacing:.1em}100%{transform:scale(1.3);opacity:0;letter-spacing:.05em} }
@keyframes fsu-pop { 0%{transform:scale(.4) translateY(20px);opacity:0}100%{transform:scale(1) translateY(0);opacity:1} }
@keyframes fsu-bounce { 0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-2px)} }
@keyframes fsu-slide { 0%,100%{background-position:0% 50%}50%{background-position:100% 50%} }
@keyframes fsu-btn { 0%{background-position:0% 50%}100%{background-position:200% 50%} }
@keyframes fsu-spin { 0%{transform:rotate(0deg)}100%{transform:rotate(360deg)} }
@keyframes fsu-ribbon { 0%{transform:translateX(0)}100%{transform:translateX(30vw)} }
`;
