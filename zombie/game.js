const canvas = document.getElementById("game-container");
const ctx = canvas.getContext("2d");

// Resize the canvas to cover the entire screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Call the resizeCanvas function initially and whenever the window is resized
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let playerX = canvas.width / 2; // Initial player X position
let playerY = canvas.height / 2; // Initial player Y position
const playerRadius = 20; // Player circle radius

let wPressed = false;
let aPressed = false;
let sPressed = false;
let dPressed = false;

let bullets = []; // Initialize an empty array to store bullets
let zombies = [];

// Define mouseX and mouseY variables outside the function
let mouseX, mouseY;

document.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "w":
        wPressed = true;
        break;
        case "a":
        aPressed = true;
        break;
        case "s":
        sPressed = true;
        break;
        case "d":
        dPressed = true;
        break;
    }
});

document.addEventListener("keyup", (event) => {
    switch (event.key) {
        case "w":
        wPressed = false;
        break;
        case "a":
        aPressed = false;
        break;
        case "s":
        sPressed = false;
        break;
        case "d":
        dPressed = false;
        break;
    }
});

function movePlayer() {
    const speed = 5;
    
    if (wPressed && playerY > 0 + playerRadius) {
        playerY -= speed;
    }
    if (aPressed && playerX > 0 + playerRadius) {
        playerX -= speed;
    }
    if (sPressed && playerY < canvas.height - playerRadius) {
        playerY += speed;
    }
    if (dPressed && playerX < canvas.width - playerRadius) {
        playerX += speed;
    }
    
    drawPlayer();
    
    
}

function drawPlayer() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(playerX, playerY, playerRadius, 0, Math.PI * 2);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.closePath();
}


class Zombie {
    constructor(x, y, radius, color, speed, health) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.health = health; // New property to represent zombie's health
        this.isHit = false; // Track if the zombie has been hit
    }
    
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
    
    update(playerX, playerY) {
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const angle = Math.atan2(dy, dx);
        const velocityX = Math.cos(angle) * this.speed;
        const velocityY = Math.sin(angle) * this.speed;
        
        this.x += velocityX;
        this.y += velocityY;
    }
    
    reduceHealth(damage) {
        // Reduce zombie health
        this.health -= damage;
        
        // Check if health is below the threshold to change color
        if (this.health <= 50 && this.health > 0) {
            // Change zombie color to darker green
            this.color = "darkgreen";
        }
        
        // Check if health is zero or less
        if (this.health <= 0) {
            // Remove the zombie
            return true; // Signal that the zombie should be removed
        }
        
        return false; // Signal that the zombie should not be removed
    }
    
}




class Weapon {
    constructor(name, magazineSize, penetrationCapacity, bulletDamage, reloadingTime, shootCooldown) {
        this.name = name;
        this.magazineSize = magazineSize;
        this.penetrationCapacity = penetrationCapacity;
        this.bulletSpeed = this.calculateBulletSpeed(bulletDamage); // Calculate bullet speed based on damage
        this.bulletDamage = bulletDamage;
        this.remainingBullets = magazineSize;
        this.reloadingTime = reloadingTime;
        this.isReloading = false;
        this.shootCooldown = shootCooldown; // New parameter for shoot cooldown
        this.canShoot = true; // Flag to track if the weapon can shoot
    }
    
    calculateBulletSpeed(damage) {
        // Determine bullet speed based on damage, considering a non-linear relationship
        const baseSpeed = 19; // Base bullet speed
        const maxDamage = 100; // Maximum damage for the non-linear curve
        const curveFactor = 0.5; // Adjustment factor for the curve
        
        // Apply non-linear relation
        let bulletSpeed = baseSpeed + (Math.pow(damage, curveFactor) / Math.pow(maxDamage, curveFactor)) * baseSpeed;
        bulletSpeed = bulletSpeed / 2;
        console.log(this.name);
        console.log(bulletSpeed);
        return bulletSpeed;
    }
    
    fire(playerX, playerY, targetX, targetY) {
        if (this.remainingBullets <= 0 || !this.canShoot) {
            this.reload();
            return null; // Cannot shoot if out of bullets or on cooldown
        }
        
        // Calculate bullet velocity
        const dx = targetX - playerX;
        const dy = targetY - playerY;
        const angle = Math.atan2(dy, dx);
        const velocityX = Math.cos(angle) * this.bulletSpeed;
        const velocityY = Math.sin(angle) * this.bulletSpeed;
        
        // Create a new bullet object
        const bullet = new Bullet(playerX, playerY, velocityX, velocityY, 5, "red", this.bulletDamage, this.penetrationCapacity);
        
        this.remainingBullets--; // Decrease remaining bullets
        this.canShoot = false; // Set shoot cooldown
        
        // Start cooldown timer
        setTimeout(() => {
            this.canShoot = true;
        }, this.shootCooldown);
        
        return bullet; // Return the bullet object
    }
    
    reload() {
        if (!this.isReloading && this.remainingBullets === 0) {
            this.isReloading = true;
            
            // Simulate reloading time
            setTimeout(() => {
                this.remainingBullets = this.magazineSize;
                this.isReloading = false;
            }, this.reloadingTime);
        }
    }
    
}




class Bullet {
    constructor(x, y, velocityX, velocityY, radius, color, damage, penetration) {
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.radius = radius;
        this.color = color;
        this.damage = damage;
        this.penetration = penetration;
        
        // Create an image object for the bullet
        this.image = new Image();
        this.image.src = "bullet.png";
        
        // Ensure the image is loaded before attempting to draw it
        this.image.onload = () => {
            this.loaded = true;
        };
    }
    
