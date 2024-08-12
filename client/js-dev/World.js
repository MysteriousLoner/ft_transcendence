import * as THREE from 'three';
import Animations from './Animations.js';

export default class World {
    scene;
    camera;
    renderer;
    animation;
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.animation = new Animations();
        this.camera.position.z = 5;
        const cubeGeometry = new THREE.BoxGeometry(10, 5, 10);
        const cubeEdges = new THREE.EdgesGeometry(cubeGeometry);
        const cubeLines = new THREE.LineSegments(cubeEdges, new THREE.LineBasicMaterial({ color: 0xffffff }));
        this.scene.add(cubeLines);
        document.body.appendChild(this.renderer.domElement);
    }
    
    addObj(object) {
        this.scene.add(object);
    }
    
    removeObj(object) {
        this.scene.remove(object);
    }
    
    get() {
        return this.scene;
    }

    setAnimationLoop() {
        this.renderer.setAnimationLoop(() => {
            this.animation.runAll(this.renderer, this.scene, this.camera);
        });
    }

    addAnimation(animation) {
        this.animation.add(animation);
    }

    removeAnimation(animation) {
        this.animation.remove(animation);
    }
}