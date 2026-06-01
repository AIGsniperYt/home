
const player1 = document.getElementById("player1");
const player2 = document.getElementById("player2");
let canShootPlayer1 = true;
let canShootPlayer2 = true;
let gameEnded = false;
let gameStarted = false;

//player1 
let isUpPressed1 = false;
let isDownPressed1 = false;
let isLeftPressed1 = false;
let isRightPressed1 = false;
//player2
let isUpPressed2 = false;
let isDownPressed2 = false;
let isLeftPressed2 = false;
let isRightPressed2 = false;

function initializeGame() {
    // Reset game variables
    canShootPlayer1 = true;
    canShootPlayer2 = true;
    gameEnded = false;
    gameStarted = false;
    health1 = 200;
    health2 = 200;
    countdown = 2;
    countdownDisplay.textContent = 3;

    // Set initial positions for player 1
    x1 = 70;
    y1 = window.innerHeight / 2 - player1.clientHeight / 2;

    // Set initial positions for player 2
    x2 = window.innerWidth - player2.clientWidth - 80;
    y2 = window.innerHeight / 2 - player2.clientHeight / 2;
    updatePlayerPositions()

    // Hide countdown display
    countdownDisplay.style.display = "none";

    // Hide the winner modal
    const winnerModal = document.getElementById("winnerModal");

    // Animation for winner modal flying up
    winnerModal.style.transition = "transform 1s ease-in-out";
    winnerModal.style.transform = "translate(-50%, -200%)";


    slideUp();
    startUp();
}

// Call the function on page load
window.onload = function () {
    initializeGame();
};

// Set initial positions for player 1
let x1 = 70; // Adjust this value to control the horizontal position
let y1 = window.innerHeight / 2 - player1.clientHeight / 2;

// Set initial positions for player 2
let x2 = window.innerWidth - player2.clientWidth - 80; // Adjust this value to control the horizontal position
let y2 = window.innerHeight / 2 - player2.clientHeight / 2;

function updatePosition1() {
    player1.style.left = x1 + "px";
    player1.style.top = y1 + "px";
}

function updatePosition2() {
    player2.style.left = x2 + "px";
    player2.style.top = y2 + "px";
}

// player 1
document.addEventListener("keydown", (event) => {
    if (event.key === "W" || event.key === "w") {
        isUpPressed1 = true;
    }
    if (event.key === "S" || event.key === "s") {
        isDownPressed1 = true;
    }
    if (event.key === "A" || event.key === "a") {
        isLeftPressed1 = true;
    }
    if (event.key === "D" || event.key === "d") {
        isRightPressed1 = true;
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "W" || event.key === "w") {
        isUpPressed1 = false;
    }
    if (event.key === "S" || event.key === "s") {
        isDownPressed1 = false;
    }
    if (event.key === "A" || event.key === "a") {
        isLeftPressed1 = false;
    }
    if (event.key === "D" || event.key === "d") {
        isRightPressed1 = false;
    }
});

//player2
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") {
        isUpPressed2 = true;
    }
    if (event.key === "ArrowDown") {
        isDownPressed2 = true;
    }
    if (event.key === "ArrowLeft") {
        isLeftPressed2 = true;
    }
    if (event.key === "ArrowRight") {
        isRightPressed2 = true;
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "ArrowUp") {
        isUpPressed2 = false;
    }
    if (event.key === "ArrowDown") {
        isDownPressed2 = false;
    }
    if (event.key === "ArrowLeft") {
        isLeftPressed2 = false;
    }
    if (event.key === "ArrowRight") {
        isRightPressed2 = false;
    }
});

// Set the speed for player 1 and player 2
const speed1 = 4;
const speed2 = 4;

// Function to update player positions
function updatePlayerPositions() {
    if (gameEnded) {
        return;
    }
    if (gameStarted) {
    if (isUpPressed1 && y1 > 0) {
        y1 -= speed1;
    }
    if (isDownPressed1 && y1 + player1.clientHeight < window.innerHeight) {
        y1 += speed1;
    }
    if (isLeftPressed1 && x1 > 0) {
        x1 -= speed1;
    }
    if (isRightPressed1 && x1 + player1.clientWidth < window.innerWidth) {
        x1 += speed1;
    }

    if (isUpPressed2 && y2 > 0) {
        y2 -= speed2;
    }
    if (isDownPressed2 && y2 + player2.clientHeight < window.innerHeight) {
        y2 += speed2;
    }
    if (isLeftPressed2 && x2 > 0) {
        x2 -= speed2;
    }
    if (isRightPressed2 && x2 + player2.clientWidth < window.innerWidth) {
        x2 += speed2;
    }
    }

    updatePosition1();
    updatePosition2();

    requestAnimationFrame(updatePlayerPositions);
}

