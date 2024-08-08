let scene, camera, renderer, paddle1, paddle2, ball, room;
let player1Score = 0, player2Score = 0;
let gameMode = '';

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create wireframe room
    const roomGeometry = new THREE.BoxGeometry(800, 600, 1000);
    const roomEdgesGeometry = new THREE.EdgesGeometry(roomGeometry);
    const roomEdgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    room = new THREE.LineSegments(roomEdgesGeometry, roomEdgesMaterial);
    scene.add(room);

    // Create paddles and ball
    const paddleGeometry = new THREE.BoxGeometry(10, 100, 10);
    const paddleMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    paddle1 = new THREE.Mesh(paddleGeometry, paddleMaterial);
    paddle2 = new THREE.Mesh(paddleGeometry, paddleMaterial);
    paddle1.position.set(-350, 0, 0);
    paddle2.position.set(350, 0, 0);
    scene.add(paddle1);
    scene.add(paddle2);

    const ballGeometry = new THREE.SphereGeometry(5, 32, 32);
    const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    scene.add(ball);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const light = new THREE.PointLight(0xffffff, 1, 1000);
    light.position.set(0, 0, 100);
    scene.add(light);

    camera.position.z = 400;

    initAudio();
    resetBall();
}

function resetBall() {
    ball.position.set(0, 0, 0);
    ball.userData.velocity = new THREE.Vector3(
        (Math.random() > 0.5 ? 1 : -1) * 3,
        Math.random() * 2 - 1,
        0
    );
}

function animate() {
    requestAnimationFrame(animate);

    // Update ball position
    ball.position.add(ball.userData.velocity);

    // Ball collision with top and bottom
    if (Math.abs(ball.position.y) > 290) {
        ball.userData.velocity.y *= -1;
        playNote();
    }

    // Ball collision with paddles
    if (ball.position.x < -340 && ball.position.y > paddle1.position.y - 50 && ball.position.y < paddle1.position.y + 50) {
        ball.userData.velocity.x *= -1.1;
        playNote();
    }
    if (ball.position.x > 340 && ball.position.y > paddle2.position.y - 50 && ball.position.y < paddle2.position.y + 50) {
        ball.userData.velocity.x *= -1.1;
        playNote();
    }

    // Scoring
    if (ball.position.x < -400) {
        player2Score++;
        updateScore();
        resetBall();
    } else if (ball.position.x > 400) {
        player1Score++;
        updateScore();
        resetBall();
    }

    // AI paddle movement (only in single player mode)
    if (gameMode === 'singlePlayer') {
        paddle2.position.y += (ball.position.y - paddle2.position.y) * 0.1;
        paddle2.position.y = Math.max(Math.min(paddle2.position.y, 250), -250);
    }

    renderer.render(scene, camera);
}

function updateScore() {
    document.getElementById('score').innerText = `Player 1: ${player1Score} | Player 2: ${player2Score}`;
    if (player1Score >= 5 || player2Score >= 5) {
        endGame();
    }
}

function endGame() {
    const winner = player1Score >= 5 ? "Player 1" : "Player 2";
    document.getElementById('result').innerText = `${winner} wins!`;
    document.getElementById('gameOver').style.display = 'block';
}

function onMouseMove(event) {
    if (gameMode === 'singlePlayer') {
        const rect = renderer.domElement.getBoundingClientRect();
        const y = ((event.clientY - rect.top) / rect.height) * 600 - 300;
        paddle1.position.y = Math.max(Math.min(y, 250), -250);
    }
}

function onKeyDown(event) {
    if (gameMode === 'multiPlayer') {
        const key = event.key.toLowerCase();
        if (key === 'w' && paddle1.position.y < 250) paddle1.position.y += 10;
        if (key === 's' && paddle1.position.y > -250) paddle1.position.y -= 10;
        if (key === 'arrowup' && paddle2.position.y < 250) paddle2.position.y += 10;
        if (key === 'arrowdown' && paddle2.position.y > -250) paddle2.position.y -= 10;
    }
}

function showGameOver(result) {
    document.getElementById('result').innerText = result;
    document.getElementById('gameOver').style.display = 'block';
}

function hideGameOver() {
    document.getElementById('gameOver').style.display = 'none';
}

function startGame(mode) {
    gameMode = mode;
    document.getElementById('startMenu').style.display = 'none';
    document.getElementById('gameUI').style.display = 'block';
    if (mode === 'singlePlayer') {
        document.getElementById('instructions').innerText = 'Move the mouse up and down to control the paddle';
    } else {
        document.getElementById('instructions').innerText = 'Player 1: W and S keys | Player 2: Up and Down arrow keys';
    }
    resetGame();
    animate();
}

function resetGame() {
    player1Score = 0;
    player2Score = 0;
    updateScore();
    hideGameOver();
    resetBall();
    paddle1.position.y = 0;
    paddle2.position.y = 0;
}

document.getElementById('singlePlayerBtn').addEventListener('click', () => startGame('singlePlayer'));
document.getElementById('multiPlayerBtn').addEventListener('click', () => startGame('multiPlayer'));
document.getElementById('playAgain').addEventListener('click', resetGame);
document.getElementById('backToMenu').addEventListener('click', () => {
    document.getElementById('gameUI').style.display = 'none';
    document.getElementById('startMenu').style.display = 'block';
});

document.addEventListener('mousemove', onMouseMove);
document.addEventListener('keydown', onKeyDown);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();