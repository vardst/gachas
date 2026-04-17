// HAND-CRAFTED — Arknights Limited flavor.
// Focus: dual-ceiling tactical UI. Pity bar + Spark bar side-by-side.
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { useGachaEngine } from '../../lib/useGachaEngine';
import { featuredFor } from '../../data/roster';
import { UnitCard } from '../../lib/GachaFrame';

const ACCENT = '#C76D7E';
const AMBER = '#E0A048';
const GRID = 'rgba(199,109,126,0.18)';
const MONO = '"SF Mono", "JetBrains Mono", Menlo, Consolas, monospace';

const KEYFRAMES = `
@keyframes ak-radar-sweep { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes ak-grid-pan { 0% { background-position: 0 0, 0 0; } 100% { background-position: 40px 40px, 40px 40px; } }
@keyframes ak-wipe-in { 0% { clip-path: inset(0 100% 0 0); opacity: 0; } 100% { clip-path: inset(0 0 0 0); opacity: 1; } }
@keyframes ak-blink { 0%, 80%, 100% { opacity: 1; } 85% { opacity: 0; } }
@keyframes ak-type-caret { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
@keyframes ak-scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
@keyframes ak-pulse-danger { 0%, 100% { box-shadow: 0 0 0 1px ${ACCENT}88, inset 0 0 0 1px ${ACCENT}33; } 50% { box-shadow: 0 0 0 2px ${ACCENT}, inset 0 0 12px -2px ${ACCENT}66; } }
`;

