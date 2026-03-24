# URL Routing Map

## Summary

The app now uses clean, human-friendly URLs (no `.html` in public page routes).

Examples:
- Old: `/community.html`
- New: `/community`
- File: `community/index.html`

This structure supports both Express hosting and static hosting through folder routes.

## Routing Principles

1. Public URLs should not expose `.html`.
2. Use folder routes with `index.html` inside each route folder.
3. Keep one canonical source tree (root + `games/`).
4. Avoid mixed URL styles in navigation and scripts.

## Public Routes

### Core pages
- `/`
- `/login`
- `/community`
- `/inbox`
- `/account`
- `/bais-medrash`
- `/coffee-room`
- `/bein-hasdarim`
- `/hearos`
- `/prices`
- `/admin`

### Game pages
- `/games/2048`
- `/games/tictactoe`
- `/games/connect4`
- `/games/snake`
- `/games/lane-racer`
- `/games/memory-match`
- `/games/reaction-timer`
- `/games/quick-math`
- `/games/number-guess`
- `/games/rps`

## File Mapping

Implemented folder-based mapping:

- `login.html` -> `login/index.html`
- `community.html` -> `community/index.html`
- `inbox.html` -> `inbox/index.html`
- `account.html` -> `account/index.html`
- `bais-medrash.html` -> `bais-medrash/index.html`
- `coffee-room.html` -> `coffee-room/index.html`
- `bein-hasdarim.html` -> `bein-hasdarim/index.html`
- `hearos.html` -> `hearos/index.html`
- `prices.html` -> `prices/index.html`
- `admin.html` -> `admin/index.html`

Games:

- `games/game-2048.html` -> `games/2048/index.html`
- `games/game-tictactoe.html` -> `games/tictactoe/index.html`
- `games/game-connect4.html` -> `games/connect4/index.html`
- `games/game-snake.html` -> `games/snake/index.html`
- `games/game-lane-racer.html` -> `games/lane-racer/index.html`
- `games/game-memory-match.html` -> `games/memory-match/index.html`
- `games/game-reaction-timer.html` -> `games/reaction-timer/index.html`
- `games/game-quick-math.html` -> `games/quick-math/index.html`
- `games/game-number-guess.html` -> `games/number-guess/index.html`
- `games/game-rps.html` -> `games/rps/index.html`

## Backend URL Output

Backend game route outputs use clean game paths.

- `"/games/connect4"`

The same rule should apply to any backend payload that returns page URLs.

## Cleanup Scope

Completed cleanup:

1. Duplicate `frontend/` pages and `frontend/games/` files were removed from active tree.
2. Keep only one canonical set of scripts/styles in `js/` and `css/`.
3. Archived duplicate backup copy has been removed.

## Verification Checklist

1. Direct navigation works for every clean route in local Express.
2. Direct navigation works for every clean route on static hosting.
3. No remaining `.html` links in HTML or JS nav code.
4. Invite acceptance opens clean game routes.
5. All global nav links resolve correctly from every page depth.
6. No references to removed duplicate files.

## Decision Notes

- Preferred route style: clean URLs with no file extension.
- Hosting target: both Express and static host compatibility.
- Redirect policy for old `.html` links: no automatic redirects in app navigation.

If this policy changes, add a redirect matrix here.

