/**
 * UX Collective — backend/db/seed.js
 * Author: Md Shahed
 * Date: 2026-10-23
 */
// Demo content inserted into empty tables on first start.
// Everything here is editable (or deletable) from the admin panel.

const img = (id, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const DEMO_EVENTS = [
  {
    slug: 'figma-crash-course-winter-2026',
    title: 'Figma Crash Course: Zero to Prototype',
    category: 'Hands-on Workshop',
    start_at: '2026-02-11 17:30:00',
    end_at: '2026-02-11 19:30:00',
    location: 'Thorvaldson Hall 105',
    summary: 'A beginner-friendly lab where everyone left with a clickable prototype.',
    description: 'Our most requested workshop. We covered frames, auto layout, components and prototyping, then everyone built a small mobile app flow from scratch.',
    highlights: ['Auto layout fundamentals', 'Components & variants', 'Clickable prototype in 90 minutes'],
    cover_image: img('photo-1581291518857-4e27b48ff24e'),
    recap: 'Over 60 students packed Thorvaldson 105 for our first workshop of the winter term. Most attendees had never opened Figma before, and by the end of the night every table was demoing a working prototype. Thank you to everyone who stayed late to help their neighbours!',
    slides_url: 'https://www.figma.com/resource-library/design-basics/',
    attendees: 62,
    photos: [
      ['photo-1522202176988-66273c2fd55f', 'Pairs working through the auto layout exercise'],
      ['photo-1531403009284-440f080d1e12', 'Live demo on the projector'],
      ['photo-1517245386807-bb43f82c33c4', 'Prototype show-and-tell']
    ]
  },
  {
    slug: 'spring-portfolio-showcase-2026',
    title: 'Spring Portfolio Showcase',
    category: 'Showcase & Critique',
    start_at: '2026-04-02 16:00:00',
    end_at: '2026-04-02 19:00:00',
    location: 'Arts & Science Student Lounge',
    summary: 'Graduating members presented case studies to local designers and recruiters.',
    description: 'An end-of-year showcase where members presented portfolio case studies and received feedback from Saskatoon product designers.',
    highlights: ['12 student case studies', 'Feedback from industry designers', 'Networking with local studios'],
    cover_image: img('photo-1524178232363-1fb2b075b655'),
    recap: 'Twelve members shared case studies ranging from campus wayfinding to a budgeting app for students. Designers from zu and other local studios gave 1-on-1 feedback at each table.',
    partners: 'zu',
    attendees: 85,
    photos: [
      ['photo-1515187029135-18ee286d815b', 'Case study presentations'],
      ['photo-1497366216548-37526070297c', 'Feedback tables'],
      ['photo-1522071820081-009f0129c71c', 'Networking after the showcase']
    ]
  },
  {
    slug: 'usask-cybersecurity-fall-meeting-2026',
    title: 'USask Cybersecurity Fall Semester Meeting',
    category: 'Club Collab & Talk',
    start_at: '2026-09-16 18:00:00',
    end_at: '2026-09-16 19:30:00',
    location: 'Thorvaldson S311 (Spinks 3rd Floor)',
    summary: 'A beginner-friendly intro to cybersecurity, co-hosted with USask Cyber.',
    description: 'Beginner-friendly first talk covering cybersecurity fundamentals, semester workshops, and upcoming CTF competitions.',
    highlights: ['Beginner-friendly cybersecurity intro', 'Semester workshop preview', 'CTF competition roadmap'],
    cover_image: img('photo-1550751827-4bd374c3f58b'),
    recap: 'We teamed up with the USask Cybersecurity Club to talk about why security and UX are closer than you think — from password flows to phishing-resistant interfaces.',
    partners: 'USask Cybersecurity Club',
    attendees: 40,
    photos: [
      ['photo-1550751827-4bd374c3f58b', 'Opening talk'],
      ['photo-1531482615713-2afd69097998', 'Q&A session']
    ]
  },
  {
    slug: 'tech-internship-panel-2026',
    title: 'Tech Internship Panel: Landing Your First Role',
    category: 'Panel & Networking',
    start_at: '2026-09-25 17:00:00',
    end_at: '2026-09-25 19:00:00',
    location: 'Arts 146, UofS Campus',
    summary: 'Past interns shared how they landed roles in design, dev and security.',
    description: 'Teaming up with the Computer Science Student Society (CSSS), USask Cybersecurity Club, AWS Student Builder Group, and USask Game Dev Club for a panel with past interns, open Q&A, and networking with snacks funded by USSU.',
    highlights: ['1-on-1 intern advice & Q&A', 'Co-hosted with CSSS, Cyber & AWS', 'Snacks funded by USSU'],
    cover_image: img('photo-1475721027785-f74eccf877e2'),
    recap: 'Five panelists, four clubs and a full room. The biggest takeaway: start your portfolio before you feel ready, and apply broadly.',
    partners: 'CSSS, USask Cybersecurity Club, AWS Student Builder Group, USask Game Dev Club',
    attendees: 120,
    photos: [
      ['photo-1475721027785-f74eccf877e2', 'The panel'],
      ['photo-1528605248644-14dd04022da1', 'Networking with snacks']
    ]
  },
  {
    slug: 'fall-ux-design-sprint-2026',
    title: 'Fall UX Design Sprint & Portfolio Night',
    category: 'Workshop & Critique',
    start_at: '2026-10-14 17:30:00',
    end_at: '2026-10-14 19:30:00',
    location: 'Thorvaldson Hall 105',
    summary: 'Design systems, Figma variables and 1-on-1 portfolio feedback.',
    description: 'Interactive workshop exploring design systems, Figma variable logic, component architecture, and 1-on-1 portfolio feedback from senior designers.',
    highlights: ['1-on-1 senior portfolio critiques', 'Figma components & variables', 'Industry feedback from agency designers'],
    cover_image: img('photo-1531403009284-440f080d1e12'),
    recap: 'We built a mini design system together using Figma variables, then switched to portfolio critiques. Slides are linked below.',
    slides_url: 'https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma',
    attendees: 54,
    photos: [
      ['photo-1531403009284-440f080d1e12', 'Design systems walkthrough'],
      ['photo-1522202176988-66273c2fd55f', 'Portfolio critiques'],
      ['photo-1581291518857-4e27b48ff24e', 'Sketching components']
    ]
  },
  {
    slug: 'executive-meet-and-greet-2026',
    title: 'Executive Team Meet & Greet',
    category: 'Community Social',
    start_at: '2026-10-29 16:30:00',
    end_at: '2026-10-29 18:30:00',
    location: 'Collaborative Science Hub',
    summary: 'Meet the 2026/27 exec team and pitch your workshop ideas.',
    description: 'Meet the 2026/27 UXCO Executive Team, learn how to get involved in club projects, and pitch your ideas for campus design workshops and initiatives.',
    highlights: ['Meet the 2026/27 executive team', 'Pitch your own workshop ideas', 'Junior lead recruitment info'],
    cover_image: img('photo-1522071820081-009f0129c71c'),
    featured: 1
  },
  {
    slug: 'figma-to-code-react-2026',
    title: 'Figma to Code: Building Responsive UI with React',
    category: 'Hands-on Workshop',
    start_at: '2026-11-11 17:00:00',
    end_at: '2026-11-11 19:00:00',
    location: 'Spinks Computer Lab 202',
    summary: 'Turn Figma tokens and prototypes into accessible React components.',
    description: 'Learn how to translate design tokens and Figma prototypes into modular, accessible React components and CSS styling in this interactive lab.',
    highlights: ['Figma design tokens to React JSX', 'Responsive CSS & accessibility tips', 'Take-home starter repository'],
    cover_image: img('photo-1498050108023-c5249f4df085')
  },
  {
    slug: 'winter-design-jam-2026',
    title: 'Winter Design Jam & Community Showcase',
    category: 'Design Sprint & Showcase',
    start_at: '2026-11-28 10:00:00',
    end_at: '2026-11-28 17:00:00',
    location: 'Arts & Science Student Lounge',
    summary: 'A one-day design sprint on a real Saskatoon community challenge.',
    description: 'Annual 1-day collaborative design sprint addressing local community challenges, with feedback from industry guest mentors and prizes for top projects.',
    highlights: ['1-day collaborative design sprint', 'Local community problem statement', 'Prizes & industry guest judges'],
    cover_image: img('photo-1515187029135-18ee286d815b')
  },
  {
    slug: 'accessibility-audit-lab-2027',
    title: 'Accessibility Audit Lab',
    category: 'Hands-on Workshop',
    start_at: '2027-01-20 17:30:00',
    end_at: '2027-01-20 19:00:00',
    location: 'Thorvaldson Hall 105',
    summary: 'Audit real campus websites against WCAG with screen readers and contrast tools.',
    description: 'Bring a laptop and learn to audit interfaces for accessibility: keyboard navigation, screen readers, colour contrast and WCAG 2.2 basics.',
    highlights: ['WCAG 2.2 in plain language', 'Screen reader walkthrough', 'Audit a real website'],
    cover_image: img('photo-1573164713988-8665fc963095')
  }
];

export const DEMO_RESOURCES = [
  ['Figma Learn: Design Basics', 'Official beginner path covering frames, layout, components and prototyping.', 'course', 'beginner', 'https://help.figma.com/hc/en-us/categories/360002051613', 'figma, basics', 1],
  ['Laws of UX', 'A beautifully illustrated collection of the psychology principles behind good interfaces.', 'guide', 'beginner', 'https://lawsofux.com/', 'psychology, principles', 1],
  ['10 Usability Heuristics', 'Jakob Nielsen\'s classic heuristics for evaluating any interface.', 'guide', 'beginner', 'https://www.nngroup.com/articles/ten-usability-heuristics/', 'heuristics, evaluation', 0],
  ['Apple Human Interface Guidelines', 'Platform conventions for designing iOS, iPadOS and macOS apps.', 'guide', 'intermediate', 'https://developer.apple.com/design/human-interface-guidelines', 'ios, mobile', 0],
  ['Material Design 3', 'Google\'s open-source design system with components, theming and guidance.', 'guide', 'intermediate', 'https://m3.material.io/', 'android, design systems', 0],
  ['WCAG 2.2 Quick Reference', 'Filterable checklist of accessibility success criteria.', 'tool', 'intermediate', 'https://www.w3.org/WAI/WCAG22/quickref/', 'accessibility', 1],
  ['Contrast Checker', 'Check colour pairs against WCAG AA and AAA in seconds.', 'tool', 'beginner', 'https://webaim.org/resources/contrastchecker/', 'accessibility, colour', 0],
  ['UXCO Portfolio Case Study Template', 'Our Figma template for structuring a case study: problem, process, outcome.', 'template', 'beginner', 'https://www.figma.com/community', 'portfolio, figma', 1],
  ['UXCO User Interview Script', 'A starter script and consent checklist for running your first user interviews.', 'template', 'beginner', 'https://www.nngroup.com/articles/user-interviews/', 'research', 0],
  ['Design Systems with Figma Variables (Fall 2026 slides)', 'Slides from our Fall Design Sprint workshop.', 'slides', 'intermediate', 'https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma', 'design systems, workshop', 0],
  ['Google UX Design Certificate', 'A structured online program covering the full UX process.', 'course', 'beginner', 'https://grow.google/certificates/ux-design/', 'career, certificate', 0],
  ['Refactoring UI Tips', 'Practical visual design tips for developers and designers.', 'guide', 'advanced', 'https://www.refactoringui.com/', 'visual design', 0]
];

export const DEMO_OPPORTUNITIES = [
  ['Event Volunteer', 'volunteer', 'Help us set up, welcome attendees, take photos and run activities at workshops and socials.', '2–4 hours per event', 'Volunteer hours, free snacks, first dibs on workshop seats', null],
  ['Workshop Mentor', 'mentor', 'Already comfortable with Figma or research methods? Help beginners during hands-on labs and portfolio nights.', '1–2 events per month', 'Leadership experience, reference letters', null],
  ['Design Jam Organizing Committee', 'committee', 'Plan our Winter Design Jam: find a community partner, recruit judges and design the challenge brief.', '~2 hours per week until Nov 28', 'Event management experience, credit on all materials', '2026-11-06'],
  ['Junior Director (Winter 2027)', 'executive', 'Shadow an executive and lead a project of your own. A path into the exec team next year.', '3–4 hours per week', 'Exec mentorship, USSU leadership recognition', '2026-12-05']
];

export const DEMO_TEAM = [
  ['Md Shahed', 'he/him', 'Web Developer', '4th Year Computer Science', 'Loves to film his life like a documentary! 🎥', '/team/shahed.jpg', 0],
  ['Kate Wright', 'she/her', 'Social Media Director', '4th Year Interactive Systems Design', 'Designed the 2026 Nuit Blanche Saskatoon brand identity! 🎨', '/team/kate.jpg', 0],
  ['Nina Sproule', 'she/her', 'Vice President', '4th Year Interactive Systems Design', 'Has over 3,000 hours in Solitaire! 🃏', '/team/nina.jpg', 0],
  ['Palima Shrestha', 'she/her', 'President', '4th Year Interactive Systems Design', 'Hiked to Machu Picchu this year! 🥾', '/team/palima.jpg', 1],
  ['Jason Monette', 'he/him', 'Treasurer', '4th Year Software Engineering', 'Used to be a competitive dancer! 🕺', '/team/jason.jpg', 0],
  ['Ayodeji Daramola', 'he/him', 'Events & Communications Director', '3rd Year Computer Science', 'Enjoys photography and graphic design in his free time! 📸', '/team/ayodeji.jpg', 0],
  ['Trushank Lakdawala', 'he/him', 'Upper Year Representative', '4th Year Computer Science', 'Niche TikTok celebrity! 📱', '/team/trushank.jpg', 0]
];

export const DEFAULT_SETTINGS = {
  events_hosted: '40',
  students_helped: '250',
  members_fallback: '308',
  founded_year: '2022',
  discord_invite: 'https://discord.gg/Fx7BUvzdzT'
};
