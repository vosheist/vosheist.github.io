# וואס הייסט (Vos Heist)

A personal accountability and tracker application for recording mitzvot (good deeds) and aveirot (transgressions) in Yiddish.

## Features

- **User Accounts** — Create accounts with display names and pen names
- **Tracker** — Log mitzvot and aveirot with details, categories, and dates
- **Analytics** — View period charts (today, weekly, monthly)
- **Community** — Browse public community records by pen name
- **Profile Management** — Edit profile info and change passwords
- **Responsive Design** — Works on desktop and mobile devices

## Tech Stack

- **HTML5** / **CSS3** / **Vanilla JavaScript**
- **Bootstrap 5.3.8** — Responsive styling
- **Web Crypto API** — Password hashing (SHA-256)
- **LocalStorage** — User data persistence
- **RTL & Yiddish Support** — Full internationalization

## Pages

- `index.html` — Home page
- `NAFSHI.HTML` — Login and signup
- `account.html` — User dashboard with tracker
- `community.html` — Public community records
- `prices.html` — Pricing/info page

## Getting Started

1. Clone the repository
2. Open `index.html` in a web browser
3. Create an account and start tracking

## Features

### Account Creation
- Create account with name, pen name, and password
- Passwords are hashed locally using Web Crypto SHA-256
- Unique pen names across all users

### Tracker
- Log mitzvot and aveirot separately
- Categorize entries
- Add optional details
- Auto-detect type based on keywords
- Mark aveirot as fixed/resolved

### Analytics
- View counts by period (today/weekly/monthly)
- Visual bar charts for quick overview

### Community
- Browse other users' pen names
- View public record summaries
- See mitzvot/aveirot statistics

## Security Notes

- Passwords are hashed locally before storage
- No backend server — data stored in browser localStorage
- User session managed via sessionStorage
- No personal data is sent externally (except optional email notifications)

## Future Enhancements

- Backend integration for persistent storage
- Email notifications on signup
- Social features (challenges, leaderboards)
- Data export/backup
- Reminder notifications

---

**Language:** Yiddish (יידיש) | **Direction:** Right-to-Left (RTL)
