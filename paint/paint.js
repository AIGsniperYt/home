// main.js
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let darkMode = false

let lineWidth = 100;
let lineCap = 'round';
let colour = 'black';

const body = document.body;

document.getElementById('toggleMode').addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    darkMode = !darkMode;
    toggleMode();
});

function toggleMode() {
    if (darkMode) {
        document.body.style.backgroundColor = "#000";
    }
    else {
        document.body.style.backgroundColor = "#fff";
    }
}

document.getElementById('brushSize').addEventListener('input', function () {
    lineWidth = this.value;
});

// Function to save the current state of the canvas
function saveState() {
    const currentState = canvas.toDataURL();
    history.push(currentState);
    historyIndex++;
}

// Modify the draw function to save state after each drawing action
function draw(e) {
    if (!isDrawing) return;
    saveState();
    ctx.lineWidth = lineWidth;
    ctx.lineCap = lineCap; 
    ctx.strokeStyle = colour; 
    ctx.lineTo(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
}


document.getElementById('black').addEventListener('click', function () {
    colour = 'black'
});
document.getElementById('blue').addEventListener('click', function () {
    colour = 'blue'
});
document.getElementById('red').addEventListener('click', function () {
    colour = 'red'
});
document.getElementById('green').addEventListener('click', function () {
    colour = 'green'
});
document.getElementById('brown').addEventListener('click', function () {
    colour = 'brown'
});
document.getElementById('pink').addEventListener('click', function () {
    colour = 'pink'
});
document.getElementById('yellow').addEventListener('click', function () {
    colour = 'yellow'
});
document.getElementById('white').addEventListener('click', function () {
    colour = 'white'
});
document.getElementById('orange').addEventListener('click', function () {
    colour = 'orange';
});


canvas.addEventListener('mousedown', () => {
    isDrawing = true;
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    ctx.beginPath();
});

canvas.addEventListener('mousemove', draw);

document.getElementById('clear').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});


document.getElementById('backgroundColorPicker').addEventListener('input', function () {
    const bgColor = this.value;
    canvas.style.backgroundColor = bgColor;
});

function calculateBrightness(color) {
    // Convert hex color to RGB
    const rgb = parseInt(color.substring(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >>  8) & 0xff;
    const b = (rgb >>  0) & 0xff;

    // Calculate luminance using standard formula
    return (0.2126 * r + 0.7152 * g + 0.0722 * b);
}
// Global variables
let history = [];
let historyIndex = -1;

// Undo functionality
function undo(ctx) {
    if (historyIndex > 0) {
        historyIndex--;
        const img = new Image();
        img.onload = function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = history[historyIndex];
    }
}

// Redo functionality
function redo(ctx) {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        const img = new Image();
        img.onload = function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = history[historyIndex];
    }
}

// Event listeners for undo and redo buttons
document.getElementById('undo').addEventListener('click', () => undo(ctx));
document.getElementById('redo').addEventListener('click', () => redo(ctx));


// main.js

// Function to dock the toolbar at the left
function dockLeft() {
    const toolbar = document.querySelector('.toolbar');
    toolbar.style.top = '0';
    toolbar.style.left = '0';
    toolbar.style.right = 'auto';
    toolbar.style.bottom = '0';

    // Reset dropdown menu position for left dock
    const dropdownContent = document.querySelector('.dropdown-content');
    dropdownContent.style.bottom = 'auto'; // Reset to default position
}

// Function to dock the toolbar at the right
function dockRight() {
    const toolbar = document.querySelector('.toolbar');
    toolbar.style.top = '0';
    toolbar.style.left = 'auto';
    toolbar.style.right = '0';
    toolbar.style.bottom = '0';

    // Reset dropdown menu position for right dock
    const dropdownContent = document.querySelector('.dropdown-content');
    dropdownContent.style.bottom = 'auto'; // Reset to default position
}

// Function to dock the toolbar at other positions
function dockOtherPositions() {
    const toolbar = document.querySelector('.toolbar');
    toolbar.style.top = '0';
    toolbar.style.left = '0';
    toolbar.style.right = '0';
    toolbar.style.bottom = 'auto';

    // Reset dropdown menu position for other dock positions
    const dropdownContent = document.querySelector('.dropdown-content');
    dropdownContent.style.bottom = 'auto'; // Reset to default position
}

// Function to dock the toolbar at the bottom
function dockBottom() {
    const toolbar = document.querySelector('.toolbar');
    toolbar.style.top = 'auto';
    toolbar.style.left = '0';
    toolbar.style.right = '0';
    toolbar.style.bottom = '0';

    // Adjust dropdown menu position for bottom dock
    const dropdownContent = document.querySelector('.dropdown-content');
    dropdownContent.style.bottom = '100%'; // Position above the button
}

// Event listeners for dock position buttons
document.getElementById('dockTop').addEventListener('click', dockOtherPositions);
document.getElementById('dockLeft').addEventListener('click', dockLeft);
document.getElementById('dockRight').addEventListener('click', dockRight);
document.getElementById('dockBottom').addEventListener('click', dockBottom);

document.getElementById('colorPicker').addEventListener('input', function () {
    colour = this.value;
});
