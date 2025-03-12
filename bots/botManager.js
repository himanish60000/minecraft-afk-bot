const mineflayer = require("mineflayer");
const { io } = require("socket.io-client");

// Connect to the WebSocket server (your website's backend)
const socket = io(process.env.WEBSOCKET_SERVER_URL); // Ensure this is set in Railway

// Bot Configuration
const botOptions = {
    host: process.env.MC_SERVER_IP, // Minecraft server IP (set in Railway)
    username: process.env.BOT_USERNAME, // Bot username
    password: process.env.BOT_PASSWORD || undefined, // Optional for premium accounts
    version: "1.20",
};

let bot;

function createBot() {
    bot = mineflayer.createBot(botOptions);

    bot.on("login", () => {
        console.log(`[✅] Bot ${bot.username} has joined ${botOptions.host}`);
        bot.chat("/login ilovenoone"); // Sends a message when bot joins
    });

    bot.on("message", (jsonMsg) => {
        const message = jsonMsg.toString();
        console.log("[💬] Minecraft Chat:", message);
        socket.emit("chatMessage", message); // Send to WebSocket server
    });

    bot.on("end", (reason) => {
        console.log(`[⚠] Bot disconnected: ${reason}`);
        console.log("[🔄] Reconnecting in 15 seconds...");
        setTimeout(createBot, 15000);
    });

    bot.on("error", (err) => {
        console.error("[❌] Bot Error:", err);
    });
}

// Start the bot
createBot();
