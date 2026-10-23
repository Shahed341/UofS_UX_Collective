/**
 * UX Collective — frontend/src/pages/homepage/HomeInvolveSection.jsx
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, BookOpen, HandHeart, CalendarClock } from 'lucide-react';
import { Reveal, TiltCard } from '../../lib/motion.jsx';
import { useApi } from '../../lib/api.js';
import { formatDate } from '../../lib/dates.js';

// Bottom-of-homepage section: a peek at the resource hub and open roles.
export default function HomeInvolveSection() {
  const { data: resources = [] } = useApi('/api/resources', { initial: [] });
  const { data: roles = [] } = useApi('/api/opportunities', { initial: [] });
  const picks = resources.slice(0, 3); // API lists exec picks first

  return (
    <section className="home-involve-section">
      <Reveal variant="up" className="home-section-head">
        <span className="section-eyebrow">Grow with us</span>
        <h2 className="section-heading">Learn and get involved</h2>
      </Reveal>

      <div className="home-involve-grid">
        <Reveal variant="left">
          <TiltCard className="involve-panel theme-learn" maxDeg={4}>
            <div className="involve-panel-head">
              <span className="involve-panel-icon"><BookOpen size={22} /></span>
              <div>
                <h3>Resources</h3>
                <p>Templates, guides and workshop slides.</p>
              </div>
            </div>
            <ul className="involve-panel-list">
              {picks.map((r) => (
                <li key={r.id}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer">
                    <span className="involve-item-title">{r.title}</span>
                    <span className="involve-item-meta">{r.level}</span>
                    <ArrowUpRight size={15} />
                  </a>
                </li>
              ))}
            </ul>
            <Link to="/resources" className="involve-panel-cta">
              Browse all resources <ArrowRight size={16} />
            </Link>
          </TiltCard>
        </Reveal>

        <Reveal variant="right" delay={120}>
          <TiltCard className="involve-panel theme-join" maxDeg={4}>
            <div className="involve-panel-head">
              <span className="involve-panel-icon"><HandHeart size={22} /></span>
              <div>
                <h3>Get involved</h3>
                <p>Volunteer, mentor or join the team.</p>
              </div>
            </div>
            <ul className="involve-panel-list">
              {roles.length === 0 && <li className="involve-empty">No open roles right now — check back soon.</li>}
              {roles.slice(0, 3).map((role) => (
                <li key={role.id}>
                  <Link to="/get-involved#roles">
                    <span className="involve-item-title">{role.title}</span>
                    <span className="involve-item-meta">
                      {role.deadline ? (
                        <><CalendarClock size={13} /> {formatDate(role.deadline, { weekday: false, year: false, short: true })}</>
                      ) : 'Open'}
                    </span>
                    <ArrowRight size={15} />
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/get-involved" className="involve-panel-cta">
              See roles & mentorship <ArrowRight size={16} />
            </Link>
          </TiltCard>
        </Reveal>
      </div>
    </section>
  );
}