    draw(ctx) {
        if (this.loaded) {
            const bulletWidth = 40; // Adjust the width as needed
            const bulletHeight = 20; // Adjust the height as needed
            ctx.drawImage(this.image, this.x - bulletWidth / 2, this.y - bulletHeight / 2, bulletWidth, bulletHeight);
        }
    }
    
    
    
    update(zombies) {
        // Update bullet position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Check collision with each zombie
        for (let i = 0; i < zombies.length; i++) {
            const zombie = zombies[i];
            
            // Increase collision detection area
            const dx = this.x - zombie.x;
            const dy = this.y - zombie.y;
            const distanceSquared = dx * dx + dy * dy;
            const minDistanceSquared = (this.radius + zombie.radius) ** 2;
            
            // If collision occurs
            if (distanceSquared < minDistanceSquared) {
                // Reduce zombie health
                zombie.reduceHealth(this.damage);
                
                // Remove bullet
                return true; // Signal that the bullet should be removed
            }
        }
        
        return false; // Signal that the bullet should not be removed
    }
    
}





function gameLoop() {
    // Update player position
    movePlayer();
    
    // Draw everything
    drawPlayer();

    // Update and draw zombies
    for (let i = 0; i < zombies.length; i++) {
        const zombie = zombies[i];
        
        // Update zombie position
        zombie.update(playerX, playerY);
        
        // Check if zombie's health is <= 0
        if (zombie.health <= 0) {
            // Remove zombie from array
            zombies.splice(i, 1);
            i--; // Decrement index to account for removed zombie
            continue; // Skip the rest of the loop iteration
        }
        
        // Draw zombie
        zombie.draw(ctx);
        
        // Check for collision with player
        const dx = zombie.x - playerX;
        const dy = zombie.y - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < playerRadius + zombie.radius) {
            // Collision occurred, end the game
            endGame();
            return; // Exit the game loop
        }
    }
    
    // Update and draw bullets
    for (let i = 0; i < bullets.length; i++) {
        const bullet = bullets[i];
        
        // Update bullet position
        const collisionDetected = bullet.update(zombies); // Pass the zombies array to the update function
        
        // Check collision with zombies
        if (collisionDetected) {
            // If collision occurred, remove bullet
            bullets.splice(i, 1);
            i--; // Decrement index to account for removed bullet
        } else {
            // Draw bullet if it hasn't collided
            bullet.draw(ctx);
        }
    }
    
    // Request the next animation frame
    requestAnimationFrame(gameLoop);
}

function endGame() {
    // Perform actions to end the game, such as displaying a game over message, resetting variables, etc.
    alert("Game Over!");
    // You may also want to reset the game state here
}


// Create weapons
const AK_47 = new Weapon("AK-47", 30, 1, 40, 1200, 120);
const SMG = new Weapon("SMG", 40, 1, 20, 1000, 50);
const Pistol = new Weapon("Pistol", 12, 1, 50, 1000, 200);
const Sniper = new Weapon("Sniper", 6, 3, 100, 2300, 500);
const Death = new Weapon("Death", Infinity, 100, 100, 0, 0.01);


let equippedWeapon = Death;


// Variable to track if left mouse button is currently held down
let isMouseDown = false;

// Event listener for mouse down
document.addEventListener("mousedown", (event) => {
    if (event.button === 0) { // Left mouse button pressed
        isMouseDown = true;
        autoFire(); // Pass the event object to autoFire
    }
});

// Event listener for mouse move to continuously update mouseX and mouseY
document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX - canvas.getBoundingClientRect().left;
    mouseY = event.clientY - canvas.getBoundingClientRect().top;
});

// Event listener for mouse up
document.addEventListener("mouseup", (event) => {
    if (event.button === 0) { // Left mouse button released
        isMouseDown = false;
    }
});

// Function to continuously fire bullets while the left mouse button is held down
function autoFire() {
    // Check if the left mouse button is still held down
    if (isMouseDown) {     
        // Calculate direction from player to mouse cursor
        const dx = mouseX - playerX;
        const dy = mouseY - playerY;
        const angle = Math.atan2(dy, dx);
        const velocityX = Math.cos(angle) * equippedWeapon.bulletSpeed;
        const velocityY = Math.sin(angle) * equippedWeapon.bulletSpeed;
        
        // Fire the pistol
        const bullet = equippedWeapon.fire(playerX, playerY, playerX + velocityX, playerY + velocityY);
        
        // Add bullet to bullets array if not null
        if (bullet) {
            bullets.push(bullet);
        }
        
        // Schedule the next autoFire call
        requestAnimationFrame(() => autoFire()); // Pass the event object to the next autoFire call
    }
}


function spawnZombie() {
    const minDistance = 200; // Minimum distance between player and newly spawned zombie
    const maxAttempts = 50; // Maximum number of attempts to find a suitable spawn location
    
    let attempts = 0;
    let x, y, distance; // Define the distance variable here
    
    // Generate random coordinates until a suitable spawn location is found
    do {
        x = Math.random() * canvas.width;
        y = Math.random() * canvas.height;
        
        const dx = x - playerX;
        const dy = y - playerY;
        distance = Math.sqrt(dx * dx + dy * dy); // Assign the distance variable here
        
        attempts++;
    } while (distance < minDistance && attempts < maxAttempts);
    
    // If a suitable spawn location is found, create a new zombie instance
    if (attempts < maxAttempts) {
        const newZombie = new Zombie(x, y, 20, "green", 2, 100);
        zombies.push(newZombie);
    }
}


// Call spawnZombie periodically using setInterval
setInterval(spawnZombie, 500); // Spawns a zombie every 5 seconds (adjust as needed)

// Start the game loop
gameLoop();