const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../subshield.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to SQLite database.');
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT DEFAULT 'demo-user-001',
                name TEXT NOT NULL,
                amount REAL NOT NULL,
                currency TEXT DEFAULT 'USD',
                billing_cycle TEXT DEFAULT 'MONTHLY',
                category TEXT DEFAULT 'Other',
                paypal_sub_id TEXT UNIQUE,
                status TEXT DEFAULT 'ACTIVE',
                usage_count INTEGER DEFAULT 0,
                last_used_date TEXT DEFAULT (DATE('now')),
                historical_base_amount REAL,
                merchant_name TEXT,
                next_billing_date TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (!err) {
                    // Safe column migrations for existing SQLite databases
                    const alterQueries = [
                        `ALTER TABLE subscriptions ADD COLUMN user_id TEXT DEFAULT 'demo-user-001'`,
                        `ALTER TABLE subscriptions ADD COLUMN usage_count INTEGER DEFAULT 0`,
                        `ALTER TABLE subscriptions ADD COLUMN last_used_date TEXT DEFAULT (DATE('now'))`,
                        `ALTER TABLE subscriptions ADD COLUMN historical_base_amount REAL`,
                        `ALTER TABLE subscriptions ADD COLUMN merchant_name TEXT`,
                        `ALTER TABLE subscriptions ADD COLUMN next_billing_date TEXT`
                    ];
                    alterQueries.forEach(q => {
                        db.run(q, () => {}); // Ignore error if column already exists
                    });

                    // Auto-seed initial demo records with competitive feature metadata if table is empty
                    db.get(`SELECT COUNT(*) as count FROM subscriptions`, (err, row) => {
                        if (row && row.count === 0) {
                            const today = new Date();
                            const formatDate = (daysAgo) => {
                                const d = new Date(today);
                                d.setDate(d.getDate() - daysAgo);
                                return d.toISOString().split('T')[0];
                            };

                            const seed = [
                                ['Netflix Premium 4K', 22.99, 'USD', 'MONTHLY', 'Entertainment', 'I-NETFLIX001', 'ACTIVE', 24, formatDate(1), 15.49],
                                ['Spotify Premium', 10.99, 'USD', 'MONTHLY', 'Music', 'I-SPOTIFY002', 'ACTIVE', 35, formatDate(0), 9.99],
                                ['GitHub Copilot Pro', 10.00, 'USD', 'MONTHLY', 'Productivity', 'I-GITHUB003', 'ACTIVE', 48, formatDate(0), 10.00],
                                ['Old Gym Pass', 45.00, 'USD', 'MONTHLY', 'Fitness', 'I-GYM004', 'ACTIVE', 1, formatDate(72), 45.00], // Zombie (>60 days)
                                ['Adobe Creative Cloud', 54.99, 'USD', 'MONTHLY', 'Design', 'I-ADOBE005', 'ACTIVE', 2, formatDate(65), 54.99] // Zombie (>60 days)
                            ];

                            const stmt = db.prepare(`INSERT INTO subscriptions 
                                (name, amount, currency, billing_cycle, category, paypal_sub_id, status, usage_count, last_used_date, historical_base_amount) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                            
                            seed.forEach(item => stmt.run(item));
                            stmt.finalize();
                            console.log('Database auto-seeded with rich demo subscriptions.');
                        }
                    });
                }
            });
        });
    }
});

module.exports = db;
