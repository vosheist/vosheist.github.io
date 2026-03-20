const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const fs = require("fs/promises");
const path = require("path");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "vos_heist";
const ADMIN_ACCESS_KEY = String(process.env.ADMIN_ACCESS_KEY || "").trim();
const FRONTEND_LOGIN_URL = String(process.env.FRONTEND_LOGIN_URL || "https://vosheist.github.io/frontend/nafshi.html").trim();
const LEGACY_STORE_PATH = path.join(__dirname, "data", "store.json");

let mongoClient;
let db;
let usersCollection;
let baisMedrashCollection;
let coffeeRoomCollection;

function normalizeName(name) {
    return String(name || "").trim().toLowerCase();
}

function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

function escapeRegex(value) {
    return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function sanitizeUserForClient(user) {
    return {
        displayName: user.displayName,
        firstname: user.firstname,
        lastname: user.lastname,
        nickname: user.nickname,
        email: user.email,
        passwordHash: user.passwordHash,
        records: Array.isArray(user.records) ? user.records : [],
        createdAt: user.createdAt || null
    };
}

function requireAdmin(req, res, next) {
    if (!ADMIN_ACCESS_KEY) {
        return res.status(503).json({ error: "Admin access is not configured" });
    }

    const providedKey = String(req.get("x-admin-key") || "").trim();
    if (!providedKey || providedKey !== ADMIN_ACCESS_KEY) {
        return res.status(401).json({ error: "Unauthorized admin access" });
    }

    return next();
}

async function connectMongo() {
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    db = mongoClient.db(MONGODB_DB_NAME);

    usersCollection = db.collection("users");
    baisMedrashCollection = db.collection("bais_medrash_posts");
    coffeeRoomCollection = db.collection("coffee_room_messages");

    await usersCollection.createIndex({ userKey: 1 }, { unique: true });
    await usersCollection.createIndex({ nicknameKey: 1 }, { unique: true });
    await usersCollection.createIndex({ displayNameKey: 1 }, { unique: true });
    await usersCollection.createIndex({ emailKey: 1 });
    await usersCollection.createIndex({ firstnameKey: 1 });
}

async function migrateLegacyStoreIfNeeded() {
    const userCount = await usersCollection.countDocuments();
    const baisCount = await baisMedrashCollection.countDocuments();
    const coffeeCount = await coffeeRoomCollection.countDocuments();

    if (userCount > 0 || baisCount > 0 || coffeeCount > 0) {
        return;
    }

    try {
        const legacyRaw = await fs.readFile(LEGACY_STORE_PATH, "utf8");
        const legacy = JSON.parse(legacyRaw);

        const users = legacy && legacy.users ? legacy.users : {};
        const userDocs = Object.entries(users).map(([userKey, user]) => {
            const displayName = String(user.displayName || `${user.firstname || ""} ${user.lastname || ""}`).trim();
            const nickname = String(user.nickname || displayName).trim();
            const firstname = String(user.firstname || "").trim();
            const email = String(user.email || "").trim();
            return {
                userKey: normalizeName(userKey),
                displayName,
                displayNameKey: normalizeName(displayName),
                firstname,
                firstnameKey: normalizeName(firstname),
                lastname: String(user.lastname || "").trim(),
                nickname,
                nicknameKey: normalizeName(nickname),
                email,
                emailKey: normalizeEmail(email),
                passwordHash: String(user.passwordHash || ""),
                records: Array.isArray(user.records) ? user.records : [],
                createdAt: user.createdAt || new Date().toISOString()
            };
        });

        const baisDocs = Array.isArray(legacy.baisMedrashPosts)
            ? legacy.baisMedrashPosts.map((post) => ({
                ...post,
                createdAt: post.createdAt || new Date().toISOString()
            }))
            : [];

        const coffeeDocs = Array.isArray(legacy.coffeeRoomMessages)
            ? legacy.coffeeRoomMessages.map((message) => ({
                ...message,
                createdAt: message.createdAt || new Date().toISOString()
            }))
            : [];

        if (userDocs.length) {
            await usersCollection.insertMany(userDocs, { ordered: false });
        }
        if (baisDocs.length) {
            await baisMedrashCollection.insertMany(baisDocs, { ordered: false });
        }
        if (coffeeDocs.length) {
            await coffeeRoomCollection.insertMany(coffeeDocs, { ordered: false });
        }

        console.log("✓ Migrated legacy JSON store into MongoDB");
    } catch {
        console.log("ℹ No legacy store to migrate");
    }
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
    const dbConnected = Boolean(db);
    res.json({ status: "ok", message: "Backend is running", db: dbConnected ? "connected" : "disconnected" });
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

    const existingUser = await usersCollection.findOne({ userKey });
    if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
    }

    const displayNameKey = normalizeName(displayName);
    const displayNameTaken = await usersCollection.findOne({ displayNameKey });
    if (displayNameTaken) {
        return res.status(409).json({ error: "User already exists" });
    }

    const nicknameTaken = await usersCollection.findOne({ nicknameKey });
    if (nicknameTaken) {
        return res.status(409).json({ error: "Nickname already exists" });
    }

    const userDoc = {
        userKey,
        displayName,
        displayNameKey,
        firstname: String(firstname).trim(),
        firstnameKey: normalizeName(firstname),
        lastname: String(lastname).trim(),
        nickname: String(nickname).trim(),
        nicknameKey,
        email: String(email).trim(),
        emailKey: normalizeEmail(email),
        passwordHash,
        records: [],
        createdAt: new Date().toISOString()
    };

    await usersCollection.insertOne(userDoc);

    return res.json({
        success: true,
        userKey,
        user: {
            displayName: userDoc.displayName,
            firstname: userDoc.firstname,
            lastname: userDoc.lastname,
            nickname: userDoc.nickname,
            email: userDoc.email,
            passwordHash: userDoc.passwordHash,
            records: userDoc.records
        }
    });
});

