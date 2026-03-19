const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

// Feedback/suggestions endpoint
app.post('/api/feedback', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Validation
        if (!name || !message) {
            return res.status(400).json({ error: 'Name and message are required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Prepare email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'vosheist@gmail.com',
            subject: `New Feedback from ${name}`,
            html: `
                <h2>New Feedback Received</h2>
                <p><strong>From:</strong> ${name}</p>
                ${email ? `<p><strong>Reply-to:</strong> ${email}</p>` : ''}
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
                <hr>
                <p><small>Submitted at: ${new Date().toISOString()}</small></p>
            `,
            replyTo: email || process.env.EMAIL_USER
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: 'Feedback sent successfully'
        });

    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({
            error: 'Failed to send feedback',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Signup notification endpoint
app.post('/api/notify-signup', async (req, res) => {
    try {
        const { displayName, nickname, email: userEmail, createdAt } = req.body;

        if (!displayName || !nickname || !userEmail) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'vosheist@gmail.com',
            subject: `New User Signup: ${displayName}`,
            html: `
                <h2>New User Registered</h2>
                <p><strong>Display Name:</strong> ${displayName}</p>
                <p><strong>Nickname:</strong> ${nickname}</p>
                <p><strong>Email:</strong> ${userEmail}</p>
                <p><strong>Registered at:</strong> ${createdAt}</p>
            `,
            replyTo: userEmail
        };

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: 'Signup notification sent'
        });

    } catch (error) {
        console.error('Signup notification error:', error);
        res.status(500).json({
            error: 'Failed to send notification',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Welcome email endpoint - sends confirmation to new user
app.post('/api/welcome-email', async (req, res) => {
    try {
        const { email, firstname, lastname } = req.body;

        if (!email || !firstname || !lastname) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const fullName = `${firstname} ${lastname}`.trim();
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'ברוכים הבאים צו וואס הייסט | Welcome to Vos Heist!',
            html: `
                <div style="font-family: Arial, sans-serif; text-align: right; direction: rtl; color: #333;">
                    <h2 style="color: #2c3e50;">ברוכים הבאים, ${fullName}!</h2>
                    <p>תודה על הירשמות! אתה עכשיו ממבר של <strong>וואס הייסט</strong>.</p>
                    <hr>
                    <h3 style="color: #34495e;">מה עכשיו?</h3>
                    <ul>
                        <li><strong>עלק לעקוב</strong> - גיע לחשבונך באתר וההתחל לעקוב אחרי מצוות וברכות שלך</li>
                        <li><strong>הצטרף לקהילה</strong> - ראה מה עושים משתמשים אחרים</li>
                        <li><strong>תן משוב</strong> - יש לך רעיון? שלח לנו הערה</li>
                    </ul>
                    <hr>
                    <p style="margin-top: 20px;">
                        <a href="http://localhost:3000" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            לך לחשבונך
                        </a>
                    </p>
                    <p style="margin-top: 20px; font-size: 12px; color: #7f8c8d;">
                        אם יש לך שאלות, כתוב לנו דרך עמוד ההערות.
                    </p>
                </div>
            `,
            replyTo: process.env.EMAIL_USER
        };

        await transporter.sendMail(mailOptions);

        res.json({ 
            success: true, 
            message: 'Welcome email sent successfully' 
        });

    } catch (error) {
        console.error('Welcome email error:', error);
        res.status(500).json({ 
            error: 'Failed to send welcome email',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`✓ Vos Heist Backend running on http://localhost:${PORT}`);
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        console.log('✓ Email service configured');
    } else {
        console.warn('⚠ Email service NOT configured - set EMAIL_USER and EMAIL_PASSWORD in .env');
    }
    console.log('✓ CORS enabled for all origins');
    console.log('✓ Endpoints: /health, /api/feedback, /api/notify-signup, /api/welcome-email');
});
