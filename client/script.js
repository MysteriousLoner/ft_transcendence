// Initialize Three.js scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add lights
const pointLight = new THREE.PointLight(0xffffff);
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(pointLight, ambientLight);

// Create paddles and ball
const paddleGeometry = new THREE.BoxGeometry(0.2, 1, 0.2);
const paddleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const playerPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
const aiPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);

const ballGeometry = new THREE.SphereGeometry(0.1, 32, 32);
const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
const ball = new THREE.Mesh(ballGeometry, ballMaterial);

// Create edges for paddles
const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
const playerPaddleEdges = new THREE.LineSegments(new THREE.EdgesGeometry(paddleGeometry), edgeMaterial);
const aiPaddleEdges = new THREE.LineSegments(new THREE.EdgesGeometry(paddleGeometry), edgeMaterial);

playerPaddle.add(playerPaddleEdges);
aiPaddle.add(aiPaddleEdges);

scene.add(playerPaddle, aiPaddle, ball);

// Create cube background with edges
const cubeGeometry = new THREE.BoxGeometry(10, 5, 10);
const cubeEdges = new THREE.EdgesGeometry(cubeGeometry);
const cubeLines = new THREE.LineSegments(cubeEdges, new THREE.LineBasicMaterial({ color: 0xffffff }));
scene.add(cubeLines);

// Position the paddles and ball
playerPaddle.position.set(-4, 0, 0);
aiPaddle.position.set(4, 0, 0);
ball.position.set(0, 0, 0);

// Set camera position
camera.position.z = 5;

// Game variables
let ballDirectionX = 1;
let ballDirectionY = 0;
let ballSpeed = 0.025;
let isGameRunning = false;
let isGamePaused = false;
const travelTime = 200; // Fixed travel time in seconds

let playerPaddleMovingUp = false;
let playerPaddleMovingDown = false;
let playerHitDirection = 0;
const maxHitAngle = Math.PI / 2; // Maximum angle for the hit direction

let playerHitDirectionLeft = false;
let playerHitDirectionRight = false;

// Add a dotted line for the hit direction
const hitLineMaterial = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.1, gapSize: 0.1 });
const hitLineGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(2, 0, 0)]);
const hitDirectionLine = new THREE.Line(hitLineGeometry, hitLineMaterial);
hitDirectionLine.computeLineDistances(); // Required for dotted lines
playerPaddle.add(hitDirectionLine);

// Function to calculate and visualize ball trajectory
function calculateBallTrajectory() {
    let posX = ball.position.x;
    let posY = ball.position.y;
    let dirX = ballDirectionX;
    let dirY = ballDirectionY;
    let speed = ballSpeed;
    const pathPoints = [new THREE.Vector3(posX, posY, 0)];

    // Calculate the trajectory until the ball goes out of bounds or hits a paddle
    while (posX > -4 && posX < 4 && posY > -2.5 && posY < 2.5) {
        posX += speed * dirX;
        posY += speed * dirY;

        // Ball collision with top and bottom
        if (Math.abs(posY) > 2) {
            dirY *= -1;
        }

        if (posX < -4) posX = -4;
        if (posX > 4) posX = 4;
        if (posY < -2.5) posY = -2.5;
        if (posY > 2.5) posY = 2.5;

        // Add the current point to the path
        pathPoints.push(new THREE.Vector3(posX, posY, 0));
    }

    return pathPoints;
}

// Function to draw the ball trajectory
let trajectoryLine;
function drawBallTrajectory() {
    const pathPoints = calculateBallTrajectory();
    const trajectoryGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
    const trajectoryMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    if (trajectoryLine) {
        scene.remove(trajectoryLine);
    }
    trajectoryLine = new THREE.Line(trajectoryGeometry, trajectoryMaterial);
    scene.add(trajectoryLine);
}

function updateHitDirectionLine() {
    const length = 2; // Length of the hit direction line
    hitDirectionLine.geometry.setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(length * Math.cos(playerHitDirection), length * Math.sin(playerHitDirection), 0)
    ]);
    hitDirectionLine.geometry.attributes.position.needsUpdate = true;
}

function gameLoop() {
    if (!isGameRunning) return;

    moveBall();
    movePaddle();
    moveAiPaddle(); // Move the AI paddle
    updateHitDirection();
    updateHitDirectionLine(); // Update the hit direction line based on the current hit direction
    drawBallTrajectory(); // Draw the ball trajectory
    renderer.render(scene, camera);

    if (!isGamePaused) {
        requestAnimationFrame(gameLoop);
    }
}

function listenInput() {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'w') {
            playerPaddleMovingUp = true;
        } else if (event.key === 's') {
            playerPaddleMovingDown = true;
        } else if (event.key === 'a') {
            playerHitDirectionLeft = true;
        } else if (event.key === 'd') {
            playerHitDirectionRight = true;
        } else if (event.key === 'Escape') {
            togglePause();
        }
    });

    document.addEventListener('keyup', (event) => {
        if (event.key === 'w') {
            playerPaddleMovingUp = false;
        } else if (event.key === 's') {
            playerPaddleMovingDown = false;
        } else if (event.key === 'a') {
            playerHitDirectionLeft = false;
        } else if (event.key === 'd') {
            playerHitDirectionRight = false;
        }
    });
}

