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
var geometry = new THREE.BoxGeometry(cuboidWidth, cuboidHeight, cuboidDepth) // width, height, depth
var wireframe = new THREE.WireframeGeometry( geometry );
var edges = new THREE.EdgesGeometry( geometry );
var mesh_material = new THREE.MeshBasicMaterial({ color: 0x00ff00});
var line_material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
var cuboid = new THREE.LineSegments(edges, line_material);

// Create paddles geometry, material -----------------------------------------
var paddleGeometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth);
var paddleMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
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

// Create a group to hold cuboid and paddles ---------------------------------
var group = new THREE.Group();
group.add(cuboid);
group.add(leftPaddle);
group.add(rightPaddle);
group.add(ball);


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

// Handle keydown events for rotation ----------------------------------------
window.addEventListener('keydown', function(event) {
    switch (event.key) {
        case 'i': // rotate up
            group.rotation.x -= 0.1;
            break;
        case 'k': // rotate down
            group.rotation.x += 0.1;
            break;
        case 'j': // rotate left
            group.rotation.y -= 0.1;
            break;
        case 'l': // rotate right
            group.rotation.y += 0.1;
            break;
        case 'u': // rotate clockwise
            group.rotation.z += 0.1;
            break;
        case 'o': // rotate counterclockwise
            group.rotation.z -= 0.1;
            break;
        case '=': // scale up
            camera.position.z -= 0.5;
            break;
        case '-': // scale down
            camera.position.z += 0.5;
            break;
        case 'r': // reset
            group.rotation.x = 0;
            group.rotation.y = 0;
            group.rotation.z = 0;
            camera.position.z = cameraZ;
            break;
    }
})


// Websocket connection ------------------------------------------------------
let     scoreLeft = 4, scoreRight = 2, DOMloaded =- false;
        socket = new WebSocket('ws://127.0.0.1:8000/ws/game/pong');
const keys = {
    w: false,
    s: false,
    ArrowUp: false,
    ArrowDown: false
}

function updateElement() {
    if (!DOMloaded)
        return;
    document.getElementById('score').textContent = `${scoreLeft} : ${scoreRight}`;
    document.getElementById('position').textContent = `Rotation: (x: ${group.rotation.x.toFixed(2)}, y: ${group.rotation.y.toFixed(2)}, z: ${group.rotation.z.toFixed(2)})`;
    document.getElementById('scale').textContent = `Camera: (z: ${camera.position.z.toFixed(2)})`;
    document.getElementById('leftPaddlePosition').textContent = `Left Paddle (y: ${leftPaddle.position.y.toFixed(2)})`;
    document.getElementById('rightPaddlePosition').textContent = `Right Paddle (y: ${rightPaddle.position.y.toFixed(2)})`;
    document.getElementById('ballPosition').textContent = `Ball (x: ${ball.position.x.toFixed(2)}, y: ${ball.position.y.toFixed(2)})`;
}

function connectWebSocket() {
    socket.onmessage = function(event) {
        const gameState = JSON.parse(event.data);
        updateGameObjects(gameState);
        updateElement();
    };

    socket.onclose = function(event) {
        console.error('WebSocket closed:', event);
    };
};

function updateGameObjects(gameState) {
    const gameStateString = JSON.stringify(gameState);
    console.log(gameStateString);

    [cuboidWidth, cuboidHeight, cuboidDepth] = gameState.cuboid.split(',').map(Number);
    [ballRadius, ball.position.x, ball.position.y, ball.position.z] = gameState.ball.split(',').map(Number);

    [paddleWidth, paddleHeight, paddleDepth] = gameState.paddle_dimensions.split(',').map(Number);
    [leftPaddle.position.x, leftPaddle.position.y, leftPaddle.position.z] = gameState.leftPaddle.split(',').map(Number);
    [rightPaddle.position.x, rightPaddle.position.y, rightPaddle.position.z] = gameState.rightPaddle.split(',').map(Number);
    [scoreLeft, scoreRight] = gameState.score.split(',').map(Number);
    console.log(scoreLeft, scoreRight);
}

// Initiliaze elements -------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    DOMloaded = true;
    updateElement()
});

document.addEventListener('keydown', (event) => {
    if (event.key in keys) {
        keys[event.key] = true;
        console.log(event.key);
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key in keys) {
        keys[event.key] = false;
        console.log(event.key);
    }
});

function movePaddles(){
    if (socket.readyState == socket.OPEN)
        socket.send(JSON.stringify({ 'keys': keys }));
}


// function sendMessage(message) {
//     if (socket.readyState == WebSocket.OPEN) {
//         socket.send(JSON.stringify(message));
//         console.log("sending message");
//     }
// }

// document.addEventListener('keydown', (event) => {
//     let action = '';
//     if (event.key === 'w' || event.key === 's' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
//         action = event.key;
//         socket.send(JSON.stringify({ 'action': action }));
//     };
//     console.log("sending message: " + action);
// });

// Animation loop ------------------------------------------------------------

function animate() {
    movePaddles();
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}   

function startGame() {
    connectWebSocket();
    animate();
}

