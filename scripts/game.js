import PongAI from './ai.js';
import Leaderboard from './leaderboard.js';
import Tournament from './tournament.js';

let scene, camera, renderer, paddle1, paddle2, ball, room;
let player1Score = 0, player2Score = 0;
let gameMode = '';
let ai, leaderboard, tournament;
let player1Name = 'Player 1', player2Name = 'Player 2';

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

    ai = new PongAI(paddle2);
    leaderboard = new Leaderboard();
    tournament = new Tournament(startGame);

    initAudio();
    resetBall();
    initTournamentDisplay();
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
        ai.update(ball.position);
    }

    renderer.render(scene, camera);
}

function updateScore() {
    document.getElementById('score').innerText = `${player1Name}: ${player1Score} | ${player2Name}: ${player2Score}`;
    if (player1Score >= 5 || player2Score >= 5) {
        endGame();
    }
}

function endGame() {
    const winner = player1Score >= 5 ? player1Name : player2Name;
    document.getElementById('result').innerText = `${winner} wins!`;
    document.getElementById('gameOver').style.display = 'block';
    
    if (gameMode === 'tournament') {
        setTimeout(() => {
            document.getElementById('gameOver').style.display = 'none';
            tournament.updateBracket(winner);
        }, 2000);
    } else {
        showNicknameInput();
    }
}

function showNicknameInput() {
    document.getElementById('nicknameInput').style.display = 'block';
    document.getElementById('playAgain').style.display = 'none';
}

function hideNicknameInput() {
    document.getElementById('nicknameInput').style.display = 'none';
    document.getElementById('playAgain').style.display = 'inline-block';
}

function onMouseMove(event) {
    if (gameMode === 'singlePlayer') {
        const rect = renderer.domElement.getBoundingClientRect();
        const y = ((event.clientY - rect.top) / rect.height) * 600 - 300;
        paddle1.position.y = Math.max(Math.min(y, 250), -250);
    }
}

function onKeyDown(event) {
    if (gameMode === 'multiPlayer' || gameMode === 'tournament') {
        const key = event.key.toLowerCase();
        if (key === 'w' && paddle1.position.y < 250) paddle1.position.y += 10;
        if (key === 's' && paddle1.position.y > -250) paddle1.position.y -= 10;
        if (key === 'arrowup' && paddle2.position.y < 250) paddle2.position.y += 10;
        if (key === 'arrowdown' && paddle2.position.y > -250) paddle2.position.y -= 10;
    }
}

function startGame(mode, players = []) {
    gameMode = mode;
    document.getElementById('startMenu').style.display = 'none';
    document.getElementById('gameUI').style.display = 'block';
    document.getElementById('bracketDisplay').style.display = mode === 'tournament' ? 'block' : 'none';
    
    if (mode === 'singlePlayer') {
        player1Name = 'Player';
        player2Name = 'AI';
        document.getElementById('instructions').innerText = 'Move the mouse up and down to control the paddle';
    } else if (mode === 'multiPlayer') {
        player1Name = 'Player 1';
        player2Name = 'Player 2';
        document.getElementById('instructions').innerText = 'Player 1: W and S keys | Player 2: Up and Down arrow keys';
    } else if (mode === 'tournament') {
        [player1Name, player2Name] = players;
        document.getElementById('instructions').innerText = `${player1Name}: W and S keys | ${player2Name}: Up and Down arrow keys`;
    }
    
    hideNicknameInput();
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

function hideGameOver() {
    document.getElementById('gameOver').style.display = 'none';
}

function saveScore() {
    const nickname = document.getElementById('nickname').value;
    const score = Math.max(player1Score, player2Score);
    leaderboard.saveScore(nickname, score);
    showLeaderboard();
}

function showLeaderboard() {
    document.getElementById('startMenu').style.display = 'none';
    document.getElementById('gameUI').style.display = 'none';
    document.getElementById('leaderboard').style.display = 'block';
    
    leaderboard.displayLeaderboard();
}

function initTournament() {
    document.getElementById('startMenu').style.display = 'none';
    document.getElementById('tournamentSetup').style.display = 'block';
    document.getElementById('bracketDisplay').style.display = 'block';
    
    let playerCount = prompt("Enter the number of players for the tournament:");
    tournament.initTournament(parseInt(playerCount));
}

function initTournamentDisplay() {
    const bracketScene = new THREE.Scene();
    const bracketCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const bracketRenderer = new THREE.WebGLRenderer();
    bracketRenderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('bracketDisplay').appendChild(bracketRenderer.domElement);

    bracketCamera.position.z = 5;

    const brackets = [];

    function updateBrackets(tournamentData) {
        // Remove old brackets
        brackets.forEach(bracket => bracketScene.remove(bracket));
        brackets.length = 0;

        // Create new brackets
        tournamentData.forEach((round, roundIndex) => {
            round.forEach((player, playerIndex) => {
                const geometry = new THREE.BoxGeometry(1, 0.5, 0.1);
                const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
                const bracket = new THREE.Mesh(geometry, material);
                bracket.position.set(roundIndex * 1.5 - 2, playerIndex * 0.6 - round.length * 0.3 + 0.3, 0);
                bracketScene.add(bracket);
                brackets.push(bracket);

                // Add player name
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                context.font = '24px Arial';
                context.fillStyle = 'black';
                context.fillText(player || 'TBD', 0, 24);
                const texture = new THREE.CanvasTexture(canvas);
                const textMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
                const textGeometry = new THREE.PlaneGeometry(0.8, 0.2);
                const textMesh = new THREE.Mesh(textGeometry, textMaterial);
                textMesh.position.set(bracket.position.x, bracket.position.y, 0.05);
                bracketScene.add(textMesh);
            });
        });
    }

    function animateBrackets() {
        requestAnimationFrame(animateBrackets);
        bracketRenderer.render(bracketScene, bracketCamera);
    }

    animateBrackets();

    // Expose the updateBrackets function
    tournament.updateBracketsDisplay = updateBrackets;
}

document.getElementById('singlePlayerBtn').addEventListener('click', () => startGame('singlePlayer'));
document.getElementById('multiPlayerBtn').addEventListener('click', () => startGame('multiPlayer'));
document.getElementById('tournamentBtn').addEventListener('click', initTournament);
document.getElementById('playAgain').addEventListener('click', resetGame);
document.getElementById('backToMenu').addEventListener('click', () => {
    document.getElementById('gameUI').style.display = 'none';
    document.getElementById('startMenu').style.display = 'block';
});
document.getElementById('saveScore').addEventListener('click', () => {
    saveScore();
    hideNicknameInput();
});
document.getElementById('showLeaderboardBtn').addEventListener('click', showLeaderboard);
document.getElementById('backToMenuFromLeaderboard').addEventListener('click', () => {
    document.getElementById('leaderboard').style.display = 'none';
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