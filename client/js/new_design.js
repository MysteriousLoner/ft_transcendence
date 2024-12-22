// Front-end dimensions -------------------------------------------------------
let     cuboidWidth = 15, cuboidHeight = 10, cuboidDepth = 0.25,
        paddleWidth = 0.2, paddleHeight = 1.5, paddleDepth = 0.25,
        ballRadius = 0.125, cameraZ = 10;

// Create a scene ------------------------------------------------------------
var scene = new THREE.Scene();

// Create a camera -----------------------------------------------------------
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = cameraZ;

// Create a renderer and add it to the DOM -----------------------------------
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a cuboid geometry, material ----------------------------------------
let cuboidColor = 0x00ff00;
var geometry = new THREE.BoxGeometry(cuboidWidth, cuboidHeight, cuboidDepth) // width, height, depth
var wireframe = new THREE.WireframeGeometry( geometry );
var edges = new THREE.EdgesGeometry( geometry );
var mesh_material = new THREE.MeshBasicMaterial({ color: cuboidColor});
var line_material = new THREE.LineBasicMaterial({ color: cuboidColor });
var cuboid = new THREE.LineSegments(edges, line_material);

// Create paddles geometry, material -----------------------------------------
let paddle_color = 0xffff00;
var paddleGeometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth);
var paddleMaterial = new THREE.MeshBasicMaterial({ color: paddle_color });
var leftPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
var rightPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
leftPaddle.position.set(-cuboidWidth/2, 0, 0);
rightPaddle.position.set(cuboidWidth/2, 0, 0);

// Create ball geometry, material --------------------------------------------
var ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
var ball_wireframe = new THREE.WireframeGeometry(ballGeometry);
var ball_edges = new THREE.EdgesGeometry(ballGeometry);
var ballMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
var ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.position.set(0, 0, 0);

// Create a ball target ------------------------------------------------------
var ballTargetMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
var ballTarget = new THREE.Mesh(ballGeometry, ballTargetMaterial);

// Create paddle collision particles -------------------------------------------------

function createExplosion(x, y, z, direction) {
    const particleCount = 75; // Number of particles
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3); // 3 values per particle (x, y, z)
    
    if (direction == 'left' || direction == 'right')
        explosion_color = paddle_color;
    if (direction == 'top' || direction == 'bottom')
        explosion_color = cuboidColor;

    const particleMaterial = new THREE.PointsMaterial({ color: explosion_color, size: 0.05, transparent: true, opacity: 0.8 });

    // Create the particles
    for (let i = 0; i < particleCount; i++) {
        if (direction == 'left')
            positions[i * 3] = x + Math.random() * 0.2; // Shift x to spread left
        else if (direction == 'right')
            positions[i * 3] = x - Math.random() * 0.2; // Shift x to spread right
        else
            positions[i * 3] = x + (Math.random() - 0.5) * 2;

        if (direction == 'top')
            positions[i * 3 + 1] = y - Math.random() * 0.2; // Shift y to spread up
        else if (direction == 'bottom')
            positions[i * 3 + 1] = y + Math.random() * 0.2; // Shift y to spread down
        else
            positions[i * 3 + 1] = y + (Math.random() - 0.5) * 2;


        positions[i * 3 + 2] = z + (Math.random() - 0.5) * 2; // Keep z spread as before
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleSystem = new THREE.Points(particles, particleMaterial);

    // Add particle system to the scene
    group.add(particleSystem);


    // Animate opacity
    let elapsed = 0;
    const duration = 1000; // 1 second

    const fadeAnimation = () => {
        elapsed += 16; // Approximately 16ms per frame
        const t = elapsed / duration;

        if (t <= 0.5) {
            // Fade in
            particleMaterial.opacity = t * 2; // Linearly interpolate from 0 to 1 over the first half of the duration
        } else if (t <= 1) {
            // Fade out
            particleMaterial.opacity = 2 - t * 2; // Linearly interpolate from 1 to 0 over the second half
        } else {
            // Remove particle system
            group.remove(particleSystem);
            return; // Stop animation
        }

        requestAnimationFrame(fadeAnimation);
    };

    fadeAnimation(); // Start the animation
}

function checkBallPaddleCollision() {
    if (ball.position.x - ballRadius <= leftPaddle.position.x + paddleWidth/2 &&
        ball.position.y - ballRadius <= leftPaddle.position.y + paddleHeight/2 &&
        ball.position.y + ballRadius >= leftPaddle.position.y - paddleHeight/2) {
        return 'left';
    }
    else if (ball.position.x + ballRadius >= rightPaddle.position.x - paddleWidth/2 &&
        ball.position.y - ballRadius <= rightPaddle.position.y + paddleHeight/2 &&
        ball.position.y + ballRadius >= rightPaddle.position.y - paddleHeight/2) {
        return 'right';
    }
    else if (ball.position.y + ballRadius >= cuboidHeight/2)
        return 'top';
    else if (ball.position.y - ballRadius <= -cuboidHeight/2)
        return 'bottom';
    else {
        return 'none';
    }
}

