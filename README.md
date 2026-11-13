# SubShield

SubShield is a subscription-management project. The backend provides Express API routes for subscriptions, PayPal webhooks, analytics, and subscription insights. The frontend is a React app built with Vite.

## Project files

```text
.
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js       # Opens SQLite and creates the subscriptions table
│   │   │   └── paypal.js         # Loads PayPal settings and fetches access tokens
│   │   ├── routes/
│   │   │   ├── subscriptions.js  # Create, list, and cancel subscriptions
│   │   │   ├── webhooks.js       # Receives PayPal subscription events
│   │   │   ├── analytics.js      # Provides subscription spending summaries
│   │   │   └── aiAgent.js        # Provides budget and subscription insights
│   │   ├── scripts/
│   │   │   └── seed.js           # Creates a sample product and billing plan in PayPal Sandbox
│   │   ├── services/
│   │   │   └── api.js            # Reserved for shared API services; currently empty
│   │   └── server.js             # Starts Express and mounts the API routes
│   ├── .env.example              # Template for local environment settings
│   ├── package.json              # Backend dependencies and commands
│   └── subshield.db              # Local SQLite database (created when the backend loads database.js)
└── frontend/
    ├── public/                   # Static files served by Vite
    ├── src/
    │   ├── assets/               # Images and other imported assets
    │   ├── App.jsx               # Main React component
    │   ├── App.css               # Main component styles
    │   ├── index.css             # Global styles
    │   └── main.jsx              # React app entry point
    ├── index.html                # Browser page Vite loads
    ├── package.json              # Frontend dependencies and commands
    └── vite.config.js             # Vite and React configuration
```

## Where project data is stored

- **SQLite data:** `backend/subshield.db`. This file is created locally when the backend imports `src/config/database.js`. The `subscriptions` table stores PayPal subscription IDs, plan and merchant information, amounts, statuses, and dates.
- **Environment settings:** Create `backend/.env` from `backend/.env.example` and add your own PayPal Sandbox credentials. Do not commit `.env` or share your PayPal secret.
- **Source code:** Backend files are under `backend/src/`; React frontend files are under `frontend/src/`.

The database file is local to the machine running the backend. It is not automatically shared with the frontend or persisted by cloud hosts that use temporary filesystems.

## Backend API

The server mounts these routes:

| Route | Purpose |
|---|---|
| `GET /api/test-token` | Tests PayPal access-token retrieval. |
| `POST /api/subscriptions/create-subscription` | Creates a PayPal subscription using a JSON `plan_id`, then saves it locally. |
| `POST /api/subscriptions/add-mock` | Inserts a mock subscription into SQLite without contacting PayPal. Available outside production. |
| `GET /api/subscriptions` | Lists subscriptions saved in SQLite. |
| `POST /api/subscriptions/cancel-subscription/:paypal_sub_id` | Cancels a PayPal subscription and updates its local status. |
| `POST /api/webhooks/paypal` | Receives PayPal subscription status events and updates SQLite. |
| `GET /api/analytics/summary` | Returns spending totals and subscription counts by category. |
| `GET /api/agent/insights?budget=50` | Returns spending and budget recommendations. |

For local UI testing, send JSON such as `{"name":"Test service","amount":12.99,"currency":"USD","billing_cycle":"MONTHLY","category":"Entertainment","status":"ACTIVE"}` to `POST /api/subscriptions/add-mock`. The `name` and positive `amount` fields are required; other fields have defaults. This route is not registered when `NODE_ENV=production`.

The webhook route currently processes incoming event data but does not verify PayPal's webhook signature. Add signature verification before relying on it in production.

## Run locally

Use separate terminals:

```powershell
Set-Location backend
npm install
Copy-Item .env.example .env
npm run dev
```

Add your PayPal Sandbox credentials to `backend/.env` before testing PayPal endpoints.

```powershell
Set-Location frontend
npm install
npm run dev
```

The backend defaults to port `5000`. The frontend currently contains the Vite/React starter screen; it is not yet a subscription dashboard connected to the backend API.
