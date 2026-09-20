-- UX Collective MySQL Initialization Script
CREATE DATABASE IF NOT EXISTS uxco_db;
USE uxco_db;

-- Table to log system connection pings and status checks
CREATE TABLE IF NOT EXISTS connection_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source VARCHAR(50) NOT NULL DEFAULT 'React Client',
    message VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store UX Collective sample events & showcase data
CREATE TABLE IF NOT EXISTS uxco_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    date VARCHAR(50) NOT NULL,
    location VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial test records to verify database query functionality
INSERT INTO connection_logs (source, message) VALUES
('System Init', 'MySQL Database successfully initialized inside Docker container'),
('Docker Healthcheck', 'Initial database connection verified healthy');

INSERT INTO uxco_events (title, category, date, location, description) VALUES
('Fall UX Design Kickoff', 'Workshop', 'Oct 14, 2026', 'Thorvaldson Hall 105', 'Join us for our first in-person UX workshop covering design systems, Figma component libraries, and user journey mapping.'),
('UX & Developer Hand-off Roundtable', 'Panel Discussion', 'Oct 28, 2026', 'Collaborative Science Hub', 'Learn best practices for bridging UI/UX design into production React & Node.js codebases.'),
('Portfolio Review & Critique Night', 'Critique & Social', 'Nov 12, 2026', 'Online & Room 210', 'Get constructive design feedback from senior industry mentors and peers on your latest portfolio projects.');
