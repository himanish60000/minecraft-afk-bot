const mineflayer = require("mineflayer");
const { MongoClient } = require("mongodb");

// MongoDB Connection
const mongoUri = process.env.MONGO_URI; // Set this in Railway environment variables
const client = new MongoClient(mongoUri);
let db, chatLogsCollection;

async function connectToDatabase() {
    try {
        await client.connect();
        db = client.db("chatLogsDB"); // Database Name
        chatLogsCollection = db.collection("chatLogs"); // Collection Name
        console.log("[✅] Connected to MongoDB");
    } catch (error) {
        console.error("[❌] MongoDB Connection Error:", error);
    }
}

// Bot Configuration
const botOptions = {
    host: process.env.MC_SERVER_IP, // Set in Railway Environment Variables
    username: process.env.BOT_USERNAME,
    password: process.env.BOT_PASSWORD || undefined, // Optional for premium accounts
    version: "1.20", // Adjust based on server version
};

// Create and Manage Bot
let bot;

function createBot() {
    bot = mineflayer.createBot(botOptions);

    bot.on("login", () => {
        console.log(`[✅] Bot ${bot.username} has joined ${botOptions.host}`);
        bot.chat("/login ilovenoone"); // Sends a message when bot joins
    });

    bot.on("message", async (message) => {
        const logEntry = {
            username: bot.username,
            message: message.toString(),
            timestamp: new Date(),
            server: botOptions.host,
        };

        try {
            await chatLogsCollection.insertOne(logEntry);
            console.log(`[💬] ${message}`);
        } catch (err) {
            console.error("[❌] Error saving chat log:", err);
        }
    });

    bot.on("end", (reason) => {
        console.log(`[⚠] Bot disconnected: ${reason}`);
        console.log("[🔄] Reconnecting in 5 seconds...");
        setTimeout(createBot, 5000); // Auto-reconnect after 5 seconds
    });

    bot.on("error", (err) => {
        console.error("[❌] Bot Error:", err);
    });
}

// Start the bot and database connection
async function startBot() {
    await connectToDatabase();
    createBot();
}

startBot();
