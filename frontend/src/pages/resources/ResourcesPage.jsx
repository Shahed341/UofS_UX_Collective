/**
 * UX Collective — frontend/src/pages/resources/ResourcesPage.jsx
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, LayoutTemplate, GraduationCap, Wrench, Presentation, Search, ArrowUpRight, Star, Compass, Users,
  Accessibility, FileText, MessageSquareHeart
} from 'lucide-react';
import PageHero from '../../components/common/PageHero.jsx';
import { Reveal, TiltCard } from '../../lib/motion.jsx';
import { useApi } from '../../lib/api.js';
import { track } from '../../lib/track.js';
import './ResourcesPage.css';

const CATEGORIES = {
  all: { label: 'Everything', icon: Compass },
  template: { label: 'Templates', icon: LayoutTemplate },
  guide: { label: 'Guides', icon: BookOpen },
  course: { label: 'Courses', icon: GraduationCap },
  tool: { label: 'Tools', icon: Wrench },
  slides: { label: 'Workshop slides', icon: Presentation },
};

const LEVELS = ['all', 'beginner', 'intermediate', 'advanced'];

// A suggested order for complete beginners; each step points somewhere on the site or the hub.
const LEARNING_PATH = [
  { icon: Compass, title: 'Learn the tool', text: 'Get comfortable in Figma: frames, auto layout and components.', filter: { category: 'course' } },
  { icon: Users, title: 'Understand people', text: 'Usability heuristics and how to run your first user interview.', filter: { query: 'research' } },
  { icon: Accessibility, title: 'Design for everyone', text: 'Colour contrast, keyboard access and WCAG basics.', filter: { query: 'accessibility' } },
  { icon: FileText, title: 'Tell the story', text: 'Turn a project into a case study with our portfolio template.', filter: { category: 'template' } },
  { icon: MessageSquareHeart, title: 'Get feedback', text: 'Book a 1-on-1 portfolio review with an exec or mentor.', to: '/get-involved#mentorship' },
];

const hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

function ResourceCard({ resource }) {
  const Icon = CATEGORIES[resource.category]?.icon || BookOpen;
  return (
    <TiltCard
      as="a"
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`resource-card cat-${resource.category}`}
      maxDeg={5}
      onClick={() => track('resource_click', resource.title)}
    >
      <div className="resource-card-top">
        <span className="resource-card-icon"><Icon size={20} /></span>
        <span className={`resource-level level-${resource.level}`}>{resource.level}</span>
      </div>
      <h3 className="resource-card-title">
        {resource.featured && <Star size={15} className="resource-star" aria-label="Exec pick" />}
        {resource.title}
      </h3>
      <p className="resource-card-desc">{resource.description}</p>
      {resource.tags.length > 0 && (
        <div className="resource-tags">
          {resource.tags.map((t) => <span key={t}>#{t}</span>)}
        </div>
      )}
      <span className="resource-card-link">
        {hostOf(resource.url)} <ArrowUpRight size={15} />
      </span>
    </TiltCard>
  );
}

export default function ResourcesPage() {
  const { data: resources = [], loading, error } = useApi('/api/resources', { initial: [] });
  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter((r) =>
      (category === 'all' || r.category === category) &&
      (level === 'all' || r.level === level) &&
      (!q || `${r.title} ${r.description} ${r.tags.join(' ')}`.toLowerCase().includes(q))
    );
  }, [resources, category, level, query]);

  const picks = resources.filter((r) => r.featured).slice(0, 4);

  const applyStep = (step) => {
    setCategory(step.filter.category || 'all');
    setLevel('all');
    setQuery(step.filter.query || '');
    document.getElementById('resource-library')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="app-container page-padded resources-page">
      <PageHero
        title="Everything you need to start designing"
        lead="Templates, guides, courses and workshop slides hand-picked by the UXCO exec team. Free, beginner-friendly and always growing."
      />

      {/* Beginner learning path */}
      <section className="learning-path" aria-labelledby="learning-path-title">
        <Reveal variant="up" className="learning-path-head">
          <span className="section-eyebrow">New to UX?</span>
          <h2 id="learning-path-title" className="section-heading">Your beginner learning path</h2>
        </Reveal>
        <ol className="learning-path-steps">
          {LEARNING_PATH.map((step, i) => {
            const Icon = step.icon;
            const content = (
              <>
                <span className="step-number">{String(i + 1).padStart(2, '0')}</span>
                <span className="step-icon"><Icon size={22} /></span>
                <span className="step-title">{step.title}</span>
                <span className="step-text">{step.text}</span>
              </>
            );
            return (
              <Reveal as="li" key={step.title} variant="up" delay={i * 110} className="learning-step" style={{ '--step': i }}>
                {step.to ? (
                  <Link to={step.to} className="learning-step-inner">{content}</Link>
                ) : (
                  <button type="button" className="learning-step-inner" onClick={() => applyStep(step)}>{content}</button>
                )}
              </Reveal>
            );
          })}
        </ol>
      </section>

      {picks.length > 0 && (
        <section className="exec-picks">
          <Reveal variant="up" className="learning-path-head">
            <span className="section-eyebrow"><Star size={14} /> Exec picks</span>
            <h2 className="section-heading">Start with these</h2>
          </Reveal>
          <div className="resource-grid picks">
            {picks.map((r, i) => (
              <Reveal key={r.id} variant="flip" delay={i * 90}>
                <ResourceCard resource={r} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section id="resource-library" className="resource-library">
        <Reveal variant="up" className="learning-path-head">
          <span className="section-eyebrow">Library</span>
          <h2 className="section-heading">Browse all resources</h2>
        </Reveal>

        <div className="resource-toolbar">
          <div className="pill-row resource-cats" role="tablist" aria-label="Category">
            {Object.entries(CATEGORIES).map(([key, { label, icon: Icon }]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={category === key}
                className={`pill-filter ${category === key ? 'active' : ''}`}
                onClick={() => setCategory(key)}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
          <div className="resource-toolbar-right">
            <label className="resource-level-select">
              <span className="sr-only">Level</span>
              <select className="ux-select" value={level} onChange={(e) => setLevel(e.target.value)}>
                {LEVELS.map((l) => <option key={l} value={l}>{l === 'all' ? 'All levels' : l[0].toUpperCase() + l.slice(1)}</option>)}
              </select>
            </label>
            <label className="archive-search resource-search">
              <Search size={17} aria-hidden="true" />
              <span className="sr-only">Search resources</span>
              <input type="search" placeholder="Search resources…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
          </div>
        </div>

        {loading ? (
          <div className="resource-grid">
            {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton" style={{ height: 220 }} />)}
          </div>
        ) : error ? (
          <div className="state-box is-error">Couldn’t load resources. Please refresh in a moment.</div>
        ) : filtered.length === 0 ? (
          <div className="state-box">
            Nothing matches yet.{' '}
            <button type="button" className="inline-link as-button" onClick={() => { setCategory('all'); setLevel('all'); setQuery(''); }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="resource-grid">
            {filtered.map((r, i) => (
              <Reveal key={r.id} variant="up" delay={(i % 3) * 80}>
                <ResourceCard resource={r} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <Reveal variant="scale" className="resource-suggest" data-obstacle>
        <div>
          <h2>Know a great resource?</h2>
          <p>Send it our way and we’ll add it to the hub for everyone.</p>
        </div>
        <Link to="/contact" className="btn-primary">Suggest a resource</Link>
      </Reveal>
    </div>
  );
}
