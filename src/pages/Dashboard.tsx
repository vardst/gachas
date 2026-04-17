import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  distributions, banners, guarantees, currencies,
  type Combo,
} from '../data/primitives';
import { ALL_TYPES, combosForType, type GachaType } from '../data/types';

type SortKey = 'title' | 'mechanicFocus' | 'generosity' | 'variants';

interface TypeRow {
  type: GachaType;
  variants: Combo[];
  repCombo: Combo;           // representative combo (first variant)
  maxGenerosity: number;     // highest generosity across variants
  distNames: Set<string>;
  bannerNames: Set<string>;
  guaranteeNames: Set<string>;
  currencyNames: Set<string>;
  tagText: string;
}

function buildRows(): TypeRow[] {
  return Object.values(ALL_TYPES).map(type => {
    const variants = combosForType(type.key);
    const rep = variants[0];
    const distNames = new Set(variants.map(v => v.dist.name));
    const bannerNames = new Set(variants.map(v => v.banner.name));
    const guaranteeNames = new Set(variants.map(v => v.guarantee.name));
    const currencyNames = new Set(variants.map(v => v.currency.name));
    const maxGen = variants.reduce((m, v) => Math.max(m, v.generosity), 0);
    // Most-common tag
    const tagCounts = new Map<string, number>();
    for (const v of variants) tagCounts.set(v.tag.text, (tagCounts.get(v.tag.text) ?? 0) + 1);
    const tagText = [...tagCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    return {
      type, variants, repCombo: rep,
      maxGenerosity: maxGen,
      distNames, bannerNames, guaranteeNames, currencyNames,
      tagText,
    };
  });
}

const ROWS = buildRows();

export default function Dashboard() {
  const [search, setSearch] = useState('');
  const [distId, setDistId] = useState('');
  const [bannerId, setBannerId] = useState('');
  const [guaranteeId, setGuaranteeId] = useState('');
  const [currencyId, setCurrencyId] = useState('');
  const [generosity, setGenerosity] = useState('');
  const [category, setCategory] = useState<'' | 'named' | 'generic'>('');
  const [sortBy, setSortBy] = useState<SortKey>('title');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let rows = ROWS.filter(r => {
      if (category && r.type.category !== category) return false;
      if (distId && !r.variants.some(v => v.dist.id === distId)) return false;
      if (bannerId && !r.variants.some(v => v.banner.id === bannerId)) return false;
      if (guaranteeId && !r.variants.some(v => v.guarantee.id === guaranteeId)) return false;
      if (currencyId && !r.variants.some(v => v.currency.id === currencyId)) return false;
      if (generosity && !r.variants.some(v => v.generosity === parseInt(generosity))) return false;
      if (q) {
        const hay = `${r.type.title} ${r.type.subtitle} ${r.type.flavor} ${r.type.key} ${r.variants.map(v => v.name).join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const dir = sortDir === 'asc' ? 1 : -1;
    rows = rows.slice().sort((a, b) => {
      let va: string | number;
      let vb: string | number;
      switch (sortBy) {
        case 'mechanicFocus': va = a.type.mechanicFocus; vb = b.type.mechanicFocus; break;
        case 'generosity': va = a.maxGenerosity; vb = b.maxGenerosity; break;
        case 'variants': va = a.variants.length; vb = b.variants.length; break;
        default: va = a.type.title; vb = b.type.title;
      }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return rows;
  }, [search, distId, bannerId, guaranteeId, currencyId, generosity, category, sortBy, sortDir]);

  function resetFilters() {
    setSearch(''); setDistId(''); setBannerId(''); setGuaranteeId('');
    setCurrencyId(''); setGenerosity(''); setCategory('');
  }

  const namedCount = ROWS.filter(r => r.type.category === 'named').length;
  const genericCount = ROWS.filter(r => r.type.category === 'generic').length;

  return (
    <div className="page">
      <header className="page-header">
        <h1>Gacha Lab</h1>
        <p>{ROWS.length} distinct gacha types · {namedCount} named flavors + {genericCount} generic buckets. Each card hand-crafted. Click to play; variants (banner/currency) are switchable inside.</p>
      </header>

      <div className="filter-panel">
        <div className="filter-group">
          <label>Search</label>
          <input type="text" placeholder="title, flavor, mechanic..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-group">
          <label>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value as '' | 'named' | 'generic')}>
            <option value="">All</option>
            <option value="named">Named flavors ({namedCount})</option>
            <option value="generic">Generic buckets ({genericCount})</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Distribution</label>
          <select value={distId} onChange={e => setDistId(e.target.value)}>
            <option value="">All</option>
            {distributions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Banner (any variant)</label>
          <select value={bannerId} onChange={e => setBannerId(e.target.value)}>
            <option value="">All</option>
            {banners.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Guarantee (any variant)</label>
          <select value={guaranteeId} onChange={e => setGuaranteeId(e.target.value)}>
            <option value="">All</option>
            {guarantees.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Currency (any variant)</label>
          <select value={currencyId} onChange={e => setCurrencyId(e.target.value)}>
            <option value="">All</option>
            {currencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Generosity (max)</label>
          <select value={generosity} onChange={e => setGenerosity(e.target.value)}>
            <option value="">All</option>
            <option value="1">Harsh (1)</option>
            <option value="2">Light (2)</option>
            <option value="3">Balanced (3)</option>
            <option value="4">Fair (4)</option>
            <option value="5">Generous (5)</option>
            <option value="6">Max (6)</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Sort</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as SortKey)}>
            <option value="title">Title</option>
            <option value="mechanicFocus">Mechanic</option>
            <option value="generosity">Generosity</option>
            <option value="variants">Variant count</option>
          </select>
        </div>
      </div>

      <div className="stats-bar">
        <div>
          Showing <span className="count">{filtered.length}</span> of <span className="count">{ROWS.length}</span> types
          <span style={{ marginLeft: 12, color: 'var(--text-subtle)' }}>· {filtered.reduce((n, r) => n + r.variants.length, 0)} total variants</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}>
            {sortDir === 'asc' ? '↑' : '↓'} {sortBy}
          </button>
          <button className="btn" onClick={resetFilters}>Reset filters</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No types match. Try resetting filters.</div>
      ) : (
        <div className="combo-grid">
          {filtered.map(r => <TypeCard key={r.type.key} row={r} />)}
        </div>
      )}
    </div>
  );
}

function TypeCard({ row }: { row: TypeRow }) {
  const { type, variants, repCombo, maxGenerosity, bannerNames, currencyNames, tagText } = row;
  const tagClass = tagClassFor(tagText);
  return (
    <Link to={`/play/${repCombo.slug}`} className="combo-card" style={{ borderColor: `${type.accent}55` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontWeight: 500, fontSize: 15, color: type.accent }}>{type.title}</div>
        <span style={{ fontSize: 10.5, color: 'var(--text-subtle)', fontFamily: 'ui-monospace, Menlo, monospace', flexShrink: 0, whiteSpace: 'nowrap' }}>
          {variants.length} variant{variants.length === 1 ? '' : 's'}
        </span>
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.4, minHeight: 32 }}>{type.subtitle}</div>
      <div className="axes">
        <span className="tag tag-neutral" style={{ textTransform: 'capitalize' }}>{type.mechanicFocus}</span>
        {bannerNames.size <= 2 && [...bannerNames].map(n => (
          <span key={n} className="tag tag-neutral">{n}</span>
        ))}
        {bannerNames.size > 2 && <span className="tag tag-neutral">{bannerNames.size} banners</span>}
        {currencyNames.size > 1 && <span className="tag tag-neutral">{currencyNames.size} currencies</span>}
      </div>
      <div className="bottom">
        <span className={`tag ${tagClass}`}>{tagText}</span>
        <Pips n={maxGenerosity} accent={type.accent} />
      </div>
    </Link>
  );
}

function Pips({ n, accent }: { n: number; accent: string }) {
  return (
    <div className="generosity-pips" title={`Max generosity ${n}/6`}>
      {Array.from({ length: 6 }).map((_, i) => (
        <span key={i} className={'pip' + (i < n ? ' filled' : '')} style={i < n ? { background: accent, borderColor: accent } : undefined} />
      ))}
    </div>
  );
}

function tagClassFor(tag: string): string {
  switch (tag) {
    case 'Player-hate risk':
    case 'Regulatory risk': return 'tag-danger';
    case 'Whale-focused':
    case 'Harsh': return 'tag-warn';
    case 'F2P-friendly': return 'tag-good';
    case 'Novel': return 'tag-accent';
    default: return 'tag-neutral';
  }
}
