///////////  VARIABLE DECLARATION   ///////////////
const wrapper1 = document.getElementById("wrapper1");
const wrapper2 = document.getElementById("wrapper2");

const plane1 = document.getElementById('plane1');
let anticlockwise1 = false;
let clockwise1 = false;
let direction1 = 0; // +90

const plane2 = document.getElementById('plane2');
let anticlockwise2 = false;
let clockwise2 = false;
let direction2 = 180; // +90

const planeSpeed = 6;

const bullet = document.querySelector(".bullet");
const bulletSpeed = 20

let canShootPlane1 = true;
let canShootPlane2 = true;
let gameEnded = false;
let gameStarted = true;

///// PUT PLANE IN INITIAL POSITIONS  /////////
let windowHeight = window.innerHeight;
let elementHeight1 = plane1.clientHeight;
let elementHeight2 = plane2.clientHeight;

// Calculate the margin-top value to center the element
let marginTop1 = (windowHeight - elementHeight1) / 2;
let marginTop2 = (windowHeight - elementHeight2) / 2;

// Set the margin-top property of the element
plane1.style.top = marginTop1 + 'px';
plane1.style.left = '0px';
plane2.style.top = marginTop2 + 'px';
plane2.style.right = '0px';


// Function to center the wrapper within the plane
function centerWrapper1() {
    const plane1Rect = plane1.getBoundingClientRect();
    const wrapper1Rect = wrapper1.getBoundingClientRect();

    const centerX = plane1Rect.left + plane1Rect.width / 2 - wrapper1Rect.width / 2;
    const centerY = plane1Rect.top + plane1Rect.height / 2 - wrapper1Rect.height / 2;

    wrapper1.style.left = centerX + 'px';
    wrapper1.style.top = centerY + 'px';
    requestAnimationFrame(centerWrapper1)
}

// Call the centerWrapper function for both planes
centerWrapper1();
//centerWrapper2();

// Add an event listener to continuously center the wrappers while resizing the window
window.addEventListener('resize', () => {
    centerWrapper(wrapper1, plane1);
    centerWrapper(wrapper2, plane2);
});


// plane 1 MOVEMENT
document.addEventListener('keydown', (event) => {
    if (event.key === 'w' || event.key === 'W') {
        anticlockwise1 = true;
    } else if (event.key === 's' || event.key === 'S') {
        clockwise1 = true;
    }
});
document.addEventListener('keyup', (event) => {
    if (event.key === 'w' || event.key === 'W') {
        anticlockwise1 = false;
    } else if (event.key === 's' || event.key === 'S')  {
        clockwise1 = false;
    }
});

// plane 2 MOVEMENT
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
        anticlockwise2 = true;
    } else if (event.key === 'ArrowDown') {
        clockwise2 = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowUp') {
        anticlockwise2 = false;
    } else if (event.key === 'ArrowDown') {
        clockwise2 = false;
    }
});


// Function to rotate the plane1 and move it
function rotateAndMovePlane1() {
    if (anticlockwise1) {
        direction1 -= 5;
    }
    if (clockwise1) {
        direction1 += 5;
    }

    // Rotate the plane
    plane1.style.transform = `rotate(${direction1}deg)`;

    // Calculate the change in X and Y positions
    let changeX = planeSpeed * Math.cos((direction1 * Math.PI) / 180);
    let changeY = planeSpeed * Math.sin((direction1 * Math.PI) / 180);

    // Get the current X and Y positions
    let currentX = parseFloat(getComputedStyle(plane1).left);
    let currentY = parseFloat(getComputedStyle(plane1).top);

    // Update the X and Y positions
    plane1.style.left = (currentX + changeX) + "px";
    plane1.style.top = (currentY + changeY) + "px";

    // Request the next frame for continuous rotation and movement
    requestAnimationFrame(rotateAndMovePlane1);
}

function rotateAndMovePlane2() {
    if (anticlockwise2) {
        direction2 -= 5;
    }
    if (clockwise2) {
        direction2 += 5;
    }

    // Rotate the plane
    plane2.style.transform = `rotate(${direction2}deg)`;

    // Calculate the change in X and Y positions
    let changeX = planeSpeed * Math.cos((direction2 * Math.PI) / 180);
    let changeY = planeSpeed * Math.sin((direction2 * Math.PI) / 180);

    // Get the current X and Y positions
    let currentX = parseFloat(getComputedStyle(plane2).left);
    let currentY = parseFloat(getComputedStyle(plane2).top);

    // Update the X and Y positions
    plane2.style.left = (currentX + changeX) + "px";
    plane2.style.top = (currentY + changeY) + "px";

    // Request the next frame for continuous rotation and movement
    requestAnimationFrame(rotateAndMovePlane2);
}

