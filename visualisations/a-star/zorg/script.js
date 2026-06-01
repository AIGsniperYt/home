// Get canvas and context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Define grid size and tile size
const gridSize = 10;
const tileSize = canvas.width / gridSize;

// Object to store transporters and their connections
const transporters = {};

// Function to draw the grid
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Draw grid lines
    for (let x = 0; x <= canvas.width; x += tileSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += tileSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Function to draw transporters and connections
function drawTransportersAndConnections() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings
    drawGrid(); // Draw the grid

    // Draw connections first
    ctx.strokeStyle = 'blue';
    Object.keys(transporters).forEach(key => {
        const [x1, y1] = key.split(',').map(Number);
        const centerX1 = x1 * tileSize + tileSize / 2;
        const centerY1 = y1 * tileSize + tileSize / 2;
        transporters[key].forEach(connectedKey => {
            const [x2, y2] = connectedKey.split(',').map(Number);
            const centerX2 = x2 * tileSize + tileSize / 2;
            const centerY2 = y2 * tileSize + tileSize / 2;
            ctx.beginPath();
            ctx.moveTo(centerX1, centerY1);
            ctx.lineTo(centerX2, centerY2);
            ctx.stroke();
        });
    });

    // Draw transporters on top
    ctx.fillStyle = 'red';
    Object.keys(transporters).forEach(key => {
        const [x, y] = key.split(',').map(Number);
        const centerX = x * tileSize + tileSize / 2;
        const centerY = y * tileSize + tileSize / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
        ctx.fill();
    });
}

// Function to toggle a transporter at a specific tile
function toggleTransporter(x, y) {
    const key = `${x},${y}`;
    
    if (transporters[key]) {
        // If the transporter exists, remove it and its connections
        for (let connectedKey of transporters[key]) {
            // Remove the connection from the other transporter's list
            const index = transporters[connectedKey].indexOf(key);
            if (index !== -1) {
                transporters[connectedKey].splice(index, 1);
            }
        }
        delete transporters[key]; // Remove the transporter
    } else {
        // If the transporter doesn't exist, add it
        transporters[key] = [];
        connectTransporters(x, y);
    }
    drawTransportersAndConnections(); // Redraw the grid and transporters
}


// Function to connect transporters
function connectTransporters(x, y) {
    const key = `${x},${y}`;
    for (let otherKey in transporters) {
        if (otherKey !== key) {
            const [ox, oy] = otherKey.split(',').map(Number);
            const heuristicCost = calculateHeuristic(x, y, ox, oy);
            if (heuristicCost <= 34) {
                // Add bi-directional connection
                transporters[key].push(otherKey);
                transporters[otherKey].push(key);
            }
        }
    }
}

// Heuristic function to calculate distance
function calculateHeuristic(x1, y1, x2, y2) {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    return 14 * Math.min(dx, dy) + 10 * Math.abs(dx - dy);
}

// Add event listener for clicks on the canvas
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Calculate grid coordinates
    const gridX = Math.floor(mouseX / tileSize);
    const gridY = Math.floor(mouseY / tileSize);

    // Toggle transporter
    toggleTransporter(gridX, gridY);
});

// Initialize the grid and transporters
drawGrid();
