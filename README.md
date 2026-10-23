# U of S UX Collective — Website

The website of the University of Saskatchewan UX Collective: events, past event recaps, a resource hub, ways to get involved, a game corner, and an admin panel for execs.

- **`frontend/`**: React 18 + Vite, React Router
- **`backend/`**: Node.js + Express REST API
- **`database/`**: MySQL 8 (tables are created and seeded by the backend on startup)

---

## 🚀 Running locally

```bash
docker compose up -d --build
```

| Service | URL |
|---|---|
| Website | http://localhost:3000 |
| Backend API | http://localhost:5002/api/health |
| MySQL | `localhost:3308` (user `uxco_user`, password `uxco_password`) |

> The host ports for the API (5002) and MySQL (3308) were changed from 5000/3306 to avoid clashing with other local projects. The containers still talk to each other on the standard ports.

After changing `backend/package.json` or `frontend/package.json`, rebuild with fresh dependency volumes:

```bash
docker compose up -d --build -V
```

Stop everything with `docker compose down` (add `-v` to also wipe the database and uploaded photos).

---

## 🗺️ Site map

| Page | Path |
|---|---|
| Home (hero, next-event countdown, calendar, recaps, gallery, FAQ) | `/` |
| About + executive team | `/about` |
| Upcoming events | `/events` |
| Past event archive | `/events/past` |
| Event detail (recap, photo album, slides) | `/events/:slug` |
| Resource hub + beginner learning path | `/resources` |
| Get involved (roles, applications, mentorship booking) | `/get-involved` |
| Gallery (event albums) | `/gallery` |
| Game Corner (Aim Trainer, Colour Eye, Pixel Perfect + weekly leaderboard) | `/fun` |
| Contact | `/contact` |
| Admin panel | `/admin` |

---

## 🔐 Admin panel (`/admin`)

Execs manage events, photo albums, resources, open roles, the team, site stats, the inbox (contact messages and applications), calendar subscribers and game scores.

Sign-in is limited to **one Google account**. To set it up:

1. Create an OAuth 2.0 Client ID (type **Web application**) at <https://console.cloud.google.com/apis/credentials>.
2. Under **Authorized JavaScript origins**, add the site origin, e.g. `http://localhost:3000` (and the production domain later).
3. Create a `.env` file in the project root (next to `docker-compose.yml`):

   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ADMIN_EMAIL=the-club-account@gmail.com
   SESSION_SECRET=a-long-random-string
   ```

4. Restart the backend: `docker compose up -d backend`.

Until Google is configured, the login page shows a **"Continue as local dev admin"** button. It only works when `NODE_ENV` isn't `production`; set `ALLOW_DEV_LOGIN=false` to hide it.

Uploaded photos are stored in the `uploads_data` Docker volume and served from `/uploads/...`.

---

## 📅 Calendar subscriptions

- **Live feed:** `/api/calendar.ics`. The Events and Home pages have "Google / Apple / Outlook" buttons that subscribe to it, so new or changed events appear in people's calendars automatically. (Google Calendar refreshes subscribed feeds on its own schedule, typically every few hours.)
- **Email invites:** people can subscribe with their email (double opt-in). Confirmed subscribers get a calendar invite whenever an event is published, rescheduled or cancelled.

Email sending needs SMTP settings in the root `.env` (until then, emails are only logged by the backend):

```env
SITE_URL=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=the-club-account@gmail.com
SMTP_PASS=a-google-app-password
MAIL_FROM=UX Collective <the-club-account@gmail.com>
```

For Gmail, create an App Password at <https://myaccount.google.com/apppasswords>.

The subscribable feed and invite links need a **public** `SITE_URL`: Google Calendar can't subscribe to `localhost`.

---

## 🧱 Project structure

```
backend/
  index.js            Express app, route mounting, error handling
  db.js               MySQL pool
  db/schema.sql       Tables (idempotent, runs on every start)
  db/migrate.js       Runs the schema, adds columns, seeds demo data into empty tables
  db/seed.js          Demo events, resources, roles and team
  lib/                auth (Google + signed cookie), uploads, events, iCal, mailer, subscriptions
  routes/             public.js, auth.js, admin.js, calendar.js
frontend/src/
  lib/                api, Saskatoon-time dates, site context, motion (reveals, tilt, count-up…)
  components/         nav, footer, common (hero, lightbox, binary background…), events, team
  pages/              homepage, about, events, resources, involved, gallery, contact, fun, admin
  styles/motion.css   Shared animation system (respects prefers-reduced-motion)
```

Event times are stored and shown in **Saskatoon time** (America/Regina, UTC−6, no daylight saving).