app.post("/api/auth/login", async (req, res) => {
    const { identifier, name, passwordHash } = req.body || {};
    const rawIdentifier = String(identifier || name || "").trim();
    const identifierKey = normalizeName(rawIdentifier);
    const emailKey = normalizeEmail(rawIdentifier);
    const exactIdentifier = new RegExp(`^${escapeRegex(rawIdentifier)}$`, "i");

    if (!identifierKey || !passwordHash) {
        return res.status(400).json({ error: "Missing login identifier or password" });
    }

    const user = await usersCollection.findOne({
        $or: [
            { userKey: identifierKey },
            { displayNameKey: identifierKey },
            { nicknameKey: identifierKey },
            { firstnameKey: identifierKey },
            { emailKey },
            { displayName: exactIdentifier },
            { nickname: exactIdentifier },
            { firstname: exactIdentifier },
            { email: exactIdentifier }
        ]
    });
    if (!user || user.passwordHash !== passwordHash) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    return res.json({
        success: true,
        userKey: user.userKey,
        user: {
            displayName: user.displayName,
            firstname: user.firstname,
            lastname: user.lastname,
            nickname: user.nickname,
            email: user.email,
            passwordHash: user.passwordHash,
            records: Array.isArray(user.records) ? user.records : []
        }
    });
});

app.get("/api/users/:userKey", async (req, res) => {
    const userKey = normalizeName(req.params.userKey);
    const user = await usersCollection.findOne({ userKey });
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    return res.json({
        success: true,
        user: {
            displayName: user.displayName,
            firstname: user.firstname,
            lastname: user.lastname,
            nickname: user.nickname,
            email: user.email,
            passwordHash: user.passwordHash,
            records: Array.isArray(user.records) ? user.records : []
        }
    });
});

app.put("/api/users/:userKey/profile", async (req, res) => {
    const userKey = normalizeName(req.params.userKey);
    const { firstname, lastname, nickname, email, passwordHash } = req.body || {};

    const user = await usersCollection.findOne({ userKey });
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const nextNickname = String(nickname || "").trim();
    if (!firstname || !lastname || !nextNickname || !email) {
        return res.status(400).json({ error: "Missing profile fields" });
    }

    const nextDisplayName = `${String(firstname).trim()} ${String(lastname).trim()}`.trim();
    const nextDisplayNameKey = normalizeName(nextDisplayName);
    const nextNicknameKey = normalizeName(nextNickname);

    const nicknameTaken = await usersCollection.findOne({
        nicknameKey: nextNicknameKey,
        userKey: { $ne: userKey }
    });
    if (nicknameTaken) {
        return res.status(409).json({ error: "Nickname already exists" });
    }

    const displayNameTaken = await usersCollection.findOne({
        displayNameKey: nextDisplayNameKey,
        userKey: { $ne: userKey }
    });
    if (displayNameTaken) {
        return res.status(409).json({ error: "User already exists" });
    }

    const updateFields = {
        firstname: String(firstname).trim(),
        firstnameKey: normalizeName(firstname),
        lastname: String(lastname).trim(),
        displayName: nextDisplayName,
        displayNameKey: nextDisplayNameKey,
        nickname: nextNickname,
        nicknameKey: nextNicknameKey,
        email: String(email).trim(),
        emailKey: normalizeEmail(email)
    };

    if (passwordHash) {
        updateFields.passwordHash = passwordHash;
    }

    await usersCollection.updateOne({ userKey }, { $set: updateFields });
    const updatedUser = await usersCollection.findOne({ userKey });

    return res.json({
        success: true,
        user: {
            displayName: updatedUser.displayName,
            firstname: updatedUser.firstname,
            lastname: updatedUser.lastname,
            nickname: updatedUser.nickname,
            email: updatedUser.email,
            passwordHash: updatedUser.passwordHash,
            records: Array.isArray(updatedUser.records) ? updatedUser.records : []
        }
    });
});