export default function ArknightsLimited({ slug }: { slug: string }) {
  const variants = combosForType('arknights-limited');
  const navigate = useNavigate();
  const combo = useMemo(() => variants.find(c => c.slug === slug) ?? variants[0], [variants, slug]);
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;

  const featured = featuredFor(combo.banner.id);
  const pityPct = Math.min(100, (state.pullsSinceFiveStar / state.hardPityAt) * 100);
  const sparkPct = Math.min(100, (state.sparkProgress / state.sparkThreshold) * 100);
  const softTriggered = state.pullsSinceFiveStar >= state.softPityStart;
  const hasFive = lastResults.some(r => r.rarity === 5);

  const pullsUntilPity = Math.max(0, state.hardPityAt - state.pullsSinceFiveStar);
  const pullsUntilSpark = Math.max(0, state.sparkThreshold - state.sparkProgress);
  // rough expected pulls for 5* is just 1/rate, ~167. We'll just surface the knowns.
  const evPulls = 167;

  const [showOperator, setShowOperator] = useState<{ name: string; rarity: number } | null>(null);
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (hasFive) {
      const five = lastResults.find(r => r.rarity === 5)!;
      setShowOperator({ name: five.unit.name.toUpperCase(), rarity: 5 });
      setTyped('');
      const name = five.unit.name.toUpperCase();
      let i = 0;
      const iv = setInterval(() => {
        i++;
        setTyped(name.slice(0, i));
        if (i >= name.length) clearInterval(iv);
      }, 60);
      const t = setTimeout(() => setShowOperator(null), 2600);
      return () => { clearInterval(iv); clearTimeout(t); };
    }
  }, [eng.pullBurstKey, hasFive, lastResults]);

  return (
    <div className="page" style={{
      background: 'linear-gradient(180deg, #14131a 0%, #1a1620 100%)',
      color: '#e7dde0',
      fontFamily: MONO,
      minHeight: '100vh',
      borderRadius: 12,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{KEYFRAMES}</style>

      {/* Grid background */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(${GRID} 1px, transparent 1px), linear-gradient(90deg, ${GRID} 1px, transparent 1px)`,
        backgroundSize: '40px 40px, 40px 40px',
        animation: 'ak-grid-pan 40s linear infinite',
        opacity: 0.5,
      }} />
      {/* Scanline overlay during pull */}
      {eng.isPulling && (
        <div aria-hidden style={{
          position: 'absolute', left: 0, right: 0, top: 0, height: 100,
          background: `linear-gradient(180deg, transparent 0%, ${ACCENT}22 50%, transparent 100%)`,
          animation: 'ak-scanline 0.6s linear', pointerEvents: 'none', zIndex: 4,
        }} />
      )}

      <div style={{ position: 'relative', zIndex: 2 }}>
        <Link to="/" style={{ color: ACCENT, fontSize: 11.5, letterSpacing: 0.12, textTransform: 'uppercase', display: 'inline-block', marginBottom: 14, fontFamily: MONO }}>
          [ ← RETURN TO DASHBOARD ]
        </Link>

        {/* Header — ops terminal */}
        <header style={{
          border: `1px solid ${ACCENT}66`,
          padding: '12px 16px',
          background: 'rgba(199,109,126,0.05)',
          marginBottom: 16,
          position: 'relative',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10.5, letterSpacing: 0.15, color: ACCENT, textTransform: 'uppercase', marginBottom: 4 }}>
            <span>// HEADHUNTING · LIMITED · CH-{state.totalPulls.toString().padStart(4, '0')}</span>
            <span style={{ animation: 'ak-blink 2s infinite' }}>● LIVE</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 26, letterSpacing: 0.08, fontFamily: MONO, color: '#f4eaec', fontWeight: 500 }}>
            OPERATOR RECRUITMENT
          </h1>
          <div style={{ fontSize: 11.5, color: '#b99ba0', marginTop: 3 }}>
            Arknights Limited · dual-ceiling contract · pity_99 + spark_300
          </div>
        </header>

        {/* Variant switcher */}
        {variants.length > 1 && (
          <div style={{ marginBottom: 16, padding: 8, border: `1px solid ${ACCENT}44`, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', background: 'rgba(0,0,0,0.25)' }}>
            <span style={{ fontSize: 10, color: '#b99ba0', letterSpacing: 0.1, textTransform: 'uppercase' }}>&gt; variant:</span>
            {variants.map(v => {
              const active = v.slug === combo.slug;
              return (
                <button key={v.slug} onClick={() => navigate(`/play/${v.slug}`)} style={{
                  padding: '4px 10px', fontSize: 10.5, fontFamily: MONO, letterSpacing: 0.08,
                  background: active ? ACCENT : 'transparent',
                  color: active ? '#14131a' : '#e7dde0',
                  border: `1px solid ${active ? ACCENT : ACCENT + '55'}`, cursor: 'pointer',
                  textTransform: 'uppercase',
                }}>{v.banner.name}/{v.currency.name}</button>
              );
            })}
          </div>
        )}

        {/* DUAL CEILING — THE HERO */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <CeilingPanel
            label="SOFT CEILING"
            sublabel="99-pull pity"
            current={state.pullsSinceFiveStar}
            total={state.hardPityAt}
            pct={pityPct}
            color={ACCENT}
            warn={softTriggered}
            note={softTriggered ? 'SOFT RAMP ACTIVE · rates escalating' : `${state.softPityStart - state.pullsSinceFiveStar} pulls to soft-ramp`}
          />
          <CeilingPanel
            label="HARD CEILING"
            sublabel="300-pull spark"
            current={state.sparkProgress}
            total={state.sparkThreshold}
            pct={sparkPct}
            color={AMBER}
            warn={eng.canSpark}
            note={eng.canSpark ? 'SPARK REDEEMABLE · pick any featured' : `${pullsUntilSpark} pulls to deterministic floor`}
          />
        </div>

        {/* Threat assessment */}
        <div style={{ marginBottom: 16, padding: 12, border: `1px solid ${ACCENT}44`, background: 'rgba(0,0,0,0.3)' }}>
          <div style={{ fontSize: 10, letterSpacing: 0.15, color: ACCENT, textTransform: 'uppercase', marginBottom: 6 }}>// THREAT ASSESSMENT</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, fontSize: 11.5 }}>
            <KV k="PULLS → PITY" v={pullsUntilPity.toString()} color={pullsUntilPity < 20 ? AMBER : '#e7dde0'} />
            <KV k="PULLS → SPARK" v={pullsUntilSpark.toString()} color={pullsUntilSpark < 50 ? AMBER : '#e7dde0'} />
            <KV k="EV (1× ★5)" v={`~${evPulls}`} color="#e7dde0" />
            <KV k="★5 ACQUIRED" v={state.fiveStarCount.toString()} color={state.fiveStarCount > 0 ? AMBER : '#e7dde0'} />
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: '#9a8388', lineHeight: 1.5 }}>
            // Layered safety. 99-pull pity floor AND 300-pull deterministic spark. Known as "dual ceiling".
          </div>
        </div>

        {/* Featured operators */}
        {featured.five.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, letterSpacing: 0.15, color: '#b99ba0', textTransform: 'uppercase', marginBottom: 6 }}>// FEATURED OPERATORS</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {featured.five.map(u => (
                <div key={u.id} style={{
                  padding: '6px 12px', background: `linear-gradient(90deg, ${u.color}cc, ${u.color}66)`,
                  color: '#14131a', fontFamily: MONO, fontSize: 11.5, letterSpacing: 0.06,
                  clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)', fontWeight: 600,
                }}>E6·{u.name.toUpperCase()}</div>
              ))}
              {featured.four.map(u => (
                <div key={u.id} style={{ padding: '5px 10px', fontSize: 10.5, color: AMBER, border: `1px solid ${AMBER}66`, fontFamily: MONO, letterSpacing: 0.06 }}>
                  5★·{u.name.toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status bar — tactical */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, padding: 10, border: `1px solid ${ACCENT}44`, background: 'rgba(0,0,0,0.25)', marginBottom: 14, fontSize: 11 }}>
          <KV k="ORUNDUM" v={state.freeCurrency.toLocaleString()} />
          {combo.currency.id === 'dual' && <KV k="ORIGINIUM" v={state.paidCurrency.toString()} />}
          {combo.currency.id === 'tickets' && <KV k="TICKETS" v={state.tickets.toString()} />}
          <KV k="OPS RUN" v={state.totalPulls.toString()} />
          <KV k="★5 COUNT" v={state.fiveStarCount.toString()} color={state.fiveStarCount > 0 ? AMBER : '#e7dde0'} />
          <KV k="FEATURED" v={state.featuredObtained.toString()} />
        </div>

        {/* Pull controls */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <button onClick={eng.pull1} disabled={!eng.canPull1} style={tacBtn(false)}>
            [ DEPLOY ×1 · {eng.pullCost} ]
          </button>
          <button onClick={eng.pull10} disabled={!eng.canPull10} style={tacBtn(true)}>
            [ DEPLOY ×10 · {(eng.pullCost * 10).toLocaleString()} ]
          </button>
          <button onClick={eng.spark} disabled={!eng.canSpark} style={tacBtn(false, eng.canSpark)}>
            [ REDEEM SPARK ({state.sparkProgress}/{state.sparkThreshold}) ]
          </button>
          <button onClick={() => eng.addFunds()} style={tacBtn(false, false, true)}>[ +FUNDS ]</button>
          <button onClick={eng.reset} style={tacBtn(false, false, true)}>[ RESET OP ]</button>
        </div>

        {/* Results panel with radar sweep during pull */}
        <div style={{ position: 'relative', minHeight: 180, padding: 14, border: `1px solid ${ACCENT}55`, background: 'rgba(0,0,0,0.35)' }}>
          <div style={{ fontSize: 10, letterSpacing: 0.15, color: '#b99ba0', textTransform: 'uppercase', marginBottom: 8 }}>
            // DEPLOYMENT RESULTS
          </div>

          {/* Radar overlay during pulling */}
          {eng.isPulling && (
            <div aria-hidden style={{
              position: 'absolute', right: 14, top: 8, width: 50, height: 50, pointerEvents: 'none',
              borderRadius: '50%', border: `1px solid ${ACCENT}88`,
              background: `conic-gradient(from 0deg, transparent 0deg, ${ACCENT}44 80deg, transparent 90deg)`,
              animation: 'ak-radar-sweep 1.2s linear infinite',
            }} />
          )}

          {/* Operator acquired banner */}
          {showOperator && (
            <div style={{
              marginBottom: 12, padding: '10px 14px', border: `1px solid ${AMBER}`,
              background: `linear-gradient(90deg, ${AMBER}22, transparent)`,
              animation: 'ak-pulse-danger 1.4s ease-in-out infinite',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ fontSize: 10, letterSpacing: 0.2, color: AMBER, textTransform: 'uppercase', marginBottom: 4 }}>
                &gt;&gt; TRANSMISSION RECEIVED
              </div>
              <div style={{ fontSize: 20, fontFamily: MONO, color: '#fff4e0', letterSpacing: 0.15, fontWeight: 600 }}>
                OPERATOR ACQUIRED: {typed}
                <span style={{ color: AMBER, animation: 'ak-type-caret 0.9s infinite' }}>_</span>
              </div>
            </div>
          )}

          {lastResults.length === 0 ? (
            <div style={{ padding: 28, textAlign: 'center', color: '#9a8388', fontSize: 12, fontFamily: MONO }}>
              &gt; STANDING BY. Press DEPLOY to initiate headhunting sequence.
            </div>
          ) : (
            <div key={eng.pullBurstKey} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
              {lastResults.map((r, i) => (
                <div key={i} style={{ animation: `ak-wipe-in 0.5s cubic-bezier(.22,1,.36,1) ${i * 55}ms both` }}>
                  <UnitCard result={r} delay={0} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Log tail */}
        {state.history.length > 0 && (
          <div style={{ marginTop: 14, padding: 10, border: `1px solid ${ACCENT}33`, background: 'rgba(0,0,0,0.25)', fontSize: 10.5, color: '#b99ba0', fontFamily: MONO, maxHeight: 120, overflowY: 'auto' }}>
            <div style={{ color: ACCENT, letterSpacing: 0.12, textTransform: 'uppercase', marginBottom: 4 }}>// OPS LOG · TAIL -n 12</div>
            {state.history.slice(-12).reverse().map((h, i) => (
              <div key={i} style={{ color: h.rarity === 5 ? AMBER : h.rarity === 4 ? '#c8aaf5' : '#8a7a7f', padding: '1px 0' }}>
                [{(state.history.length - i).toString().padStart(4, '0')}] ★{h.rarity} {h.unit.name.toUpperCase()}
                {h.hardPity && ' · HARD_PITY'}
                {h.softPity && ' · SOFT_PITY'}
                {h.sparkRedeemed && ' · SPARK_REDEEMED'}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CeilingPanel({ label, sublabel, current, total, pct, color, warn, note }: {
  label: string; sublabel: string; current: number; total: number; pct: number; color: string; warn: boolean; note: string;
}) {
  return (
    <div style={{
      padding: 12,
      border: `1px solid ${warn ? color : color + '55'}`,
      background: warn ? `${color}12` : 'rgba(0,0,0,0.3)',
      fontFamily: MONO,
      position: 'relative',
      ...(warn ? { animation: 'ak-pulse-danger 1.6s ease-in-out infinite' } : {}),
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 10, color, letterSpacing: 0.2, textTransform: 'uppercase', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 9.5, color: '#9a8388', letterSpacing: 0.1 }}>{sublabel}</span>
      </div>
      <div style={{ fontSize: 22, color: warn ? color : '#e7dde0', fontWeight: 500, lineHeight: 1 }}>
        {current}<span style={{ fontSize: 12, color: '#9a8388' }}> / {total}</span>
      </div>
      <div style={{ marginTop: 8, height: 6, background: 'rgba(0,0,0,0.5)', border: `1px solid ${color}44`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, boxShadow: `0 0 8px ${color}88`, transition: 'width 0.35s ease' }} />
        {/* tick marks */}
        {[25, 50, 75].map(t => (
          <div key={t} style={{ position: 'absolute', left: `${t}%`, top: 0, bottom: 0, width: 1, background: 'rgba(0,0,0,0.6)' }} />
        ))}
      </div>
      <div style={{ marginTop: 6, fontSize: 10.5, color: warn ? color : '#9a8388', letterSpacing: 0.05 }}>
        // {note}
      </div>
    </div>
  );
}

function KV({ k, v, color }: { k: string; v: string; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: 9.5, color: '#8a7478', letterSpacing: 0.1, textTransform: 'uppercase' }}>{k}</div>
      <div style={{ fontSize: 14, color: color ?? '#e7dde0', fontFamily: MONO, fontWeight: 500 }}>{v}</div>
    </div>
  );
}

function tacBtn(primary: boolean, glowing = false, ghost = false): React.CSSProperties {
  if (glowing) {
    return {
      padding: '9px 14px', fontSize: 11.5, fontFamily: MONO, letterSpacing: 0.12,
      background: AMBER, color: '#14131a', border: `1px solid ${AMBER}`, cursor: 'pointer',
      textTransform: 'uppercase', fontWeight: 700,
      boxShadow: `0 0 12px ${AMBER}88`,
    };
  }
  if (primary) {
    return {
      padding: '9px 14px', fontSize: 11.5, fontFamily: MONO, letterSpacing: 0.12,
      background: ACCENT, color: '#14131a', border: `1px solid ${ACCENT}`, cursor: 'pointer',
      textTransform: 'uppercase', fontWeight: 600,
    };
  }
  if (ghost) {
    return {
      padding: '9px 12px', fontSize: 11, fontFamily: MONO, letterSpacing: 0.12,
      background: 'transparent', color: '#b99ba0', border: `1px solid ${ACCENT}44`, cursor: 'pointer',
      textTransform: 'uppercase',
    };
  }
  return {
    padding: '9px 14px', fontSize: 11.5, fontFamily: MONO, letterSpacing: 0.12,
    background: 'rgba(199,109,126,0.08)', color: '#e7dde0', border: `1px solid ${ACCENT}88`, cursor: 'pointer',
    textTransform: 'uppercase',
  };
}
