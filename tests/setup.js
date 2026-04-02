const path = require('path');
const fs = require('fs');
const { initDatabase, closeDatabase } = require('../src/config/database');
const { runMigrations } = require('../src/migrations/001_initial');
const { runSeeds } = require('../src/seeds/001_seed');

const TEST_DB_PATH = path.join(__dirname, '..', 'data', 'test.db');

/**
 * Set up a fresh test database before each test suite.
 */
async function setupTestDatabase() {
  // Remove old test database if it exists
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }

  // Ensure data directory exists
  const dir = path.dirname(TEST_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Initialize fresh database
  await initDatabase(TEST_DB_PATH);
  runMigrations();
  await runSeeds();
}

/**
 * Clean up test database after tests complete.
 */
function teardownTestDatabase() {
  closeDatabase();
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
}

module.exports = { setupTestDatabase, teardownTestDatabase, TEST_DB_PATH };
