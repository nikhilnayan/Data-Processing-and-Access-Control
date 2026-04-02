const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

let wrapper = null;
let currentDbPath = null;

// ── Compatibility Wrapper ────────────────────────────────────────────
// Provides a better-sqlite3–compatible API on top of sql.js,
// so model and service code doesn't need to know which driver is used.

/**
 * Wraps a single SQL string and exposes .get(), .all(), .run()
 * matching the better-sqlite3 PreparedStatement interface.
 */
class PreparedStatement {
  constructor(db, sql, saveFn) {
    this._db = db;
    this._sql = sql;
    this._save = saveFn;
  }

  /** Execute query and return the first row, or undefined. */
  get(...params) {
    const stmt = this._db.prepare(this._sql);
    if (params.length > 0) stmt.bind(params);
    let result;
    if (stmt.step()) {
      result = stmt.getAsObject();
    }
    stmt.free();
    return result;
  }

  /** Execute query and return all matching rows as an array. */
  all(...params) {
    const stmt = this._db.prepare(this._sql);
    if (params.length > 0) stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  /** Execute a write statement (INSERT/UPDATE/DELETE). */
  run(...params) {
    this._db.run(this._sql, params);
    const changes = this._db.getRowsModified();
    const idResult = this._db.exec('SELECT last_insert_rowid() AS id');
    const lastInsertRowid = idResult.length > 0 ? idResult[0].values[0][0] : 0;
    this._save();
    return { changes, lastInsertRowid };
  }
}

/**
 * Wraps the sql.js Database instance and exposes the same interface
 * that the rest of the codebase expects (prepare, exec, pragma, transaction).
 */
class DatabaseWrapper {
  constructor(sqlJsDb, saveFn) {
    this._db = sqlJsDb;
    this._save = saveFn;
    this._inTransaction = false;
  }

  /** Return a PreparedStatement for `sql`. */
  prepare(sql) {
    return new PreparedStatement(this._db, sql, () => {
      if (!this._inTransaction) this._save();
    });
  }

  /** Run one or more raw SQL statements (e.g. migrations). */
  exec(sql) {
    this._db.exec(sql);
    if (!this._inTransaction) this._save();
  }

  /** Set a PRAGMA (best-effort; some are no-ops under sql.js). */
  pragma(str) {
    try {
      this._db.exec(`PRAGMA ${str}`);
    } catch (_) {
      // WAL mode etc. are unavailable in sql.js – ignore silently
    }
  }

  /**
   * Wrap `fn` in a BEGIN/COMMIT transaction.
   * Returns a new function that, when called, executes the transaction.
   */
  transaction(fn) {
    const self = this;
    return function (...args) {
      self._inTransaction = true;
      self._db.exec('BEGIN TRANSACTION');
      try {
        const result = fn(...args);
        self._db.exec('COMMIT');
        self._inTransaction = false;
        self._save();
        return result;
      } catch (err) {
        self._db.exec('ROLLBACK');
        self._inTransaction = false;
        throw err;
      }
    };
  }

  close() {
    this._save();
    this._db.close();
  }
}

// ── Module API ───────────────────────────────────────────────────────

function saveToDisk() {
  if (wrapper && currentDbPath) {
    const data = wrapper._db.export();
    fs.writeFileSync(currentDbPath, Buffer.from(data));
  }
}

/**
 * Initialize the database connection (async because sql.js loads WASM).
 * Creates the data directory if it doesn't exist.
 * @param {string} [dbPath] - Override path (used in tests).
 * @returns {Promise<DatabaseWrapper>}
 */
async function initDatabase(dbPath) {
  const config = require('./index');
  const resolvedPath = dbPath || config.db.path;
  currentDbPath = resolvedPath;

  const dir = path.dirname(resolvedPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const SQL = await initSqlJs();

  let sqlJsDb;
  if (fs.existsSync(resolvedPath)) {
    const fileBuffer = fs.readFileSync(resolvedPath);
    sqlJsDb = new SQL.Database(fileBuffer);
  } else {
    sqlJsDb = new SQL.Database();
  }

  wrapper = new DatabaseWrapper(sqlJsDb, saveToDisk);

  // Enable foreign keys (WAL is irrelevant for sql.js)
  wrapper.pragma('foreign_keys = ON');

  return wrapper;
}

/**
 * Get the current database wrapper.
 * @returns {DatabaseWrapper}
 */
function getDatabase() {
  if (!wrapper) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return wrapper;
}

/**
 * Close the database connection and flush to disk.
 */
function closeDatabase() {
  if (wrapper) {
    wrapper.close();
    wrapper = null;
    currentDbPath = null;
  }
}

module.exports = { initDatabase, getDatabase, closeDatabase };
