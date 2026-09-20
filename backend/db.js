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
};

// Create connection pool
export const pool = mysql.createPool(dbConfig);

// Helper to test database connection and measure latency
export async function testConnection() {
  const startTime = Date.now();
  try {
    const connection = await pool.getConnection();
    const [versionRows] = await connection.query('SELECT VERSION() as version, DATABASE() as db_name, NOW() as server_time');
    const [tablesRows] = await connection.query('SHOW TABLES');
    const [countRows] = await connection.query('SELECT COUNT(*) as log_count FROM connection_logs');
    
    connection.release();
    const latency = Date.now() - startTime;

    return {
      connected: true,
      latencyMs: latency,
      host: dbConfig.host,
      database: versionRows[0]?.db_name || dbConfig.database,
      version: versionRows[0]?.version || 'Unknown',
      serverTime: versionRows[0]?.server_time || new Date().toISOString(),
      tablesCount: tablesRows.length,
      tables: tablesRows.map(row => Object.values(row)[0]),
      logCount: countRows[0]?.log_count || 0,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    return {
      connected: false,
      latencyMs: latency,
      host: dbConfig.host,
      database: dbConfig.database,
      error: error.message,
    };
  }
}
