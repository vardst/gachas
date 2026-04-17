import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TierList from './pages/TierList';
import Play from './pages/Play';

export default function App() {
  return (
    <HashRouter>
      <nav className="app-nav">
        <div className="brand">Gacha <span>Lab</span></div>
        <div className="links">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
          <NavLink to="/tier-list" className={({ isActive }) => isActive ? 'active' : ''}>Tier list</NavLink>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tier-list" element={<TierList />} />
        <Route path="/play/:slug" element={<Play />} />
      </Routes>
    </HashRouter>
  );
}
