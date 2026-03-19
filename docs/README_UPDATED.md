# 🎉 Vos Heist - Mitzvah Tracker

A spiritual accountability tracker for tracking daily mitzvahs (commandments) and aveirot (transgressions) in Yiddish.

**Status:** ✅ **PRODUCTION READY** (with backend setup required)

## Quick Start

### 1. Backend Setup (5 minutes)

```bash
# Install dependencies
npm install

# Create .env file with Gmail credentials
# (See BACKEND_SETUP.md for detailed instructions)
cp .env.example .env
# Edit .env and add your Gmail app password

# Start backend server
npm run dev
# Backend runs on http://localhost:3000
```

### 2. Frontend Setup

No installation needed! Just open `index.html` in your browser and:
1. Click "נפשי" to login/signup
2. Create an account
3. Start tracking!

## Features

### ✨ For Users

- **Create Account** - First name, last name, nickname, email, password
- **Track Mitzvahs** - Daily good deeds with categories and notes
- **Track Aveirahs** - Transgressions you're working on overcoming
- **View Community** - See what other members are tracking (members only)
- **Period Charts** - See your stats for today, this week, this month
- **Autocomplete** - 50+ suggestions for mitzvahs and aveirahs
- **Full Yiddish UI** - Complete Yiddish/Hebrew/English support
- **RTL Support** - Right-to-left text for Yiddish

### 🔧 For Developers

- **Backend API** - Node.js/Express with email integration
- **Email Service** - Gmail powered (feedback, signup notifications, welcome emails)
- **localStorage Storage** - Quick & easy user data persistence
- **Clean Code** - Well-organized, documented, audited
- **Full Testing Guide** - Comprehensive test scenarios

## File Structure

```
vos heist/
├── Frontend Files
│   ├── index.html          # Home page
│   ├── nafshi.html         # Login/signup
│   ├── account.html        # User dashboard
│   ├── prices.html         # Pricing plans
│   ├── community.html      # Member-only records
│   ├── hearos.html         # Feedback form
│   ├── styles.css          # All styling (RTL)
│   └── script.js           # Global utilities
│
├── Backend (Node.js)
│   ├── server.js           # Express backend
│   ├── package.json        # Dependencies
│   ├── .env                # Config (Gmail creds)
│   └── .env.example        # Template
│
├── Documentation
│   ├── README.md           # This file
│   ├── BACKEND_SETUP.md    # Backend configuration
│   ├── CODE_AUDIT.md       # Code quality report
│   └── TESTING_GUIDE.md    # Full testing scenarios
│
└── images/
    └── logo.png            # Branding
```

## Key Technologies

- **Frontend:** HTML5, Bootstrap 5, CSS, Vanilla JS
- **Backend:** Node.js, Express, Nodemailer
- **Storage:** Browser localStorage + Email notifications
- **Languages:** Yiddish, Hebrew, English
- **Features:** RTL support, Responsive design, SPA-style

## API Endpoints

### Health Check
```
GET /health
```

### Feedback/Suggestions
```
POST /api/feedback
{
  "name": "User Name",
  "email": "user@example.com",  // optional
  "message": "Feedback text"
}
→ Sends to: vosheist@gmail.com
```

### Signup Notification (to owner)
```
POST /api/notify-signup
{
  "displayName": "Full Name",
  "nickname": "username",
  "email": "user@example.com",
  "createdAt": "2026-03-19T..."
}
→ Sends to: vosheist@gmail.com
```

### Welcome Email (to new user)
```
POST /api/welcome-email
{
  "email": "user@example.com",
  "firstname": "First",
  "lastname": "Last"
}
→ Sends to: user@example.com
```

## User Data Structure

### Account Storage (localStorage)
```javascript
vosHeistUsers: {
  "first lastname": {
    displayName: "First Last",
    firstname: "First",
    lastname: "Last",
    nickname: "nick",
    email: "user@example.com",
    records: [],
    passwordHash: "SHA256..."
  }
}
```

### Session Storage
```javascript
vosHeistCurrentUser: "first lastname"  // Set on login
```

### User Records
```javascript
{
  type: "mitzvah" | "aveirah",
  title: "title",
  description: "details",
  category: "category",
  date: "YYYY-MM-DD",
  time: "HH:MM"
}
```

## Security Features

- ✅ Passwords hashed with SHA-256
- ✅ Email validation with regex
- ✅ Input sanitization on all forms
- ✅ Environment variables for secrets (.env)
- ✅ CORS configured for frontend
- ✅ Community page requires login

## Browser Support

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## Known Limitations

1. **No Persistent Database** - Uses localStorage only (per browser)
   - Future: Add MongoDB/PostgreSQL

2. **Client-side Password Hashing** - Should also hash server-side
   - Future: Add bcrypt hashing on backend

3. **Gmail Only** - Email requires Gmail app password
   - Alternative: SendGrid/Mailgun for production

4. **No Admin Panel** - Owner receives emails but no dashboard
   - Future: Add admin interface to manage users

## Deployment

### Development
```bash
npm run dev
# Backend on http://localhost:3000
# Frontend: Open index.html in browser
```

### Production
See [BACKEND_SETUP.md](BACKEND_SETUP.md) for:
- Environment configuration
- Gmail setup
- Production deployment options
- Security considerations

## Testing

Complete testing guide in [TESTING_GUIDE.md](TESTING_GUIDE.md) with:
- User flow scenarios
- Email verification
- Error handling tests
- Browser compatibility
- Production checklist

## Documentation

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Project overview (this file) |
| [BACKEND_SETUP.md](BACKEND_SETUP.md) | Backend configuration & deployment |
| [CODE_AUDIT.md](CODE_AUDIT.md) | Code quality review & structure |
| [TESTING_GUIDE.md](TESTING_GUIDE.md) | Complete testing scenarios |

## Recent Updates

### March 19, 2026
- ✅ Backend email system fully operational
- ✅ Welcome emails for new members
- ✅ Community link hidden for non-members
- ✅ Code audit & comprehensive cleanup
- ✅ Full testing guide with all scenarios
- ✅ Production-ready documentation

## Getting Help

1. **Backend Issues?** See [BACKEND_SETUP.md](BACKEND_SETUP.md)
2. **Need to Test?** Follow [TESTING_GUIDE.md](TESTING_GUIDE.md)
3. **Code Questions?** Check [CODE_AUDIT.md](CODE_AUDIT.md)
4. **Development?** This README has quick start

## License

MIT - Feel free to use and modify

## Contact

Questions? Submit feedback through the app!
- 📧 Email: vosheist@gmail.com
- 🌐 Use the "הערות" (Comments) page in the app

---

**Happy Tracking! בהצלחה!** 🎯
