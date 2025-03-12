const socket = io();

let messageHistory = [];
let historyIndex = -1;

// ✅ Display received chat messages in real-time
socket.on('chatMessage', (message) => {
    const chatBox = document.getElementById('chatBox');
    const newMessage = document.createElement('div');
    newMessage.textContent = message;
    chatBox.appendChild(newMessage);

    // Auto-scroll to latest message
    chatBox.scrollTop = chatBox.scrollHeight;
});

// ✅ Handle keypresses for sending messages and history navigation
document.getElementById('chatInput').addEventListener('keydown', (event) => {
    const chatInput = document.getElementById('chatInput');

    // 🔼 Pressing "Up" Key (Retrieve Older Message)
    if (event.key === 'ArrowUp') {
        if (historyIndex > 0) {
            historyIndex--;
            chatInput.value = messageHistory[historyIndex];
        } else if (historyIndex === 0) {
            chatInput.value = messageHistory[historyIndex];
        }
        event.preventDefault(); // Prevent cursor from moving
    }

    // 🔽 Pressing "Down" Key (Retrieve Newer Message)
    else if (event.key === 'ArrowDown') {
        if (historyIndex < messageHistory.length - 1) {
            historyIndex++;
            chatInput.value = messageHistory[historyIndex];
        } else {
            historyIndex = messageHistory.length;
            chatInput.value = "";
        }
        event.preventDefault();
    }

    // ⏎ Pressing "Enter" Key (Send Message)
    else if (event.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    if (message) {
        socket.emit('sendMessageToServer', message); // Send to Minecraft

        // Store message in history
        messageHistory.push(message);
        historyIndex = messageHistory.length;

        chatInput.value = ''; // Clear input field
    }
}
