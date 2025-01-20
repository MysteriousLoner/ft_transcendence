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
            username: null,
            displayName: null,
            game_mode: null,
            ai_lvl: null,
        }
        window.addEventListener('popstate', this.handlePopState.bind(this));
    }

    sceneRouterCallback(scene) {
        console.log('Routing to scene:', scene);
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
                this.currentScene = new GameScene(this.sceneRouterCallback.bind(this), this.globalVars);
                break
            default:
                console.error('Invalid scene:', scene);
                return;
        }

        // Push new state to browser history
        if (this.history[this.history.length - 1] !== scene) { 
            window.history.pushState({ scene }, '', window.location.pathname); 
            this.history.push(scene); 
        } 
        console.log('Current history stack:', this.history);
    }

    handlePopState(event) {
        if (this.history.length <= 1) { 
            return; 
        } 
        const previousScene = this.history.length >= 2 ? this.history[this.history.length - 2] : this.history[0]; 
        this.history.pop(); 
        console.log('Handling pop state:', previousScene); 
        this.sceneRouterCallback(previousScene);
    }

    startApp() {
        const initialScene = 'homeScene';
        this.currentScene = new HomeScene(this.sceneRouterCallback.bind(this));
        this.history.push(initialScene);
        window.history.replaceState({ scene: initialScene }, '', window.location.pathname);
    }
}

export default SceneRegistry;
