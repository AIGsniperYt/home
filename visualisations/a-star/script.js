const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
const messageDiv = document.getElementById('message');

const TileState = {
    EMPTY: "empty",
    WALL: "wall",
    GRASS: "grass",
    WATER: "water",
    LAVA: "lava",
    START: "start",
    END: "end",
    EXPLORED: "explored",
    UNEXPLORED: "unexplored",
    PATH: "path",
    FRONTIER: "frontier"
};

let gridRows = 21;
let gridColumns = 21;
let tileX = canvas.width / gridRows;
let tileY = canvas.height / gridColumns;

let tileType = TileState.WALL;

function selectTile(tilestate) {
    tileType = tilestate;
    console.log(tileType);
}

// control panel options:
let tutorialMode = false;
let showParents = false;
let showFCosts = false;
let individualCost = false;
let asmrMode = false;

let delay = 0;
let manualControl = false;
let iterationTimeout;

function toggleShowParents() {
    showParents = !showParents; // Toggle the value of showParents
    const showParentsBtn = document.getElementById('showParentsBtn');
    showParentsBtn.textContent = showParents ? 'Hide Parents' : 'Show Parents'; // Update button text
    drawGrid(); // Redraw the grid with the updated showParents value
}

function toggleShowFCosts() {
    showFCosts = !showFCosts; // Toggle the value of showFCosts
    const showFCostsBtn = document.getElementById('showFCostsBtn');
    showFCostsBtn.textContent = showFCosts ? 'Hide F Costs' : 'Show F Costs'; // Update button text
    drawGrid(); // Redraw the grid with the updated showFCosts value
}

class Node{
    constructor(x, y, tileState = TileState.EMPTY, g = 0, h = 0, parent = null, effort = 0) {
        this.x = x;
        this.y = y;
        this.tileState = tileState;
        this.g_cost = g;
        this.h_cost = h;
        this.f_cost = h + g;
        this.parent = parent;
        this.effort = effort;
    }
}

let grid = [];
let frontiers = [];
let startNode = null;
let targetNode = null;

let to_evaluate = [startNode];
let evaluated = [];
let path = [];
let foundPath = false;

function initializeGrid() {
    grid = new Array(gridRows).fill(null).map((_, y) =>
        new Array(gridColumns).fill(null).map((_, x) => new Node(x, y, TileState.EMPTY))
    );
    
    startNode = null;
    targetNode = null;
    drawGrid();
    setMessage("Click a tile to set the start point.", "info");
}

function getCoords(mouseX, mouseY) {
    const tileXIndex = Math.floor(mouseX / tileX);
    const tileYIndex = Math.floor(mouseY / tileY);
    return { x: tileXIndex, y: tileYIndex };
}

function setMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `info ${type}`;
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before drawing

    // Draw grid tiles
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridColumns; col++) {
            const currentNode = grid[row][col];
            let color;

            switch (currentNode.tileState) {
                case TileState.WALL:
                    color = "#5C5C5C"; // Dark grey
                    break;
                case TileState.START:
                    color = "#4CAF50"; // Moderate green
                    break;
                case TileState.END:
                    color = "#F44336"; // Moderate red
                    break;
                case TileState.EXPLORED:
                    color = "#0d7dd9"; // Medium light blue
                    break;
                case TileState.UNEXPLORED:
                    color = "#55aef6"; // Light blue
                    break;
                case TileState.PATH:
                    color = "#FF8C00"; // Soft yellow
                    break;
                // Special tiles with distinct colors
                case TileState.GRASS:
                    color = "#7CFC00"; // Bright lime green
                    break;
                case TileState.WATER:
                    color = "#1E90FF"; // Dodger blue
                    break;
                case TileState.LAVA:
                    color = "#FF4500"; // Orange red
                    break;
                case TileState.FRONTIER:
                    color = "#FF0000"; // Orange red
                    break;
                default:
                    color = "#212121"; // Dark grey
                    break;
            }
            

            // Draw the tile
            ctx.fillStyle = color;
            ctx.fillRect(col * tileX, row * tileY, tileX, tileY);
            ctx.lineWidth = 0.1;
            ctx.strokeStyle = "grey";
            ctx.strokeRect(col * tileX, row * tileY, tileX, tileY);

            // Draw the f_cost in the center of the tile, only if showFCosts is true
            if (showFCosts && currentNode.f_cost !== Infinity && currentNode.tileState !== TileState.WALL) {
                ctx.fillStyle = "white"; // Text color
                ctx.font = `${Math.min(tileX, tileY) / 2}px Arial`; // Adjust font size
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                if (currentNode.f_cost !== 0) {
                    ctx.fillText(
                        currentNode.f_cost, 
                        col * tileX + tileX / 2, // X position (center of the tile)
                        row * tileY + tileY / 2  // Y position (center of the tile)
                    );
                } else if (currentNode == startNode) {
                    ctx.fillText(
                        currentNode.f_cost, 
                        col * tileX + tileX / 2, // X position (center of the tile)
                        row * tileY + tileY / 2  // Y position (center of the tile)
                    );
                }
            }
        }
    }

    // Draw parent connection lines, only if showParents is true
    if (showParents) {
        ctx.strokeStyle = "purple"; // Color for parent connections
        ctx.lineWidth = 2; // Thickness of the lines
        for (let row = 0; row < gridRows; row++) {
            for (let col = 0; col < gridColumns; col++) {
                const currentNode = grid[row][col];
                if (currentNode.parent) {
                    const parent = currentNode.parent;
                    ctx.beginPath();
                    ctx.moveTo(col * tileX + tileX / 2, row * tileY + tileY / 2); // Current node center
                    ctx.lineTo(parent.x * tileX + tileX / 2, parent.y * tileY + tileY / 2); // Parent node center
                    ctx.stroke();
                }
            }
        }
    }
}

