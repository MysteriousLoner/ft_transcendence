import RegisterScene from "./registerScene.js";
import LoginScene from "./loginScene.js";
import HomeScene from "./homeScene.js";
import MenuScene from "./menuScene.js";
import GameScene from "./gameScene.js";

class SceneRegistry {
    constructor() {
        this.currentScene = null;
        this.history = [];
        this.globalVars = {
            username: null
        };
        window.addEventListener('popstate', this.handlePopState.bind(this));
    }

    sceneRouterCallback(scene) {
        if (this.currentScene) {
            console.log('Cleaning current scene', this.currentScene);
            this.currentScene.cleanScreens();
        }

        switch (scene) {
            case 'homeScene':
                this.currentScene = new HomeScene(this.sceneRouterCallback.bind(this));
                break;
            case 'registerScene':
                this.currentScene = new RegisterScene(this.sceneRouterCallback.bind(this));
                break;
            case 'loginScene':
                this.currentScene = new LoginScene(this.sceneRouterCallback.bind(this), this.globalVars);
                break;
            case 'menuScene':
                this.currentScene = new MenuScene(this.sceneRouterCallback.bind(this), this.globalVars);
                break;
            case 'gameScene':
                this.currentScene = new GameScene(this.sceneRouterCallback.bind(this));
                break;
            default:
                console.error('Invalid scene:', scene);
                return;
        }

        // Push new state to browser history
        window.history.pushState({ scene }, '', window.location.pathname);
        this.history.push(scene);
    }

    handlePopState(event) {
        // Previous scene pops out before current scene
        if (this.history.length > 1) {
            this.history.pop();  // Remove current scene
            const scene = this.history.pop();  // Pop out previous scene
            console.log('Handling pop state:', scene);
            this.sceneRouterCallback(scene);
        } else {
            console.log('No previous scene found in history');
        }
    }

    startApp() {
        const initialScene = 'homeScene';
        this.currentScene = new HomeScene(this.sceneRouterCallback.bind(this));
        this.history.push(initialScene);
        window.history.replaceState({ scene: initialScene }, '', window.location.pathname);
    }
}

export default SceneRegistry;
