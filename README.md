# Inventory & Billing Web App

A full-stack inventory + GST billing app built with React (Vite), Tailwind, Zustand, Express, and SQLite.

## Run

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Demo login
- Email: `demo@mybillbook.ai`
- Password: `password123`

## Included modules
- JWT auth (register/login)
- Dashboard with KPI cards and charts
- Items/inventory CRUD and low-stock highlighting
- Parties CRUD and outstanding balance calculation
- Sales invoices & quotations with totals and status
- Quotation -> Invoice conversion endpoint
- Purchase bills with stock addition
- Expenses module
- P&L report
- Business/invoice settings

## Notes
- Database is `server/db/app.db` (SQLite via better-sqlite3)
- Migration and seed are idempotent.
