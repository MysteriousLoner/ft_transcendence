import RegisterScene from "./registerScene.js";
import LoginScene from "./loginScene.js";
import HomeScene from "./homeScene.js";

class SceneRegistry {
    constructor () {
        this.currentScene = null;
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
            default:
                console.error('Invalid scene:', scene);
                break;
        }
    }

    startApp() {
        this.currentScene = new HomeScene(this.sceneRouterCallback.bind(this));
    }
}

export default SceneRegistry;
