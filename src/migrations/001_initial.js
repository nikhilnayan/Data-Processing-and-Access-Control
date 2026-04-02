const { getDatabase } = require('../config/database');

/**
 * Run all migrations to set up the database schema.
 * Uses a simple idempotent approach — CREATE TABLE IF NOT EXISTS.
 */
function runMigrations() {
  const db = getDatabase();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         TEXT    NOT NULL UNIQUE,
      password_hash TEXT    NOT NULL,
      full_name     TEXT    NOT NULL,
      role          TEXT    NOT NULL DEFAULT 'viewer' CHECK(role IN ('viewer', 'analyst', 'admin')),
      status        TEXT    NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
      created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS financial_records (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      amount      REAL    NOT NULL CHECK(amount > 0),
      type        TEXT    NOT NULL CHECK(type IN ('income', 'expense')),
      category    TEXT    NOT NULL,
      date        TEXT    NOT NULL,
      description TEXT,
      created_by  INTEGER NOT NULL,
      is_deleted  INTEGER NOT NULL DEFAULT 0 CHECK(is_deleted IN (0, 1)),
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    -- Indexes for common query patterns
    CREATE INDEX IF NOT EXISTS idx_records_type       ON financial_records(type);
    CREATE INDEX IF NOT EXISTS idx_records_category   ON financial_records(category);
    CREATE INDEX IF NOT EXISTS idx_records_date       ON financial_records(date);
    CREATE INDEX IF NOT EXISTS idx_records_created_by ON financial_records(created_by);
    CREATE INDEX IF NOT EXISTS idx_records_is_deleted ON financial_records(is_deleted);
    CREATE INDEX IF NOT EXISTS idx_users_email        ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role         ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_status       ON users(status);
  `);
}

module.exports = { runMigrations };
