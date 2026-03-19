const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const fs = require("fs/promises");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, "data", "store.json");

let writeQueue = Promise.resolve();

function normalizeName(name) {
    return String(name || "").trim().toLowerCase();
}

function createEmptyStore() {
    return {
        users: {},
        baisMedrashPosts: [],
        coffeeRoomMessages: []
    };
}

async function ensureStoreExists() {
    try {
        await fs.access(DB_PATH);
    } catch {
        await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
        await fs.writeFile(DB_PATH, JSON.stringify(createEmptyStore(), null, 2), "utf8");
    }
}

async function readStore() {
    await ensureStoreExists();
    const raw = await fs.readFile(DB_PATH, "utf8");
    try {
        const parsed = JSON.parse(raw);
        return {
            users: parsed.users || {},
            baisMedrashPosts: Array.isArray(parsed.baisMedrashPosts) ? parsed.baisMedrashPosts : [],
            coffeeRoomMessages: Array.isArray(parsed.coffeeRoomMessages) ? parsed.coffeeRoomMessages : []
        };
    } catch {
        return createEmptyStore();
    }
}

async function writeStore(nextStore) {
    writeQueue = writeQueue.then(async () => {
        await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
        await fs.writeFile(DB_PATH, JSON.stringify(nextStore, null, 2), "utf8");
    });
    return writeQueue;
}

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Backend is running" });
});

app.post("/api/auth/signup", async (req, res) => {
    const {
        firstname,
        lastname,
        nickname,
        email,
        passwordHash
    } = req.body || {};

    const displayName = `${String(firstname || "").trim()} ${String(lastname || "").trim()}`.trim();
    const userKey = normalizeName(displayName);
    const nicknameKey = normalizeName(nickname);

    if (!userKey || !nicknameKey || !email || !passwordHash) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const store = await readStore();
    if (store.users[userKey]) {
        return res.status(409).json({ error: "User already exists" });
    }

    const nicknameTaken = Object.values(store.users).some((user) => normalizeName(user.nickname) === nicknameKey);
    if (nicknameTaken) {
        return res.status(409).json({ error: "Nickname already exists" });
    }

    store.users[userKey] = {
        displayName,
        firstname: String(firstname).trim(),
        lastname: String(lastname).trim(),
        nickname: String(nickname).trim(),
        email: String(email).trim(),
        passwordHash,
        records: []
    };

    await writeStore(store);
    return res.json({ success: true, userKey, user: store.users[userKey] });
});

app.post("/api/auth/login", async (req, res) => {
    const { name, passwordHash } = req.body || {};
    const userKey = normalizeName(name);
    if (!userKey || !passwordHash) {
        return res.status(400).json({ error: "Missing name or password" });
    }

    const store = await readStore();
    const user = store.users[userKey];
    if (!user || user.passwordHash !== passwordHash) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    return res.json({ success: true, userKey, user });
});

app.get("/api/users/:userKey", async (req, res) => {
    const userKey = normalizeName(req.params.userKey);
    const store = await readStore();
    const user = store.users[userKey];
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    return res.json({ success: true, user });
});

app.put("/api/users/:userKey/profile", async (req, res) => {
    const userKey = normalizeName(req.params.userKey);
    const { firstname, lastname, nickname, email, passwordHash } = req.body || {};

    const store = await readStore();
    const user = store.users[userKey];
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const nextNickname = String(nickname || "").trim();
    if (!firstname || !lastname || !nextNickname || !email) {
        return res.status(400).json({ error: "Missing profile fields" });
    }

    const nicknameTaken = Object.entries(store.users).some(([key, value]) => key !== userKey && normalizeName(value.nickname) === normalizeName(nextNickname));
    if (nicknameTaken) {
        return res.status(409).json({ error: "Nickname already exists" });
    }

    user.firstname = String(firstname).trim();
    user.lastname = String(lastname).trim();
    user.displayName = `${user.firstname} ${user.lastname}`.trim();
    user.nickname = nextNickname;
    user.email = String(email).trim();
    if (passwordHash) {
        user.passwordHash = passwordHash;
    }

    await writeStore(store);
    return res.json({ success: true, user });
});

app.get("/api/users/:userKey/records", async (req, res) => {
    const userKey = normalizeName(req.params.userKey);
    const store = await readStore();
    const user = store.users[userKey];
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    return res.json({ success: true, records: Array.isArray(user.records) ? user.records : [] });
});

