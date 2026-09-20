import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, testConnection } from './db.js';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

app.use(cors());
app.use(express.json());

const startTime = Date.now();

// Base API Documentation
app.get('/api', (req, res) => {
  res.json({
    service: 'UX Collective API Service',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      status: 'GET /api/status',
      events: 'GET /api/events',
      logs: 'GET /api/logs',
      pingDb: 'POST /api/ping-db',
      contact: 'POST /api/contact'
    }
  });
});

// Fast health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'uxco-backend',
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024)
  });
});

// Full end-to-end 3-tier status check (Frontend <-> Node <-> MySQL)
app.get('/api/status', async (req, res) => {
  const dbStatus = await testConnection();

  const fullStatus = {
    service: 'UX Collective System Monitor',
    timestamp: new Date().toISOString(),
    frontend: {
      name: 'React Frontend',
      status: 'active',
      framework: 'React + Vite'
    },
    backend: {
      name: 'Node.js Express Server',
      status: 'connected',
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      port: PORT,
      nodeVersion: process.version
    },
    database: {
      name: 'MySQL Database',
      ...dbStatus
    }
  };

  res.status(dbStatus.connected ? 200 : 503).json(fullStatus);
});

// Retrieve UX Collective events from database
app.get('/api/events', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM uxco_events ORDER BY id ASC');
    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events from database',
      details: error.message
    });
  }
});

// Retrieve connection logs from database
app.get('/api/logs', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM connection_logs ORDER BY id DESC LIMIT 10');
    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch connection logs',
      details: error.message
    });
  }
});

// Perform an interactive ping write & read in MySQL
app.post('/api/ping-db', async (req, res) => {
  const { source = 'React Frontend', message = 'Interactive connection test' } = req.body || {};
  const writeStart = Date.now();

  try {
    const [insertResult] = await pool.query(
      'INSERT INTO connection_logs (source, message) VALUES (?, ?)',
      [source, `${message} at ${new Date().toLocaleTimeString()}`]
    );

    const writeLatency = Date.now() - writeStart;
    const [recentLogs] = await pool.query('SELECT * FROM connection_logs ORDER BY id DESC LIMIT 5');

    res.json({
      success: true,
      insertedId: insertResult.insertId,
      writeLatencyMs: writeLatency,
      timestamp: new Date().toISOString(),
      recentLogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to record ping in MySQL',
      details: error.message
    });
  }
});

// Submit contact form into MySQL
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: 'Name, email, and message are required fields.'
    });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO contact_submissions (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name, email, subject || 'General Inquiry', message]
    );

    res.json({
      success: true,
      submissionId: result.insertId,
      message: 'Your message has been stored in the database.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to save contact submission',
      details: error.message
    });
  }
});

// Start Express Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 UXCO Node.js backend server running on http://0.0.0.0:${PORT}`);
});
