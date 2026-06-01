const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const TILE_SIZE = 40;
const grid = [];
const player = {
    x: 200,
    y: 200,
    angle: 0,
    speed: 1,
};

let FOV = Math.PI / 4; // Field of view in radians
let numRays = 100; // Number of rays to cast
let showRays = true; // Toggle for ray visualization

// Movement flags
let movingForward = false;
let movingBackward = false;
let rotatingLeft = false;
let rotatingRight = false;

function initGrid() {
    for (let i = 0; i < canvas.width / TILE_SIZE; i++) {
        grid[i] = [];
        for (let j = 0; j < canvas.height / TILE_SIZE; j++) {
            grid[i][j] = Math.random() > 0.9 ? 1 : 0; // Reduced noise density
        }
    }
}

function drawGrid() {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === 1) {
                ctx.fillStyle = 'gray';
                ctx.fillRect(i * TILE_SIZE, j * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = 'cyan';
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    ctx.beginPath();
    ctx.moveTo(0, -15); // Tip of the triangle
    ctx.lineTo(-10, 10);
    ctx.lineTo(10, 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function castRays() {
    const rayStep = FOV / numRays; // Step angle between rays
    const hitDistances = []; // Store hit distances

    for (let i = 0; i < numRays; i++) {
        const rayAngle = player.angle - FOV / 2 + rayStep * i; // Starting angle
        let hitDistance = 0;

        for (let j = 0; j < 1000; j++) { // Increase max distance for rays
            const gridX = Math.floor((player.x + Math.cos(rayAngle) * j) / TILE_SIZE);
            const gridY = Math.floor((player.y + Math.sin(rayAngle) * j) / TILE_SIZE);

            // Check if we hit a wall
            if (grid[gridX] && grid[gridX][gridY] === 1) {
                hitDistance = j; // Save hit distance
                hitDistances.push(hitDistance);
                break;
            }
        }

        // Calculate the correct height of the wall slice
        if (hitDistance > 0) {
            // Wall height calculation to fix fisheye effect
            const adjustedDistance = hitDistance * Math.cos(rayAngle - player.angle); // Adjust for the angle
            const wallHeight = (canvas.height * TILE_SIZE) / (adjustedDistance || 1); // Adjust height based on distance
            const wallX = (i / numRays) * canvas.width; // Calculate wall X position

            // Draw wall slice
            ctx.fillStyle = 'rgba(255, 255, 0, 0.5)'; // Color for hit surfaces
            ctx.fillRect(wallX, (canvas.height - wallHeight) / 2, canvas.width / numRays, wallHeight); // Draw wall slice
        }
    }

    // Draw rays if enabled
    if (showRays) {
        for (let i = 0; i < hitDistances.length; i++) {
            const wallX = player.x + Math.cos(player.angle - FOV / 2 + (i * rayStep)) * (hitDistances[i] || 0);
            const wallY = player.y + Math.sin(player.angle - FOV / 2 + (i * rayStep)) * (hitDistances[i] || 0);

            ctx.strokeStyle = 'yellow';
            ctx.beginPath();
            ctx.moveTo(player.x, player.y);
            ctx.lineTo(wallX, wallY);
            ctx.stroke();
        }
    }
}


function update() {
ctx.fillStyle = 'black'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawPlayer();
    castRays();

    // Update player position based on movement flags
    if (movingForward) {
        player.x += Math.cos(player.angle) * player.speed;
        player.y += Math.sin(player.angle) * player.speed;
    }
    if (movingBackward) {
        player.x -= Math.cos(player.angle) * player.speed;
        player.y -= Math.sin(player.angle) * player.speed;
    }
    if (rotatingLeft) {
        player.angle -= 0.05;
    }
    if (rotatingRight) {
        player.angle += 0.05;
    }
}

function toggleWall(x, y) {
    const gridX = Math.floor(x / TILE_SIZE);
    const gridY = Math.floor(y / TILE_SIZE);
    if (grid[gridX] && grid[gridX][gridY] !== undefined) {
        grid[gridX][gridY] = grid[gridX][gridY] === 1 ? 0 : 1; // Toggle wall
    }
}

canvas.addEventListener('click', (e) => {
    toggleWall(e.clientX, e.clientY);
});

// Key down event to set flags
window.addEventListener('keydown', (e) => {
    switch (e.keyCode) {
        case 87: // W key
            movingForward = true;
            break;
        case 83: // S key
            movingBackward = true;
            break;
        case 65: // A key
            rotatingLeft = true;
            break;
        case 68: // D key
            rotatingRight = true;
            break;
    }
});

// Key up event to unset flags
window.addEventListener('keyup', (e) => {
    switch (e.keyCode) {
        case 87: // W key
            movingForward = false;
            break;
        case 83: // S key
            movingBackward = false;
            break;
        case 65: // A key
            rotatingLeft = false;
            break;
        case 68: // D key
            rotatingRight = false;
            break;
    }
});

// Sliders for controlling FOV and number of rays
const fovSlider = document.getElementById('fovSlider');
const raysSlider = document.getElementById('raysSlider');
const toggleRaysButton = document.getElementById('toggleRaysButton');

fovSlider.addEventListener('input', (e) => {
    FOV = parseFloat(e.target.value);
});

raysSlider.addEventListener('input', (e) => {
    numRays = parseInt(e.target.value);
});

// Toggle rays visibility
toggleRaysButton.addEventListener('click', () => {
    showRays = !showRays;
    toggleRaysButton.textContent = showRays ? "Hide Rays" : "Show Rays"; // Update button text
});

function gameLoop() {
    update();
    requestAnimationFrame(gameLoop);
}

initGrid();
gameLoop();
