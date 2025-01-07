import RegisterScene from "./registerScene.js";
import LoginScene from "./loginScene.js";
import HomeScene from "./homeScene.js";
import MenuScene from "./menuScene.js";

class SceneRegistry {
    constructor () {
        this.currentScene = null;
        this.history = [];
        window.addEventListener('popstate', this.handlePopState.bind(this));
    }

    sceneRouterCallback(scene) {
        console.log('Routing to scene:', scene);
        if (this.currentScene) {
            this.currentScene.cleanScreens();
        }
        this.currentScene = null;

        switch (scene) {
            case 'homeScene':
                this.currentScene = new HomeScene(this.sceneRouterCallback.bind(this));
                break;
            case 'registerScene':
                console.log('Routing to register scene');
                this.currentScene = new RegisterScene(this.sceneRouterCallback.bind(this));
                break;
            case 'loginScene':
                this.currentScene = new LoginScene(this.sceneRouterCallback.bind(this));
                break;
            case 'menuScene':
                this.currentScene = new MenuScene(this.sceneRouterCallback.bind(this));
                break;
            default:
                console.error('Invalid scene:', scene);
                break;
        }
        this.history.push(scene);
        window.history.pushState({ scene }, '', `#${scene}`);
    }

    handlePopState(event) { 
        const { scene } = event.state || {}; 
        if (scene) { 
            this.sceneRouterCallback(scene); 
        } 
    }

    startApp() {
        const initialScene = 'homeScene';
        this.currentScene = new HomeScene(this.sceneRouterCallback.bind(this));
        this.history.push(initialScene); 
        window.history.replaceState({ scene: initialScene }, '', `#${initialScene}`);
    }
}

export default SceneRegistry;
