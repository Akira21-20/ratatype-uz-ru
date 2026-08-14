import 'dotenv/config';
import pg from 'pg';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const hasPostgres = !!process.env.DATABASE_URL;

let queryDb;

if (hasPostgres) {
  console.log("Using PostgreSQL Database");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  // Initialize tables
  const initDb = async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS custom_lessons (
        id VARCHAR(255) PRIMARY KEY,
        title TEXT,
        text TEXT,
        language VARCHAR(50),
        difficulty VARCHAR(50),
        created_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS test_results (
        id SERIAL PRIMARY KEY,
        wpm INTEGER,
        accuracy INTEGER,
        language VARCHAR(50),
        lesson_id VARCHAR(255),
        completed_at TIMESTAMP
      );
    `);
  };
  initDb().catch(e => console.error("DB Init Error", e));

  queryDb = async (sql, params = []) => {
    // Convert SQLite param syntax (?) to Postgres syntax ($1, $2)
    let pgSql = sql;
    let i = 1;
    while (pgSql.includes('?')) {
      pgSql = pgSql.replace('?', `$${i}`);
      i++;
    }
    const { rows } = await pool.query(pgSql, params);
    return rows;
  };

  queryDb.isPostgres = true;

} else {
  console.log("Using SQLite Database (Local fallback)");
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const dbPath = path.join(__dirname, 'database.sqlite');
  const db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS custom_lessons (
      id TEXT PRIMARY KEY,
      title TEXT,
      text TEXT,
      language TEXT,
      difficulty TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS test_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wpm INTEGER,
      accuracy INTEGER,
      language TEXT,
      lesson_id TEXT,
      completed_at TEXT
    );
  `);

  queryDb = async (sql, params = []) => {
    // For sqlite, if it's a SELECT we use .all(), otherwise .run()
    const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
    const stmt = db.prepare(sql);
    if (isSelect) {
      return stmt.all(...params);
    } else {
      const info = stmt.run(...params);
      return { count: info.changes }; // Simulate count for other queries
    }
  };
  
  queryDb.isPostgres = false;
}

export default queryDb;
