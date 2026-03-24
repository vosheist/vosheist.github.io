# Yeshiva Chill Documentation

This repository contains the Yeshiva Chill member platform (frontend + backend) and supporting docs.

## Current Structure

- Route folders - Main web app pages (`login/`, `community/`, `inbox/`, `account/`, etc.)
- `games/` - Game pages and game logic scripts
- `js/` - Shared frontend scripts
- `css/` - Shared frontend stylesheet
- `backend/` - Express + MongoDB API server
- `backend/scripts/` - Utility and seed scripts
- `public/` - Shared static images/assets
- `mashbak/` - SMS compliance/support page
- `archive/legacy-root/` - Archived legacy root files

## Frontend Overview

- Core app pages are served via clean routes using folder `index.html` files.
- Games hub route: `/bein-hasdarim`
- Individual game routes are grouped under `/games/*`
- Shared frontend logic:
	- `js/script.js`
	- `js/api.js`
	- `js/auth.js`
	- `css/styles.css`

## URL Routing Plan

- Clean URLs are implemented and active.
- No `.html` route paths are used in active navigation.
- Route map and migration details: `docs/URL_ROUTING_PLAN.md`.

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
	 - `index.html` (redirects to login)

## Related Docs

- `docs/BACKEND_SETUP.md` - Practical backend setup and run steps
- `BACKEND_QUICK_START.md` - Expanded backend setup and troubleshooting
- `docs/TESTING_GUIDE.md` - Manual test checklist
- `docs/CODE_AUDIT.md` - Code audit notes
