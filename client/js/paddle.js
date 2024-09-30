// paddle.js

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.142.0/build/three.module.js';
import { scene } from './scene.js';
import { ball } from './ball.js';

let playerPaddle, aiPaddle;
let playerPaddleMovingUp = false;
let playerPaddleMovingDown = false;

export function createPaddles() {
    const paddleGeometry = new THREE.BoxGeometry(0.2, 1, 0.2);
    const paddleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    playerPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
    aiPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);

    scene.add(playerPaddle, aiPaddle);
    playerPaddle.position.set(-4, 0, 0);
    aiPaddle.position.set(4, 0, 0);
}

export function movePaddle() {
    if (playerPaddleMovingUp && playerPaddle.position.y < 2) {
        playerPaddle.position.y += 0.05;
    }
    if (playerPaddleMovingDown && playerPaddle.position.y > -2) {
        playerPaddle.position.y -= 0.05;
    }
}

export function moveAiPaddle() {
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