// Create snowfall effect -----------------------------------------------------
function createSnowfall(cuboidWidth, cuboidHeight, cuboidDepth, snowfallCount, scene) {

    // Create snowflake geometry
    const snowflakes = new THREE.BufferGeometry();
    const snowflakePositions = new Float32Array(snowfallCount * 3);

    // Initialize snowflake positions
    for (let i = 0; i < snowfallCount; i++) {
        snowflakePositions[i * 3] = (Math.random() - 0.5) * cuboidWidth; // Random x
        snowflakePositions[i * 3 + 1] = (Math.random() - 0.5) * cuboidHeight;   // Random y (top to bottom)
        snowflakePositions[i * 3 + 2] = (Math.random() - 0.5) * cuboidDepth; // Random z
    }

    snowflakes.setAttribute('position', new THREE.BufferAttribute(snowflakePositions, 3));

    // Material for snowflakes
    const snowflakeMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.05,
        transparent: true,
        opacity: 0.8
    });

    // Create the particle system
    const snowfallSystem = new THREE.Points(snowflakes, snowflakeMaterial);
    scene.add(snowfallSystem); // Add to the scene
    

    // Function to animate snowfall
    function animateSnowfall() {
        for (let i = 0; i < snowfallCount; i++) {
            snowflakePositions[i * 3 + 1] -= 0.02; // Snowflake falling down
            if (snowflakePositions[i * 3 + 1] < -cuboidHeight / 2) { 
                // Reset snowflake to top when it goes below the cuboid
                snowflakePositions[i * 3 + 1] = cuboidHeight / 2;
            }
        }
        snowfallSystem.geometry.attributes.position.needsUpdate = true; // Notify Three.js to update positions
    }

    function removeSnowfall() {
        scene.remove(snowfallSystem); // Remove the particle system from the scene
        snowfallSystem.geometry.dispose(); // Dispose of the geometry
        snowfallSystem.material.dispose(); // Dispose of the material
    }

    return { animateSnowfall, removeSnowfall } ; // Return the animation function
}

let snowfallActive = false;  // Flag to track snowfall state
let snowfallFunctions = null;  // To store the snowfall functions (animation and removal)

function toggleSnowfall() {
    if (snowfallActive) {
        // If snowfall is active, remove and stop it
        if (snowfallFunctions) {
            snowfallFunctions.removeSnowfall(); // Remove snowfall from the scene
        }
        snowfallActive = false;  // Set flag to false
    } else {
        // If snowfall is not active, create and animate it
        snowfallFunctions = createSnowfall(10, 10, 10, 500, group); // Create snowfall
        snowfallActive = true;  // Set flag to true
    }
}


// Create a group to hold cuboid and paddles ---------------------------------
var group = new THREE.Group();
group.add(cuboid);
group.add(leftPaddle);
group.add(rightPaddle);
group.add(ball);
group.add(ballTarget);
// group.add(snowfallSystem);


// Add to scene --------------------------------------------------------------
// scene.add(cuboid);
// scene.add(leftPaddle);
// scene.add(rightPaddle);
scene.add(group);


// Handle window resize ------------------------------------------------------
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Websocket connection ------------------------------------------------------
let     scoreLeft = 4, scoreRight = 2, DOMloaded =- false, ballSpeedX = 0, ballSpeedY = 0,
        socket = new WebSocket('ws://127.0.0.1:8000/ws/game/pong');
const keys = {
    w: false,
    s: false,
    ArrowUp: false,
    ArrowDown: false,
    AI_L: false,
    AI_R:  false,
    Ball_Predict_Point: false,
    Collision_Particles: false,
    Snowfall: false,
    AI_Mode: false, // true: chad, false: noob
}
const key_rotate = {
    i: false,
    k: false,
    j: false,
    l: false,
    u: false,
    o: false,
    '=': false,
    '-': false,
    r: false
}

function updateElement() {
    if (!DOMloaded)
        return;
    document.getElementById('score').textContent = `${scoreLeft} : ${scoreRight}`;
    document.getElementById('position').textContent = `Rotation: (x: ${group.rotation.x.toFixed(2)}, y: ${group.rotation.y.toFixed(2)}, z: ${group.rotation.z.toFixed(2)})`;
    document.getElementById('scale').textContent = `Camera: (z: ${camera.position.z.toFixed(2)})`;
    document.getElementById('leftPaddlePosition').textContent = `Left Paddle (y: ${leftPaddle.position.y.toFixed(2)})`;
    document.getElementById('rightPaddlePosition').textContent = `Right Paddle (y: ${rightPaddle.position.y.toFixed(2)})`;
    // document.getElementById('ballPosition').textContent = `Ball (x: ${ball.position.x.toFixed(2)}, y: ${ball.position.y.toFixed(2)})`;
    document.getElementById('ballSpeed').textContent = `Ball Speed (x: ${ballSpeedX.toFixed(4)}, y: ${ballSpeedY.toFixed(4)})`;
    
}

