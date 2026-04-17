import { useEffect, useMemo, useState, type DragEvent } from 'react';
import { Link } from 'react-router-dom';
import { ALL_TYPES, combosForType } from '../data/types';

type Tier = 'S' | 'A' | 'B' | 'C' | 'D' | 'unranked';
const TIERS: { key: Tier; color: string; label: string }[] = [
  { key: 'S', color: '#ff7b7b', label: 'S' },
  { key: 'A', color: '#ffa94d', label: 'A' },
  { key: 'B', color: '#ffd86f', label: 'B' },
  { key: 'C', color: '#a0d468', label: 'C' },
  { key: 'D', color: '#7ec4f5', label: 'D' },
];

type Rankings = Record<Tier, string[]>;

const STORAGE_KEY = 'gacha-tier-rankings-v2';

function loadRankings(): Rankings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Rankings>;
      return {
        S: parsed.S ?? [],
        A: parsed.A ?? [],
        B: parsed.B ?? [],
        C: parsed.C ?? [],
        D: parsed.D ?? [],
        unranked: parsed.unranked ?? [],
      };
    }
  } catch { /* empty */ }
  return { S: [], A: [], B: [], C: [], D: [], unranked: [] };
}

function saveRankings(r: Rankings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
}

export default function TierList() {
  const [rankings, setRankings] = useState<Rankings>(loadRankings);
  const [filter, setFilter] = useState<'all' | 'named' | 'generic'>('all');
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<Tier | null>(null);

  const allKeys = useMemo(() => Object.keys(ALL_TYPES), []);
  const namedKeys = useMemo(() => Object.values(ALL_TYPES).filter(t => t.category === 'named').map(t => t.key), []);
  const genericKeys = useMemo(() => Object.values(ALL_TYPES).filter(t => t.category === 'generic').map(t => t.key), []);

  useEffect(() => {
    const inRankings = new Set(Object.values(rankings).flat());
    const source = filter === 'all' ? allKeys : filter === 'named' ? namedKeys : genericKeys;
    const missing = source.filter(k => !inRankings.has(k));
    if (missing.length > 0) {
      setRankings(r => ({ ...r, unranked: [...missing, ...r.unranked] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    saveRankings(rankings);
  }, [rankings]);

  function onDragStart(e: DragEvent<HTMLDivElement>, key: string) {
    setDragKey(key);
    e.dataTransfer.effectAllowed = 'move';
  }
  function onDragOver(e: DragEvent<HTMLDivElement>, tier: Tier) {
    e.preventDefault();
    setDropTarget(tier);
  }
  function onDragLeave() { setDropTarget(null); }
  function onDrop(e: DragEvent<HTMLDivElement>, tier: Tier) {
    e.preventDefault();
    if (!dragKey) return;
    setRankings(r => {
      const next: Rankings = { S: [...r.S], A: [...r.A], B: [...r.B], C: [...r.C], D: [...r.D], unranked: [...r.unranked] };
      for (const k of Object.keys(next) as Tier[]) {
        next[k] = next[k].filter(s => s !== dragKey);
      }
      next[tier].push(dragKey);
      return next;
    });
    setDragKey(null);
    setDropTarget(null);
  }

  function resetAll() {
    if (!confirm('Clear all rankings?')) return;
    const source = filter === 'all' ? allKeys : filter === 'named' ? namedKeys : genericKeys;
    setRankings({ S: [], A: [], B: [], C: [], D: [], unranked: [...source] });
  }

  const visibleSet = filter === 'all'
    ? new Set(allKeys)
    : filter === 'named'
    ? new Set(namedKeys)
    : new Set(genericKeys);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Tier List</h1>
        <p>Rank the {allKeys.length} gacha types. Drag to tier, saves automatically to your browser.</p>
      </header>

      <div className="stats-bar">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label>
            <span style={{ color: 'var(--text-muted)', marginRight: 6 }}>Show:</span>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as 'all' | 'named' | 'generic')}
              style={{ padding: '4px 8px', background: 'var(--surface-muted)', color: 'var(--text)', border: '1px solid var(--border-strong)', borderRadius: 4 }}
            >
              <option value="all">All types ({allKeys.length})</option>
              <option value="named">Named flavors ({namedKeys.length})</option>
              <option value="generic">Generic buckets ({genericKeys.length})</option>
            </select>
          </label>
        </div>
        <button className="btn" onClick={resetAll}>Reset rankings</button>
      </div>

      <div className="tier-list">
        {TIERS.map(t => {
          const items = rankings[t.key].filter(k => visibleSet.has(k));
          return (
            <div key={t.key} className="tier-row" style={{ ['--tier-color' as never]: t.color } as React.CSSProperties}>
              <div className="tier-label">{t.label}</div>
              <div
                className={'tier-items' + (dropTarget === t.key ? ' drop-target' : '')}
                onDragOver={(e) => onDragOver(e, t.key)}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, t.key)}
              >
                {items.length === 0 ? (
                  <div style={{ fontSize: 11, color: 'var(--text-subtle)', padding: '8px 4px' }}>Drop types here</div>
                ) : items.map(key => <TierItem key={key} typeKey={key} onDragStart={onDragStart} dragging={dragKey === key} />)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="unranked-bar">
        <h3>Unranked · {rankings.unranked.filter(k => visibleSet.has(k)).length}</h3>
        <div
          className={'tier-items' + (dropTarget === 'unranked' ? ' drop-target' : '')}
          onDragOver={(e) => onDragOver(e, 'unranked')}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, 'unranked')}
          style={{ padding: 0 }}
        >
          {rankings.unranked.filter(k => visibleSet.has(k)).length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>All types ranked.</div>
          ) : rankings.unranked
              .filter(k => visibleSet.has(k))
              .map(key => <TierItem key={key} typeKey={key} onDragStart={onDragStart} dragging={dragKey === key} />)
          }
        </div>
      </div>
    </div>
  );
}

function TierItem({ typeKey, onDragStart, dragging }: {
  typeKey: string;
  onDragStart: (e: DragEvent<HTMLDivElement>, key: string) => void;
  dragging: boolean;
}) {
  const type = ALL_TYPES[typeKey];
  if (!type) return null;
  const variants = combosForType(typeKey);
  const firstSlug = variants[0]?.slug;
  return (
    <div
      className={'tier-item' + (dragging ? ' dragging' : '')}
      draggable
      onDragStart={(e) => onDragStart(e, typeKey)}
      title={`${type.subtitle} · ${variants.length} variants`}
      style={{ borderColor: `${type.accent}66` }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: type.accent, marginRight: 2 }} />
      <span>{type.title}</span>
      {firstSlug && (
        <Link
          to={`/play/${firstSlug}`}
          onClick={(e) => e.stopPropagation()}
          style={{ fontSize: 10.5, color: 'var(--text-subtle)', marginLeft: 4 }}
          draggable={false}
        >↗</Link>
      )}
    </div>
  );
}
