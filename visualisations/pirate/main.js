// Set up basic scene, camera, renderer, and controls
let scene, camera, renderer, controls;
let waveMesh, raftMesh, wireframeMode = true;

// Add velocity and damping variables
let velocity = new THREE.Vector3(); // Velocity vector
let direction = new THREE.Vector3(); // Direction vector
let damping = 0.1; // Damping factor for smooth movement
let keyboardState = {}; // Keyboard state for tracking movement keys

const waveFrequency = 0.2; // Wave frequency
const waveAmplitude = 0.8; // Amplitude of the waves
const waveSpeed = 5; // Speed of wave movement
const movementSpeed = 0.1; // Speed of movement (can be adjusted)

init();
animate();

// Add lighting
function addLights() {
    // Ambient light: Provides general illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Lower intensity for a softer light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    directionalLight.position.set(0, 20, 0)
    console.log(directionalLight.position);
    scene.add( directionalLight );

    // Visualize the directional light with a sphere at the light's position
    const directionalLightHelper = new THREE.Mesh(
        new THREE.SphereGeometry(0.2),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    directionalLightHelper.position.copy(directionalLight.position);
    scene.add(directionalLightHelper);

    // Visualize the direction of the light with an arrow (helpful for debugging)
    const lightDirectionHelper = new THREE.ArrowHelper(
        new THREE.Vector3(-1, -1, -1).normalize(), // Direction (pointing towards center)
        directionalLight.position, // Start position of the arrow
        10, // Length of the arrow
        0xffffff // Color of the arrow
    );
    scene.add(lightDirectionHelper);
}

function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue

    // Add lights to the scene
    addLights();

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 50); // Starting position

    // Renderer setup
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // PointerLockControls setup for WASDQE movement
    controls = new THREE.PointerLockControls(camera, renderer.domElement);
    document.body.addEventListener('click', () => controls.lock(), false);

    // Create wave geometry
    const waveGeometry = createWaveGeometry(100, 100, 50, 50);
    waveMesh = new THREE.Mesh(waveGeometry, new THREE.MeshBasicMaterial({ color: 0x006994 }));
    scene.add(waveMesh);

    // Create raft (rectangle-shaped using 2 triangles)
    const raftGeometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([ 
        -10, 0, 5,   // Bottom-left
        10, 0, 5,    // Bottom-right
        -10, 0, -5,  // Top-left
        10, 0, -5    // Top-right
    ]);
    const indices = new Uint16Array([0, 1, 2, 1, 3, 2]);
    raftGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    raftGeometry.setIndex(new THREE.BufferAttribute(indices, 1));

    const raftMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
    raftMesh = new THREE.Mesh(raftGeometry, raftMaterial);
    raftMesh.position.set(0, 5, 0); // Position the raft at the desired coordinates
    scene.add(raftMesh);

    // Event listener for wireframe toggle
    document.addEventListener('keydown', onKeyDown, false);

    // Resize handling
    window.addEventListener('resize', onWindowResize, false);

    // Handle key down events to track user input
    document.addEventListener('keydown', (event) => keyboardState[event.key.toLowerCase()] = true, false);
    document.addEventListener('keyup', (event) => keyboardState[event.key.toLowerCase()] = false, false);
}



function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

function onKeyDown(event) {
    if (event.key === 'v') {
        wireframeMode = !wireframeMode;
        waveMesh.material.wireframe = wireframeMode;
        raftMesh.material.wireframe = wireframeMode;
    }
}

function animate() {
    requestAnimationFrame(animate);

    // Update velocity based on controls
    updateVelocity();

    // Apply damping to velocity for smooth movement
    velocity.multiplyScalar(1 - damping);

    // Apply velocity to the camera
    camera.position.add(velocity);

    // Simulate waves
    updateWaveGeometry();

    // Update the raft position based on wave height at its 4 corners
    updateRaft();

    renderer.render(scene, camera);
}

