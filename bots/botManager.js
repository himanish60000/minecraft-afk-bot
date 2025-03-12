const fs = require('fs');
const path = require('path');
const mineflayer = require('mineflayer');
const io = require('socket.io-client');
const socket = io.connect('http://localhost:3000'); // Backend URL for frontend chat

const bots = [];

function createBot(username, host, port) {
    const bot = mineflayer.createBot({
        host: host,
        port: port,
        username: username,
    });

    // Create a folder to store logs (if it doesn't exist)
    const logsDirectory = path.join(__dirname, 'chat_logs');
    if (!fs.existsSync(logsDirectory)) {
        fs.mkdirSync(logsDirectory);
    }

    // Generate a timestamp for file name
    const timestamp = new Date().toISOString().replace(/[:.-]/g, '_');
    const logFileName = `${timestamp}_${host}_${username}.log`;
    const logFilePath = path.join(logsDirectory, logFileName);

    // Create a write stream for the log file
    const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

    // Write a log entry when the bot joins the server
    bot.on('spawn', () => {
        const message = `Bot ${username} has joined the server at ${host} on ${new Date().toLocaleString()}\n`;
        logStream.write(message);
        bot.chat("/login ilovenoone"); // Send a message when the bot joins             
        // Send a message 10 seconds after joining
        setTimeout(() => {
            bot.chat('/server gens');
        }, 10000);
    });

    // Listen for in-game chat and log it to the file
    bot.on('messagestr', (message) => {
        const chatMessage = `[${new Date().toLocaleTimeString()}] ${message}\n`;
        console.log(`Chat: ${message}`);
        logStream.write(chatMessage);  // Save chat message to log file
        socket.emit('chatMessage', message); // Send chat to frontend
    });

    // Handle incoming messages from the website to the bot
    socket.on('sendMessageToServer', (message) => {
        console.log(`Sending to server: ${message}`);
        bot.chat(message); // Send message to Minecraft server
    });

    // Auto-reconnect on disconnect
    bot.on('end', (reason) => {
        const disconnectMessage = `${username} disconnected: ${reason}. Reconnecting in 5s...\n`;
        console.log(disconnectMessage);
        logStream.write(disconnectMessage);  // Log disconnect message
        setTimeout(() => createBot(username, host, port), 15000);  // Reconnect after 5 seconds
    });

    // Handle errors
    bot.on('error', (err) => {
        const errorMessage = `${username} encountered an error: ${err.message}\n`;
        console.log(errorMessage);
        logStream.write(errorMessage);  // Log error message
    });

    // Close the log stream when the bot shuts down
    bot.on('quit', () => {
        const quitMessage = `Bot ${username} has quit the server at ${new Date().toLocaleString()}\n`;
        logStream.write(quitMessage);
        logStream.end(); // Close the file stream when bot quits
    });
    bot.removeAllListeners("physicsTick"); // Reduces CPU load
    bot.removeAllListeners("blockUpdate"); // Stops tracking block changes
    bot.removeAllListeners("health"); // Stops checking bot health
    // Store bot instance
    bots.push(bot);
}

// Create bots (you can add more bots with different usernames, IPs, and ports)
createBot('saber', 'jartex.fun', 25565);

module.exports = { createBot };