//////////   SHOOTING   ////////////////

const bullet = document.querySelector(".bullet");

// Function to create and position a bullet clone
function shootBullet1() {
    if (!canShootPlayer1) return; // Check if Player 1 can shoot
    if (gameStarted) {
        const bulletClone = bullet.cloneNode(true);
        bulletClone.style.display = "block";

        // Calculate the player1's position relative to the document
        const player1Rect = player1.getBoundingClientRect();

        // Position the bullet clone at the middle of the player1's position
        bulletClone.style.left = player1Rect.right + 5 + "px";
        bulletClone.style.top = player1Rect.top + player1Rect.height / 2 + "px";

        // Convert player1.style.left to a number
        let bulletX = parseFloat(bulletClone.style.left) || 0;

        // Use setInterval to move the bullet at a regular interval
        const bulletInterval = setInterval(function () {
            bulletX += 8;
            bulletClone.style.left = bulletX + "px";

            // Check if the bullet collides with player2
            const player2Rect = player2.getBoundingClientRect();
            if (
                bulletX < player2Rect.right &&
                bulletX + bulletClone.clientWidth > player2Rect.left &&
                bulletClone.offsetTop < player2Rect.bottom &&
                bulletClone.offsetTop + bulletClone.clientHeight > player2Rect.top
            ) {
                // Collision detected with player2
                clearInterval(bulletInterval);
                document.body.removeChild(bulletClone);
                // Subtract health from player2
                health2 -= 10;
                updateHealthBars();
            }

            // Check if the bullet is out of the screen and remove it
            if (bulletX > window.innerWidth) {
                clearInterval(bulletInterval);
                document.body.removeChild(bulletClone);
            }
        }, 12);

        document.body.appendChild(bulletClone);
    }
}

function shootBullet2() {
    if (!canShootPlayer2) return; // Check if Player 2 can shoot
    if (gameStarted) {
        const bulletClone = bullet.cloneNode(true);
        bulletClone.style.display = "block";

        // Calculate the player2's position relative to the document
        const player2Rect = player2.getBoundingClientRect();

        // Position the bullet clone at the middle of the player2's position
        bulletClone.style.left = player2Rect.left - 55 - bulletClone.clientWidth + "px";
        bulletClone.style.top = player2Rect.top + player2Rect.height / 2 + "px";

        // Convert player2.style.left to a number
        let bulletX = parseFloat(bulletClone.style.left) || 0;

        // Use setInterval to move the bullet at a regular interval
        const bulletInterval = setInterval(function () {
            bulletX -= 8;
            bulletClone.style.left = bulletX + "px";

            // Check if the bullet collides with player1
            const player1Rect = player1.getBoundingClientRect();
            if (
                bulletX < player1Rect.right &&
                bulletX + bulletClone.clientWidth > player1Rect.left &&
                bulletClone.offsetTop < player1Rect.bottom &&
                bulletClone.offsetTop + bulletClone.clientHeight > player1Rect.top
            ) {
                // Collision detected with player1
                clearInterval(bulletInterval);
                document.body.removeChild(bulletClone);
                // Subtract health from player1
                health1 -= 10;
                updateHealthBars();
            }

            // Check if the bullet is out of the screen and remove it
            if (bulletX < 0) {
                clearInterval(bulletInterval);
                document.body.removeChild(bulletClone);
            }
        }, 12);

        document.body.appendChild(bulletClone);
    }
}



let isEKeyDown1 = false;
let isShootingInProgress1 = false;

let isEKeyDown2 = false;
let isShootingInProgress2 = false;

document.addEventListener("keydown", (event) => {
    if (event.key === "e" || event.key === "E") {
        if (!isEKeyDown1 && !isShootingInProgress1) {
            isEKeyDown1 = true;
            isShootingInProgress1 = true;
            shootBullet1();
        }
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "e" || event.key === "E") {
        isEKeyDown1 = false;
        isShootingInProgress1 = false;
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "0") {
        if (!isEKeyDown2 && !isShootingInProgress2) {
            isEKeyDown2 = true;
            isShootingInProgress2 = true;
            shootBullet2();
        }
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "0") {
        isEKeyDown2 = false;
        isShootingInProgress2 = false;
    }
});


///////////////////////////HEALTH/////////////////////////////////////

let health1 = 200;
let health2 = 200;