function updateHitDirection() {
    if (playerHitDirectionLeft) {
        playerHitDirection = Math.max(playerHitDirection - 0.05, -maxHitAngle); // Limit the angle
    }
    if (playerHitDirectionRight) {
        playerHitDirection = Math.min(playerHitDirection + 0.05, maxHitAngle); // Limit the angle
    }
    // console.log(playerHitDirection);
}

function movePaddle() {
    if (playerPaddleMovingUp && playerPaddle.position.y < 2) {
        playerPaddle.position.y += 0.05;
    }
    if (playerPaddleMovingDown && playerPaddle.position.y > -2) {
        playerPaddle.position.y -= 0.05;
    }
}

function moveAiPaddle() {
    const pathPoints = calculateBallTrajectory();
    if (pathPoints.length > 1) {
        const targetY = pathPoints[pathPoints.length - 1].y;

        // Move the AI paddle towards the target Y position
        if (aiPaddle.position.y < targetY) {
            aiPaddle.position.y += 0.05;
        } else if (aiPaddle.position.y > targetY) {
            aiPaddle.position.y -= 0.05;
        }

        // Ensure the AI paddle stays within the boundaries
        aiPaddle.position.y = Math.max(-2, Math.min(2, aiPaddle.position.y));
    }
}

// Function to calculate the required speed for the ball to travel a given distance in a fixed time
function calculateSpeed(distance, time) {
    return distance / time;
}

// Function to calculate the total travel distance of the ball from a paddle to the other paddle
function calculateTravelDistance() {
    const paddleX = ballDirectionX > 0 ? 3.9 : -3.9;
    const targetY = ballDirectionX > 0 ? aiPaddle.position.y : playerPaddle.position.y;

    const currentX = ball.position.x;
    const currentY = ball.position.y;
    
    const deltaY = Math.abs(targetY - currentY);
    const deltaX = Math.abs(paddleX - currentX);

    // Calculate the distance for horizontal travel to the paddle
    const distanceToPaddle = deltaX / Math.abs(ballDirectionX);
    
    // Calculate the distance for vertical bounces
    let remainingDeltaY = deltaY;
    let remainingDeltaX = deltaX;
    let totalDistance = 0;

    // Calculate the bouncing effect
    while (remainingDeltaX > 0) {
        const nextWallY = ballDirectionY > 0 ? 2 : -2;
        const distanceToWall = Math.abs((nextWallY - currentY) / ballDirectionY);
        if (distanceToWall * Math.abs(ballDirectionX) > remainingDeltaX) {
            // If we can reach the paddle before hitting the wall
            totalDistance += Math.sqrt(remainingDeltaX**2 + (remainingDeltaX / Math.abs(ballDirectionX) * Math.abs(ballDirectionY))**2);
            break;
        }
        
        totalDistance += Math.sqrt(distanceToWall**2 + (distanceToWall * Math.abs(ballDirectionX))**2);
        remainingDeltaX -= distanceToWall * Math.abs(ballDirectionX);
        ballDirectionY *= -1;
    }
    
    return totalDistance;
}

function moveBall() {
    if (playerHitDirection >= 0)
        ballDirectionY = Math.abs(ballDirectionY);
    else if (playerHitDirection < 0)
        ballDirectionY *= -1;
    console.log("direction: " + ballDirectionY);
    console.log("hit: " + playerHitDirection);
    ball.position.x += ballSpeed * ballDirectionX;
    ball.position.y += ballSpeed * ballDirectionY;
    
    // Ball collision with top and bottom
    if (Math.abs(ball.position.y) > 2) {
        ballDirectionY *= -1;
    }
    
    // Ball collision with player paddle
    if (ball.position.x <= -3.9 && Math.abs(ball.position.y - playerPaddle.position.y) < 0.5) {
        ballDirectionX *= -1;
        ballDirectionY = Math.sin(playerHitDirection);
    // Reset ball speed
    const distance = calculateTravelDistance();
    ballSpeed = calculateSpeed(distance, travelTime);
    }

    // Ball collision with AI paddle
    if (ball.position.x >= 3.9 && Math.abs(ball.position.y - aiPaddle.position.y) < 0.5) {
        ballDirectionX *= -1;
        ballDirectionY = 0; // AI always hits the ball straight back
        // Reset ball speed
        const distance = calculateTravelDistance();
        ballSpeed = calculateSpeed(distance, travelTime);
    }

    // Check for scoring
    if (ball.position.x < -4 || ball.position.x > 4) {
        ball.position.set(0, 0, 0);
        ballDirectionX = (Math.random() > 0.5) ? 1 : -1;
        ballDirectionY = 0;
    }
}

function togglePause() {
    isGamePaused = !isGamePaused;
    document.getElementById('pauseMenu').style.display = isGamePaused ? 'block' : 'none';

    if (!isGamePaused) {
        gameLoop();
    }
}

function startGame() {
    document.getElementById('score').style.display = 'block';
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('instructions').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    isGameRunning = true;
    isGamePaused = false;
    gameLoop();
}

document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('retryButton').addEventListener('click', startGame);

// Call listenInput to setup input handling
listenInput();