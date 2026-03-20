/**
 * Rename specific female test users to male names in the database
 * Run: node rename-female-to-male.js
 */
const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'vos_heist';

function normalizeName(name) {
    return String(name || '').trim().toLowerCase();
}

const mappings = [
    {
        oldFirstname: 'Rivka',
        newFirstname: 'Reuven',
        newNickname: 'Reu',
        newEmail: 'reuven.blum@example.com'
    },
    {
        oldFirstname: 'Sarah',
        newFirstname: 'Shlomo',
        newNickname: 'Shlom',
        newEmail: 'shlomo.m@example.com'
    }
];

async function renameUsers() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db(MONGODB_DB_NAME);
        const users = db.collection('users');

        for (const map of mappings) {
            const query = { firstnameKey: normalizeName(map.oldFirstname) };
            const user = await users.findOne(query);
            if (!user) {
                console.log(`No user found with firstname ${map.oldFirstname}`);
                continue;
            }

            const newFirstname = map.newFirstname;
            const newLastname = user.lastname || '';
            const newDisplayName = `${newFirstname} ${newLastname}`.trim();

            const update = {
                $set: {
                    firstname: newFirstname,
                    firstnameKey: normalizeName(newFirstname),
                    displayName: newDisplayName,
                    displayNameKey: normalizeName(newDisplayName),
                    nickname: map.newNickname || user.nickname,
                    nicknameKey: normalizeName(map.newNickname || user.nickname),
                    userKey: normalizeName(newFirstname),
                    email: map.newEmail || user.email,
                    emailKey: normalizeName(map.newEmail || user.email)
                }
            };

            // Attempt update
            const result = await users.updateOne(query, update);
            if (result.modifiedCount === 1) {
                console.log(`Renamed ${map.oldFirstname} -> ${newFirstname}`);
            } else if (result.matchedCount === 1) {
                console.log(`No changes were needed for ${map.oldFirstname} (matched but not modified)`);
            } else {
                console.log(`Update result for ${map.oldFirstname}:`, result);
            }
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.close();
    }
}

renameUsers();
