import React, { useState } from 'react';
import { CalendarCheck, Megaphone, GraduationCap, Crown, Clock, Gift, CalendarClock, ArrowRight, MessageSquareHeart, FileSearch, Briefcase } from 'lucide-react';
import PageHero from '../../components/common/PageHero.jsx';
import ApplicationForm from './ApplicationForm.jsx';
import { Reveal, TiltCard } from '../../lib/motion.jsx';
import { useApi } from '../../lib/api.js';
import { formatDate, saskatoonToday } from '../../lib/dates.js';
import './GetInvolvedPage.css';

const LADDER = [
  { icon: CalendarCheck, title: 'Attend', text: 'Drop into any event. No sign-up, no experience needed.' },
  { icon: Megaphone, title: 'Volunteer', text: 'Help run events and meet the community behind the scenes.' },
  { icon: GraduationCap, title: 'Mentor', text: 'Guide beginners in labs and portfolio nights.' },
  { icon: Crown, title: 'Lead', text: 'Join a committee or the exec team and shape the club.' },
];

const TYPE_LABELS = { volunteer: 'Volunteer', mentor: 'Mentor', committee: 'Committee', executive: 'Leadership' };

function daysLeft(deadline) {
  if (!deadline) return null;
  const t = saskatoonToday();
  const [y, m, d] = deadline.split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(t.year, t.month, t.day)) / 86400000);
}

export default function GetInvolvedPage() {
  const { data: roles = [], loading, error } = useApi('/api/opportunities', { initial: [] });
  const [selectedRoleId, setSelectedRoleId] = useState(null);

  const applyFor = (id) => {
    setSelectedRoleId(id);
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="app-container page-padded involved-page">
      <PageHero
        title="Build the club. Build your portfolio."
        lead="Every role at UXCO is a chance to lead, teach and grow — and it looks great on a resume. Pick the level that fits your schedule."
      >
        <a href="#roles" className="btn-primary">See open roles <ArrowRight size={16} /></a>
        <a href="#mentorship" className="btn-secondary">Book a portfolio review</a>
      </PageHero>

      {/* Involvement ladder */}
      <section className="involve-ladder" aria-label="Ways to get involved">
        {LADDER.map(({ icon: Icon, title, text }, i) => (
          <Reveal key={title} variant="up" delay={i * 120} className="ladder-step" style={{ '--lift': `${i * 18}px` }}>
            <span className="ladder-icon"><Icon size={22} /></span>
            <span className="ladder-index">Step {i + 1}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </Reveal>
        ))}
      </section>

      {/* Open roles */}
      <section id="roles" className="involve-section">
        <Reveal variant="up" className="involve-head">
          <span className="section-eyebrow">Now recruiting</span>
          <h2 className="section-heading">Open roles</h2>
        </Reveal>

        {loading ? (
          <div className="roles-grid">{[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 230 }} />)}</div>
        ) : error ? (
          <div className="state-box is-error">Couldn’t load open roles. Please refresh in a moment.</div>
        ) : roles.length === 0 ? (
          <div className="state-box">No roles are open right now — check back soon or say hi on Discord!</div>
        ) : (
          <div className="roles-grid">
            {roles.map((role, i) => {
              const left = daysLeft(role.deadline);
              return (
                <Reveal key={role.id} variant="up" delay={(i % 3) * 100}>
                  <TiltCard className={`role-card type-${role.type} ${selectedRoleId === role.id ? 'is-selected' : ''}`} maxDeg={5}>
                    <div className="role-card-top">
                      <span className="role-type">{TYPE_LABELS[role.type]}</span>
                      {left !== null && (
                        <span className={`role-deadline ${left <= 7 ? 'soon' : ''}`}>
                          <CalendarClock size={13} />
                          {left <= 0 ? 'Closes today' : `${left} day${left === 1 ? '' : 's'} left`}
                        </span>
                      )}
                    </div>
                    <h3 className="role-title">{role.title}</h3>
                    <p className="role-desc">{role.description}</p>
                    <ul className="role-facts">
                      {role.commitment && <li><Clock size={14} /> {role.commitment}</li>}
                      {role.perks && <li><Gift size={14} /> {role.perks}</li>}
                      {role.deadline && <li><CalendarClock size={14} /> Apply by {formatDate(role.deadline, { weekday: false })}</li>}
                    </ul>
                    <button type="button" className="role-apply-btn" onClick={() => applyFor(role.id)}>
                      Apply <ArrowRight size={15} />
                    </button>
                  </TiltCard>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>

      {/* Application form */}
      {roles.length > 0 && (
        <section id="apply" className="involve-section involve-form-section">
          <Reveal variant="left" className="involve-form-intro">
            <span className="section-eyebrow">Apply</span>
            <h2 className="section-heading">Tell us about you</h2>
            <p className="section-lead">
              Takes about two minutes. An exec will reply by email within a week — no interview prep needed for volunteer roles.
            </p>
          </Reveal>
          <Reveal variant="right" className="involve-form-card" data-obstacle>
            <ApplicationForm kind="role" roles={roles} selectedRoleId={selectedRoleId} onRoleChange={setSelectedRoleId} />
          </Reveal>
        </section>
      )}

      {/* Mentorship booking */}
      <section id="mentorship" className="involve-section involve-form-section mentorship">
        <Reveal variant="left" className="involve-form-intro">
          <span className="section-eyebrow">1-on-1 help</span>
          <h2 className="section-heading">Book a mentorship session</h2>
          <p className="section-lead">
            Get 30 minutes with an exec or industry mentor. Free for every USask student.
          </p>
          <ul className="mentor-perks">
            <li><FileSearch size={18} /> Portfolio and case-study reviews</li>
            <li><Briefcase size={18} /> Resume, LinkedIn and internship advice</li>
            <li><MessageSquareHeart size={18} /> Career chats about UX, product and research</li>
          </ul>
        </Reveal>
        <Reveal variant="right" className="involve-form-card" data-obstacle>
          <ApplicationForm kind="mentorship" />
        </Reveal>
      </section>
    </div>
  );
}