document.addEventListener('click', function(event) {
    toggle(event.target, 'AI_Left', 'AI_L', 'Enable AI L', 'Disable AI L');
    toggle(event.target, 'AI_Right', 'AI_R', 'Enable AI R', 'Disable AI R');
    toggle(event.target, 'Ball_Predict_Point', 'Ball_Predict_Point', 'Show Ball Prediction', 'Hide Ball Prediction');
    toggle(event.target, 'Collision_Particles', 'Collision_Particles', 'Enable Collision Particles', 'Disable Collision Particles');
    toggle(event.target, 'Snowfall', 'Snowfall', 'Enable Snowfall', 'Disable Snowfall');
    toggle(event.target, 'AI_Prediction', 'AI_Mode', 'Enable Pro AI', 'Disable Pro AI');
});

function toggle(target, buttonId, key, enableText, disableText) {
    const button = document.getElementById(buttonId);
    if (target === button) {
        button.classList.toggle('active');
        if (button.classList.contains('active')) {
            keys[key] = true;
            button.textContent = disableText;
        } else {
            keys[key] = false;
            button.textContent = enableText;
        }

        if (key == 'Snowfall') {
            toggleSnowfall();
        }
    }
}


function connectWebSocket() {
    socket.onmessage = function(event) {
        const gameState = JSON.parse(event.data);
        updateGameObjects(gameState);
        // updateElement();
    };

    socket.onclose = function(event) {
        console.error('WebSocket closed:', event);
    };
};

function updateGameObjects(gameState) {
    const gameStateString = JSON.stringify(gameState);
    // console.log(gameStateString);

    [cuboidWidth, cuboidHeight, cuboidDepth] = gameState.cuboid.split(',').map(Number);
    [ballRadius, ball.position.x, ball.position.y, ball.position.z] = gameState.ball.split(',').map(Number);

    [paddleWidth, paddleHeight, paddleDepth] = gameState.paddle_dimensions.split(',').map(Number);
    [leftPaddle.position.x, leftPaddle.position.y, leftPaddle.position.z] = gameState.leftPaddle.split(',').map(Number);
    [rightPaddle.position.x, rightPaddle.position.y, rightPaddle.position.z] = gameState.rightPaddle.split(',').map(Number);
    [scoreLeft, scoreRight] = gameState.score.split(',').map(Number);
    [ballTarget.position.x, ballTarget.position.y, ballTarget.position.z] = gameState.ballTarget.split(',').map(Number);
    [ballSpeedX, ballSpeedY] = gameState.ballSpeed.split(',').map(Number);
}

// Initiliaze elements -------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    DOMloaded = true;
    updateElement();
});

document.addEventListener('keydown', (event) => {
    if (event.key in keys) {
        keys[event.key] = true;
        console.log(event.key);
    }
    else if (event.key in key_rotate) {
        key_rotate[event.key] = true;
        console.log(event.key);
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key in keys) {
        keys[event.key] = false;
        console.log(event.key);
    }
    else if (event.key in key_rotate) {
        key_rotate[event.key] = false;
        console.log(event.key);
    }
});

function sendMessage() {
    if (socket.readyState == socket.OPEN)
        socket.send(JSON.stringify({ 'keys': keys }));
}

// Handle events for rotation ----------------------------------------
function rotateBoard() {
    let rotateSpeed = 0.025;
    const actions = {
        'i': () => group.rotation.x -= rotateSpeed, // rotate around x-axis
        'k': () => group.rotation.x += rotateSpeed,
        'j': () => group.rotation.y -= rotateSpeed, // rotate around y-axis
        'l': () => group.rotation.y += rotateSpeed,
        'u': () => group.rotation.z += rotateSpeed, // rotate around z-axis
        'o': () => group.rotation.z -= rotateSpeed,
        '=': () => camera.position.z -= rotateSpeed * 5, // zoom in/out
        '-': () => camera.position.z += rotateSpeed * 5,
        'r': () => {
            group.rotation.x = group.rotation.y = group.rotation.z = 0;
            camera.position.z = cameraZ;
        }
    };
    for (const key in key_rotate) {
        if (key_rotate[key] && key in actions) {
            actions[key]();
        }
    }
}

// Animation loop ------------------------------------------------------------

function visual_toogle() {
    let ballCollision = checkBallPaddleCollision();
    if (ballCollision != 'none' && keys['Collision_Particles'])
        createExplosion(ball.position.x, ball.position.y, ball.position.z, ballCollision);

    if (keys['Ball_Predict_Point'])
        ballTarget.visible = true;
    else
        ballTarget.visible = false;

    if (snowfallActive && snowfallFunctions) {
        snowfallFunctions.animateSnowfall(); // Animate snowfall if active
    }
}

function animate() {
    sendMessage();
    rotateBoard();
    updateElement();
    visual_toogle();

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

connectWebSocket();
animate();

