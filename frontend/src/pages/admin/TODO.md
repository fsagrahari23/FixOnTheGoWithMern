# Admin React Pages Conversion TODO

## Overall Goal
Convert all legacy EJS admin views under `frontend/src/admin` into modular React admin pages under `frontend/src/pages/admin`, fully integrated with the existing React admin dashboard and routing.

---

## Tasks by Admin Page

### 1. Mechanic Management Page
- [x] Fetch list of mechanics, pending mechanics, and approved mechanics using `/api/mechanics`
- [x] Display pending mechanics with approve/reject buttons
- [x] Display approved mechanics with details including job count
- [x] Implement approve mechanic action calling API (POST to `/mechanic/:id/approve`)
- [x] Implement reject mechanic action calling API (POST to `/mechanic/:id/reject`)
- [x] Detailed view for a mechanic with profile and bookings
- [x] Integrate with AdminLayout and route `/admin/mechanics`

### 2. User Management Page
- [x] Fetch list of users with premium status and booking counts from `/api/users`
- [x] Display users in a table/list with key info
- [x] Detailed user view showing user info, bookings and subscription from `/api/user/:id`
- [x] Implement delete user action, handling confirmation and API interaction
- [x] Integrate with AdminLayout and route `/admin/users`

### 3. Subscription Management Page
- [x] Fetch list of subscriptions from `/api/subscriptions`
- [x] Display subscription details with user info
- [x] Create/edit subscription forms with validation and submission
- [x] Implement update and cancel subscription actions
- [x] Integrate with AdminLayout and route `/admin/subscriptions`

### 4. Payment Management Page
- [x] Fetch list of payments and subscription payments from `/api/payments`
- [x] Show payment statistics and total revenues
- [x] Display payments with relevant user/mechanic info
- [x] Integrate with AdminLayout and route `/admin/payments`

### 5. Admin Dashboard
- [ ] Use existing AdminDashboard component to display summary stats from `/api/dashboard`
- [ ] Visualize booking stats, subscription stats, recent bookings, revenue charts

### 6. Other Features
- [ ] Integrate approve mechanic features into mechanic page
- [ ] Integrate delete requests (user, booking deletions) into relevant user and booking pages
- [ ] Implement loading spinners and error handling for all pages
- [ ] Use consistent UI styling matching existing Admin Dashboard style

---

## Development Notes
- Use React hooks like `useEffect` and `useState` for data fetching and state management
- Use `fetch` or preferred HTTP client for API calls
- Protect admin pages with authenticated routes as currently setup
- Test each page fully with backend API verifying CRUD operations

---

Once completed, the legacy EJS admin views will be deprecated and removed.

---

## Milestones
- Milestone 1: Implement Mechanic and User management pages
- Milestone 2: Implement Subscription and Payment management pages
- Milestone 3: Finalize Admin Dashboard integration and polish UI/UX
- Milestone 4: Test end-to-end and remove old EJS views and routes

---

This plan sets the basis for full React admin functionality consistent with existing backend API and React app structure.
