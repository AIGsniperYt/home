const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

let numOfAgents = 100;
let foodClusterSize = 20;
let foodItems = [];
let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 0;

// Utility: Clamp vector magnitude
function clampMagnitude(vector, maxMagnitude) {
    let mag = vector.magnitude();
    if (mag > maxMagnitude) {
        vector.normalize().scale(maxMagnitude);
    }
}

// Vector2 class (already created earlier)
class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }

    subtract(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }

    scale(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        let mag = this.magnitude();
        if (mag !== 0) {
            this.x /= mag;
            this.y /= mag;
        }
        return this;
    }

    copy() {
        return new Vector2(this.x, this.y);
    }

    // New method to calculate the distance between this vector and another vector
    distanceTo(vector) {
        let dx = this.x - vector.x;
        let dy = this.y - vector.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Static method to create a random unit vector
    static randomUnitVector() {
        let angle = Math.random() * 2 * Math.PI;
        return new Vector2(Math.cos(angle), Math.sin(angle));
    }
}

// Agent (ant) class
class Agent {
    constructor(x, y) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.direction = Vector2.randomUnitVector();
        this.maxSpeed = 200;
        this.maxSteer = 0.4;
        this.wanderStrength = 0.5;
        this.borderMargin = 50;
        this.fovAngle = Math.PI / 2; // Set FOV angle to 90 degrees (π / 2)
        this.fovRange = 50; // FOV range
        this.hasFood = false; // Whether the agent has picked up food
        this.colonyPosition = new Vector2(canvas.width / 2, canvas.height / 2); // Central colony
        this.state = "wandering"; // States: 'wandering', 'movingToFood', 'returningToColony'
        this.target = null; // The target food or colony position
        this.foodCarrying = null; // Holds the food item it's carrying
    }

    update(deltaTime) {
        switch (this.state) {
            case "wandering":
                this.wander(); // Random movement
                this.checkForFoodInFOV();
                break;
            case "movingToFood":
                this.moveToTarget(this.target); // Move toward the food
                this.checkFoodCollision();
                break;
            case "returningToColony":
                this.moveToTarget(this.colonyPosition); // Move toward the colony
                this.checkColonyArrival();
                break;
        }

        this.applyMovement(deltaTime);
    }

    // Wandering behavior (random movement)
    wander() {
        let wanderDirection = Vector2.randomUnitVector().scale(this.wanderStrength);
        this.direction.add(wanderDirection).normalize();
    }

    // Move toward a specific target
    moveToTarget(target) {
        let desiredDirection = target.copy().subtract(this.position).normalize();
        this.direction = desiredDirection;
    }

    // Apply the movement based on direction and velocity
    applyMovement(deltaTime) {
        let desiredVelocity = this.direction.copy().scale(this.maxSpeed);

        this.avoidBorders();

        let steeringForce = desiredVelocity.copy().subtract(this.velocity);
        clampMagnitude(steeringForce, this.maxSteer);

        this.velocity.add(steeringForce);
        clampMagnitude(this.velocity, this.maxSpeed);

        this.position.add(this.velocity.copy().scale(deltaTime));

        this.angle = Math.atan2(this.velocity.y, this.velocity.x);
    }

    // Check if food is within the FOV
    checkForFoodInFOV() {
        if (!this.hasFood) {
            for (let i = 0; i < foodItems.length; i++) {
                let food = foodItems[i];
                let distance = this.position.distanceTo(food.position);
                if (distance < this.fovRange) {
                    let toFood = food.position.copy().subtract(this.position).normalize();
                    let dotProduct = this.direction.copy().normalize().x * toFood.x + this.direction.copy().normalize().y * toFood.y;

                    let angleToFood = Math.acos(dotProduct);
                    if (angleToFood < this.fovAngle / 2) {
                        this.state = "movingToFood"; // Transition to move toward the food
                        this.target = food.position.copy(); // Set the target to the food's position
                        this.foodCarrying = food; // Assign food to the agent
                        return;
                    }
                }
            }
        }
    }

    // Check for collision with food and pick it up
    checkFoodCollision() {
        if (!this.hasFood && this.target) {
            let distanceToFood = this.position.distanceTo(this.target);
            if (distanceToFood < 5) { // Pickup radius
                this.hasFood = true; // Pick up the food
                this.state = "returningToColony"; // Transition to return to colony
                foodItems = foodItems.filter(food => food !== this.foodCarrying); // Remove the food from the world
                updateFoodStats(); // Update the food counter
                this.target = null; // Clear the food target
            }
        }
    }

    // Check if the ant has reached the colony and drop the food
    checkColonyArrival() {
        let distanceToColony = this.position.distanceTo(this.colonyPosition);
        if (distanceToColony < 10) { // Drop food if within a certain distance from the colony
            this.hasFood = false; // Drop the food
            this.state = "wandering"; // Transition back to wandering
            this.foodCarrying = null; // Remove the reference to the food
        }
    }

    avoidBorders() {
        let canvasWidth = canvas.width;
        let canvasHeight = canvas.height;

        if (this.position.x < this.borderMargin) {
            this.direction.x += 0.5;
        } else if (this.position.x > canvasWidth - this.borderMargin) {
            this.direction.x -= 0.5;
        }

        if (this.position.y < this.borderMargin) {
            this.direction.y += 0.5;
        } else if (this.position.y > canvasHeight - this.borderMargin) {
            this.direction.y -= 0.5;
        }

        this.direction.normalize();
    }

    draw() {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, 2 * Math.PI);
        ctx.fillStyle = this.hasFood ? 'orange' : 'black'; // Change color if holding food
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(10, 0);
        ctx.strokeStyle = 'red';
        ctx.stroke();

        ctx.restore();
    }

    drawWithFOV() {
        this.drawFOV();
        this.draw();
    }

    drawFOV() {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, this.fovRange, -this.fovAngle / 2, this.fovAngle / 2);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
        ctx.fill();
        ctx.restore();
    }
}

