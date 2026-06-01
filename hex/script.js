const canvas = document.getElementById('hexCanvas');
const ctx = canvas.getContext('2d');
const themeToggle = document.getElementById('themeToggle');
const resetButton = document.getElementById('resetGame');
const gameStatus = document.getElementById('gameStatus');

// Color palettes
const colorPalettes = {
  light: {
    background: '#f8f9fa',
    hex: '#e9ecef',
    border: '#adb5bd',
    text: '#495057',
    player1: '#4a6fa5', // Blue
    player2: '#c1666b', // Red
    player1Highlight: 'rgba(74, 111, 165, 0.7)',
    player2Highlight: 'rgba(193, 102, 107, 0.7)',
    player1Border: '#3a5a8f', // Darker blue
    player2Border: '#a8565b', // Darker red
    cornerBorder: 'linear-gradient(135deg, #3a5a8f 50%, #a8565b 50%)' // For corners
  },
  dark: {
    background: '#212529',
    hex: '#343a40',
    border: '#6c757d',
    text: '#f8f9fa',
    player1: '#5c7aff', // Bright blue
    player2: '#ff6b6b', // Bright red
    player1Highlight: 'rgba(92, 122, 255, 0.7)',
    player2Highlight: 'rgba(255, 107, 107, 0.7)',
    player1Border: '#4a6ad8', // Darker blue
    player2Border: '#e05a5a', // Darker red
    cornerBorder: 'linear-gradient(135deg, #4a6ad8 50%, #e05a5a 50%)' // For corners
  }
};

// Game state
const gameState = {
  currentPlayer: 1,
  board: [],
  gameOver: false,
  winner: null,
  winningPath: [] // Add this to store the winning path

};

// Configuration
const config = {
  size: 7,
  hexRadius: 60,
  spacing: 1.0,
  theme: 'dark',
  debugMode: true // Add this flag
};

// Hexagon geometry
const SIN_60 = Math.sqrt(3)/2;
const COS_60 = 0.5;

// Directions for hex grid neighbors (pointy top orientation)
const HEX_DIRECTIONS = [
  [0, -1],  // Top
  [1, -1],  // Top-right
  [1, 0],   // Bottom-right
  [0, 1],   // Bottom
  [-1, 1],  // Bottom-left
  [-1, 0]   // Top-left
];

// Set canvas size and draw grid
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.backgroundColor = colorPalettes[config.theme].background;
  drawGrid();
}

// Toggle between light and dark mode
function toggleTheme() {
  config.theme = config.theme === 'light' ? 'dark' : 'light';
  canvas.style.backgroundColor = colorPalettes[config.theme].background;
  drawGrid();
}

// Reset the game
function resetGame() {
  gameState.currentPlayer = 1;
  initializeBoard();
  gameState.gameOver = false;
  gameState.winner = null;
  gameState.winningPath = []; // Clear winning path
  updateGameStatus();
  drawGrid();
}

// Update the game status display
function updateGameStatus() {
  if (gameState.gameOver) {
    const winnerColor = gameState.winner === 1 ? 'Blue' : 'Red';
    gameStatus.textContent = `Player ${gameState.winner} (${winnerColor}) wins!`;
  } else {
    gameStatus.textContent = `Player ${gameState.currentPlayer}'s turn (${gameState.currentPlayer === 1 ? 'Blue' : 'Red'})`;
  }
}

// Check if a hex is on the starting edge for a player
function isOnPlayerEdge(row, col, player) {
  if (player === 1) { // Blue - connects top and bottom
    return row === 0 || row === config.size - 1;
  } else { // Red - connects left and right
    return col === 0 || col === config.size - 1;
  }
}

// Check if a hex is on the opposite edge for a player
function isOnOppositeEdge(row, col, player) {
  if (player === 1) { // Blue - opposite is bottom or top
    return row === config.size - 1 || row === 0;
  } else { // Red - opposite is right or left
    return col === config.size - 1 || col === 0;
  }
}

// Check if coordinates are valid (within bounds)
function isValidCoordinate(row, col) {
  return row >= 0 && row < config.size && col >= 0 && col < config.size;
}

// Get all neighbors of a hex
function getNeighbors(row, col) {
  const neighbors = [];
  for (const [dr, dc] of HEX_DIRECTIONS) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (isValidCoordinate(newRow, newCol)) {
      neighbors.push([newRow, newCol]);
    }
  }
  return neighbors;
}

