import MenuScreen from "../screens/menuScreen.js";

class MenuScene {
    constructor(sceneRouterCallback) {
        console.log('MenuScene constructor');
        this.sceneRouterCallback = sceneRouterCallback;
        
        // scene level shared variables
        this.currentScreen = null;

        // initiate default screen
        this.currentScreen = new MenuScreen(
            this.sceneRouterCallback.bind(this), 
            this.screenRouterCallback.bind(this)
        )
    }

    // standard, no nneed to change if not neccesary
    cleanScreens() {
        this.currentScreen.clean();
        this.currentScreen = null;
    }

    screenRouterCallback(screen) {
        if (screen === 'menuScreen') { 
            this.cleanScreens();
            this.currentScreen = new MenuScreen(
                this.sceneRouterCallback.bind(this), 
                this.screenRouterCallback.bind(this)
            )
        } else {
            console.error('Invalid screen:', screen);
        }
    }
}

export default MenuScene;