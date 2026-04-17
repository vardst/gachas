import { Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { resolveBySlug } from '../components/gachas';

export default function Play() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) {
    return (
      <div className="page">
        <div className="empty-state">No gacha specified. <Link to="/">Back to dashboard</Link></div>
      </div>
    );
  }
  const resolved = resolveBySlug(slug);
  if (!resolved) {
    return (
      <div className="page">
        <Link to="/" className="back-link">← Back to dashboard</Link>
        <div className="empty-state">
          No gacha found for slug <code>{slug}</code>.
        </div>
      </div>
    );
  }
  const { Component } = resolved;
  return (
    <Suspense fallback={<div className="page"><div className="empty-state">Loading gacha…</div></div>}>
      <Component slug={slug} />
    </Suspense>
  );
}
