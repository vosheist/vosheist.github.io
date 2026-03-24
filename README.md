# Yeshiva Chill

Yeshiva Chill web platform (frontend pages + Express/Mongo backend).

## Project Layout

- Route folders: `login/`, `community/`, `inbox/`, `account/`, `bais-medrash/`, `coffee-room/`, `bein-hasdarim/`, `hearos/`, `prices/`, `admin/`, `nafshi/`
- `games/` - Game pages and game scripts
- `js/` - Shared frontend scripts (`script.js`, `api.js`, `auth.js`)
- `css/` - Shared styles (`styles.css`)
- `backend/` - Express + MongoDB API
- `backend/scripts/` - Operational/test utility scripts
- `public/` - Shared static assets
- `docs/` - Setup, testing, and architecture documentation
- `mashbak/` - SMS compliance/support page
- `archive/legacy-root/` - Historical archived files

## Entry Points

- Main site: `index.html` (redirects to `/login`)
- Login page route: `/login` (`login/index.html`)
- Backend API: `backend/server.js`

## URL Strategy

- Clean URLs are now live (no `.html` in navigation routes).
- Examples: `/community`, `/inbox`, `/account`, `/games/connect4`.
- See `docs/URL_ROUTING_PLAN.md` for full route map and migration notes.

## Backend Commands

Run from `backend/`:

- `npm start` - Start backend
- `npm run dev` - Start backend with nodemon
- `npm run seed:test-data` - Seed test users
- `npm run view:test-data` - View test users and sample records
- `npm run rename:test-users` - Rename test users by mapping

## Notes

- Duplicate `frontend/` tree has been removed from the active project structure.
- URL migration details are documented in `docs/URL_ROUTING_PLAN.md`.
