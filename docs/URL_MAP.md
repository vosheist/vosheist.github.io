# URL Map

This is the canonical public route map for Yeshiva Chill.

## Core Routes

| Public URL | File Path |
|---|---|
| `/` | `index.html` (redirects to `/login`) |
| `/login` | `login/index.html` |
| `/community` | `community/index.html` |
| `/inbox` | `inbox/index.html` |
| `/account` | `account/index.html` |
| `/nafshi` | `nafshi/index.html` |
| `/bais-medrash` | `bais-medrash/index.html` |
| `/coffee-room` | `coffee-room/index.html` |
| `/bein-hasdarim` | `bein-hasdarim/index.html` |
| `/hearos` | `hearos/index.html` |
| `/prices` | `prices/index.html` |
| `/admin` | `admin/index.html` |

## Game Routes

| Public URL | File Path |
|---|---|
| `/games/2048` | `games/2048/index.html` |
| `/games/tictactoe` | `games/tictactoe/index.html` |
| `/games/connect4` | `games/connect4/index.html` |
| `/games/snake` | `games/snake/index.html` |
| `/games/lane-racer` | `games/lane-racer/index.html` |
| `/games/memory-match` | `games/memory-match/index.html` |
| `/games/reaction-timer` | `games/reaction-timer/index.html` |
| `/games/quick-math` | `games/quick-math/index.html` |
| `/games/number-guess` | `games/number-guess/index.html` |
| `/games/rps` | `games/rps/index.html` |

## Backend-Generated Route Paths

The backend emits clean game URLs (no `.html`) via invite payloads:

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

## Rules

1. Do not link to `.html` page routes in navigation or JS redirects.
2. Keep page links extensionless (example: `/community`).
3. Keep game links extensionless (example: `/games/connect4`).
4. Keep shared assets in `js/`, `css/`, and `public/` as canonical locations.
