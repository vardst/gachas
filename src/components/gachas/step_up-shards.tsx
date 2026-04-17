// HAND-CRAFTED — Step-Up + Shards.
// Vibe: crafting / alchemy bench + rhythmic steps.
// Shards counter alongside the step bar. Dupes become shards; shards forge featured.
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { combosForType } from '../../data/types';
import { useGachaEngine } from '../../lib/useGachaEngine';
import { featuredFor } from '../../data/roster';
import { UnitCard, StatusBar, CelebrationFlash } from '../../lib/GachaFrame';

const ACCENT = '#c48a6e';
const DEEP = '#8c5940';
const CLAY = '#e8c6a8';
const INK = '#f3ecdf';
const BG_0 = '#1b1510';
const BG_1 = '#2a1f15';
const AMBER = '#e8b05a';

const KEYFRAMES = `
@keyframes shd-glow { 0%, 100% { box-shadow: 0 0 0 1px ${AMBER}, 0 0 14px -2px ${AMBER}aa; } 50% { box-shadow: 0 0 0 2px ${AMBER}, 0 0 22px 0 ${AMBER}; } }
@keyframes shd-rise { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes shd-shatter { 0% { transform: rotate(0) scale(1); } 50% { transform: rotate(5deg) scale(1.1); } 100% { transform: rotate(0) scale(1); } }
@keyframes shd-anvil-spark { 0% { opacity: 0; transform: scale(0.4); } 40% { opacity: 1; } 100% { opacity: 0; transform: scale(1.6) translateY(-20px); } }
`;

