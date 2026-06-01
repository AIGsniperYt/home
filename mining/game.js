const gameContainer = document.getElementById('game-container');
const tileSize = 50; // Set your desired tile size


// Function to create a tile at a specific position
function createTile(x, y, type) {
    const tile = document.createElement('div');
    tile.classList.add('tile', type);
    tile.style.left = `${x * tileSize}px`;
    tile.style.top = `${y * tileSize}px`;
    tile.style.width = `50px`;
    tile.style.height = `50px`;
    gameContainer.appendChild(tile);
}

// Create the player
const player = document.createElement('div');
player.classList.add('player');
gameContainer.appendChild(player);
player.style.width = `50px`;
player.style.height = `50px`;

// Create tiles for the map
createTile(2, 2, 'tree');
createTile(5, 4, 'stone');
// Add more tiles as needed

// Function to move the player
function movePlayer(x, y) {
    player.style.left = `${x}px`;
    player.style.top = `${y}px`;
}

// Example: Move the player to the center initially
movePlayer(gameContainer.clientWidth / 2, gameContainer.clientHeight / 2);
