-- UX Collective schema. Every statement is idempotent; migrate.js runs this on each backend start.
-- All DATETIME values are stored in Saskatoon local time (America/Regina, UTC-6, no DST).

CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(160) NOT NULL UNIQUE,
    title VARCHAR(160) NOT NULL,
    category VARCHAR(60) NOT NULL,
    start_at DATETIME NOT NULL,
    end_at DATETIME NULL,
    location VARCHAR(160) NOT NULL,
    summary VARCHAR(300) NOT NULL DEFAULT '',
    description TEXT NOT NULL,
    highlights JSON NULL,
    cover_image VARCHAR(500) NOT NULL DEFAULT '',
    recap TEXT NULL,
    slides_url VARCHAR(500) NOT NULL DEFAULT '',
    recording_url VARCHAR(500) NOT NULL DEFAULT '',
    rsvp_url VARCHAR(500) NOT NULL DEFAULT '',
    partners VARCHAR(300) NOT NULL DEFAULT '',
    attendees INT NULL,
    featured TINYINT(1) NOT NULL DEFAULT 0,
    status ENUM('draft', 'published') NOT NULL DEFAULT 'published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_events_start (start_at)
);

CREATE TABLE IF NOT EXISTS event_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    url VARCHAR(500) NOT NULL,
    caption VARCHAR(200) NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(160) NOT NULL,
    description VARCHAR(400) NOT NULL DEFAULT '',
    category ENUM('template', 'guide', 'course', 'tool', 'slides') NOT NULL DEFAULT 'guide',
    level ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner',
    url VARCHAR(500) NOT NULL,
    thumbnail VARCHAR(500) NOT NULL DEFAULT '',
    tags VARCHAR(200) NOT NULL DEFAULT '',
    featured TINYINT(1) NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    status ENUM('draft', 'published') NOT NULL DEFAULT 'published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS opportunities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(160) NOT NULL,
    type ENUM('volunteer', 'executive', 'mentor', 'committee') NOT NULL DEFAULT 'volunteer',
    description TEXT NOT NULL,
    commitment VARCHAR(120) NOT NULL DEFAULT '',
    perks VARCHAR(300) NOT NULL DEFAULT '',
    deadline DATE NULL,
    is_open TINYINT(1) NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kind ENUM('role', 'mentorship') NOT NULL,
    opportunity_id INT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    program VARCHAR(120) NOT NULL DEFAULT '',
    year_of_study VARCHAR(40) NOT NULL DEFAULT '',
    topic VARCHAR(120) NOT NULL DEFAULT '',
    portfolio_url VARCHAR(500) NOT NULL DEFAULT '',
    availability VARCHAR(300) NOT NULL DEFAULT '',
    message TEXT NOT NULL,
    status ENUM('new', 'reviewing', 'accepted', 'declined') NOT NULL DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    pronouns VARCHAR(30) NOT NULL DEFAULT '',
    role VARCHAR(100) NOT NULL,
    major VARCHAR(120) NOT NULL DEFAULT '',
    fact VARCHAR(200) NOT NULL DEFAULT '',
    image_url VARCHAR(500) NOT NULL DEFAULT '',
    is_lead TINYINT(1) NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(60) PRIMARY KEY,
    setting_value VARCHAR(500) NOT NULL
);

CREATE TABLE IF NOT EXISTS contact_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game VARCHAR(30) NOT NULL,
    name VARCHAR(24) NOT NULL,
    score INT NOT NULL,
    accuracy TINYINT UNSIGNED NULL,
    time_ms INT NULL,
    detail JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_scores_game (game, score)
);

-- Tables from the original prototype that are no longer used
DROP TABLE IF EXISTS uxco_events;
DROP TABLE IF EXISTS connection_logs;