// Function to update the food count
function updateFoodStats() {
    document.getElementById("foodCount").innerText = foodItems.length;
}


class Colony {
    constructor(x, y) {
        this.position = new Vector2(x, y);
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 15, 0, 2 * Math.PI); // Colony size is 15 pixels
        ctx.fillStyle = '#00f'; // Blue color for the colony
        ctx.fill();
    }
}

class Food {
    constructor(x, y) {
        this.position = new Vector2(x, y);
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 5, 0, 2 * Math.PI); // Food size is 5 pixels
        ctx.fillStyle = '#0f0'; // Green color for food
        ctx.fill();
    }
}
let colony = new Colony(canvas.width / 2, canvas.height / 2);


// Initialize agents (ants)
let agents = [];
for (let i = 0; i < numOfAgents; i++) {
    agents.push(new Agent(Math.random() * canvas.width, Math.random() * canvas.height));
}

// Function to create a cluster of food
function placeFoodCluster(x, y) {
    for (let i = 0; i < foodClusterSize; i++) {
        let offsetX = Math.random() * 40 - 20;
        let offsetY = Math.random() * 40 - 20;
        let food = new Food(x + offsetX, y + offsetY);
        foodItems.push(food);
    }
    updateFoodStats();
}

// Right-click to place food clusters
canvas.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    placeFoodCluster(x, y);
});

// Update food stats
function updateFoodStats() {
    document.getElementById("foodCount").innerText = foodItems.length;
}

// Update and draw everything
function updateAndDraw(deltaTime) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw food items
    foodItems.forEach(food => {
        food.draw();
    });

    // Update and draw agents (ants)
    agents.forEach(agent => {
        agent.update(deltaTime);
        agent.draw();
    });
}

// Calculate and update FPS
function calculateFPS() {
    const now = performance.now();
    const delta = now - lastFrameTime;
    console.log(delta);

    // Update FPS every second
    if (delta >= 1000) {
        
        fps = (frameCount / (delta / 1000)).toFixed(1); // Calculate FPS
        document.getElementById("fps").innerText = fps; // Update FPS on the page
        frameCount = 0; // Reset frame count
        lastFrameTime = now; // Reset lastFrameTime for the next interval
    } else {

        frameCount++; // Increment frame count for each frame
    }
}



// Update number of ants in stats
function updateAntStats() {
    document.getElementById("numAnts").innerText = agents.length;
}
function drawCanvas() {
    const currentFrameTime = performance.now();
    const deltaTime = (currentFrameTime - lastFrameTime) / 1000;
    lastFrameTime = currentFrameTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the colony
    drawColony();

    // Draw all food items
    foodItems.forEach(food => food.draw());

    // Update and draw all ants
    agents.forEach(agent => {
        agent.update(deltaTime);
        agent.drawWithFOV();
    });

    document.getElementById('fps').innerText = fps.toFixed(1);
    document.getElementById('numAnts').innerText = agents.length;

    requestAnimationFrame(drawCanvas);
}

function drawColony() {
    let colonyRadius = 40; // Set the colony size (radius)
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, colonyRadius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 0, 255, 0.2)'; // Light blue for the colony
    ctx.fill();
}

drawCanvas();
