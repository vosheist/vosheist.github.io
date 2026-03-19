# Vos Heist Backend Setup Guide

## Prerequisites
- Node.js 14+ and npm installed
- Gmail account with app-specific passwords enabled

## Installation

1. Navigate to the project directory:
```bash
cd "c:\Users\owner\Desktop\vos heist"
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
copy .env.example .env
```

4. Configure your `.env` file with Gmail credentials:
```
PORT=3000
NODE_ENV=development
EMAIL_USER=vosheist@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
BACKEND_URL=http://localhost:3000
```

## Gmail App Password Setup

1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification if not already enabled
3. Go to App passwords (https://myaccount.google.com/apppasswords)
4. Select "Mail" and "Windows Computer" (or your device)
5. Copy the generated 16-character password
6. Paste it in `.env` as `EMAIL_PASSWORD`

## Running the Server

### Development (with auto-reload):
```bash
npm run dev
```

### Production:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
```
GET /health
```
Returns: `{ "status": "ok", "message": "Backend is running" }`

### Send Feedback
```
POST /api/feedback
Content-Type: application/json

{
  "name": "User Name",
  "email": "user@example.com",  // optional
  "message": "Feedback message"
}
```

### Notify Signup
```
POST /api/notify-signup
Content-Type: application/json

{
  "displayName": "Full Name",
  "nickname": "username",
  "email": "user@example.com",
  "createdAt": "2026-03-19T..."
}
```

## Frontend Configuration

The frontend is already configured to use:
- Hearos feedback: `http://localhost:3000/api/feedback`
- Signup notifications: `http://localhost:3000/api/notify-signup`

Update these in:
- `hearos.html` - line 121 (FEEDBACK_ENDPOINT)
- `nafshi.html` - line 136 (SIGNUP_NOTIFY_ENDPOINT)

## Production Deployment

For production:

1. Set `NODE_ENV=production` in `.env`
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "vos-heist-backend"
   ```
3. Use a reverse proxy (nginx/Apache) to forward requests
4. Set `BACKEND_URL` to your production domain
5. Update frontend endpoints to point to production backend

## Troubleshooting

- **Email not sending**: Check Gmail app password is correct and 2FA is enabled
- **CORS errors**: Backend is configured to accept requests from any origin
- **Port already in use**: Change PORT in `.env` to an available port
- **Connection refused**: Ensure backend is running with `npm run dev`

## Security Notes

- **Never commit `.env` file** (already in .gitignore)
- Use environment variables for all secrets
- Consider rate limiting in production
- Add authentication for production endpoints
