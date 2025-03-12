const mineflayer = require("mineflayer");

// Bot Configuration
const botOptions = {
    host: process.env.MC_SERVER_IP, // Minecraft server IP (set in Railway)
    username: process.env.BOT_USERNAME, // Bot username
    password: process.env.BOT_PASSWORD || undefined, // Optional for premium accounts
    version: "1.20", // Adjust based on server version
};

// Create and Manage Bot
let bot;

function createBot() {
    bot = mineflayer.createBot(botOptions);

    bot.on("login", () => {
        console.log(`[✅] Bot ${bot.username} has joined ${botOptions.host}`);
        bot.chat("Hello! I am online now!"); // Sends a message when bot joins
    });

    bot.on("message", (jsonMsg) => {
        console.log("[💬] Minecraft Chat:", jsonMsg.toString());
    });

    bot.on("end", (reason) => {
        console.log(`[⚠] Bot disconnected: ${reason}`);
        console.log("[🔄] Reconnecting in 15 seconds...");
        setTimeout(createBot, 15000); // Reconnect after 15s instead of 5s (less resource usage)
    });

    bot.on("error", (err) => {
        console.error("[❌] Bot Error:", err);
    });
}

// Start the bot
createBot();
