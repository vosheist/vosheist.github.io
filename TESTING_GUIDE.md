# Integration & Testing Guide

## Pre-Launch Verification

### 1. Backend Setup ✅

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with Gmail credentials:
```
PORT=3000
NODE_ENV=development
EMAIL_USER=vosheist@gmail.com
EMAIL_PASSWORD=<16-char app password from Google>
BACKEND_URL=http://localhost:3000
```

3. Start the backend:
```bash
npm run dev
```

4. Verify it's running:
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok","message":"Backend is running"}
```

### 2. Frontend Configuration ✅

The frontend is already configured with backend endpoints:
- `hearos.html` → `http://localhost:3000/api/feedback`
- `nafshi.html` → `http://localhost:3000/api/notify-signup` & `/api/welcome-email`

No changes needed unless deploying to production.

### 3. User Flow Testing

#### Step 1: New User Registration
```
1. Go to nafshi.html
2. Click "שאַף אַ נײַעם חשבון" (Create account)
3. Fill in:
   - First Name: "יוחנן"
   - Last Name: "כהן"
   - Nickname: "johnan" (must be unique)
   - Email: "user@example.com"
   - Password: "password123"
   - Confirm: "password123"
4. Click "שאַפֿן חשבון"
```

**Expected Results:**
- ✅ Success message in modal
- ✅ Modal closes after 700ms
- ✅ Owner notified at vosheist@gmail.com
- ✅ User receives welcome email at their email
- ✅ User data stored in localStorage

#### Step 2: User Login
```
1. Go to nafshi.html
2. Enter Name: "יוחנן כהן"
3. Enter Password: "password123"
4. Click "אַרײַנגיין"
```

**Expected Results:**
- ✅ Success message
- ✅ sessionStorage gets vosHeistCurrentUser
- ✅ Redirects to account.html
- ✅ Profile panel shows user info
- ✅ Community link becomes visible in navbar

#### Step 3: Profile Management
```
1. Click "טויש פרופיל" button
2. Update fields (optional)
3. Click "היט ענדערונגען"
```

**Expected Results:**
- ✅ Profile updates in localStorage
- ✅ Header syncs immediately
- ✅ Modal closes

#### Step 4: Mitzvah/Aveirah Tracking
```
1. On account.html: Fill in mitzvah form
2. Title: (autocomplete available)
3. Click "היט מצוה"
```

**Expected Results:**
- ✅ Record saves to localStorage
- ✅ Appears in records list
- ✅ Period chart updates
- ✅ No page reload needed

#### Step 5: Community Access
```
1. Test: Log out (click Logout)
2. Try accessing community.html
3. Should redirect to nafshi.html
4. Community link should be hidden in navbar
```

**Expected Results:**
- ✅ Unauthorized users redirected
- ✅ Community nav link hidden
- ✅ Logged-in users see community link

#### Step 6: Feedback Form
```
1. Go to hearos.html
2. Fill form:
   - Name: "משה"
   - Email: "feedback@example.com"
   - Message: "עלק לשפרות!"
3. Click "שיקן הערה"
```

**Expected Results:**
- ✅ Success message
- ✅ Form clears
- ✅ vosheist@gmail.com receives feedback
- ✅ Reply-to is feedback@example.com

### 4. Email Verification

#### Owner Notifications
Check vosheist@gmail.com for:
1. New user signup emails (when user creates account)
2. Feedback submissions (when user sends suggestions)

#### User Welcome Emails
New users should receive welcome email with:
- Personalized greeting in Yiddish
- Instructions for next steps
- Link to their account

#### Email Content Checks
Both emails should have:
- ✅ Correct sender (vosheist@gmail.com)
- ✅ HTML formatting
- ✅ RTL/Hebrew/Yiddish support
- ✅ Proper reply-to address

### 5. Data Persistence

#### localStorage Inspection (Browser DevTools)
```
Open: DevTools → Application → Local Storage
Check:
- vosHeistUsers: {}  (all users stored here)
- vosHeistSelectedPlan: "pro" | "starter"
- vosHeistCurrentUser: "firstname lastname"  (sessionStorage)
```

