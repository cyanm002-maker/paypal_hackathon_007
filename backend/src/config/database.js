const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../subshield.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            amount REAL NOT NULL,
            currency TEXT DEFAULT 'INR',
            billing_cycle TEXT DEFAULT 'MONTHLY',
            category TEXT,
            paypal_sub_id TEXT UNIQUE,
            status TEXT DEFAULT 'APPROVAL_PENDING',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (!err) {
                // Auto-seed initial demo records if table is empty
                db.get(`SELECT COUNT(*) as count FROM subscriptions`, (err, row) => {
                    if (row && row.count === 0) {
                        const seed = [
                            ['Netflix', 649, 'INR', 'MONTHLY', 'Entertainment', 'I-NETFLIX001', 'ACTIVE'],
                            ['Spotify Premium', 119, 'INR', 'MONTHLY', 'Music', 'I-SPOTIFY002', 'ACTIVE'],
                            ['GitHub Copilot', 850, 'INR', 'MONTHLY', 'Productivity', 'I-GITHUB003', 'ACTIVE']
                        ];
                        const stmt = db.prepare(`INSERT INTO subscriptions (name, amount, currency, billing_cycle, category, paypal_sub_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)`);
                        seed.forEach(item => stmt.run(item));
                        stmt.finalize();
                        console.log('Database auto-seeded with mock subscriptions.');
                    }
                });
            }
        });
    }
});

module.exports = db;