const healthBar1 = document.getElementById("healthBar1");
const healthBar2 = document.getElementById("healthBar2");
const greenHealthBar1 = document.getElementById("healthBar1");
const greenHealthBar2 = document.getElementById("healthBar2");
const healthText1 = document.getElementById("healthText1");
const healthText2 = document.getElementById("healthText2");

function updateHealthBars() {
    updateHealthBarPosition(healthBar1, player1);
    updateHealthBarPosition(healthBar2, player2);

    // Update health text
    healthText1.textContent = "Health: " + health1;
    healthText2.textContent = "Health: " + health2;


    // Adjust health portion width based on health variables
    const health1Width = (health1 / 200) * 200;
    const health2Width = (health2 / 200) * 200;

    document.getElementById("health1").style.width = health1Width + "px";
    document.getElementById("health2").style.width = health2Width + "px";

    requestAnimationFrame(updateHealthBars);
    checkPlayerDeath();

}



updateHealthBars();

function updateHealthBarPosition(healthBar, player) {
    const playerRect = player.getBoundingClientRect();
    healthBar.style.left = playerRect.left + playerRect.width / 2 - healthBar.clientWidth / 2 + "px";
    healthBar.style.top = playerRect.top - 50 + "px";
}


function checkPlayerDeath() {
    if (health1 <= 0 && health2 > 0) {
        stopShooting()
        console.log("Player 2 wins!");
        gameEnded = true;
        initializeGame()
    } else if (health2 <= 0 && health1 > 0) {
        stopShooting()
        console.log("Player 1 wins!");
        gameEnded = true;
        initializeGame()
    } else if (health1 <= 0 && health2 <= 0) {
        stopShooting()
        console.log("It's a draw!");
        gameEnded = true;
        initializeGame()
    }
}


function stopShooting() {
    // Disable shooting for both players
    canShootPlayer1 = false;
    canShootPlayer2 = false;
}


// Menu Modal
const menuModal = document.getElementById("menuModal");
const playButton = document.getElementById("playButton");
const countdownDisplay = document.getElementById("countdownDisplay");

let countdown = 3; // Initial countdown value

// Show the modal when the page loads
window.onload = function () {
    startUp();
}

// Add an event listener to the "Play" button
playButton.addEventListener("click", function () {
    // Start the countdown
    slideUp()
    startCountdown();
});

// Function to slide up the menu
function slideUp() {
    menuModal.style.transition = "transform 1.5s ease-in-out";
    menuModal.style.transform = "translate(-50%, -400%)";
} 

// Function to slide down the menu
function startUp() {
    menuModal.style.transition = "transform 1.5s ease-in-out";
    menuModal.style.transform = "translate(-50%, -200%)";

}

// Function to hide the menu
function hideMenu() {
    startUp();
    menuModal.style.display = "none";
}



// Function to start the countdown
function startCountdown() {
    countdownDisplay.style.display = "block"; // Show the countdown display

    // Update the countdown every second
    const countdownInterval = setInterval(function () {
        countdownDisplay.textContent = countdown; // Update the countdown display
        countdown--;

        if (countdown < 0) {
            clearInterval(countdownInterval); // Stop the countdown when it reaches 0
            countdownDisplay.style.display = "none"; // Hide the countdown display
            menuModal.style.display = "none"
            menuModal.style.transform = "translate(-50%, 0%)"
            gameStarted = true;

            // Now, players can move and shoot
        }
    }, 1000);
    setInterval(function () {
        menuModal.style.display = "block"
    }, 1000)

}

updatePlayerPositions();

function showWinnerModal(winner) {
    const winnerModal = document.getElementById("winnerModal");
    const winnerText = document.getElementById("winnerText");

    winnerText.textContent = winner;
    winnerModal.style.display = "block";
    stopShooting(); // Stop shooting when the game ends
}

// Update checkPlayerDeath function
function checkPlayerDeath() {
    if (health1 <= 0 && health2 > 0) {
        gameEnded = true;
        showWinnerModal("Player 2 wins!");
    } else if (health2 <= 0 && health1 > 0) {
        gameEnded = true;
        showWinnerModal("Player 1 wins!");
    } else if (health1 <= 0 && health2 <= 0) {
        gameEnded = true;
        showWinnerModal("It's a draw");
    }
}

const playAgainButton = document.getElementById("playAgainButton");
playAgainButton.addEventListener("click", function () {
    const winnerModal = document.getElementById("winnerModal");
    const menuModal = document.getElementById("menuModal");

    // Animation for winner modal flying up
    winnerModal.style.transition = "transform 1s ease-in-out";
    winnerModal.style.transform = "translate(-50%, -200%)";

    // Animation for menu modal flying up from below
    menuModal.style.transform = "translate(-50%, -200%)";

    initializeGame();
});
