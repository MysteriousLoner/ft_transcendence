// scene.js

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.142.0/build/three.module.js';

export let scene, camera, renderer;

export function setupScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const pointLight = new THREE.PointLight(0xffffff);
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(pointLight, ambientLight);

    camera.position.z = 5;
}