app.post("/api/users/:userKey/records", async (req, res) => {
    const userKey = normalizeName(req.params.userKey);
    const { record } = req.body || {};

    if (!record || !record.type || !record.title) {
        return res.status(400).json({ error: "Invalid record payload" });
    }

    const store = await readStore();
    const user = store.users[userKey];
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    if (!Array.isArray(user.records)) {
        user.records = [];
    }

    user.records.push({
        ...record,
        createdAt: record.createdAt || new Date().toISOString()
    });

    await writeStore(store);
    return res.json({ success: true, records: user.records });
});

app.get("/api/community", async (req, res) => {
    const excludeUserKey = normalizeName(req.query.exclude || "");
    const store = await readStore();

    const users = Object.entries(store.users)
        .filter(([key]) => key !== excludeUserKey)
        .map(([key, user]) => ({ key, user }));

    return res.json({ success: true, users });
});

app.get("/api/bais-medrash", async (req, res) => {
    const store = await readStore();
    return res.json({ success: true, posts: store.baisMedrashPosts });
});

app.post("/api/bais-medrash", async (req, res) => {
    const { post } = req.body || {};
    if (!post || !post.nickname || !post.time || !post.length || !post.limud || !post.style) {
        return res.status(400).json({ error: "Invalid post payload" });
    }

    const store = await readStore();
    store.baisMedrashPosts.push({
        ...post,
        createdAt: post.createdAt || new Date().toISOString()
    });
    await writeStore(store);
    return res.json({ success: true, posts: store.baisMedrashPosts });
});

app.get("/api/coffee-room", async (req, res) => {
    const store = await readStore();
    return res.json({ success: true, messages: store.coffeeRoomMessages });
});

app.post("/api/coffee-room", async (req, res) => {
    const { message } = req.body || {};
    if (!message || !message.nickname || !message.message) {
        return res.status(400).json({ error: "Invalid message payload" });
    }

    const store = await readStore();
    store.coffeeRoomMessages.push({
        ...message,
        createdAt: message.createdAt || new Date().toISOString()
    });
    await writeStore(store);
    return res.json({ success: true, messages: store.coffeeRoomMessages });
});

app.post("/api/feedback", async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !message) {
            return res.status(400).json({ error: "Name and message are required" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: "vosheist@gmail.com",
            subject: `New Feedback from ${name}`,
            html: `
                <h2>New Feedback Received</h2>
                <p><strong>From:</strong> ${name}</p>
                ${email ? `<p><strong>Reply-to:</strong> ${email}</p>` : ""}
                <p><strong>Message:</strong></p>
                <p>${String(message).replace(/\n/g, "<br>")}</p>
                <hr>
                <p><small>Submitted at: ${new Date().toISOString()}</small></p>
            `,
            replyTo: email || process.env.EMAIL_USER
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Feedback sent successfully" });
    } catch (error) {
        console.error("Email error:", error);
        res.status(500).json({
            error: "Failed to send feedback",
            details: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
});

app.post("/api/notify-signup", async (req, res) => {
    try {
        const { displayName, nickname, email: userEmail, createdAt } = req.body;
        if (!displayName || !nickname || !userEmail) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: "vosheist@gmail.com",
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
        res.json({ success: true, message: "Signup notification sent" });
    } catch (error) {
        console.error("Signup notification error:", error);
        res.status(500).json({
            error: "Failed to send notification",
            details: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
});

app.post("/api/welcome-email", async (req, res) => {
    try {
        const { email, firstname, lastname } = req.body;
        if (!email || !firstname || !lastname) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const fullName = `${firstname} ${lastname}`.trim();
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "ברוכים הבאים צו וואס הייסט | Welcome to Vos Heist!",
            html: `
                <div style="font-family: Arial, sans-serif; text-align: right; direction: rtl; color: #333;">
                    <h2 style="color: #2c3e50;">ברוכים הבאים, ${fullName}!</h2>
                    <p>תודה על הירשמות! אתה עכשיו ממבר של <strong>וואס הייסט</strong>.</p>
                </div>
            `,
            replyTo: process.env.EMAIL_USER
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Welcome email sent successfully" });
    } catch (error) {
        console.error("Welcome email error:", error);
        res.status(500).json({
            error: "Failed to send welcome email",
            details: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
});

app.listen(PORT, async () => {
    await ensureStoreExists();
    console.log(`✓ Vos Heist Backend running on http://localhost:${PORT}`);
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        console.log("✓ Email service configured");
    } else {
        console.warn("⚠ Email service NOT configured - set EMAIL_USER and EMAIL_PASSWORD in .env");
    }
    console.log("✓ Persistent store: backend/data/store.json");
    console.log("✓ Endpoints: auth, users, records, community, bais-medrash, coffee-room");
});