**User Object Structure**
```javascript
{
  "firstname lastname": {
    displayName: "First Last",
    firstname: "First",
    lastname: "Last",
    nickname: "nick",
    email: "user@example.com",
    records: [
      {
        type: "mitzvah" | "aveirah",
        title: "title",
        description: "details",
        category: "category",
        date: "YYYY-MM-DD",
        time: "HH:MM"
      }
    ],
    passwordHash: "SHA256HASH"
  }
}
```

### 6. Error Handling Tests

#### Invalid Inputs
Test these should show error messages:
```
1. Sign up with existing username → "דער נאמען איז שוין פארנומען."
2. Sign up with short password → "פּאַראָל דאַרף האָבן 4 אותיות אָדער מער."
3. Login with wrong password → "דער פאסווארד איז נישט ריכטיג."
4. Feedback without message → "לייג אריין נאמען און הערה."
5. Invalid email → validation should reject
```

#### Network Errors
Test backend unavailability:
```
1. Stop backend: npm process
2. Try submitting feedback
3. Should show: "מ'האט שווער דער הערה צו שיקן..."
4. Restart backend
5. Works again
```

### 7. Browser Compatibility

Test on:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (if available)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Critical Features to Check:**
- RTL direction
- Responsive layout
- Form inputs
- Modals
- Navbar toggle

### 8. Security Spot Checks

```
1. localStorage Inspection:
   - Passwords are hashed (not plaintext)
   - Sensitive data not exposed in URLs
   
2. Form Validation:
   - No SQL injection possible (localStorage only)
   - Email regex validates properly
   - Password minlength enforced
   
3. Backend Validation:
   - Server-side email validation
   - Errors don't expose system info
   - CORS headers properly set
```

### 9. Production Checklist

Before going live:

**Backend:**
- [ ] Gmail app password configured
- [ ] NODE_ENV = production
- [ ] Error logging enabled
- [ ] Rate limiting added
- [ ] CORS restricted to known domains
- [ ] Server running on production domain

**Frontend:**
- [ ] Backend URL updated to production domain
- [ ] HTTPS enforced
- [ ] No console.log() debug statements
- [ ] Service worker (optional)
- [ ] Minify CSS/JS (optional)

**Operations:**
- [ ] Backup system in place
- [ ] Email monitoring active
- [ ] Error alerts set up
- [ ] User data backed up
- [ ] Support email monitored

### 10. Sample Test Data

For testing without real emails, use:

```
User 1:
- First Name: יוחנן
- Last Name: כהן
- Nickname: johnan
- Email: test1@example.com
- Password: test1234

User 2:
- First Name: מרים
- Last Name: לוי
- Nickname: miryam
- Email: test2@example.com
- Password: test2345
```

### 11. Feedback Loop

After launch, monitor:
1. Error logs in backend
2. Email delivery status
3. User feedback submissions
4. Account creation rate
5. Login success rate
6. Performance metrics

### Common Issues & Fixes

**Issue: "credential-gh is not a git command"**
- This is a warning only, not an error
- Does not affect push functionality
- Git push completes successfully

**Issue: Welcome email not received**
- Check: EMAIL_PASSWORD is correct 16-char password
- Check: Gmail account has 2-Factor auth enabled
- Check: Email not in spam folder
- Check: Backend console shows "Email service configured"

**Issue: Community link not hiding**
- Clear localStorage and reload
- Check: sessionStorage has vosHeistCurrentUser

**Issue: Records not saving**
- Check: Browser localStorage isn't disabled
- Check: localStorage quota not exceeded
- Check: No browser extensions blocking

---

## Verification Signoff

- [x] Code audited and cleaned
- [x] All endpoints tested
- [x] Email system integrated
- [x] Community access restricted
- [x] Error handling complete
- [x] Documentation complete

**Status: READY FOR BETA TESTING**

For issues or questions, check [BACKEND_SETUP.md](BACKEND_SETUP.md) or [CODE_AUDIT.md](CODE_AUDIT.md)
