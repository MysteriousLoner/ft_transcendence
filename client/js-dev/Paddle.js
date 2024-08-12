import * as THREE from 'three';

export default class Paddle {
    geometry;
    material;
    reference;
    isMovingUp;
    isMovingDown;
    hitDirection;
    isAimingUp;
    isAimingDown;
    directionLine; // Add a line object to visualize the direction

    constructor() {
        // Set default values for aiming and moving
        this.isAimingDown = false;
        this.isAimingUp = false;
        this.isMovingUp = false;
        this.isMovingDown = false;
        this.hitDirection = 0;

        // Create the paddle's visuals
        this.geometry = new THREE.BoxGeometry(0.2, 1, 0.2);
        this.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.reference = new THREE.Mesh(this.geometry, this.material);
        const edgesGeometry = new THREE.EdgesGeometry(this.geometry);
        const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
        this.reference.add(edges);

        // Create a line to show the hit direction
        this.createDirectionLine();
        this.updateHitDirection(0);
    }

    // Method to create the direction line
    createDirectionLine() {
        const points = [];
        points.push(new THREE.Vector3(0, 0, 0));
        points.push(new THREE.Vector3(1, 0, 0)); // Initially, the line extends along the X axis

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.1, gapSize: 0.1 });
        this.directionLine = new THREE.Line(geometry, material);
        this.directionLine.computeLineDistances(); // Needed for dashed lines
        this.reference.add(this.directionLine);
    }

    animation() {
        // this.reference.rotation.y += 0.01;
        this.updatePosition(0.05);
        this.updateHitDirection(0.01);
    }

    updatePosition(dy) {
        if (this.reference.position.y + dy < 2.5 && this.isMovingUp) {
            this.reference.position.y += dy;
        }
        if (this.reference.position.y + dy > -2.5 && this.isMovingDown) {
            this.reference.position.y -= dy;
        }
        // console.log(this.reference.position);
    }

    updateHitDirection(angle) {
        if (this.isAimingUp && this.hitDirection + angle < 1.5) {
            this.hitDirection += angle;
        }
        if (this.isAimingDown && this.hitDirection - angle > -1.5) {
            this.hitDirection -= angle;
        }

        // Determine the sign of the direction based on the paddle's x position
        const sign = this.reference.position.x < 0 ? 1 : -1;

        // Update the direction line based on the hit direction
        const length = 1; // Length of the direction line

        // Calculate the new end point of the line
        const endX = sign * length * Math.cos(this.hitDirection);
        const endY = length * Math.sin(this.hitDirection);

        // Update points of the direction line
        const points = [];
        points.push(new THREE.Vector3(0, 0, 0));
        points.push(new THREE.Vector3(endX, endY, 0)); // New end point based on angle

        this.directionLine.geometry.setFromPoints(points);
        this.directionLine.computeLineDistances(); // Needed for dashed lines

        // console.log(this.hitDirection, "aiming", this.isAimingUp, this.isAimingDown);
    }
}