function handleClick(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const tileCoords = getCoords(mouseX, mouseY);
    const currentTile = grid[tileCoords.y][tileCoords.x];

    if (!startNode) {
        currentTile.tileState = TileState.START;
        startNode = currentTile;
        setMessage("Start point set. Now, choose the end point.", "info");
    } else if (!targetNode && currentTile.tileState !== TileState.START) {
        currentTile.tileState = TileState.END;
        targetNode = currentTile;
        setMessage("End point set. You can now place walls or start the A* algorithm.", "info");
    } else if (currentTile.tileState === TileState.START) {
        currentTile.tileState = TileState.EMPTY;
        startNode = null;
        setMessage("Start point removed. Please choose a new start point.", "warning");
    } else if (currentTile.tileState === TileState.END) {
        currentTile.tileState = TileState.EMPTY;
        targetNode = null;
        setMessage("End point removed. Please choose a new end point.", "warning");
    } else if (startNode && targetNode) {
        // Place the tile type stored in currentTile
        currentTile.tileState = tileType;
        switch (currentTile.tileState) {
            // Special tiles with their cost to use them
            case TileState.GRASS:
                currentTile.effort = 2;
                break;
            case TileState.WATER:
                currentTile.effort = 11;
                break;
            case TileState.LAVA:
                currentTile.effort = 100;
                break;
        }
        setMessage(`Tile updated to ${tileType}.`, "info");
    }

    drawGrid();
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateMaze() {
    // Ensure the grid is properly initialized
    if (!grid || grid.length === 0 || grid[0].length === 0) {
        console.error("Grid is not properly initialized.");
        return;
    }

    frontiers.length = 0;

    // Set all tiles to wall initially
    setGridToWalls();

    // Pick a random starting point
    const { x, y } = getRandomPoint();

    // Set the starting node to empty and initialize the maze
    grid[y][x].tileState = TileState.EMPTY;
    const mazeStartNode = grid[y][x];
    addFrontiers(mazeStartNode);

    // Continue while there are frontiers
    while (frontiers.length > 0) {
        // Pick a random frontier cell
        const randomIndex = Math.floor(Math.random() * frontiers.length);
        const frontier = frontiers[randomIndex];

        // Remove the selected frontier from the list
        frontiers.splice(randomIndex, 1);

        // Connect the frontier to its parent if it exists
        if (frontier.parent) {
            connectCells(frontier.parent, frontier);
            frontier.parent = null;
        }

        // Add new frontier cells to the list
        addFrontiers(frontier);

        drawGrid(); // Redraw the grid to reflect the changes
        await sleep(10); // Add a delay to visualize the generation process
    }
}

function addFrontiers(node) {
    const directions = [
        { dx: -2, dy: 0 }, // left 
        { dx: 0, dy: -2 }, // top
        { dx: 0, dy: 2 },  // bottom
        { dx: 2, dy: 0 }   // right
    ];
    for (const { dx, dy } of directions) {
        const newX = node.x + dx;
        const newY = node.y + dy;

        // Check if the new coordinates are within the grid boundaries
        if (newX >= 1 && newX < gridColumns - 1 && newY >= 1 && newY < gridRows - 1) {
            const frontier = grid[newY][newX];
            if (frontier.tileState === TileState.WALL) {
                // Set the parent and mark it as a frontier
                frontier.parent = node;
                frontier.tileState = TileState.FRONTIER;
                frontiers.push(frontier);
            }
        }
    }
}

function connectCells(cellA, cellB) {
    // Determine the cell in between
    const betweenX = (cellA.x + cellB.x) / 2;
    const betweenY = (cellA.y + cellB.y) / 2;

    // Set both the cellB and the in-between cell as part of the maze
    grid[betweenY][betweenX].tileState = TileState.EMPTY;
    cellB.tileState = TileState.EMPTY;

    drawGrid(); // Redraw the grid to reflect the new connections
}



function setGridToWalls() {
    for (let y = 0; y < gridRows; y++) {
        for (let x = 0; x < gridColumns; x++) {
            grid[y][x].tileState = TileState.WALL;
        }
    }
    drawGrid(); // Redraw the grid to reflect the changes
}
function getRandomPoint() {
    // Define the margin (minimum distance from edges)
    const margin = 1;

    // Define the possible corner positions
    const corners = [
        { x: margin, y: margin }, // Top-left
        { x: gridColumns - margin - 1, y: margin }, // Top-right
        { x: margin, y: gridRows - margin - 1 }, // Bottom-left
        { x: gridColumns - margin - 1, y: gridRows - margin - 1 } // Bottom-right
    ];

    // Pick a random corner
    const corner = corners[Math.floor(Math.random() * corners.length)];
    
    return corner;
}



function startAStar() {
    if (startNode && targetNode) {
        setMessage("Started A* Pathfinding from the start point to the end point.", "info");
          
        path = A_star(startNode, targetNode);
        console.log(path);
    } else {
        setMessage("Please set both start and end points before starting the algorithm.", "warning");
    }
}

function A_star(startNode, targetNode) {
    to_evaluate = [startNode];
    evaluated = [];
    path = [];
    foundPath = false;

    function iterate() {
        if (to_evaluate.length === 0) {
            if (!foundPath) {
                setMessage("No path found.", "warning");
            }
            return path;
        }

        let current = to_evaluate[0];
        let minF = Infinity;
        let minNodes = [];

        // Find the node with the lowest f_cost
        for (let node of to_evaluate) {
            if (node.f_cost < minF) {
                minF = node.f_cost;
                minNodes = [node];
            } else if (node.f_cost === minF) {
                minNodes.push(node);
            }
        }

        // Select the node with the lowest h_cost among nodes with the same f_cost
        current = minNodes.reduce((prev, curr) => prev.h_cost < curr.h_cost ? prev : curr);

        // Remove current from list of nodes waiting for evaluation
        to_evaluate = to_evaluate.filter(node => node !== current);

        // Add current node to the list of evaluated nodes
        evaluated.push(current);

        // Color this tile explored visually
        if (current !== startNode && current !== targetNode) {
            current.tileState = TileState.EXPLORED;
        }

        if (current === targetNode) {
            // Reconstruct the path
            let pointer = current;
            while (pointer) {
                path.push(pointer);
                pointer = pointer.parent;
            }
            path.reverse();
            foundPath = true;

            // Update tile states for the path
            for (let i = 0; i < path.length; i++) {
                const node = path[i];
                if (node !== startNode && node !== targetNode) {
                    node.tileState = TileState.PATH;
                }
            }
            drawGrid();
            setMessage("Found path!", "info");
            return path;
        }

        // Process neighbors
        let neighbors = getNeighbours(current);
        for (let neighbor of neighbors) {
            if (neighbor.tileState === TileState.WALL || evaluated.includes(neighbor)) {
                continue;
            }

            const newGCost = current.g_cost + heuristic(current, neighbor);

            if (newGCost < neighbor.g_cost || !to_evaluate.includes(neighbor)) {
                neighbor.g_cost = newGCost;
                neighbor.h_cost = heuristic(neighbor, targetNode);
                neighbor.f_cost = neighbor.g_cost + neighbor.h_cost + neighbor.effort;
                neighbor.parent = current;

                if (!to_evaluate.includes(neighbor)) {
                    to_evaluate.push(neighbor);
                }
            }
        }

        drawGrid();

        if (manualControl) {
            clearTimeout(iterationTimeout);
        } else {
            iterationTimeout = setTimeout(iterate, delay);
        }
    }

    iterate();
    return path;
}

// Function to set delay
function setDelay(newDelay) {
    delay = newDelay;
}

function heuristic(current, target) {
    let dx = Math.abs(target.x - current.x);
    let dy = Math.abs(target.y - current.y);

    const D = 10; // cardinal direction constant cost
    const D2 = 14; // diagonal direction constant cost, (square root of 2 * 10)

    return D * (dx + dy) + (D2 - 2 * D) * Math.min(dx, dy);
}

function getNeighbours(node) {
    let neighbours = [];
    const directions = [
        {dx : -1, dy : -1}, // bottom left
        {dx : -1, dy : 0}, // left 
        {dx : -1, dy : 1}, // top left
        {dx : 0, dy : -1}, // bottom
        {dx : 0, dy : 1}, // top
        {dx : 1, dy : -1}, // bottom right
        {dx : 1, dy : 0}, // right
        {dx : 1, dy : 1}, // top right
    ];

    for (const {dx, dy} of directions) {
        const newX = node.x + dx;
        const newY = node.y + dy;

        // check if neighbour is in grid boundaries
        if (newX >= 0 && newX < gridColumns && newY >= 0 && newY < gridRows) {
            const neighbour = grid[newY][newX];
            //console.log("neighbour: ", neighbour);

            // check if neighbour isnt a wall
            if (neighbour.tileState != TileState.WALL && neighbour.tileState != TileState.START) {
                neighbours.push(neighbour);
                if (neighbour.tileState !== TileState.END) {
                    neighbour.tileState = TileState.UNEXPLORED;
                }                
                drawGrid();
            }
        }
    }
    return neighbours;
}

/*current1 = new Node(2, 3);
target1 = new Node(7, 5);  heuristic function working? checked, correctly answers 58
console.log(heuristic(current1, target1));
*/

let asmrModeActive = false;
let asmrInterval;

function toggleASMRMode() {
    asmrModeActive = !asmrModeActive; // Toggle ASMR mode
    const asmrBtn = document.getElementById('asmrBtn');
    asmrBtn.textContent = asmrModeActive ? 'Stop ASMR Mode' : 'Start ASMR Mode';

    if (asmrModeActive) {
        startASMR();
    } else {
        clearInterval(asmrInterval); // Stop the ASMR loop
        setMessage("ASMR Mode stopped.", "warning");
    }
}

async function startASMR() {
    while (asmrModeActive) {
        await generateMaze(); // Generate the maze

        let startCoords = getRandomPoint();
        let endCoords = getRandomPoint();
        
        while (heuristic(startCoords, endCoords) < 100) {
            endCoords = getRandomPoint(); // Ensure decent distance between start and end
        }

        grid[startCoords.y][startCoords.x].tileState = TileState.START;
        grid[endCoords.y][endCoords.x].tileState = TileState.END;

        startNode = grid[startCoords.y][startCoords.x];
        targetNode = grid[endCoords.y][endCoords.x];

        drawGrid(); // Redraw grid with new start and end points

        path = A_star(startNode, targetNode); // Start the A* algorithm
        await sleep(1500); // Wait for 5 seconds before restarting
    }
}




initializeGrid(); // Initialize and draw the grid
canvas.addEventListener('click', handleClick);

document.getElementById('delayInput').addEventListener('change', (e) => setDelay(e.target.value));