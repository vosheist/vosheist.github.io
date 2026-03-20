/**
 * View member test data from MongoDB
 * Run: node view-test-data.js
 */
const { MongoClient } = require("mongodb");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "vos_heist";

async function viewTestData() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        const db = client.db(MONGODB_DB_NAME);
        const usersCollection = db.collection("users");

        console.log("\n📊 TEST DATA SUMMARY\n" + "=".repeat(60));

        const users = await usersCollection.find({}).toArray();

        console.log(`\nTotal Members: ${users.length}`);
        console.log(`Total Records: ${users.reduce((sum, u) => sum + (u.records?.length || 0), 0)}\n`);

        console.log("MEMBERS SUMMARY:\n" + "=".repeat(60));

        users.forEach((user, idx) => {
            console.log(`\n${idx + 1}. ${user.displayName}`);
            console.log(`   Pen Name: ${user.nickname}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Joined: ${new Date(user.createdAt).toLocaleDateString()}`);
            console.log(`   Total Records: ${user.records?.length || 0}`);

            if (user.records && user.records.length > 0) {
                console.log(`\n   Recent Entries (${user.records.length}):`);
                user.records.slice(0, 5).forEach((entry) => {
                    console.log(`      • ${entry.title || "Entry"}`);
                    console.log(`        (${new Date(entry.createdAt).toLocaleDateString()})`);
                });
            }
        });

        console.log("\n" + "=".repeat(60));
        console.log("\n💡 QUICK MONGODB QUERIES:\n");
        console.log("View single user with records:");
        console.log('  db.users.findOne({firstname: "Moshe"}, {projection: {records: 1, displayName: 1}})');
        console.log("\nView sample entries:");
        console.log('  db.users.aggregate([ {$unwind: "$records"}, {$project: {displayName: 1, title: "$records.title"}} ])');
        console.log("\nView user by email:");
        console.log('  db.users.findOne({email: "moshe.cohen@example.com"})');
        console.log("\nAdd a record to a user:");
        console.log('  db.users.updateOne({userKey: "moshe"}, {$push: {records: {type: "activity", title: "New entry", createdAt: new Date().toISOString()}}})');

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await client.close();
    }
}

viewTestData();
