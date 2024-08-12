import * as THREE from 'three';

export default class Paddle {
    geometry;
    material;
    reference;
    constructor() {
        this.geometry = new THREE.BoxGeometry(0.2, 1, 0.2);
        this.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.reference = new THREE.Mesh(this.geometry, this.material);
        const edgesGeometry = new THREE.EdgesGeometry(this.geometry);
        const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
        this.reference.add(edges);
    }

    animation() {
        // this.reference.rotation.y += 0.01;
    }

    updatePosition(dx, dy, dz) {
        if (this.reference.position.y + dy > 2.5 || this.reference.position.y + dy < -2.5) {
            return;
        }
        this.reference.position.y += dy;
        console.log(this.reference.position);
    }
}