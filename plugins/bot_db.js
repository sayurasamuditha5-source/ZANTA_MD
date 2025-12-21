const mongoose = require('mongoose');
const config = require('../config');

// 🚨 MongoDB URI
const MONGO_URI = 'mongodb+srv://Zanta-MD:Akashkavindu12345@cluster0.y7xsqsi.mongodb.net/?appName=Cluster0'; 
const OWNER_KEY = config.OWNER_NUMBER;

// --- 🛠️ Schema Definition ---
// සියලුම Settings (Always Online, Anti-Delete, Read Cmd, Auto Voice ඇතුළුව)
const SettingsSchema = new mongoose.Schema({
    id: { type: String, default: OWNER_KEY, unique: true }, 
    botName: { type: String, default: config.DEFAULT_BOT_NAME },
    ownerName: { type: String, default: config.DEFAULT_OWNER_NAME },
    prefix: { type: String, default: config.DEFAULT_PREFIX },
    autoRead: { type: String, default: 'false' },
    autoTyping: { type: String, default: 'false' },
    autoStatusSeen: { type: String, default: 'true' },
    alwaysOnline: { type: String, default: 'false' },
    readCmd: { type: String, default: 'false' },
    antiBadword: { type: String, default: 'false' },
    autoVoice: { type: String, default: 'false' }
});

const Settings = mongoose.model('Settings', SettingsSchema);

let isConnected = false;

async function connectDB() {
    if (isConnected) return;
    try {
        await mongoose.connect(MONGO_URI, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });
        isConnected = true;
        console.log("✅ MongoDB Connected!");
    } catch (error) {
        console.error("❌ MongoDB Error:", error);
    }
}

async function getBotSettings() {
    const defaults = { 
        botName: config.DEFAULT_BOT_NAME, 
        ownerName: config.DEFAULT_OWNER_NAME, 
        prefix: config.DEFAULT_PREFIX,
        autoRead: 'false',
        autoTyping: 'false',
        autoStatusSeen: 'true',
        alwaysOnline: 'false',
        readCmd: 'false',
        antiBadword: 'false',
        autoVoice: 'false'
    };

    if (!OWNER_KEY) return defaults;

    try {
        let settings = await Settings.findOne({ id: OWNER_KEY });
        if (!settings) {
            settings = await Settings.create({ id: OWNER_KEY, ...defaults });
            console.log(`[DB] Created settings profile for: ${OWNER_KEY}`);
        }
        return settings.toObject(); 
    } catch (e) {
        console.error('[DB] Fetch Error:', e);
        return defaults;
    }
}

async function updateSetting(key, value) {
    if (!OWNER_KEY) return false;
    try {
        const result = await Settings.findOneAndUpdate(
            { id: OWNER_KEY },
            { $set: { [key]: value } },
            { new: true, upsert: true }
        );
        return !!result;
    } catch (e) {
        console.error(`[DB] Update Error (${key}):`, e);
        return false;
    }
}

module.exports = { connectDB, getBotSettings, updateSetting };
