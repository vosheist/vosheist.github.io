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

app.listen(PORT, () => {
    console.log(`✓ VOS HEIST Backend running on http://localhost:${PORT}`);
    console.log(`✓ CORS enabled`);
    console.log(`✓ Email service: ${process.env.EMAIL_USER || 'NOT CONFIGURED'}`);
});
