import { useEffect, useMemo, useState, type DragEvent } from 'react';
import { Link } from 'react-router-dom';
import { combos } from '../data/primitives';

type Tier = 'S' | 'A' | 'B' | 'C' | 'D' | 'unranked';
const TIERS: { key: Tier; color: string; label: string }[] = [
  { key: 'S', color: '#ff7b7b', label: 'S' },
  { key: 'A', color: '#ffa94d', label: 'A' },
  { key: 'B', color: '#ffd86f', label: 'B' },
  { key: 'C', color: '#a0d468', label: 'C' },
  { key: 'D', color: '#7ec4f5', label: 'D' },
];

type Rankings = Record<Tier, string[]>;

const STORAGE_KEY = 'gacha-tier-rankings-v1';

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
  const [filter, setFilter] = useState<'all' | 'named' | 'played'>('named');
  const [dragSlug, setDragSlug] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<Tier | null>(null);

  const allSlugs = useMemo(() => combos.map(c => c.slug), []);
  const namedSlugs = useMemo(() => combos.filter(c => !c.name.includes(' / ')).map(c => c.slug), []);

  // Reconcile: add any missing slugs to unranked based on filter.
  useEffect(() => {
    const inRankings = new Set(Object.values(rankings).flat());
    const source = filter === 'all' ? allSlugs : filter === 'named' ? namedSlugs : namedSlugs;
    const missing = source.filter(s => !inRankings.has(s));
    if (missing.length > 0) {
      setRankings(r => ({ ...r, unranked: [...missing, ...r.unranked] }));
    }
    // Keep only currently-visible items (don't wipe stored ranks).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    saveRankings(rankings);
  }, [rankings]);

  function onDragStart(e: DragEvent<HTMLDivElement>, slug: string) {
    setDragSlug(slug);
    e.dataTransfer.effectAllowed = 'move';
  }
  function onDragOver(e: DragEvent<HTMLDivElement>, tier: Tier) {
    e.preventDefault();
    setDropTarget(tier);
  }
  function onDragLeave() {
    setDropTarget(null);
  }
  function onDrop(e: DragEvent<HTMLDivElement>, tier: Tier) {
    e.preventDefault();
    if (!dragSlug) return;
    setRankings(r => {
      const next: Rankings = { S: [...r.S], A: [...r.A], B: [...r.B], C: [...r.C], D: [...r.D], unranked: [...r.unranked] };
      for (const k of Object.keys(next) as Tier[]) {
        next[k] = next[k].filter(s => s !== dragSlug);
      }
      next[tier].push(dragSlug);
      return next;
    });
    setDragSlug(null);
    setDropTarget(null);
  }

  function resetAll() {
    if (!confirm('Clear all rankings?')) return;
    const fresh: Rankings = { S: [], A: [], B: [], C: [], D: [], unranked: [...(filter === 'all' ? allSlugs : namedSlugs)] };
    setRankings(fresh);
  }

  const visibleSet = filter === 'all' ? new Set(allSlugs) : new Set(namedSlugs);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Tier List</h1>
        <p>Drag gachas into tiers. Rankings save automatically to your browser.</p>
      </header>

      <div className="stats-bar">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label>
            <span style={{ color: 'var(--text-muted)', marginRight: 6 }}>Show:</span>
            <select value={filter} onChange={e => setFilter(e.target.value as 'all' | 'named' | 'played')} style={{ padding: '4px 8px', background: 'var(--surface-muted)', color: 'var(--text)', border: '1px solid var(--border-strong)', borderRadius: 4 }}>
              <option value="named">Named only ({combos.filter(c => !c.name.includes(' / ')).length})</option>
              <option value="all">All combos ({combos.length})</option>
            </select>
          </label>
        </div>
        <button className="btn" onClick={resetAll}>Reset rankings</button>
      </div>

      <div className="tier-list">
        {TIERS.map(t => {
          const items = rankings[t.key].filter(s => visibleSet.has(s));
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
                  <div style={{ fontSize: 11, color: 'var(--text-subtle)', padding: '8px 4px' }}>Drop gachas here</div>
                ) : items.map(slug => <TierItem key={slug} slug={slug} onDragStart={onDragStart} dragging={dragSlug === slug} />)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="unranked-bar">
        <h3>Unranked · {rankings.unranked.filter(s => visibleSet.has(s)).length}</h3>
        <div
          className={'tier-items' + (dropTarget === 'unranked' ? ' drop-target' : '')}
          onDragOver={(e) => onDragOver(e, 'unranked')}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, 'unranked')}
          style={{ padding: 0 }}
        >
          {rankings.unranked.filter(s => visibleSet.has(s)).length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>All gachas have been ranked.</div>
          ) : rankings.unranked
              .filter(s => visibleSet.has(s))
              .map(slug => <TierItem key={slug} slug={slug} onDragStart={onDragStart} dragging={dragSlug === slug} />)
          }
        </div>
      </div>
    </div>
  );
}

function TierItem({ slug, onDragStart, dragging }: { slug: string; onDragStart: (e: DragEvent<HTMLDivElement>, slug: string) => void; dragging: boolean }) {
  const combo = combos.find(c => c.slug === slug);
  if (!combo) return null;
  return (
    <div
      className={'tier-item' + (dragging ? ' dragging' : '')}
      draggable
      onDragStart={(e) => onDragStart(e, slug)}
      title={`${combo.dist.name} · ${combo.banner.name} · ${combo.guarantee.name} · ${combo.currency.name}`}
    >
      <span>{combo.name}</span>
      <Link to={`/play/${slug}`} onClick={(e) => e.stopPropagation()} style={{ fontSize: 10.5, color: 'var(--text-subtle)', marginLeft: 4 }}>↗</Link>
    </div>
  );
}
