const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// This creates a file named 'subshield.db' in your root backend/ folder
const dbPath = path.resolve(__dirname, '../../subshield.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to local SQLite database.');
    }
});

// Initialize the subscriptions table based on your system design
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paypal_sub_id TEXT UNIQUE,
        merchant_name TEXT,
        plan_name TEXT,
        category TEXT,
        amount TEXT,
        currency TEXT,
        interval TEXT,
        status TEXT,
        next_billing_time TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

module.exports = db;
// ```[cite: 2, 4]

// 3. When you run your server (`npm run dev`), `database.js` will automatically create the `subshield.db` file and the `subscriptions` table for you.

// ---

// ### Part 2: How Will We Deploy This? (And Will It Cause Problems?)

// Deploying a Node.js + SQLite app has one major catch you need to know about:

// #### 1. The SQLite Storage Problem on Cloud Hosts
// * **The Issue:** Free hosting platforms like Render, Railway, or Fly.io use **ephemeral (temporary) file systems**. This means every time your server restarts, crashes, goes to sleep due to inactivity, or deploys new code, **your `subshield.db` file will be wiped out**, and your saved subscriptions will disappear.
// * **The Best Workarounds:**
//   * **Option A (For Hackathons / Quick Demos):** You can keep using SQLite, but write your `seed.js` script to automatically re-seed your mock subscriptions every time the server boots up, or manually hit your `/create-subscription` Postman endpoint right before your demo.
//   * **Option B (The Proper Way / System Design Plan):** If you want persistent data in production, your system design recommends migrating from SQLite to **PostgreSQL** (like Supabase, Neon, or Railway's managed Postgres)[cite: 2, 4]. 

// #### 2. How to Deploy (Step-by-Step Overview)
// When you are ready to deploy your backend:
// 1. Push your code to a GitHub repository (make sure `node_modules/` and `.env` are in your `.gitignore`)[cite: 3].
// 2. Create a project on a platform like **Render** or **Railway** and link your GitHub repository.
// 3. **Crucial Step:** Go to your hosting provider's dashboard settings and manually add your environment variables (`PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`, `PAYPAL_API_BASE`) so your app can talk to PayPal in production[cite: 3].