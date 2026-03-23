# Yeshiva Chill

Organized monorepo-style layout for the Yeshiva Chill web platform.

## Project Layout

- `frontend/` - Main client app pages and shared assets
- `frontend/games/` - All game pages and game scripts
- `backend/` - Express + MongoDB API
- `backend/scripts/` - Operational/test utility scripts
- `public/` - Shared static assets
- `docs/` - Setup, testing, and audit documentation
- `mashbak/` - SMS compliance/support page
- `archive/legacy-root/` - Historical root files kept for reference

## Entry Points

- Main site: `index.html` (redirects to `frontend/index.html`)
- Frontend app: `frontend/index.html`
- Backend API: `backend/server.js`

## Backend Commands

Run from `backend/`:

- `npm start` - Start backend
- `npm run dev` - Start backend with nodemon
- `npm run seed:test-data` - Seed test users
- `npm run view:test-data` - View test users and sample records
- `npm run rename:test-users` - Rename test users by mapping

## Notes

- Legacy or one-off root files were moved into `archive/legacy-root/` to keep the root clean.
- Existing routes and runtime behavior were not changed by this organization pass.
