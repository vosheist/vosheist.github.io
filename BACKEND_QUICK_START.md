# Backend Setup Guide - Complete Instructions

## 📁 Project Structure

```
vos heist/
├── index.html                    # Entry point (redirects to frontend)
├── frontend/                     # All frontend files
│   ├── index.html
│   ├── nafshi.html
│   ├── account.html
│   ├── prices.html
│   ├── community.html
│   ├── hearos.html
│   ├── styles.css
│   └── script.js
├── backend/                      # Node.js backend
│   ├── server.js                 # Express server
│   ├── package.json              # Dependencies
│   ├── .env                      # Configuration (SECRET - don't commit)
│   └── .env.example              # Template for .env
├── public/
│   └── images/
│       └── logo.png              # Application logo
├── docs/                         # Documentation
│   ├── README.md
│   ├── BACKEND_SETUP.md
│   ├── CODE_AUDIT.md
│   ├── TESTING_GUIDE.md
└── .gitignore                    # Git ignore rules

```

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

**What gets installed:**
- `express` - Web framework
- `cors` - Cross-origin requests
- `nodemailer` - Email sending
- `dotenv` - Environment variables
- `nodemon` (dev) - Auto-reload on changes

### Step 2: Configure Gmail

You need a Gmail account with an **app-specific password**.

#### 2a. Enable 2-Step Verification

1. Go to https://myaccount.google.com/
2. Click "Security" on the left
3. Scroll down to "2-Step Verification"
4. Click "Get started" if not enabled

#### 2b. Create App Password

1. Go to https://myaccount.google.com/apppasswords
2. Under "Select the app and device you want to generate the app password for:"
   - **App:** Select "Mail"
   - **Device:** Select "Windows Computer" (or your device type)
3. Click "Generate"
4. Google will show you a 16-character password
5. **Copy this password** (save it somewhere safe)

#### 2c. Create .env File

In the `backend/` folder:

```bash
# Copy the template
cp .env.example .env
```

Edit `backend/.env` and add your Gmail password:

```
PORT=3000
NODE_ENV=development
EMAIL_USER=vosheist@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
BACKEND_URL=http://localhost:3000
```

> **Note:** The password is 16 characters separated by spaces (e.g., `xxxx xxxx xxxx xxxx`)

### Step 3: Start the Backend

```bash
# From the backend/ folder
npm run dev
```

**Expected output:**
```
✓ Vos Heist Backend running on http://localhost:3000
✓ Email service configured
✓ CORS enabled for all origins
✓ Endpoints: /health, /api/feedback, /api/notify-signup, /api/welcome-email
```

### Step 4: Test It Works

Open a new terminal/command prompt:

```bash
curl http://localhost:3000/health
```

**Expected response:**
```json
{"status":"ok","message":"Backend is running"}
```

## 📧 Email Configuration Details

### What Emails Are Sent?

When users interact with the app, emails are sent:

| Trigger | Recipient | Subject |
|---------|-----------|---------|
| New account created | vosheist@gmail.com | `New User Signup: [Name]` |
| New account created | User's email | Welcome email in Yiddish |
| Feedback submitted | vosheist@gmail.com | `New Feedback from [Name]` |

### Email Service Used

- **Service:** Gmail SMTP
- **Requires:** 2-Factor Authentication enabled
- **Alternative:** Google App Passwords (recommended)

### Alternative Email Services

If you don't want to use Gmail, update `server.js`:

#### SendGrid (Recommended for production)
```javascript
const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
    }
});
```

#### Mailgun
```javascript
const transporter = nodemailer.createTransport({
    host: 'smtp.mailgun.org',
    port: 587,
    auth: {
        user: process.env.MAILGUN_USER,
        pass: process.env.MAILGUN_PASS
    }
});
```

## 🔧 Backend Architecture

### API Endpoints

#### 1. Health Check
```
GET /health
Response: {"status":"ok","message":"Backend is running"}
```

#### 2. Send Feedback
```
POST /api/feedback
Content-Type: application/json

Body:
{
  "name": "User Name",
  "email": "user@example.com",    // optional
  "message": "Feedback text"
}

Response:
{
  "success": true,
  "message": "Feedback sent successfully"
}
```

#### 3. New User Signup (notify owner)
```
POST /api/notify-signup
Content-Type: application/json

Body:
{
  "displayName": "First Last",
  "nickname": "username",
  "email": "user@example.com",
  "createdAt": "2026-03-19T10:00:00Z"
}

Response:
{
  "success": true,
  "message": "Signup notification sent"
}
```

#### 4. Welcome Email (to user)
```
POST /api/welcome-email
Content-Type: application/json

Body:
{
  "email": "user@example.com",
  "firstname": "First",
  "lastname": "Last"
}

Response:
{
  "success": true,
  "message": "Welcome email sent successfully"
}
```

