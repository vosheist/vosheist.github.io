# Yeshiva Chill Documentation

This repository contains the Yeshiva Chill member platform (frontend + backend) and supporting docs.

## Current Structure

- `frontend/` - Main web app pages and shared assets
- `frontend/games/` - All game pages and game logic scripts
- `backend/` - Express + MongoDB API server
- `backend/scripts/` - Utility and seed scripts
- `public/` - Shared static images/assets
- `mashbak/` - SMS compliance/support page
- `archive/legacy-root/` - Archived legacy root files

## Frontend Overview

- Core app pages (auth, account, community, etc.) live in `frontend/`
- Games hub is `frontend/bein-hasdarim.html`
- Individual game pages are now grouped in `frontend/games/`
- Shared frontend logic:
	- `frontend/script.js`
	- `frontend/api.js`
	- `frontend/auth.js`
	- `frontend/styles.css`

## Backend Overview

- Main API server: `backend/server.js`
- Package config: `backend/package.json`
- Env template: `backend/.env.example`
- Utility scripts:
	- `npm run seed:test-data`
	- `npm run view:test-data`
	- `npm run rename:test-users`

## Getting Started

1. Start backend:
	 - `cd backend`
	 - `npm install`
	 - copy `.env.example` to `.env` and fill values
	 - `npm run dev`
2. Open the frontend entrypoint:
	 - `index.html` (redirects to `frontend/index.html`)

## Related Docs

- `docs/BACKEND_SETUP.md` - Practical backend setup and run steps
- `BACKEND_QUICK_START.md` - Expanded backend setup and troubleshooting
- `docs/TESTING_GUIDE.md` - Manual test checklist
- `docs/CODE_AUDIT.md` - Code audit notes