// Update velocity based on keyboard input or other controls
function updateVelocity() {
    direction.set(0, 0, 0); // Reset direction

    // Get user input for movement (WASDQE keys)
    if (controls.isLocked) {
        if (keyboardState['w']) direction.z = -1; // Move forward
        if (keyboardState['s']) direction.z = 1; // Move backward
        if (keyboardState['a']) direction.x = -1; // Move left
        if (keyboardState['d']) direction.x = 1; // Move right
        if (keyboardState['q']) direction.y = -1; // Move down
        if (keyboardState['e']) direction.y = 1; // Move up

        direction.normalize(); // Normalize once for all directions

        // Apply movement speed
        velocity.add(direction.multiplyScalar(movementSpeed));
    }
}

// Create wave geometry using BufferGeometry
function createWaveGeometry(width, height, widthSegments, heightSegments) {
    const geometry = new THREE.BufferGeometry();

    const vertices = [];
    const indices = [];

    const stepX = width / widthSegments;
    const stepZ = height / heightSegments;

    // Create vertices for the grid
    for (let z = 0; z <= heightSegments; z++) {
        for (let x = 0; x <= widthSegments; x++) {
            vertices.push(x * stepX - width / 2, 0, z * stepZ - height / 2);
        }
    }

    // Create indices for the grid (two triangles per square)
    for (let z = 0; z < heightSegments; z++) {
        for (let x = 0; x < widthSegments; x++) {
            const i = z * (widthSegments + 1) + x;
            indices.push(i, i + widthSegments + 1, i + 1);
            indices.push(i + 1, i + widthSegments + 1, i + widthSegments + 2);
        }
    }

    // Set the vertices and indices
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    geometry.setIndex(indices);

    return geometry;
}

// Update wave geometry based on time (simple sine wave displacement)
function updateWaveGeometry() {
    const time = Date.now() * 0.001 * waveSpeed;
    const positions = waveMesh.geometry.attributes.position.array;

    // Modify wave geometry based on time (simple sine wave displacement)
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];
        positions[i + 1] = Math.sin(x * waveFrequency + time) * waveAmplitude + Math.cos(z * waveFrequency + time) * waveAmplitude;
    }

    // Notify that geometry needs an update
    waveMesh.geometry.attributes.position.needsUpdate = true;
}

// Get wave height at specific (x, z) position
function getWaveHeightAt(x, z) {
    const time = Date.now() * 0.001 * waveSpeed;
    return (Math.sin(x * waveFrequency + time) + Math.cos(z * waveFrequency + time)) * waveAmplitude;
}

// Update raft geometry based on wave heights at each corner
function updateRaft() {
    const raftPosition = raftMesh.position;
    const halfWidth = 5;  // Half of the raft's width (5 for 10 width)
    const halfLength = 2.5; // Half of the raft's length (5 for 5 length)

    // Get wave heights at each corner of the raft (in terms of x, z offset)
    const waveHeights = [
        getWaveHeightAt(raftPosition.x - halfWidth, raftPosition.z + halfLength),  // Top-left
        getWaveHeightAt(raftPosition.x + halfWidth, raftPosition.z + halfLength),  // Top-right
        getWaveHeightAt(raftPosition.x - halfWidth, raftPosition.z - halfLength),  // Bottom-left
        getWaveHeightAt(raftPosition.x + halfWidth, raftPosition.z - halfLength)   // Bottom-right
    ];

    // Update raft geometry positions based on wave heights at each corner
    const positions = raftMesh.geometry.attributes.position.array;
    positions[1] = waveHeights[0] - 4;  // Top-left
    positions[4] = waveHeights[1] - 4;  // Top-right
    positions[7] = waveHeights[2] - 4;  // Bottom-left
    positions[10] = waveHeights[3] - 4; // Bottom-right

    // Notify geometry update and recompute bounding sphere
    raftMesh.geometry.attributes.position.needsUpdate = true;
    raftMesh.geometry.computeBoundingSphere();
}
