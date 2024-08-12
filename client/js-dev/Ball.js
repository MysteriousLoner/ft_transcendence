import * as THREE from 'three';

export default class Ball {
    constructor(playerPaddle, aiPaddle) {
        this.geometry = new THREE.SphereGeometry(0.1, 32, 32);
        this.material = new THREE.MeshPhongMaterial({ color: 0xffffff });
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.playerPaddle = playerPaddle;
        this.aiPaddle = aiPaddle;

        this.speed = 0.05;
        this.directionX = 1;
        this.directionY = 0;
    }

    update() {
        this.move();
        this.checkCollisions();
        if (this.aiPaddle && this.aiPaddle.ai) {
            this.updateAIPaddle();
            // console.log("Updating AI Paddle with position:", this.mesh.position);
        }
    }

    move() {
        this.mesh.position.x += this.speed * this.directionX;
        this.mesh.position.y += this.speed * this.directionY;

        if (Math.abs(this.mesh.position.y) > 2) {
            this.directionY *= -1;
        }
    }

    checkCollisions() {
        console.log("Checking collisions");
        if (this.mesh.position.x <= -4.8 && Math.abs(this.mesh.position.y - this.playerPaddle.reference.position.y) < 0.5) {
            this.directionX *= -1;
            this.directionY = Math.sin(this.playerPaddle.hitDirection);
            this.speed = (this.calculateTravelDistance() / 300).toFixed(2);
            console.log("distance left: ", this.calculateTravelDistance());
            console.log("Speed left; ", this.speed);
        } else if (this.mesh.position.x >= 4.8 && Math.abs(this.mesh.position.y - this.aiPaddle.reference.position.y) < 0.5) {
            this.directionX *= -1;
            this.directionY = 0;
            this.speed = (this.calculateTravelDistance() / 300).toFixed(2);
            console.log("Speed right; ", this.speed);
            console.log("distance right: ", this.calculateTravelDistance());
        } else if (this.mesh.position.x <= -5 || this.mesh.position.x >= 5) {
            this.reset();
        }
    }

    calculateTravelDistance() {
        const topBoundary = 2;
        const bottomBoundary = -2;
        const playerPaddleX = -4.9;
        const aiPaddleX = 4.9;
        
        let currentX = this.mesh.position.x;
        let currentY = this.mesh.position.y;
        let directionX = this.directionX;
        let directionY = this.directionY;
    
        let totalDistance = 0;
    
        while (true) {
            // Calculate distance to either top or bottom boundary
            const yToWall = directionY > 0 ? topBoundary - currentY : bottomBoundary - currentY;
            const xToWall = yToWall / Math.tan(Math.asin(directionY));
    
            // Calculate distance to the paddle in the current direction
            const xToPaddle = directionX > 0 ? aiPaddleX - currentX : currentX - playerPaddleX;
    
            if (Math.abs(xToWall) <= Math.abs(xToPaddle)) {
                // Collision with top or bottom boundary first
                totalDistance += Math.abs(xToWall);
                currentX += xToWall;
                currentY += yToWall;
                directionY = -directionY; // Reflect the direction on Y axis
            } else {
                // Collision with paddle first
                totalDistance += Math.abs(xToPaddle);
                break;
            }
        }
    
        return totalDistance.toFixed(2);
    }

    updateAIPaddle() {
        // Update AI paddle with the current ball position and movement parameters
        this.aiPaddle.updateBallPosition(this.mesh.position, this.directionX, this.directionY, this.speed);
    }

    reset() {
        this.mesh.position.set(0, 0, 0);
        this.speed = 0.05;
        this.directionX *= -1;
        this.directionY = 0; // Reset to straight direction
    }
}