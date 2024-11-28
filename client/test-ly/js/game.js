// game.js
let scene, camera, renderer;
let ball, playerPaddle, opponentPaddle;
const gameMapWidth = 36, gameMapHeight = 18;
const boxWidth = 15, boxHeight = 10;

function init() {
    // Initialize Three.js Scene
    // set the scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    camera.position.z = 5;
// White box 
    const cubeGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, 5); 
    const cubeEdges = new THREE.EdgesGeometry(cubeGeometry); 
    const cubeLines = new THREE.LineSegments(cubeEdges, new THREE.LineBasicMaterial({ color: 0xffffff })); 
    scene.add(cubeLines);
    const pointLight = new THREE.PointLight(0xffffff, 3, 100);
    pointLight.position.set(2, 2, 5);
    scene.add(pointLight);
    const ambientLight = new THREE.AmbientLight(0xc0c0c0);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(-5, 5, 5).normalize();
    scene.add(directionalLight);
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
    const playerPaddleGeometry = new THREE.BoxGeometry(boxWidth * 0.05, boxHeight * 0.2, 1);
    const playerPaddleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const edgesGeometry = new THREE.EdgesGeometry(playerPaddleGeometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    playerPaddle = new THREE.Line(playerPaddleGeometry, playerPaddleMaterial);
    // playerPaddle.add(edges);
    scene.add(playerPaddle);

    // Opponent Paddle
    const opponentPaddleGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0)]);
    const opponentPaddleMaterial = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.1, gapSize: 0.1 });
    opponentPaddle = new THREE.Line(playerPaddleGeometry, playerPaddleMaterial);
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
    // Scale and position values based on box dimensions
    const scaledBallX = ballX * (boxWidth / gameMapWidth); 
    const scaledBallY = ballY * (boxHeight / gameMapHeight);
    const scaledPlayerPaddleY = playerY * (boxHeight / gameMapHeight);
    const scaledOpponentPaddleY = opponentY * (boxHeight / gameMapHeight);

    ball.position.set(scaledBallX - (boxWidth / 2), scaledBallY - (boxHeight / 2), 0);
    playerPaddle.position.set(-boxWidth / 2 + 0.5, scaledPlayerPaddleY - (boxHeight / 2), 0);
    opponentPaddle.position.set(boxWidth / 2 - 0.5, scaledOpponentPaddleY - (boxHeight / 2), 0);

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
