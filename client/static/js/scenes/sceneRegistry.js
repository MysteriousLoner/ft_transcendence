import RegisterScene from "./registerScene.js";
import LoginScene from "./loginScene.js";
import HomeScene from "./homeScene.js";
import MenuScene from "./menuScene.js";
import GameScene from "./gameScene.js";

class SceneRegistry {
    constructor() {
        this.currentScene = null;
        this.pastScenes = [];
        this.futureScenes = [];  
        this.globalVars = {
            username: null,
            displayName: null,
            game_mode: null,
            ai_lvl: null,
            game_outcome: null,
        }
        this.initialLoad = true;
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

        if (!this.initialLoad) {
            this.pastScenes.push(scene);
            this.futureScenes.length = 0;  // Clear future scenes when navigating to a new scene
        } else {
            this.initialLoad = false;
        }

        // Push new state to browser history
        window.history.pushState({ scene }, '', scene);
        console.log('Past scenes:', this.pastScenes);
        console.log('Future scenes:', this.futureScenes);
    }

    handlePopState(event) {
        if (this.pastScenes.length === 0) {
            return;
        }

        const previousScene = this.pastScenes.pop();
        this.futureScenes.push(this.currentScene.sceneName);

        console.log('Navigating to previous scene:', previousScene);
        this.sceneRouterCallback(previousScene);

        if (event.state) {
            console.log('Handling pop state:', event.state.scene);
            this.sceneRouterCallback(event.state.scene);
        }

        console.log('Past scenes:', this.pastScenes);
        console.log('Future scenes:', this.futureScenes);
    }

    startApp() {
        const initialScene = 'homeScene';
        this.currentScene = new HomeScene(this.sceneRouterCallback.bind(this));
        this.history.push(initialScene);
        window.history.replaceState({ scene: initialScene }, '', initialScene);
    }
}

export default SceneRegistry;