export default function StepUpShards({ slug }: { slug: string }) {
  const variants = combosForType('step_up-shards');
  const navigate = useNavigate();
  const combo = useMemo(() => variants.find(c => c.slug === slug) ?? variants[0], [variants, slug]);
  const eng = useGachaEngine(combo);
  const { state, lastResults } = eng;

  const featured = featuredFor(combo.banner.id);
  const step = state.stepIndex;
  const stepLen = state.stepLength;
  const shardsPct = Math.min(100, (state.shards / state.shardsNeededForFive) * 100);
  const canCraft = eng.canShards;
  const usesPity = combo.guarantee.id === 'shards_pity';
  const pityPct = usesPity ? Math.min(100, (state.pullsSinceFiveStar / state.hardPityAt) * 100) : 0;

  const hasFive = lastResults.some(r => r.rarity === 5);
  const hasFour = lastResults.some(r => r.rarity === 4);
  const dupeCount = lastResults.filter(r => r.rarity === 5 && state.fiveStarCount > 1).length;

  return (
    <div className="page" style={{
      background: `radial-gradient(700px 500px at 20% 0%, ${AMBER}18 0%, transparent 55%), linear-gradient(180deg, ${BG_0} 0%, ${BG_1} 100%)`,
      minHeight: '100vh', padding: 22, color: INK, borderRadius: 12,
      fontFamily: 'ui-serif, "Iowan Old Style", Georgia, serif',
    }}>
      <style>{KEYFRAMES}</style>

      <Link to="/" style={{ color: CLAY, fontSize: 12.5, textDecoration: 'none', display: 'inline-block', marginBottom: 12 }}>← Back to dashboard</Link>

      <header style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, letterSpacing: 0.3, textTransform: 'uppercase', color: CLAY, fontWeight: 500 }}>
          Step-Up × Shards · crafted in rhythm
        </div>
        <h1 style={{ margin: '3px 0 0', fontSize: 30, fontWeight: 400, color: '#fff', letterSpacing: 0.4 }}>
          The Anvil & the Ladder
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: CLAY, maxWidth: 640, lineHeight: 1.55 }}>
          Step-up cycles drive the rhythm; every dupe feeds the anvil. When the shard tally crosses {state.shardsNeededForFive}, forge any featured 5★ directly.
        </p>
      </header>

      {variants.length > 1 && (
        <div style={{ marginBottom: 14, padding: 10, background: 'rgba(255,255,255,0.03)', border: `1px solid ${ACCENT}55`, borderRadius: 8, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.12, color: CLAY }}>Variant</span>
          {variants.map(v => {
            const active = v.slug === combo.slug;
            return (
              <button key={v.slug} onClick={() => navigate(`/play/${v.slug}`)} style={{
                padding: '4px 10px', fontSize: 11.5, borderRadius: 4,
                background: active ? ACCENT : 'rgba(255,255,255,0.04)',
                color: active ? '#1b1510' : INK,
                border: `1px solid ${active ? ACCENT : `${ACCENT}44`}`,
                cursor: 'pointer', fontWeight: active ? 600 : 400, fontFamily: 'inherit',
              }}>{v.banner.name} · {v.guarantee.name} · {v.currency.name}</button>
            );
          })}
        </div>
      )}

      {/* The two rails — STEP LADDER (left) + ANVIL (right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14, marginBottom: 14 }}>
        {/* STEP LADDER */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${ACCENT}44`, borderRadius: 10, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <div style={{ fontSize: 11, letterSpacing: 0.25, textTransform: 'uppercase', color: ACCENT, fontWeight: 700 }}>Step cycle</div>
            <div style={{ fontSize: 11, color: CLAY }}>Step {step + 1} / {stepLen}</div>
          </div>
          <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
            {Array.from({ length: stepLen }).map((_, i) => {
              const isCurrent = i === step;
              const isPast = i < step;
              const isFloor = i === stepLen - 1;
              return (
                <div key={i} style={{
                  flex: 1, height: 28,
                  background: isFloor
                    ? (isPast ? '#8a5a40' : ACCENT)
                    : isCurrent ? 'rgba(196,138,110,0.22)' : isPast ? 'rgba(196,138,110,0.08)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isFloor ? ACCENT : isCurrent ? ACCENT : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10.5, fontWeight: 600,
                  color: isFloor && !isPast ? '#1b1510' : isCurrent ? INK : '#a48d72',
                }}>{i + 1}{isFloor ? '★' : ''}</div>
              );
            })}
          </div>
          <div style={{ fontSize: 11, color: CLAY, lineHeight: 1.45 }}>
            {step === stepLen - 1
              ? 'Next pull is the step ★5 guarantee — dupes from here feed the anvil.'
              : `Step ${stepLen} guarantees ★5. Dupes across the whole cycle become shards.`}
          </div>

          {usesPity && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 10.5, letterSpacing: 0.2, textTransform: 'uppercase', color: CLAY, marginBottom: 4 }}>Pity rail</div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${pityPct}%`, height: '100%', background: `linear-gradient(90deg, ${ACCENT}, ${AMBER})`, transition: 'width 0.3s' }} />
              </div>
              <div style={{ fontSize: 10.5, color: CLAY, marginTop: 3 }}>
                {state.pullsSinceFiveStar} / {state.hardPityAt} pulls since last ★5
              </div>
            </div>
          )}
        </div>

        {/* ANVIL */}
        <div style={{
          background: `linear-gradient(180deg, rgba(232,176,90,0.1), rgba(0,0,0,0.2))`,
          border: `1px solid ${AMBER}66`,
          borderRadius: 10, padding: 14,
          position: 'relative', overflow: 'hidden',
          animation: canCraft ? 'shd-glow 2s ease-in-out infinite' : undefined,
        }}>
          <div style={{ fontSize: 11, letterSpacing: 0.25, textTransform: 'uppercase', color: AMBER, fontWeight: 700, marginBottom: 4 }}>
            The Anvil
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: 34, fontWeight: 300, color: '#fff', lineHeight: 1, fontFamily: 'inherit' }}>
              {state.shards}
              <span style={{ fontSize: 16, color: '#c4a77f', fontWeight: 400 }}> / {state.shardsNeededForFive}</span>
            </div>
            <div aria-hidden style={{
              fontSize: 28, color: canCraft ? AMBER : '#67513a',
              animation: canCraft ? 'shd-shatter 1.4s ease-in-out infinite' : undefined,
            }}>◆</div>
          </div>
          <div style={{ marginTop: 6, height: 10, background: 'rgba(0,0,0,0.4)', borderRadius: 5, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{
              width: `${shardsPct}%`, height: '100%',
              background: `linear-gradient(90deg, ${ACCENT}, ${AMBER}, #f8e0a8)`,
              transition: 'width 0.4s cubic-bezier(.22,1,.36,1)',
              boxShadow: canCraft ? `0 0 14px ${AMBER}` : undefined,
            }} />
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: CLAY, lineHeight: 1.45 }}>
            {canCraft
              ? 'Anvil is HOT. Forge any featured ★5 now.'
              : `Every dupe ★5 = 40 shards, dupe ★4 = 10 shards. ${state.shardsNeededForFive - state.shards} to forge.`}
          </div>
        </div>
      </div>

      {/* Dupes message */}
      {dupeCount > 0 && (
        <div style={{
          marginBottom: 12, padding: '8px 12px',
          background: 'rgba(232,176,90,0.1)',
          border: `1px solid ${AMBER}55`,
          borderRadius: 6, fontSize: 12, color: AMBER,
          animation: 'shd-rise 0.4s ease-out',
        }}>
          {dupeCount} duplicate ★5 this pull — melted into shards on the anvil.
        </div>
      )}

      {featured.five.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10.5, letterSpacing: 0.15, textTransform: 'uppercase', color: CLAY, marginBottom: 6 }}>Featured · craftable</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {featured.five.map(u => (
              <span key={u.id} style={{
                padding: '4px 10px', fontSize: 12, fontWeight: 600,
                background: `linear-gradient(90deg, ${u.color}, ${u.color}99)`,
                color: '#1b1510', borderRadius: 3,
                boxShadow: `0 0 0 1px ${AMBER}66`,
              }}>★5 {u.name}</span>
            ))}
            {featured.four.map(u => (
              <span key={u.id} style={{
                padding: '3px 9px', fontSize: 11, color: CLAY,
                background: 'rgba(196,138,110,0.12)', borderRadius: 3,
                border: `1px solid ${ACCENT}44`,
              }}>★4 {u.name}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: 10, background: 'rgba(255,255,255,0.03)', border: `1px solid ${ACCENT}33`, borderRadius: 8, marginBottom: 12 }}>
        <StatusBar combo={combo} eng={eng} />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <button onClick={eng.pull1} disabled={!eng.canPull1} style={clayBtn(false)}>Pull 1 · {eng.pullCost}</button>
        <button onClick={eng.pull10} disabled={!eng.canPull10} style={clayBtn(true)}>
          Pull 10 · {(eng.pullCost * 10).toLocaleString()}
        </button>
        <button onClick={eng.shards} disabled={!canCraft} style={craftBtn(canCraft)}>
          {canCraft ? 'FORGE ★5' : `Craft ${state.shards}/${state.shardsNeededForFive}`}
        </button>
        <button onClick={() => eng.addFunds()} style={clayBtn(false, true)}>+ Funds</button>
        <button onClick={eng.reset} style={clayBtn(false, true)}>Reset</button>
      </div>

      <div style={{
        background: 'rgba(0,0,0,0.25)',
        border: `1px solid ${ACCENT}33`,
        borderRadius: 10, padding: 14, minHeight: 140, position: 'relative',
      }}>
        {hasFive && <CelebrationFlash tier={5} accent={AMBER} />}
        {!hasFive && hasFour && <CelebrationFlash tier={4} accent={AMBER} />}
        {lastResults.length === 0 ? (
          <div style={{ padding: 22, textAlign: 'center', color: '#a48d72', fontSize: 13, fontStyle: 'italic' }}>
            Pull to keep the rhythm. Every dupe tips molten shards into the anvil.
          </div>
        ) : (
          <div key={eng.pullBurstKey} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px,1fr))', gap: 10 }}>
            {lastResults.map((r, i) => (
              <div key={i} style={{ animation: `shd-rise 0.4s ease-out ${i * 45}ms both` }}>
                <UnitCard result={r} delay={0} />
              </div>
            ))}
          </div>
        )}
      </div>

      {state.history.length > 0 && (
        <div style={{ marginTop: 12, padding: 10, background: 'rgba(255,255,255,0.03)', border: `1px solid ${ACCENT}33`, borderRadius: 8 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.12, color: CLAY, fontWeight: 600, marginBottom: 5 }}>Forge log · {state.history.length}</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {state.history.slice(-16).reverse().map((h, i) => (
              <span key={i} style={{
                padding: '2px 7px', fontSize: 10.5, borderRadius: 3,
                background: h.rarity === 5 ? `${AMBER}22` : h.rarity === 4 ? 'rgba(196,138,110,0.18)' : 'rgba(255,255,255,0.04)',
                color: h.rarity === 5 ? AMBER : h.rarity === 4 ? CLAY : '#a48d72',
                border: h.rarity >= 4 ? `1px solid ${h.rarity === 5 ? AMBER : ACCENT}55` : '1px solid rgba(255,255,255,0.05)',
                fontWeight: h.rarity >= 4 ? 600 : 400,
              }}>★{h.rarity} {h.unit.name}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function clayBtn(primary: boolean, ghost = false): React.CSSProperties {
  if (primary) {
    return {
      padding: '10px 16px', fontSize: 13, fontWeight: 700, letterSpacing: 0.15,
      background: `linear-gradient(180deg, ${ACCENT}, ${DEEP})`,
      color: '#1b1510',
      border: `1px solid ${ACCENT}`,
      borderRadius: 5, cursor: 'pointer',
      boxShadow: `0 3px 10px -3px ${ACCENT}aa`,
      fontFamily: 'inherit',
    };
  }
  if (ghost) {
    return {
      padding: '8px 14px', fontSize: 12.5,
      background: 'transparent', color: CLAY,
      border: `1px solid ${ACCENT}44`, borderRadius: 5, cursor: 'pointer',
      fontFamily: 'inherit',
    };
  }
  return {
    padding: '9px 14px', fontSize: 12.5,
    background: 'rgba(255,255,255,0.05)', color: INK,
    border: `1px solid ${ACCENT}66`, borderRadius: 5, cursor: 'pointer',
    fontFamily: 'inherit',
  };
}

function craftBtn(ready: boolean): React.CSSProperties {
  if (ready) {
    return {
      padding: '10px 16px', fontSize: 13, fontWeight: 800, letterSpacing: 0.3,
      background: `linear-gradient(180deg, ${AMBER}, #c48a3a)`,
      color: '#1b1510',
      border: `1px solid ${AMBER}`, borderRadius: 5, cursor: 'pointer',
      boxShadow: `0 0 18px -4px ${AMBER}`, textTransform: 'uppercase',
      fontFamily: 'inherit',
    };
  }
  return {
    padding: '9px 14px', fontSize: 12.5,
    background: 'rgba(232,176,90,0.08)', color: '#c4a77f',
    border: `1px solid ${AMBER}44`, borderRadius: 5, cursor: 'pointer',
    fontFamily: 'inherit',
  };
}
