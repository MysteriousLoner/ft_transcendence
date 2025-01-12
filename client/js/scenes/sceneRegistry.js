import RegisterScene from "./registerScene.js";
import LoginScene from "./loginScene.js";
import HomeScene from "./homeScene.js";
import MenuScene from "./menuScene.js";

class SceneRegistry {
    constructor () {
        this.updateHistory = true;
        this.currentScene = null;
        this.history = [];
        this.globalVars = {
            username: null
        }
        window.addEventListener('popstate', this.handlePopState.bind(this));
    }

    sceneRouterCallback(scene) {
        // console.log('Routing to scene:', scene);
        if (this.currentScene) {
            this.currentScene.cleanScreens();
        }
        this.currentScene = null;

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
            default:
                console.error('Invalid scene:', scene);
                return;
        }
        if (this.updateHistory == true) {
            this.history.push(scene);
            window.history.pushState({ scene }, '', `#${scene}`);
            this.updateHistory = false;
        }
        // console.log(history);
    }

    handlePopState(event) { 
        const { scene } = event.state || {}; 
        if (scene) { 
            this.updateHistory = true;
            this.sceneRouterCallback(scene); 
        } 
    }

    startApp() {
        const initialScene = 'homeScene';
        this.currentScene = new HomeScene(this.sceneRouterCallback.bind(this));
        this.history.push(initialScene); 
        window.history.replaceState({ scene: initialScene }, '', `#${initialScene}`);
        // console.log(history);
    }
}

export default SceneRegistry;