app.get("/api/users/:userKey/records", async (req, res) => {
    const userKey = normalizeName(req.params.userKey);
    const user = await usersCollection.findOne({ userKey }, { projection: { records: 1 } });
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

    const user = await usersCollection.findOne({ userKey }, { projection: { records: 1 } });
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const nextRecord = {
        ...record,
        createdAt: record.createdAt || new Date().toISOString()
    };

    await usersCollection.updateOne({ userKey }, { $push: { records: nextRecord } });
    const updated = await usersCollection.findOne({ userKey }, { projection: { records: 1 } });
    return res.json({ success: true, records: Array.isArray(updated.records) ? updated.records : [] });
});

app.get("/api/community", async (req, res) => {
    const excludeUserKey = normalizeName(req.query.exclude || "");
    const docs = await usersCollection.find({ userKey: { $ne: excludeUserKey } }).toArray();

    const users = docs.map((doc) => ({
        key: doc.userKey,
        user: {
            displayName: doc.displayName,
            firstname: doc.firstname,
            lastname: doc.lastname,
            nickname: doc.nickname,
            email: doc.email,
            passwordHash: doc.passwordHash,
            records: Array.isArray(doc.records) ? doc.records : []
        }
    }));

    return res.json({ success: true, users });
});

app.get("/api/bais-medrash", async (req, res) => {
    const posts = await baisMedrashCollection.find({}).toArray();
    const normalizedPosts = posts.map((post) => {
        const { _id, ...rest } = post;
        return rest;
    });
    return res.json({ success: true, posts: normalizedPosts });
});

app.post("/api/bais-medrash", async (req, res) => {
    const { post } = req.body || {};
    if (!post || !post.nickname || !post.time || !post.length || !post.limud || !post.style) {
        return res.status(400).json({ error: "Invalid post payload" });
    }

    const nextPost = {
        ...post,
        createdAt: post.createdAt || new Date().toISOString()
    };

    await baisMedrashCollection.insertOne(nextPost);
    const posts = await baisMedrashCollection.find({}).toArray();
    const normalizedPosts = posts.map((item) => {
        const { _id, ...rest } = item;
        return rest;
    });
    return res.json({ success: true, posts: normalizedPosts });
});

app.get("/api/coffee-room", async (req, res) => {
    const messages = await coffeeRoomCollection.find({}).toArray();
    const normalizedMessages = messages.map((message) => {
        const { _id, ...rest } = message;
        return rest;
    });
    return res.json({ success: true, messages: normalizedMessages });
});

app.get("/api/admin/overview", requireAdmin, async (req, res) => {
    const userDocs = await usersCollection.find({}).sort({ createdAt: -1 }).toArray();
    const posts = await baisMedrashCollection.find({}).sort({ createdAt: -1 }).toArray();
    const messages = await coffeeRoomCollection.find({}).sort({ createdAt: -1 }).toArray();

    const users = userDocs.map((doc) => ({
        key: doc.userKey,
        user: sanitizeUserForClient(doc)
    }));

    const baisMedrashPosts = posts.map((post) => {
        const { _id, ...rest } = post;
        return rest;
    });

    const coffeeRoomMessages = messages.map((message) => {
        const { _id, ...rest } = message;
        return rest;
    });

    return res.json({
        success: true,
        totals: {
            users: users.length,
            records: users.reduce((sum, entry) => sum + (Array.isArray(entry.user.records) ? entry.user.records.length : 0), 0),
            baisMedrashPosts: baisMedrashPosts.length,
            coffeeRoomMessages: coffeeRoomMessages.length
        },
        users,
        baisMedrashPosts,
        coffeeRoomMessages
    });
});

