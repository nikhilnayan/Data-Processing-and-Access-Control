const bcrypt = require('bcryptjs');
const { getDatabase } = require('../config/database');

/**
 * Seed the database with demo users and sample financial records.
 * Idempotent: skips seeding if users already exist.
 */
async function runSeeds() {
  const db = getDatabase();

  // Check if data already exists
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count > 0) {
    console.log('Database already seeded. Skipping.');
    return;
  }

  const saltRounds = 10;

  // Create demo users
  const adminHash = await bcrypt.hash('admin123', saltRounds);
  const analystHash = await bcrypt.hash('analyst123', saltRounds);
  const viewerHash = await bcrypt.hash('viewer123', saltRounds);

  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, full_name, role, status)
    VALUES (?, ?, ?, ?, 'active')
  `);

  const insertManyUsers = db.transaction(() => {
    insertUser.run('admin@example.com', adminHash, 'Alice Admin', 'admin');
    insertUser.run('analyst@example.com', analystHash, 'Bob Analyst', 'analyst');
    insertUser.run('viewer@example.com', viewerHash, 'Carol Viewer', 'viewer');
  });

  insertManyUsers();
  console.log('Seeded 3 demo users.');

  // Get admin user id for created_by
  const admin = db.prepare("SELECT id FROM users WHERE role = 'admin'").get();

  // Sample financial records
  const records = [
    { amount: 5000.00, type: 'income',  category: 'Salary',        date: '2026-01-15', description: 'Monthly salary - January' },
    { amount: 1200.00, type: 'expense', category: 'Rent',          date: '2026-01-01', description: 'Office rent payment' },
    { amount: 150.00,  type: 'expense', category: 'Utilities',     date: '2026-01-05', description: 'Electricity bill' },
    { amount: 300.00,  type: 'expense', category: 'Software',      date: '2026-01-10', description: 'SaaS subscriptions' },
    { amount: 2000.00, type: 'income',  category: 'Freelance',     date: '2026-01-20', description: 'Freelance project payment' },
    { amount: 80.00,   type: 'expense', category: 'Office Supplies', date: '2026-01-22', description: 'Printer paper and ink' },
    { amount: 5000.00, type: 'income',  category: 'Salary',        date: '2026-02-15', description: 'Monthly salary - February' },
    { amount: 1200.00, type: 'expense', category: 'Rent',          date: '2026-02-01', description: 'Office rent payment' },
    { amount: 175.00,  type: 'expense', category: 'Utilities',     date: '2026-02-05', description: 'Electricity bill' },
    { amount: 500.00,  type: 'income',  category: 'Investment',    date: '2026-02-10', description: 'Dividend income' },
    { amount: 250.00,  type: 'expense', category: 'Travel',        date: '2026-02-18', description: 'Client meeting travel' },
    { amount: 5000.00, type: 'income',  category: 'Salary',        date: '2026-03-15', description: 'Monthly salary - March' },
    { amount: 1200.00, type: 'expense', category: 'Rent',          date: '2026-03-01', description: 'Office rent payment' },
    { amount: 160.00,  type: 'expense', category: 'Utilities',     date: '2026-03-05', description: 'Electricity bill' },
    { amount: 3000.00, type: 'income',  category: 'Freelance',     date: '2026-03-12', description: 'Website redesign project' },
    { amount: 450.00,  type: 'expense', category: 'Marketing',     date: '2026-03-20', description: 'Social media advertising' },
    { amount: 120.00,  type: 'expense', category: 'Software',      date: '2026-03-25', description: 'Design tool subscription' },
    { amount: 5000.00, type: 'income',  category: 'Salary',        date: '2026-04-01', description: 'Monthly salary - April' },
    { amount: 1200.00, type: 'expense', category: 'Rent',          date: '2026-04-01', description: 'Office rent payment' },
    { amount: 800.00,  type: 'income',  category: 'Investment',    date: '2026-04-02', description: 'Stock market gains' },
  ];

  const insertRecord = db.prepare(`
    INSERT INTO financial_records (amount, type, category, date, description, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertManyRecords = db.transaction(() => {
    for (const r of records) {
      insertRecord.run(r.amount, r.type, r.category, r.date, r.description, admin.id);
    }
  });

  insertManyRecords();
  console.log(`Seeded ${records.length} financial records.`);
}

module.exports = { runSeeds };
