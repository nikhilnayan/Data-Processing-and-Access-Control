const path = require('path');
const { initDatabase } = require('../src/config/database');
const { runMigrations } = require('../src/migrations/001_initial');
const { runSeeds } = require('../src/seeds/001_seed');
const app = require('../src/app');

// Vercel serverless instances can be reused, so we track initialization
let isDbInitialized = false;

module.exports = async (req, res) => {
  // 1. Vercel's filesystem is read-only, EXCEPT for the /tmp directory.
  // We MUST map the SQLite database to /tmp so we can write to it.
  if (process.env.VERCEL) {
    process.env.DB_PATH = '/tmp/finance.db';
  }

  // 2. Initialize the database on "cold start" (when a new serverless function spins up)
  if (!isDbInitialized) {
    try {
      await initDatabase();
      runMigrations();
      await runSeeds();
      isDbInitialized = true;
      console.log('Database initialized in Vercel environment.');
    } catch (err) {
      console.error('Failed to initialize database:', err);
      // Even if init fails, we'll try to pass the request so we can see the error,
      // but usually we'd want to return a 500 error here.
    }
  }

  // 3. Forward the request and response objects to our Express app
  return app(req, res);
};