// Check if a player has won using optimized BFS that connects both edges
function checkWin(player) {
    const visited = new Array(config.size).fill().map(() => new Array(config.size).fill(false));
    const edge1Nodes = [];
    const edge2Nodes = [];
    
    // Identify starting and target edges
    for (let row = 0; row < config.size; row++) {
        for (let col = 0; col < config.size; col++) {
            if (gameState.board[row][col] === player) {
                if (player === 1) { // Blue connects top-bottom
                    if (row === 0) edge1Nodes.push([row, col]);
                    if (row === config.size - 1) edge2Nodes.push([row, col]);
                } else { // Red connects left-right
                    if (col === 0) edge1Nodes.push([row, col]);
                    if (col === config.size - 1) edge2Nodes.push([row, col]);
                }
            }
        }
    }

    if (edge1Nodes.length === 0 || edge2Nodes.length === 0) {
        return { result: false, path: [] };
    }

    // Track both visited status and path reconstruction
    const parentMap = new Map();
    let winningPath = [];

    for (const [startRow, startCol] of edge1Nodes) {
        if (visited[startRow][startCol]) continue;

        const queue = [[startRow, startCol]];
        visited[startRow][startCol] = true;
        parentMap.set(`${startRow},${startCol}`, null);
        let foundWin = false;

        while (queue.length > 0 && !foundWin) {
            const [currentRow, currentCol] = queue.shift();

            // Check if we reached the opposite edge
            if ((player === 1 && currentRow === config.size - 1) ||
                (player === 2 && currentCol === config.size - 1)) {
                
                // Reconstruct the exact winning path
                const path = [];
                let node = [currentRow, currentCol];
                while (node) {
                    path.unshift(node);
                    node = parentMap.get(`${node[0]},${node[1]}`);
                }
                
                winningPath = path;
                foundWin = true;
                break;
            }

            // Explore all six hexagonal neighbors
            for (const [dr, dc] of HEX_DIRECTIONS) {
                const newRow = currentRow + dr;
                const newCol = currentCol + dc;

                if (isValidCoordinate(newRow, newCol) && 
                    !visited[newRow][newCol] && 
                    gameState.board[newRow][newCol] === player) {
                    
                    visited[newRow][newCol] = true;
                    parentMap.set(`${newRow},${newCol}`, [currentRow, currentCol]);
                    queue.push([newRow, newCol]);
                }
            }
        }

        if (foundWin) {
            return { result: true, path: winningPath };
        }
    }

    return { result: false, path: [] };
}
// Calculate hexagon corner points (pointy top orientation)
function getHexCorners(centerX, centerY, radius) {
  const corners = [];
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 3 * i - Math.PI / 6;
    corners.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    });
  }
  return corners;
}

