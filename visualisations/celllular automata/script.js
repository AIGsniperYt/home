const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const noiseDensitySlider = document.getElementById("noiseDensity");
const noiseDensityValue = document.getElementById("noiseDensityValue");
const refreshBtn = document.getElementById("refreshBtn");
const iterateCA = document.getElementById("iterateCA");
const toggleModeBtn = document.getElementById("toggleMode");
const controls = document.getElementById("controls");

// Adjust canvas size to fit the window while leaving space for the controls
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - controls.clientHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Grid parameters
const tileSize = 10; // Size of each tile (10x10 pixels)
let cols, rows; // Number of columns and rows in the grid
let grid = []; // To store the grid data

let lightSources = [];


// Noise threshold to determine if a tile is a wall or empty
let noise_density = noiseDensitySlider.value / 100; // Start with default slider value

// Update the display of the noise density value
noiseDensityValue.innerText = noiseDensitySlider.value + "%";

// Mode variables
let isDungeonMode = false;

// Color schemes
const colorSchemes = {
    demoMode: {
        wall: 'black',
        empty: 'white'
    },
    dungeonMode: {
        wall: '#1b263b',  // Dark brown for walls
        empty: '#415a77'   // Dark grey for empty spaces
    }
};

// Current color scheme
let currentColors = colorSchemes.demoMode;

// Function to generate the grid
function generateGrid() {
    grid = []; // Reset the grid
    lightSources = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    cols = Math.floor(canvas.width / tileSize);
    rows = Math.floor(canvas.height / tileSize);

    for (let y = 0; y < rows; y++) {
        let row = [];
        for (let x = 0; x < cols; x++) {
            // Make the edges (borders) always walls
            if (y === 0 || y === rows - 1 || x === 0 || x === cols - 1) {
                row.push(1); // Wall
                ctx.fillStyle = currentColors.wall;
            } else {
                // Generate a random number between 0 and 1 for non-edge tiles
                let randomValue = Math.random();
                if (randomValue < noise_density) {
                    row.push(1); // Wall
                    ctx.fillStyle = currentColors.wall;
                } else {
                    row.push(0); // Empty
                    ctx.fillStyle = currentColors.empty;
                }
            }
            // Draw the tile
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
        grid.push(row);
    }
    drawGrid();
}


// Refresh grid when the button is clicked
refreshBtn.addEventListener('click', generateGrid);

// Update noise_density when the slider is adjusted
noiseDensitySlider.addEventListener('input', function() {
    noise_density = noiseDensitySlider.value / 100;
    noiseDensityValue.innerText = noiseDensitySlider.value + "%";
});

// Cellular automata function to process the grid
function iterateCellularAutomata() {
    let newGrid = JSON.parse(JSON.stringify(grid)); // Clone the current grid

    // Check the neighbors for each tile
    for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
            let wallCount = countWallNeighbors(x, y);

            if (grid[y][x] === 1) {
                // If it's a wall, it stays a wall if it has 4 or more wall neighbors
                if (wallCount < 4) newGrid[y][x] = 0; // Turn it to empty
            } else {
                // If it's empty, it becomes a wall if it has 5 or more wall neighbors
                if (wallCount >= 5) newGrid[y][x] = 1; // Turn it to wall
            }
        }
    }

    // Update the grid and draw it
    grid = newGrid;
    drawGrid();
}

// Count the number of wall neighbors around a tile
function countWallNeighbors(x, y) {
    let wallCount = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue; // Skip the center tile itself
            if (grid[y + i][x + j] === 1) wallCount++; // Count walls
        }
    }
    return wallCount;
}

// Function to check if a tile is a wall touching an empty tile
function isWallTouchingEmpty(x, y) {
    if (grid[y][x] === 1) { // If it's a wall
        // Check all adjacent tiles (up, down, left, right)
        const neighbors = [
            grid[y - 1] && grid[y - 1][x],  // above
            grid[y + 1] && grid[y + 1][x],  // below
            grid[y][x - 1],                 // left
            grid[y][x + 1]                  // right
        ];
        // If any neighbor is empty, return true
        return neighbors.includes(0);
    }
    return false;
}

// Function to clear light sources
function clearLightSources() {
    lightSources.forEach(light => {
        grid[light.y][light.x] = 1; // Set the grid back to wall (1)
    });
    lightSources = []; // Clear the light sources array
}


// Function to place light sources
function placeLightSources() {
    clearLightSources(); 
    for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
            if (isWallTouchingEmpty(x, y) && Math.random() < 0.01) {  // 10% probability
                lightSources.push({ x, y });
                grid[y][x] = 2; // Mark as light source
            }
        }
    }
    drawGrid(); // Redraw the grid after placing light sources
}

// Function to draw the grid after cellular automata is applied
// Function to draw the grid after cellular automata is applied
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (grid[y][x] === 1) {
                ctx.fillStyle = currentColors.wall; // Wall color
            } else if (grid[y][x] === 0) {
                ctx.fillStyle = currentColors.empty; // Empty color
            } else if (grid[y][x] === 2) {
                ctx.fillStyle = "#8affc1"; // Light source color
            }
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }

    // Draw glow effect for light sources
    lightSources.forEach(light => {
        // Set shadow properties for glow effect
        ctx.fillStyle = "rgba(255, 174, 66, 0.4)"; // Warm orange color
        ctx.shadowColor = "rgba(255, 174, 66, 0.9)"; // Semi-transparent orange shadow
        ctx.shadowBlur = 30; // Increased blur radius

        // Draw a larger rectangle to create a glow effect
        ctx.fillRect((light.x + 0.5) * tileSize - tileSize * 1.5, (light.y + 0.5) * tileSize - tileSize * 1.5, tileSize * 3, tileSize * 3);
    });

    // Reset shadow properties for other drawings
    ctx.shadowColor = "transparent"; // Reset shadow to avoid affecting other drawings
    ctx.shadowBlur = 0; // Reset blur
}




// Add event listener to the new button
document.getElementById('placeLightsBtn').addEventListener('click', placeLightSources);





// Toggle between demo mode and dungeon mode
toggleModeBtn.addEventListener('click', function() {
    isDungeonMode = !isDungeonMode;
    currentColors = isDungeonMode ? colorSchemes.dungeonMode : colorSchemes.demoMode;
    drawGrid();  // Redraw the grid with the new colors
    toggleModeBtn.textContent = isDungeonMode ? "Switch to Demo Mode" : "Switch to Dungeon Mode";
});

// Run cellular automata when the button is clicked
iterateCA.addEventListener('click', iterateCellularAutomata);

// Initial grid generation
generateGrid();