// Initialize the rotation and movement
rotateAndMovePlane1();
rotateAndMovePlane2();

//////////////////// HEALTH ///////////////////////
let health1 = 200;
let health2 = 200;

const healthBar1 = document.getElementById("healthBar1");
const healthBar2 = document.getElementById("healthBar2");
const greenHealthBar1 = document.getElementById("healthBar1");
const greenHealthBar2 = document.getElementById("healthBar2");
const healthText1 = document.getElementById("healthText1");
const healthText2 = document.getElementById("healthText2");

function updateHealthBars() {
    updateHealthBarPosition(healthBar1, plane1);
    updateHealthBarPosition(healthBar2, plane2);

    // Update health text
    healthText1.textContent = "Health: " + health1;
    healthText2.textContent = "Health: " + health2;


    // Adjust health portion width based on health variables
    const health1Width = (health1 / 200) * 200;
    const health2Width = (health2 / 200) * 200;

    document.getElementById("health1").style.width = health1Width + "px";
    document.getElementById("health2").style.width = health2Width + "px";

    requestAnimationFrame(updateHealthBars);
}

updateHealthBars();

function updateHealthBarPosition(healthBar, plane) {
    const planeRect = plane.getBoundingClientRect();
    healthBar.style.left = planeRect.left + planeRect.width / 2 - healthBar.clientWidth / 2 + "px";
    healthBar.style.top = planeRect.top - 50 + "px";
}

//////////   SHOOTING   ////////////////


function shootBullet1() {
    if (!canShootPlane1) return; // Check if Plane 1 can shoot
    if (gameStarted) {
        const bulletClone = bullet.cloneNode(true);
        bulletClone.style.display = "block";

        // Calculate the Plane1's position relative to the document
        const plane1Rect = plane1.getBoundingClientRect();

        // Position the bullet clone at the center of the Plane1's position
        bulletClone.style.left = plane1Rect.left + plane1Rect.width / 2 + "px";
        bulletClone.style.top = plane1Rect.top + plane1Rect.height / 2 + "px";

        // Set the initial direction of the bullet based on the current direction of the plane
        let bulletDirection = direction1;

        // Rotate the bullet
        bulletClone.style.transform = `rotate(${bulletDirection}deg)`;

        let bulletX;

        function moveBullet() {
            // Convert bulletclone.style.left to a number
            bulletX = parseFloat(bulletClone.style.left) || 0;

            // Check if bulletX is NaN, set it to 0
            if (isNaN(bulletX)) {
                bulletX = 0;
            }
        
            // Calculate the change in X and Y positions based on the dynamic bullet direction
            let changeX = bulletSpeed * Math.cos((bulletDirection * Math.PI) / 180);
            let changeY = bulletSpeed * Math.sin((bulletDirection * Math.PI) / 180);
        
            // Get the current X and Y positions
            let currentX = parseFloat(getComputedStyle(bulletClone).left);
            let currentY = parseFloat(getComputedStyle(bulletClone).top);
        
            // Update the X and Y positions
            bulletClone.style.left = (currentX + changeX) + "px";
            bulletClone.style.top = (currentY + changeY) + "px";
        
            // Request the next frame for continuous rotation and movement
            requestAnimationFrame(moveBullet);
        }

        const bulletInterval = setInterval(function () {
            // Check if the bulletClone is a child of the document body
            if (document.body.contains(bulletClone)) {
                // Check if the bullet collides with plane2
                const plane2Rect = plane2.getBoundingClientRect();
                if (
                    bulletX < plane2Rect.right &&
                    bulletX + bulletClone.clientWidth > plane2Rect.left &&
                    bulletClone.offsetTop < plane2Rect.bottom &&
                    bulletClone.offsetTop + bulletClone.clientHeight > plane2Rect.top
                ) {
                    // Collision detected with plane2
                    clearInterval(bulletInterval);
                    document.body.removeChild(bulletClone);
                    // Subtract health from plane2
                    health2 -= 10;
                    updateHealthBars();
                }
        
                // Check if the bullet is out of the screen and remove it
                if (
                    bulletX > window.innerWidth ||
                    bulletX < 0 ||
                    bulletClone.offsetTop > window.innerHeight ||
                    bulletClone.offsetTop + bulletClone.clientHeight < 0
                ) {
                    clearInterval(bulletInterval);
                    document.body.removeChild(bulletClone);
                }
            }
        }, 1);
        

        document.body.appendChild(bulletClone);
        moveBullet()
    }
}

