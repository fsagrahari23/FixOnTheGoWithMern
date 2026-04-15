# FixOnTheGo Frontend

This is the React + Vite frontend for FixOnTheGo. It includes role-based dashboards for user, mechanic, admin, and staff.

## Tech Stack

- React + Vite
- Redux Toolkit
- React Router
- Tailwind CSS
- Recharts (analytics visualizations)
- Lucide React icons

## Setup

1. Install dependencies

```bash
npm install
```

2. Create environment file

```env
VITE_API_BASE_URL=http://localhost:3000
```

3. Start development server

```bash
npm run dev
```

4. Build production bundle

```bash
npm run build
```

## Main Role Routes

- `/user/dashboard`
- `/mechanic/dashboard`
- `/mechanic/history`
- `/mechanic/booking/:id`
- `/admin/dashboard`
- `/staff/dashboard`

## Recent UI Enhancements

- Mechanic Dashboard: richer analytics hub and user search by name/email with booking details
- Mechanic History: improved visuals, summary cards, and filters
- Mechanic Booking Details: redesigned page with improved action states and payment display
- Staff Dashboard: added complete analytics center (distribution and trend charts)

## Notes

- Authentication uses cookie-based sessions from backend; keep backend server running in parallel.
- For best local development, run backend and frontend in separate terminals.
