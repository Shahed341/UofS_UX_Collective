-- UX Collective MySQL Database Initialization
CREATE DATABASE IF NOT EXISTS uxco_db;
USE uxco_db;

-- Table to log system connection tests and pings
CREATE TABLE IF NOT EXISTS connection_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source VARCHAR(50) NOT NULL DEFAULT 'React Client',
    message VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store UX Collective events
CREATE TABLE IF NOT EXISTS uxco_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    date VARCHAR(50) NOT NULL,
    location VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    calendar_link VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store Contact submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial seed data
INSERT INTO connection_logs (source, message) VALUES
('System Init', 'MySQL Database successfully initialized inside Docker container'),
('Docker Healthcheck', 'Initial database connection verified healthy');

-- Real events extracted from UXCO LinkedIn & Campus Partners
INSERT INTO uxco_events (title, category, date, location, description, calendar_link) VALUES
('Tech Internship Panel: Landing Your First Role', 'Panel & Networking', 'Friday, Sep 25, 2026 • 5:00 PM - 7:00 PM', 'Arts 146, UofS Campus', 'Teaming up with the Computer Science Student Society (CSSS), USask Cybersecurity Club, AWS Student Builder Group, and USask Game Dev Club for a panel with past interns, open Q&A, and networking with snacks funded by USSU.', 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Tech+Internship+Panel+How+to+Land+Your+First+Role&location=Arts+146'),
('USask Cybersecurity Fall Semester Meeting', 'Club Collab & Talk', 'Wednesday, Sep 16, 2026 • 6:00 PM', 'Thorvaldson S311 (Spinks 3rd Floor)', 'Beginner-friendly first talk covering cybersecurity fundamentals, semester workshops, and upcoming CTF competitions.', 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=USask+Cybersecurity+Club+Meeting&location=Thorvaldson+S311'),
('Fall UX Design Sprint & Portfolio Night', 'Workshop & Critique', 'Wednesday, Oct 14, 2026 • 5:30 PM - 7:30 PM', 'Thorvaldson Hall 105', 'Interactive workshop exploring design systems, Figma variable logic, component architecture, and 1-on-1 portfolio feedback.', 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Fall+UX+Design+Sprint&location=Thorvaldson+Hall+105'),
('Executive Team Meet & Greet', 'Community Social', 'Thursday, Oct 29, 2026 • 4:30 PM', 'Collaborative Science Hub', 'Meet the 2026/27 UXCO Executive Team, learn how to get involved in club projects, and pitch your ideas for campus design workshops.', 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=UXCO+Executive+Meet+and+Greet&location=Collaborative+Science+Hub');
