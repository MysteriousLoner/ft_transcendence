//Ball.js
import * as THREE from 'three';

export default class Ball {
    constructor(playerPaddle, aiPaddle) {
        this.geometry = new THREE.SphereGeometry(0.1, 32, 32);
        this.material = new THREE.MeshPhongMaterial({ color: 0xffffff });
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.playerPaddle = playerPaddle;
        this.aiPaddle = aiPaddle;

        this.speed = 0.1;
        this.directionX = 1;
        this.directionY = 0;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.currentOscillator = null;

        this.lastNote = null;
        this.startTime = null; // To store the start time of the travel
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
        // console.log("Checking collisions");
        if (this.mesh.position.x <= -4.8 && Math.abs(this.mesh.position.y - this.playerPaddle.reference.position.y) < 0.5) {
            this.directionX *= -1;
            this.directionY = Math.sin(this.playerPaddle.hitDirection);
            this.speed = (this.calculateTravelDistance() / 200).toFixed(2);

            this.logTravelTime(); // Log the travel time

            this.playNoteForPosition(this.mesh.position.y);
        } else if (this.mesh.position.x >= 4.8 && Math.abs(this.mesh.position.y - this.aiPaddle.reference.position.y) < 0.5) {
            this.directionX *= -1;
            this.directionY = 0;
            this.speed = (this.calculateTravelDistance() / 200).toFixed(2);

            this.logTravelTime(); // Log the travel time

            this.playNoteForPosition(this.mesh.position.y);
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

    logTravelTime() {
        const now = performance.now();

        if (this.startTime) {
            const travelTime = (now - this.startTime) / 1000; // Convert to seconds
            console.log(`Travel time: ${travelTime.toFixed(2)} seconds`);
        }

        // Set the new start time
        this.startTime = now;
    }

    updateAIPaddle() {
        // Update AI paddle with the current ball position and movement parameters
        this.aiPaddle.updateBallPosition(this.mesh.position, this.directionX, this.directionY, this.speed);
    }

    playNoteForPosition(y) {
        const scale = ['G', 'A', 'B', 'C', 'D', 'E', 'F', 'G2']; // Major scale notes
        const zoneHeight = 4 / scale.length; // Height of each zone

        let noteIndex = Math.floor((y + 2) / zoneHeight);
        noteIndex = Math.max(0, Math.min(noteIndex, scale.length - 1)); // Ensure index is within bounds

        const note = scale[noteIndex];
        const nextNote = scale[(noteIndex + 2) % scale.length]; // Get the next note in the scale
        // switch (note) {
        //     case 'C':
        //         nextNote = 'G2';
        //         break;
        //     case 'D':
        //         nextNote = 'F';
        //         break;
        //     case 'E':
        //         nextNote = 'G2';
        //         break;
        //     case 'F':
        //         nextNote = 'A';
        //     default:
        //         this.playNotePair(note, noteIndex, scale);
        // }
        console.log(`Playing notes: ${note} and ${nextNote}`);

        if (this.lastNote !== note) {
            this.playNoteSequence(note, nextNote);
            this.lastNote = note;
        }
    }

    playNoteSequence(note, nextNote) {
        if (this.currentOscillator) {
            this.currentOscillator.stop(); // Stop the current oscillator
        }

        const frequencies = {
            'G2': 783.99,   // G in the next octave
            'G': 392.00,
            'A': 440.00,
            'B': 493.88,
            'C': 523.25,
            'D': 587.33,
            'E': 659.25,
            'F': 698.46
        };

        const frequency1 = frequencies[note];
        const frequency2 = frequencies[nextNote];

        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine';

        let isFirstNote = true;
        const playNote = () => {
            if (isFirstNote) {
                oscillator.frequency.setValueAtTime(frequency1, this.audioContext.currentTime);
            } else {
                oscillator.frequency.setValueAtTime(frequency2, this.audioContext.currentTime);
            }
            isFirstNote = !isFirstNote;
        };

        playNote();
        oscillator.connect(this.audioContext.destination);
        oscillator.start();

        this.currentOscillator = oscillator;

        this.intervalId = setInterval(playNote, 200);
    }

    reset() {
        this.mesh.position.set(0, 0, 0);
        this.speed = 0.05;
        this.directionX *= -1;
        this.directionY = 0; // Reset to straight direction
        this.stopNoteSequence();
    }

    stopNoteSequence() {
        if (this.currentOscillator) {
            this.currentOscillator.stop();
            this.currentOscillator = null;
        }
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.lastNote = null;
    }
}