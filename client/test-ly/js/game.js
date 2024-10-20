// game.js

let scene, camera, renderer;
let ball, playerPaddle, opponentPaddle;
const gameMapWidth = 36, gameMapHeight = 18;

function init() {
    // Initialize Three.js Scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Initialize Game Objects
    initGameObjects();

    // Connect to WebSocket
    connectWebSocket();

    // Start the render loop
    animate();
}

function initGameObjects() {
    // Ball
    const ballGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    scene.add(ball);

    // Player Paddle
    const playerPaddleGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0)]);
    const playerPaddleMaterial = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.1, gapSize: 0.1 });
    playerPaddle = new THREE.Line(playerPaddleGeometry, playerPaddleMaterial);
    scene.add(playerPaddle);

    // Opponent Paddle
    const opponentPaddleGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0)]);
    const opponentPaddleMaterial = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.1, gapSize: 0.1 });
    opponentPaddle = new THREE.Line(opponentPaddleGeometry, opponentPaddleMaterial);
    scene.add(opponentPaddle);

    camera.position.z = 10;
}

function connectWebSocket() {
    const socket = new WebSocket('ws://127.0.0.1:8000/ws/game/pong');

    socket.onmessage = function(event) {
        const gameState = JSON.parse(event.data);
        const [ballX, ballY] = gameState.ball.split(',').map(Number);
        const [playerX, playerY] = gameState.player_paddle.split(',').map(Number);
        const [opponentX, opponentY] = gameState.opponent_paddle.split(',').map(Number);

        // Update positions based on game state
        updateGameObjects(ballX, ballY, playerY, opponentY);
    };

    socket.onclose = function(event) {
        console.error('WebSocket closed:', event);
    };
}

function updateGameObjects(ballX, ballY, playerY, opponentY) {
    // Scale and position values based on screen size
    ball.position.set(ballX - (gameMapWidth / 2), ballY - (gameMapHeight / 2), 0);
    playerPaddle.position.set(-gameMapWidth / 2 + 0.5, playerY - (gameMapHeight / 2), 0);
    opponentPaddle.position.set(gameMapWidth / 2 - 0.5, opponentY - (gameMapHeight / 2), 0);
    console.log('Ball:', ball.position, 'Player:', playerPaddle.position, 'Opponent:', opponentPaddle.position);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Event Listener for Window Resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// Start the game
init();
