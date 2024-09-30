//Animations.js
export default class Animations {
    constructor() {
        this.animations = [];
    }

    add(animation) {
        this.animations.push(animation);
    }

    remove(animation) {
        const index = this.animations.indexOf(animation);
        if (index > -1) {
            this.animations.splice(index, 1);
        }
    }

    runAll(renderer, scene, camera) {
        this.animations.forEach(animation => animation());
        renderer.render(scene, camera);
    }
}