import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  combos, distributions, banners, guarantees, currencies,
  type Combo,
} from '../data/primitives';

type SortKey = 'name' | 'dist' | 'banner' | 'guarantee' | 'currency' | 'generosity' | 'tag';

export default function Dashboard() {
  const [search, setSearch] = useState('');
  const [distId, setDistId] = useState('');
  const [bannerId, setBannerId] = useState('');
  const [guaranteeId, setGuaranteeId] = useState('');
  const [currencyId, setCurrencyId] = useState('');
  const [generosity, setGenerosity] = useState('');
  const [risk, setRisk] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [onlyNamed, setOnlyNamed] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let rows = combos.filter(c => {
      if (distId && c.dist.id !== distId) return false;
      if (bannerId && c.banner.id !== bannerId) return false;
      if (guaranteeId && c.guarantee.id !== guaranteeId) return false;
      if (currencyId && c.currency.id !== currencyId) return false;
      if (generosity && c.generosity !== parseInt(generosity)) return false;
      if (risk) {
        if (risk === 'standard' && c.tag.text !== 'Standard') return false;
        if (risk === 'novel' && c.tag.text !== 'Novel') return false;
        if (risk === 'regulatory' && c.tag.text !== 'Regulatory risk') return false;
        if (risk === 'player-hate' && c.tag.text !== 'Player-hate risk') return false;
        if (risk === 'f2p' && c.tag.text !== 'F2P-friendly') return false;
        if (risk === 'whale' && c.tag.text !== 'Whale-focused') return false;
      }
      if (onlyNamed) {
        const generic = c.name.includes(' / ');
        if (generic) return false;
      }
      if (q) {
        const hay = `${c.name} ${c.example} ${c.notes.join(' ')} ${c.dist.desc} ${c.banner.desc} ${c.slug}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const dir = sortDir === 'asc' ? 1 : -1;
    rows = rows.slice().sort((a, b) => {
      let va: string | number;
      let vb: string | number;
      switch (sortBy) {
        case 'dist': va = a.dist.name; vb = b.dist.name; break;
        case 'banner': va = a.banner.name; vb = b.banner.name; break;
        case 'guarantee': va = a.guarantee.name; vb = b.guarantee.name; break;
        case 'currency': va = a.currency.name; vb = b.currency.name; break;
        case 'generosity': va = a.generosity; vb = b.generosity; break;
        case 'tag': va = a.tag.text; vb = b.tag.text; break;
        default: va = a.name; vb = b.name;
      }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return rows;
  }, [search, distId, bannerId, guaranteeId, currencyId, generosity, risk, sortBy, sortDir, onlyNamed]);

  function toggleSort(key: SortKey) {
    if (sortBy === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortDir('asc'); }
  }

  function resetFilters() {
    setSearch(''); setDistId(''); setBannerId(''); setGuaranteeId('');
    setCurrencyId(''); setGenerosity(''); setRisk(''); setOnlyNamed(false);
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Gacha Dashboard</h1>
        <p>{combos.length} valid combinations of 4 design axes. Click any card to play.</p>
      </header>

      <div className="filter-panel">
        <div className="filter-group">
          <label>Search</label>
          <input type="text" placeholder="name, slug, notes..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-group">
          <label>Distribution</label>
          <select value={distId} onChange={e => setDistId(e.target.value)}>
            <option value="">All</option>
            {distributions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Banner</label>
          <select value={bannerId} onChange={e => setBannerId(e.target.value)}>
            <option value="">All</option>
            {banners.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Guarantee profile</label>
          <select value={guaranteeId} onChange={e => setGuaranteeId(e.target.value)}>
            <option value="">All</option>
            {guarantees.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Currency</label>
          <select value={currencyId} onChange={e => setCurrencyId(e.target.value)}>
            <option value="">All</option>
            {currencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Generosity tier</label>
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
          <label>Tag</label>
          <select value={risk} onChange={e => setRisk(e.target.value)}>
            <option value="">All</option>
            <option value="standard">Standard</option>
            <option value="novel">Novel</option>
            <option value="f2p">F2P-friendly</option>
            <option value="whale">Whale-focused</option>
            <option value="player-hate">Player-hate</option>
            <option value="regulatory">Regulatory</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Sort</label>
          <select value={sortBy} onChange={e => toggleSort(e.target.value as SortKey)}>
            <option value="name">Name</option>
            <option value="dist">Distribution</option>
            <option value="banner">Banner</option>
            <option value="guarantee">Guarantee</option>
            <option value="generosity">Generosity</option>
            <option value="tag">Tag</option>
          </select>
        </div>
      </div>

      <div className="stats-bar">
        <div>
          Showing <span className="count">{filtered.length}</span> of <span className="count">{combos.length}</span>
          <label style={{ marginLeft: 18, fontSize: 12 }}>
            <input type="checkbox" checked={onlyNamed} onChange={e => setOnlyNamed(e.target.checked)} style={{ marginRight: 6 }} />
            Only named/flavored
          </label>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}>
            {sortDir === 'asc' ? '↑' : '↓'} {sortBy}
          </button>
          <button className="btn" onClick={resetFilters}>Reset filters</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No combinations match. Try resetting filters.</div>
      ) : (
        <div className="combo-grid">
          {filtered.map(c => <ComboCard key={c.id} combo={c} />)}
        </div>
      )}
    </div>
  );
}

function ComboCard({ combo }: { combo: Combo }) {
  return (
    <Link to={`/play/${combo.slug}`} className="combo-card">
      <div className="name">{combo.name}</div>
      <div className="slug">{combo.slug}</div>
      <div className="axes">
        <span className="tag tag-neutral">{combo.dist.name}</span>
        <span className="tag tag-neutral">{combo.banner.name}</span>
        <span className="tag tag-neutral">{combo.guarantee.name}</span>
        <span className="tag tag-neutral">{combo.currency.name}</span>
      </div>
      <div className="bottom">
        <span className={`tag ${combo.tag.cls}`}>{combo.tag.text}</span>
        <Pips n={combo.generosity} />
      </div>
    </Link>
  );
}

function Pips({ n }: { n: number }) {
  return (
    <div className="generosity-pips" title={`Generosity ${n}/6`}>
      {Array.from({ length: 6 }).map((_, i) => <span key={i} className={'pip' + (i < n ? ' filled' : '')} />)}
    </div>
  );
}
