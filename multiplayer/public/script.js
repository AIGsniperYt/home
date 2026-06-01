document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("board");
    const status = document.getElementById("status");
    const chatForm = document.getElementById("chat-form");

    const chatMessages = document.getElementById("chat-messages");
    const socket = io();

    // Receive chat history from the server
    socket.on("chatHistory", chatHistory => {
        chatHistory.forEach(({ message, sender }) => {
            const isSender = sender === socket.id;
            const senderName = isSender ? "You" : "Opponent";
            const messageElement = document.createElement("li");
            messageElement.textContent = `${senderName}: ${message}`;
            chatMessages.appendChild(messageElement);
        });
    });

    socket.on("currentPlayer", player => {
        status.textContent = `Player ${player}'s turn`;
    });

    socket.on("gameState", gameState => {
        updateBoard(gameState);
    });

    socket.on("updateBoard", ({ index, player }) => {
        const cell = document.getElementById(index);
        cell.textContent = player;
    });

    socket.on("chatMessage", ({ message, sender }) => {
        const isSender = sender === socket.id;
        const senderName = isSender ? "You" : "Opponent";
        const messageElement = document.createElement("li");
        messageElement.textContent = `${senderName}: ${message}`;
        chatMessages.appendChild(messageElement);
    });

    board.addEventListener("click", event => {
        if (event.target.classList.contains("cell")) {
            const index = event.target.id;
            socket.emit("move", index);
        }
    });

    chatForm.addEventListener("submit", event => {
        event.preventDefault();
        const messageInput = event.target.elements.message;
        const message = messageInput.value.trim();
        if (message !== "") {
            socket.emit("chatMessage", message);
            messageInput.value = "";
        }
    });

    function updateBoard(gameState) {
        gameState.forEach((player, index) => {
            const cell = document.getElementById(index);
            cell.textContent = player;
        });
    }
});
