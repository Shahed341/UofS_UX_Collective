import React from 'react';

const PAST_STUDENT_COMMENTS = [
  {
    id: 1,
    name: 'Alex Patel',
    role: 'Computer Science • Tech Intern',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    initial: 'A',
    quote: '“UXCO makes finding design mentors and tech workshops so easy! I was able to build real-world Figma prototypes and collaborate directly with developer peers. Highly recommend!”'
  },
  {
    id: 2,
    name: 'Maya Kowalski',
    role: 'Interactive Systems • UI/UX Lead',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    initial: 'M',
    quote: '“Our team needed a flexible workshop space and hands-on portfolio feedback. UXCO delivered exactly what we needed to refine our case studies and land our first design internships!”'
  },
  {
    id: 3,
    name: 'Jessica Tran',
    role: 'Software Engineering • Frontend Mentee',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    initial: 'J',
    quote: '“I love the variety of collaborative events available! Whether I need a peer design critique or an interactive sprint session, UXCO always has the perfect community support.”'
  }
];

export default function StudentComments() {
  return (
    <section className="testimonials-unified-section">
      {/* Center Header */}
      <div className="testimonials-header-block">
        <span className="testimonials-badge-pill">Testimonials</span>
        <h2 className="testimonials-main-title">
          Trusted by creatives and leaders
        </h2>
        <p className="testimonials-sub-title">
          from student designers, developers & researchers across USask
        </p>
      </div>

      {/* 3-Column Reviews (No Star, Clean Quotes & Authors) */}
      <div className="testimonials-reviews-grid">
        {PAST_STUDENT_COMMENTS.map((item) => (
          <div key={item.id} className="testimonial-quote-card">
            <p className="testimonial-quote-text">
              {item.quote}
            </p>

            <div className="testimonial-author-row">
              <img 
                src={item.avatar} 
                alt={item.name} 
                className="testimonial-author-avatar"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = e.target.parentElement.querySelector('.testimonial-fallback-avatar');
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="testimonial-fallback-avatar" style={{ display: 'none' }}>
                {item.initial}
              </div>
              <div className="testimonial-author-info">
                <h4 className="testimonial-author-name">{item.name}</h4>
                <p className="testimonial-author-role">{item.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
