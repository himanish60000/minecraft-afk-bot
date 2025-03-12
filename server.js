const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const botManager = require('./bots/botManager');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
  console.log('User connected');

  // ✅ Broadcast chat messages to all users
  socket.on('chatMessage', (data) => {
    const { message, hoverText } = data;
    io.emit('chatMessage', { message, hoverText });
  });

  // ✅ Listen for messages from the website & send them to the bot
  socket.on('sendMessageToServer', (data) => {
    const { message, hoverText } = data;
    console.log(`Received message from website: ${message}`);
    io.emit('sendMessageToServer', { message, hoverText }); // Forward message to bots
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
