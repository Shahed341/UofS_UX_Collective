import React from 'react';
import { MessageSquareQuote, Star, UserCheck, Sparkles } from 'lucide-react';

const STUDENT_COMMENTS = [
  {
    id: 1,
    name: 'Alex Patel',
    role: '3rd Year Computer Science',
    badge: 'Tech Intern',
    quote: 'UXCO bridged the gap between my CS coursework and production product design. Collaborating on Figma component libraries and design tokens gave me the exact portfolio edge I needed for my summer internship!',
    rating: 5,
    tag: 'Career Growth'
  },
  {
    id: 2,
    name: 'Maya Kowalski',
    role: '4th Year Interactive Systems Design',
    badge: 'UI/UX Lead',
    quote: 'Having an active community on campus focused on user research, usability testing, and design sprints has been transformative. It’s inspiring to work alongside passionate peers across disciplines.',
    rating: 5,
    tag: 'Design Community'
  },
  {
    id: 3,
    name: 'Liam Davies',
    role: '2nd Year Software Engineering',
    badge: 'Developer',
    quote: 'The collaborative events with CSSS and Cybersecurity Club opened my eyes to real design-to-development handoffs. Building with React and Docker connected theory directly to real-world code.',
    rating: 5,
    tag: 'Developer Hand-off'
  },
  {
    id: 4,
    name: 'Jessica Tran',
    role: '3rd Year Computer Science',
    badge: 'Workshop Attendee',
    quote: 'The portfolio critique night was invaluable. Senior student mentors gave me honest, constructive feedback that helped me completely redesign my mobile case studies before applying for jobs.',
    rating: 5,
    tag: 'Portfolio Review'
  }
];

export default function StudentComments() {
  return (
    <section className="comments-section">
      <div className="section-header-centered">
        <span className="section-tag">Student Voices</span>
        <h3 className="section-title">What Students Say About UXCO</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '640px', margin: '6px auto 0 auto' }}>
          Hear from student designers, researchers, and software developers across the University of Saskatchewan campus.
        </p>
      </div>

      <div className="comments-grid">
        {STUDENT_COMMENTS.map((item) => (
          <div key={item.id} className="comment-card">
            <div className="comment-header">
              <div className="comment-stars">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} size={14} fill="#FA9B7A" color="#FA9B7A" />
                ))}
              </div>
              <span className="comment-tag">{item.tag}</span>
            </div>

            <p className="comment-quote">"{item.quote}"</p>

            <div className="comment-author">
              <div className="author-avatar">
                {item.name.charAt(0)}
              </div>
              <div>
                <h4 className="author-name">{item.name}</h4>
                <p className="author-role">🎓 {item.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