// Draw a border segment for a hex side
function drawHexBorder(centerX, centerY, sideIndex, color, lineWidth = 3) {
  const corners = getHexCorners(centerX, centerY, config.hexRadius);
  const nextIndex = (sideIndex + 1) % 6;
  
  ctx.beginPath();
  ctx.moveTo(corners[sideIndex].x, corners[sideIndex].y);
  ctx.lineTo(corners[nextIndex].x, corners[nextIndex].y);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

// Draw a single hexagon with special borders for edges
function drawHex(centerX, centerY, row, col) {
  const corners = getHexCorners(centerX, centerY, config.hexRadius);
  const colors = colorPalettes[config.theme];
  const player = gameState.board[row][col];
  
  ctx.beginPath();
  ctx.moveTo(corners[0].x, corners[0].y);
  for (let i = 1; i < 6; i++) {
    ctx.lineTo(corners[i].x, corners[i].y);
  }
  ctx.closePath();
  
  // Check if this hex is in the winning path
  const isWinningHex = gameState.gameOver && 
    gameState.winningPath.some(([r, c]) => r === row && c === col);
  
  // Determine fill color - yellow for winning path, normal colors otherwise
  if (isWinningHex) {
    ctx.fillStyle = '#FFD700'; // Gold/yellow color for winning path
  } else {
    ctx.fillStyle = player ? (player === 1 ? colors.player1 : colors.player2) : colors.hex;
  }
  ctx.fill();
  
  // Rest of the drawHex function remains the same...
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 1;
  ctx.stroke();
  
  if (row === 0) {
    drawHexBorder(centerX, centerY, 4, colors.player1Border);
    drawHexBorder(centerX, centerY, 5, colors.player1Border);
  }
  
  if (row === config.size - 1) {
    drawHexBorder(centerX, centerY, 2, colors.player1Border);
    drawHexBorder(centerX, centerY, 1, colors.player1Border);
  }
  
  if (col === 0) {
    drawHexBorder(centerX, centerY, 3, colors.player2Border);
    drawHexBorder(centerX, centerY, 4, colors.player2Border);
  }
  
  if (col === config.size - 1) {
    drawHexBorder(centerX, centerY, 1, colors.player2Border);
    drawHexBorder(centerX, centerY, 0, colors.player2Border);
  }
  
  ctx.fillStyle = colors.text;
  ctx.font = '19px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${row},${col}`, centerX, centerY + 3);
}

// Calculate hexagon center position with perfect centering
function getHexCenter(row, col) {
  const horizSpacing = config.hexRadius * 2 * SIN_60 * config.spacing;
  const vertSpacing = config.hexRadius * 1.5 * config.spacing;
  
  // Right-tilted coordinates
  const x = col * horizSpacing - row * horizSpacing * 0.5;
  const y = row * vertSpacing;
  
  // Calculate the maximum x-offset needed to center the tilted grid
  const maxRowOffset = (config.size - 1) * horizSpacing * 0.5;
  const gridWidth = (config.size - 1) * horizSpacing + maxRowOffset;
  const gridHeight = (config.size - 1) * vertSpacing;
  
  // Perfect centering calculations
  const offsetX = (canvas.width - gridWidth) / 2 + maxRowOffset;
  const offsetY = (canvas.height - gridHeight) / 2;
  
  return {
    x: offsetX + x,
    y: offsetY + y
  };
}

// Draw the entire grid
function drawGrid() {
  const colors = colorPalettes[config.theme];
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (let row = 0; row < config.size; row++) {
    for (let col = 0; col < config.size; col++) {
      const center = getHexCenter(row, col);
      drawHex(center.x, center.y, row, col);
    }
  }
}

// Handle hex click
function handleHexClick(row, col) {
  if (gameState.gameOver) return;

  if (gameState.board[row][col] === 0) {
    const currentPlayer = gameState.currentPlayer;
    gameState.board[row][col] = currentPlayer;

    // DEBUG: Place 6 neighbors around first move
    if (config.debugMode && Object.values(gameState.board).flat().filter(v => v !== 0).length === 1) {
      const neighbors = getNeighbors(row, col);
      neighbors.forEach(([nRow, nCol]) => {
        gameState.board[nRow][nCol] = currentPlayer;
      });
      
      // Draw immediately so we can see the neighbors
      drawGrid();
      return;
    }

    // Rest of your existing win checking logic...
    const { result: hasWon, path } = checkWin(currentPlayer);
    if (hasWon) {
      gameState.gameOver = true;
      gameState.winner = currentPlayer;
      gameState.winningPath = path;
    } else {
      gameState.currentPlayer = currentPlayer === 1 ? 2 : 1;
    }

    updateGameStatus();
    drawGrid();

    if (!gameState.gameOver) {
      const center = getHexCenter(row, col);
      const colors = colorPalettes[config.theme];
      const highlightColor = currentPlayer === 1 ? 
        colors.player1Highlight : colors.player2Highlight;
      
      const corners = getHexCorners(center.x, center.y, config.hexRadius);
      ctx.fillStyle = highlightColor;
      ctx.beginPath();
      ctx.moveTo(corners[0].x, corners[0].y);
      for (let i = 1; i < 6; i++) {
        ctx.lineTo(corners[i].x, corners[i].y);
      }
      ctx.closePath();
      ctx.fill();
    }
  }
}

// Helper to count placed hexes (add this if not already present)
function countPlacedHexes() {
  let count = 0;
  for (let row = 0; row < config.size; row++) {
    for (let col = 0; col < config.size; col++) {
      if (gameState.board[row][col] !== 0) count++;
    }
  }
  return count;
}

// Helper function to check if point is in hexagon
function isPointInHex(x, y, corners) {
  let inside = false;
  for (let i = 0, j = corners.length - 1; i < corners.length; j = i++) {
    const xi = corners[i].x, yi = corners[i].y;
    const xj = corners[j].x, yj = corners[j].y;
    
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function initializeBoard() {
  gameState.board = [];
  for (let row = 0; row < config.size; row++) {
    gameState.board[row] = [];
    for (let col = 0; col < config.size; col++) {
      gameState.board[row][col] = 0; // 0 represents empty
    }
  }
}

// Initialize
window.addEventListener('load', () => {
  initializeBoard(); // Initialize the 2D array
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  themeToggle.addEventListener('click', toggleTheme);
  resetButton.addEventListener('click', resetGame);
  
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    for (let row = 0; row < config.size; row++) {
      for (let col = 0; col < config.size; col++) {
        const center = getHexCenter(row, col);
        const corners = getHexCorners(center.x, center.y, config.hexRadius);
        
        if (isPointInHex(mouseX, mouseY, corners)) {
          handleHexClick(row, col);
          return;
        }
      }
    }
  });
});