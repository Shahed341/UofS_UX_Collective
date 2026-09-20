# UX Collective — Full Stack Docker Architecture

A containerized full-stack application featuring:
- **`frontend/`**: React 18 (JavaScript, Vite) served via Nginx on port **3000**
  - Specific page folders: `homepage/`, `about/`, `events/`, `gallery/`, `contact/`
  - Component folders: `nav/`, `footer/`, `common/`
- **`backend/`**: Node.js Express REST API on port **5000**
- **`database/`**: MySQL 8.0 with automated health checks, schema initialization & seed data on port **3306**
- **Design System**: Plain white background (`#FFFFFF`) with official UXCO palette (`#E81D88`, `#F46FC2`, `#FB8AA2`, `#FA9B7A`, `#FDCEA1`, `#333333`).

---

## 📁 Folder Structure

```
UX_Collectives/
├── docker-compose.yml
├── .env.example
├── README.md
├── database/
│   └── init.sql                 # MySQL schema, seed events, and ping log table
├── backend/
│   ├── package.json             # Express, mysql2, cors, dotenv
│   ├── index.js                 # API endpoints (health, status, events, logs, ping, contact)
│   ├── db.js                    # MySQL connection pooling & diagnostics
│   ├── Dockerfile
│   ├── .dockerignore
│   └── .env
└── frontend/
    ├── package.json             # React 18, Vite, Lucide Icons
    ├── vite.config.js
    ├── index.html
    ├── nginx.conf               # Nginx reverse proxy configuration
    ├── Dockerfile               # Multi-stage build
    ├── .dockerignore
    ├── public/
    │   ├── logo.jpg
    │   ├── welcome.jpg
    │   ├── palette.jpg
    │   └── thorvaldson_preview.jpg
    └── src/
        ├── main.jsx
        ├── index.css            # UXCO design system variables
        ├── App.jsx              # Navigation & state orchestration
        ├── App.css
        ├── components/
        │   ├── nav/
        │   │   ├── Navbar.jsx
        │   │   └── Navbar.css
        │   ├── footer/
        │   │   ├── Footer.jsx
        │   │   └── Footer.css
        │   └── common/
        │       └── ColorPaletteBar.jsx
        └── pages/
            ├── homepage/
            │   ├── HomePage.jsx
            │   ├── HeroSection.jsx
            │   ├── ConnectionStatus.jsx
            │   └── HomePage.css
            ├── about/
            │   ├── AboutPage.jsx
            │   └── AboutPage.css
            ├── events/
            │   ├── EventsPage.jsx
            │   └── EventsPage.css
            ├── gallery/
            │   ├── GalleryPage.jsx
            │   └── GalleryPage.css
            └── contact/
                ├── ContactPage.jsx
                └── ContactPage.css
```

---

## 🚀 How to Run

1. Start all services:
   ```bash
   docker compose up -d --build
   ```

2. Open **[http://localhost:3000](http://localhost:3000)** in your browser.
3. Test full-stack connectivity:
   - Check the **Connected Multi-Tier Pipeline** indicator.
   - Click **"Test Full Stack Ping"** to test a round-trip write & read directly in MySQL.
   - Browse the **Events** page to see real database records with "Add to Google Calendar" links.
   - Submit the **Contact** form to verify write persistence to `contact_submissions`.

---

## 🛑 How to Stop

```bash
docker compose down
```
To remove database volumes:
```bash
docker compose down -v
```
