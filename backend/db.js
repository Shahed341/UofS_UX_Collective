import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'database',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'uxco_user',
  password: process.env.DB_PASSWORD || 'uxco_password',
  database: process.env.DB_NAME || 'uxco_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  // Return DATETIME columns as 'YYYY-MM-DD HH:MM:SS' strings in Saskatoon local time, untouched by JS timezones
  dateStrings: true,
};

// Create connection pool
export const pool = mysql.createPool(dbConfig);

// Helper to test database connection and measure latency
export async function testConnection() {
  const startTime = Date.now();
  try {
    const [versionRows] = await pool.query('SELECT VERSION() as version, DATABASE() as db_name, NOW() as server_time');
    const [tablesRows] = await pool.query('SHOW TABLES');

    return {
      connected: true,
      latencyMs: Date.now() - startTime,
      database: versionRows[0]?.db_name || dbConfig.database,
      version: versionRows[0]?.version || 'Unknown',
      serverTime: versionRows[0]?.server_time,
      tables: tablesRows.map(row => Object.values(row)[0]),
    };
  } catch (error) {
    return {
      connected: false,
      latencyMs: Date.now() - startTime,
      database: dbConfig.database,
      error: error.message,
    };
  }
}
