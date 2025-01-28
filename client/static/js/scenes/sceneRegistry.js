import RegisterScene from "./registerScene.js";
import LoginScene from "./loginScene.js";
import HomeScene from "./homeScene.js";
import MenuScene from "./menuScene.js";
import GameScene from "./gameScene.js";
import GLOBAL_VARS from "../utils/constants.js";

class SceneRegistry {
    constructor() {
        this.currentScene = null;
        this.pastScenes = [];
        this.history = [];
        this.globalVars = {
            username: null,
            displayName: null,
            game_mode: null,
            ai_lvl: null,
            game_outcome: null,
        }
        this.initialLoad = true;
        window.addEventListener('popstate', this.handlePopState.bind(this));
        this.len = 0;
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
            window.history.pushState({ scene }, '', scene); 
            this.history.push(scene); 
        } 
        console.log('Current history stack:', this.history);
    }

    handlePopState(event) {
        // if (this.history.length <= 1) { 
        //     return; 
        // } 
        let eventScene;
        if (!event.state.scene) {
            eventScene = "homeScene";
        } else {
            eventScene = event.state.scene;
        }
        console.log("from event: ", eventScene);
        if (!this.history.includes(eventScene)) {
            this.sceneRouterCallback(eventScene);
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
        window.history.pushState({ initialScene }, '', initialScene);
    }
}

export default SceneRegistry;
