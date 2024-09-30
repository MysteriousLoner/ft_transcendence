//AiPaddle.js
import * as THREE from 'three';
import Paddle from './Paddle.js';

export default class AiPaddle extends Paddle {
    constructor() {
        super();
        this.ai = true;
        this.speed = 0.05; // Speed at which the AI paddle moves
        this.ballPosition = new THREE.Vector3(0, 0, 0); // Store the ball's current position
    }

    updateBallPosition(position) {
        // Update the AI paddle with the current ball position
        this.ballPosition.copy(position);

        // console.log("Updating ball position", this.ballPosition);
    }

    // Simple AI logic: follow the ball's y-coordinate
    followBall() {
        const ballY = this.ballPosition.y;

        // Move the AI paddle towards the ball's y-coordinate
        if (ballY > this.reference.position.y && this.reference.position.y < 2.5) {
            this.reference.position.y += this.speed;
            // console.log("Moving AI paddle up to:", this.reference.position.y);
        } else if (ballY < this.reference.position.y && this.reference.position.y > -2.5) {
            this.reference.position.y -= this.speed;
            // console.log("Moving AI paddle down to:", this.reference.position.y);
        }
    }

    // Override the animation method to follow the ball's y-coordinate
    animation() {
        this.followBall();

        // Always hit the ball straight
        this.hitDirection = 0;
    }
}