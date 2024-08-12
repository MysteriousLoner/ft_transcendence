// ball.js

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.142.0/build/three.module.js';
import { scene } from './scene.js';

let ball, ballDirectionX = 1, ballDirectionY = 0, ballSpeed = 0.5, playerHitDirection = 0;
const maxHitAngle = Math.PI / 2; // Maximum angle for the hit direction

export function createBall() {
    const ballGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    scene.add(ball);

    ballDirectionX = 1;
    ballDirectionY = 0;
    ballSpeed = 0.025;
    ball.position.set(0, 0, 0);
}

export function moveBall() {
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