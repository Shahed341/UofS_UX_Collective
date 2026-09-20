# UX Collective — Full Stack Docker Setup

A multi-container setup containing:
- **Frontend**: React (JavaScript, Vite) served via Nginx on port **3000**
- **Backend API**: Node.js Express server on port **5000**
- **Database**: MySQL 8.0 with automatic healthcheck & schema initialization on port **3306**
- **Theme**: Plain white background (`#FFFFFF`) with official UXCO gradient & palette (`#E81D88`, `#F46FC2`, `#FB8AA2`, `#FA9B7A`, `#FDCEA1`, `#333333`)

---

## 🚀 Quick Start

Run the entire stack with a single command:

```bash
docker compose up --build
```

To run in detached background mode:
```bash
docker compose up -d --build
```

---

## 🌐 Access Points

| Service | Address | Description |
| :--- | :--- | :--- |
| **Frontend UI** | [http://localhost:3000](http://localhost:3000) | Interactive React frontpage with 3-tier status visualizer & live MySQL data |
| **API Endpoints** | [http://localhost:5000/api/status](http://localhost:5000/api/status) | JSON diagnostics across React, Node, and MySQL |
| **API Health** | [http://localhost:5000/api/health](http://localhost:5000/api/health) | Node.js process health check |
| **MySQL Events** | [http://localhost:5000/api/events](http://localhost:5000/api/events) | Seeded collective events query |
| **MySQL Port** | `localhost:3306` | MySQL server accessible via any SQL GUI / CLI |

---

## 🛠️ Verification & Diagnostics

1. Open **[http://localhost:3000](http://localhost:3000)** in your browser.
2. Check the **Connected Multi-Tier Pipeline** card — green status indicators will confirm all 3 services are active.
3. Click **"Test Full Stack Ping"** to execute a real-time write ➔ read trip to MySQL and verify query latency.
4. Check the **Live Data Queried From MySQL** section displaying database records from the `uxco_events` table.

---

## 🛑 Stopping the Stack

To stop containers:
```bash
docker compose down
```

To stop containers and wipe the database volume:
```bash
docker compose down -v
```