app.post("/api/coffee-room", async (req, res) => {
    const { message } = req.body || {};
    if (!message || !message.nickname || !message.message) {
        return res.status(400).json({ error: "Invalid message payload" });
    }

    const nextMessage = {
        ...message,
        createdAt: message.createdAt || new Date().toISOString()
    };

    await coffeeRoomCollection.insertOne(nextMessage);
    const messages = await coffeeRoomCollection.find({}).toArray();
    const normalizedMessages = messages.map((item) => {
        const { _id, ...rest } = item;
        return rest;
    });
    return res.json({ success: true, messages: normalizedMessages });
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
        const { email, firstname, lastname, nickname } = req.body;
        if (!email || !firstname || !lastname) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const fullName = `${firstname} ${lastname}`.trim();
        const escapedFullName = escapeHtml(fullName);
        const escapedEmail = escapeHtml(email);
        const escapedNickname = nickname ? escapeHtml(nickname) : null;
        const escapedLoginUrl = escapeHtml(FRONTEND_LOGIN_URL);
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Welcome to Vos Heist",
            html: `
                <div style="margin:0; padding:32px 16px; background:#f4f7fb; font-family:Arial,Helvetica,sans-serif; color:#22313f;">
                    <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #d7e0ea; border-radius:18px; overflow:hidden; box-shadow:0 14px 40px rgba(34,49,63,0.08);">
                        <div style="padding:28px 32px; background:linear-gradient(135deg,#dcecf7 0%,#f9ecd8 100%); border-bottom:1px solid #d7e0ea;">
                            <p style="margin:0 0 10px; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#5b7186;">Vos Heist</p>
                            <h1 style="margin:0; font-size:30px; line-height:1.2; color:#1f3142;">Welcome, ${escapedFullName}</h1>
                            <p style="margin:12px 0 0; font-size:16px; line-height:1.6; color:#385066;">Your member account is now active. You can sign in, track your progress, join the community, and use the member rooms right away.</p>
                        </div>
                        <div style="padding:28px 32px;">
                            <p style="margin:0 0 18px; font-size:16px; line-height:1.7;">Here are your account details:</p>
                            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse; margin:0 0 24px;">
                                <tr>
                                    <td style="padding:10px 0; border-bottom:1px solid #edf2f7; font-weight:700; width:160px;">Full name</td>
                                    <td style="padding:10px 0; border-bottom:1px solid #edf2f7;">${escapedFullName}</td>
                                </tr>
                                ${escapedNickname ? `<tr><td style="padding:10px 0; border-bottom:1px solid #edf2f7; font-weight:700;">Pen name</td><td style="padding:10px 0; border-bottom:1px solid #edf2f7;">${escapedNickname}</td></tr>` : ""}
                                <tr>
                                    <td style="padding:10px 0; border-bottom:1px solid #edf2f7; font-weight:700;">Email</td>
                                    <td style="padding:10px 0; border-bottom:1px solid #edf2f7;">${escapedEmail}</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 0; font-weight:700; vertical-align:top;">Login options</td>
                                    <td style="padding:10px 0;">You can sign in with your email, first name, full name, or pen name, together with your code.</td>
                                </tr>
                            </table>
                            <div style="margin:0 0 24px;">
                                <a href="${escapedLoginUrl}" style="display:inline-block; padding:14px 24px; background:#2d6788; color:#ffffff; text-decoration:none; border-radius:999px; font-weight:700; font-size:15px;">Go to Login</a>
                            </div>
                            <p style="margin:0 0 12px; font-size:15px; line-height:1.7;">After you log in, you will be able to:</p>
                            <ul style="margin:0 0 24px; padding-left:20px; color:#385066; line-height:1.8;">
                                <li>View and update your account details</li>
                                <li>Track mitzvah and aveirah records</li>
                                <li>See the member community</li>
                                <li>Use the Bais Medrash and Caveh Tzimer pages</li>
                            </ul>
                            <p style="margin:0; font-size:14px; line-height:1.7; color:#66788a;">If the button does not open, copy and paste this link into your browser:<br><a href="${escapedLoginUrl}" style="color:#2d6788; word-break:break-all;">${escapedLoginUrl}</a></p>
                        </div>
                    </div>
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

async function startServer() {
    try {
        await connectMongo();
        await migrateLegacyStoreIfNeeded();

        app.listen(PORT, () => {
            console.log(`✓ Vos Heist Backend running on http://localhost:${PORT}`);
            console.log(`✓ MongoDB connected: ${MONGODB_DB_NAME}`);
            if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
                console.log("✓ Email service configured");
            } else {
                console.warn("⚠ Email service NOT configured - set EMAIL_USER and EMAIL_PASSWORD in .env");
            }
            console.log("✓ Endpoints: auth, users, records, community, bais-medrash, coffee-room");
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
}

startServer();