function shootBullet2() {
    if (!canShootPlane2) return; // Check if Plane 2 can shoot
    if (gameStarted) {
        const bulletClone = bullet.cloneNode(true);
        bulletClone.style.display = "block";
        let bulletDirection = direction2;

        // Calculate the Plane2's position relative to the document
        const plane2Rect = plane2.getBoundingClientRect();

        // Position the bullet clone at the center of the Plane2's position
        bulletClone.style.left = plane2Rect.left + plane2Rect.width / 2 + "px";
        bulletClone.style.top = plane2Rect.top + plane2Rect.height / 2 + "px";

        // Rotate the bullet
        bulletClone.style.transform = `rotate(${bulletDirection}deg)`;

        let bulletX;

        function moveBullet() {
            // Convert bulletclone.style.left to a number
            bulletX = parseFloat(bulletClone.style.left) || 0;

            // Check if bulletX is NaN, set it to 0
            if (isNaN(bulletX)) {
                bulletX = 0;
            }
        
            // Calculate the change in X and Y positions based on the dynamic bullet direction
            let changeX = bulletSpeed * Math.cos((bulletDirection * Math.PI) / 180);
            let changeY = bulletSpeed * Math.sin((bulletDirection * Math.PI) / 180);
        
            // Get the current X and Y positions
            let currentX = parseFloat(getComputedStyle(bulletClone).left);
            let currentY = parseFloat(getComputedStyle(bulletClone).top);
        
            // Update the X and Y positions
            bulletClone.style.left = (currentX + changeX) + "px";
            bulletClone.style.top = (currentY + changeY) + "px";
        
            // Request the next frame for continuous rotation and movement
            requestAnimationFrame(moveBullet);
        }
        const bulletInterval = setInterval(function () {
            // Check if the bulletClone is a child of the document body
            if (document.body.contains(bulletClone)) {
                // Check if the bullet collides with plane2
                const plane1Rect = plane1.getBoundingClientRect();
                if (
                    bulletX < plane1Rect.right &&
                    bulletX + bulletClone.clientWidth > plane1Rect.left &&
                    bulletClone.offsetTop < plane1Rect.bottom &&
                    bulletClone.offsetTop + bulletClone.clientHeight > plane1Rect.top
                ) {
                    // Collision detected with plane2
                    clearInterval(bulletInterval);
                    document.body.removeChild(bulletClone);
                    // Subtract health from plane2
                    health1 -= 10;
                    updateHealthBars();
                }
        
                // Check if the bullet is out of the screen and remove it
                if (
                    bulletX > window.innerWidth ||
                    bulletX < 0 ||
                    bulletClone.offsetTop > window.innerHeight ||
                    bulletClone.offsetTop + bulletClone.clientHeight < 0
                ) {
                    clearInterval(bulletInterval);
                    document.body.removeChild(bulletClone);
                }
            }
        }, 1);
        

        document.body.appendChild(bulletClone);
        moveBullet()
    }
}

let shooting1 = false;
let shooting2 = false;

let shootingInterval1;
let shootingInterval2;


document.addEventListener("keydown", (event) => {
    if (event.key === "e" || event.key === "E") {
        shooting1 = true;
        startShootingInterval1();
    } else if (event.key === "0") {
        shooting2 = true;
        startShootingInterval2();
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "e" || event.key === "E") {
        shooting1 = false;
        stopShootingInterval1();
    } else if (event.key === "0") {
        shooting2 = false;
        stopShootingInterval2();
    }
});

function startShootingInterval1() {
    if (shooting1 && !shootingInterval1) {
        shootingInterval1 = setInterval(() => {
            shootBullet1();
        }, 100); // Adjust the interval duration as needed
    }
}

function stopShootingInterval1() {
    if (!shooting1 && shootingInterval1) {
        clearInterval(shootingInterval1);
        shootingInterval1 = null;
    }
}

function startShootingInterval2() {
    if (shooting2 && !shootingInterval2) {
        shootingInterval2 = setInterval(() => {
            shootBullet2();
        }, 100); // Adjust the interval duration as needed
    }
}

function stopShootingInterval2() {
    if (!shooting2 && shootingInterval2) {
        clearInterval(shootingInterval2);
        shootingInterval2 = null;
    }
}