## 🌐 Frontend Configuration

The frontend is **already configured** to use the backend:

**File:** `frontend/nafshi.html` (line ~136)
```javascript
const SIGNUP_NOTIFY_ENDPOINT = "http://localhost:3000/api/notify-signup";
```

**File:** `frontend/hearos.html` (line ~121)
```javascript
const FEEDBACK_ENDPOINT = "http://localhost:3000/api/feedback";
```

No changes needed for development!

## 🧪 Testing the Backend

### Test 1: Health Check
```bash
curl http://localhost:3000/health

# Expected:
# {"status":"ok","message":"Backend is running"}
```

### Test 2: Send Feedback
```bash
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Test message"}'

# Expected:
# {"success":true,"message":"Feedback sent successfully"}
```

### Test 3: Full App Flow
1. Open `index.html` in browser
2. Click "הקליקו כאן" to go to frontend
3. Create a new account
4. You should receive:
   - Welcome email at your address
   - Signup notification at vosheist@gmail.com

## ⚠️ Troubleshooting

### Problem: "Email service NOT configured"

**Cause:** EMAIL_USER or EMAIL_PASSWORD missing in .env

**Solution:**
```bash
# Check .env file exists in backend/
cd backend
cat .env

# Make sure these lines are present:
EMAIL_USER=vosheist@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

### Problem: "credential-gh is not a git command"

This is a **warning only** and doesn't affect functionality. It appears when pushing to GitHub but doesn't prevent the push.

### Problem: "Connection refused" (port 3000)

**Cause:** Backend not running or port already in use

**Solution:**
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# If in use, either:
# 1. Stop the other process
# 2. Use a different port in .env
# PORT=3001
```

### Problem: Emails not sending

**Checklist:**
- ✅ 2-Factor auth enabled on Gmail account
- ✅ App password created (not just password)
- ✅ .env file has correct 16-char password
- ✅ Backend shows "Email service configured" on start
- ✅ Check "Spam" folder for test emails

### Problem: "CORS error" in browser console

**Cause:** Frontend and backend not aligned on URLs

**Solution:** Verify frontend has correct backend URL:
```javascript
// In frontend/hearos.html and frontend/nafshi.html:
const FEEDBACK_ENDPOINT = "http://localhost:3000/api/feedback";
const SIGNUP_NOTIFY_ENDPOINT = "http://localhost:3000/api/notify-signup";
```

## 📝 Directory Structure Explanation

| Folder | Purpose |
|--------|---------|
| `frontend/` | HTML, CSS, JavaScript - serves to browser |
| `backend/` | Node.js server - handles emails and API |
| `docs/` | All markdown documentation |
| `public/images/` | Static assets (logo, images) |

## 🔐 Security Notes

1. **Never commit `.env`** - It contains secrets
   - Already in `.gitignore` ✓

2. **Keep passwords safe**
   - Don't share your Gmail app password
   - Use environment variables in production

3. **CORS configured**
   - Currently accepts requests from all origins
   - In production, restrict to your domain

## 🚀 Production Deployment

When deploying to production:

### 1. Update .env
```
NODE_ENV=production
EMAIL_USER=vosheist@gmail.com
EMAIL_PASSWORD=<production password>
BACKEND_URL=https://your-domain.com
```

### 2. Update Frontend URLs
In `frontend/nafshi.html` and `frontend/hearos.html`:
```javascript
const SIGNUP_NOTIFY_ENDPOINT = "https://your-domain.com/api/notify-signup";
const FEEDBACK_ENDPOINT = "https://your-domain.com/api/feedback";
```

### 3. Use Process Manager
```bash
npm install -g pm2
pm2 start backend/server.js --name "vos-heist"
pm2 save
pm2 startup
```

### 4. Enable HTTPS
Use a reverse proxy (nginx/Apache) to:
- Serve HTTPS
- Proxy requests to `http://localhost:3000`
- Handle SSL certificates

## 📞 Support

- Check the logs: `npm run dev` shows all errors
- Review backend/server.js for endpoint definitions
- See TESTING_GUIDE.md for complete test scenarios
- Check CODE_AUDIT.md for code structure

## ✅ Setup Checklist

- [ ] Node.js installed (check: `node --version`)
- [ ] npm installed (check: `npm --version`)
- [ ] Gmail account has 2-Factor auth
- [ ] Generated app-specific password
- [ ] Created `backend/.env` file
- [ ] Installed dependencies (`npm install`)
- [ ] Started backend (`npm run dev`)
- [ ] Health check passes (`curl http://localhost:3000/health`)
- [ ] Frontend loads at `index.html`
- [ ] Tested email sending

**Done! 🎉**

---

**Need help?** 
- Check the error output when running `npm run dev`
- Review troubleshooting section above
- Look in `docs/` folder for more guides
