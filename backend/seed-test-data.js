/**
 * Seed test members with mitzvos and aveiros
 * Run: node seed-test-data.js
 */
const { MongoClient } = require("mongodb");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "vos_heist";

const mitzvos = [
    "Helped elderly neighbor with groceries",
    "Studied Torah for 30 minutes",
    "Donated to charity",
    "Davened mincha with intention",
    "Visited sick friend",
    "Gave tzedakah without being asked",
    "Learned mussar",
    "Said Tehillim",
    "Helped with community project",
    "Showed kindness to stranger"
];

const aveiros = [
    "Lost patience with family",
    "Wasted time instead of learning",
    "Spoke lashon hara",
    "Complained about situation",
    "Skipped tefillah",
    "Was disrespectful to parent",
    "Acted with pride",
    "Engaged in idle gossip",
    "Procrastinated on important task",
    "Let anger get the better"
];

const testMembers = [
    {
        firstname: "Moshe",
        lastname: "Cohen",
        nickname: "Rabbi M",
        email: "moshe.cohen@example.com",
        password: "test123"
    },
    {
        firstname: "Reuven",
        lastname: "Blum",
        nickname: "Reu",
        email: "reuven.blum@example.com",
        password: "test123"
    },
    {
        firstname: "Yochanan",
        lastname: "Rosenberg",
        nickname: "John",
        email: "yochanan.r@example.com",
        password: "test123"
    },
    {
        firstname: "Shlomo",
        lastname: "Mendelsohn",
        nickname: "Shlom",
        email: "shlomo.m@example.com",
        password: "test123"
    }
];

function normalizeName(name) {
    return String(name || "").trim().toLowerCase();
}

function getRandomItems(arr, count) {
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(arr[Math.floor(Math.random() * arr.length)]);
    }
    return result;
}

async function seedTestData() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        const db = client.db(MONGODB_DB_NAME);
        const usersCollection = db.collection("users");

        console.log("🌱 Seeding test members...\n");

        for (const member of testMembers) {
            const userKey = normalizeName(member.firstname);
            const nicknameKey = normalizeName(member.nickname);
            const displayNameKey = normalizeName(`${member.firstname} ${member.lastname}`);
            const emailKey = normalizeName(member.email);
            const firstnameKey = normalizeName(member.firstname);

            // Generate random records (3-6 mitzvos, 2-4 aveiros)
            const records = [];

            const randomMitzvos = getRandomItems(mitzvos, 2 + Math.floor(Math.random() * 3));
            randomMitzvos.forEach((title) => {
                records.push({
                    type: "mitzvah",
                    title: title,
                    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
                });
            });

            const randomAveiros = getRandomItems(aveiros, 2 + Math.floor(Math.random() * 2));
            randomAveiros.forEach((title) => {
                records.push({
                    type: "aveira",
                    title: title,
                    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
                });
            });

            const userDoc = {
                userKey,
                nicknameKey,
                displayNameKey,
                emailKey,
                firstnameKey,
                firstname: member.firstname,
                lastname: member.lastname,
                nickname: member.nickname,
                displayName: `${member.firstname} ${member.lastname}`,
                email: member.email,
                passwordHash: "$2b$10$test_hash_not_real", // Fake hash for demo
                records: records,
                createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            };

            // Upsert to avoid duplicates
            await usersCollection.updateOne(
                { userKey },
                { $set: userDoc },
                { upsert: true }
            );

            console.log(`✅ ${member.firstname} ${member.lastname}`);
            console.log(`   Mitzvos: ${randomMitzvos.length}, Aveiros: ${randomAveiros.length}`);
            console.log();
        }

        console.log("\n✨ Test data seeded successfully!\n");
        console.log("To view this data:\n");
        console.log("1️⃣  Via Admin API (browser):");
        console.log('   curl -H "x-admin-key: change-this-admin-key-now" http://localhost:3000/api/admin/overview\n');
        console.log("2️⃣  Via MongoDB (if using mongosh):");
        console.log('   mongosh "mongodb://127.0.0.1:27017/vos_heist"');
        console.log('   use vos_heist');
        console.log('   db.users.find().pretty()');
        console.log('   db.users.findOne({firstname: "Moshe"}, {records: 1})\n');
        console.log("3️⃣  Via MongoDB Compass (GUI):");
        console.log('   Connect to: mongodb://127.0.0.1:27017');
        console.log("   Go to vos_heist > users collection\n");

    } catch (error) {
        console.error("❌ Error seeding data:", error);
    } finally {
        await client.close();
    }
}

seedTestData();
