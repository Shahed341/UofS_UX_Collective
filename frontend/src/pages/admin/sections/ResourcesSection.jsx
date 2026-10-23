import React from 'react';
import { Star } from 'lucide-react';
import CrudSection from '../CrudSection.jsx';
import { StatusPill } from '../ui.jsx';

const RESOURCES = {
  title: 'Resources',
  itemName: 'resource',
  endpoint: '/api/admin/resources',
  defaults: { category: 'guide', level: 'beginner', status: 'published', featured: false, sort_order: 0 },
  fields: [
    { name: 'title', label: 'Title', required: true, full: true },
    { name: 'url', label: 'Link', type: 'url', required: true, full: true },
    { name: 'description', label: 'Short description', type: 'textarea', rows: 2 },
    { name: 'category', label: 'Category', type: 'select', options: ['template', 'guide', 'course', 'tool', 'slides'] },
    { name: 'level', label: 'Level', type: 'select', options: ['beginner', 'intermediate', 'advanced'] },
    { name: 'tags', label: 'Tags', help: 'Comma separated, e.g. figma, portfolio' },
    { name: 'sort_order', label: 'Sort order', type: 'number' },
    { name: 'status', label: 'Status', type: 'select', options: ['published', 'draft'] },
    { name: 'featured', label: 'Exec pick', type: 'checkbox', checkLabel: 'Show in “Exec picks”' },
  ],
  renderRow: (r) => (
    <>
      <strong>{r.featured ? <Star size={14} className="admin-star" /> : null}{r.title}</strong>
      <span className="admin-meta">{r.category} · {r.level} · {r.url}</span>
      {r.status === 'draft' && <span className="admin-pills"><StatusPill tone="muted">draft</StatusPill></span>}
    </>
  ),
};

export default function ResourcesSection() {
  return <CrudSection config={RESOURCES} />;
}
