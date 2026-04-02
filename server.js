const config = require('./src/config');
const { initDatabase } = require('./src/config/database');
const { runMigrations } = require('./src/migrations/001_initial');
const { runSeeds } = require('./src/seeds/001_seed');
const app = require('./src/app');

async function startServer() {
  try {
    // 1. Initialize database
    console.log('Initializing database...');
    await initDatabase();

    // 2. Run migrations
    console.log('Running migrations...');
    runMigrations();

    // 3. Seed data (only if DB is empty)
    console.log('Checking seed data...');
    await runSeeds();

    // 4. Start the server
    app.listen(config.port, () => {
      console.log(`
╔══════════════════════════════════════════════════════╗
║         Finance Dashboard API Server                 ║
╠══════════════════════════════════════════════════════╣
║  Status:       Running                               ║
║  Environment:  ${config.nodeEnv.padEnd(37)}║
║  Port:         ${String(config.port).padEnd(37)}║
║  API Base:     http://localhost:${config.port}/api${' '.repeat(16)}║
║  API Docs:     http://localhost:${config.port}/api-docs${' '.repeat(11)}║
║  Health:       http://localhost:${config.port}/api/health${' '.repeat(10)}║
╠══════════════════════════════════════════════════════╣
║  Demo Accounts:                                      ║
║  admin@example.com    / admin123    (Admin)           ║
║  analyst@example.com  / analyst123  (Analyst)         ║
║  viewer@example.com   / viewer123   (Viewer)          ║
╚══════════════════════════════════════════════════════╝
      `);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
