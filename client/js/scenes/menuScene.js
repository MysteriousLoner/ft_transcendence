import MenuScreen from "../screens/menuScreen.js";

class MenuScene {
    constructor(sceneRouterCallback, globalVars) {
        // console.log('MenuScene constructor');
        this.sceneRouterCallback = sceneRouterCallback;
        
        // scene level shared variables
        this.currentScreen = null;
        this.sceneVars = {
            get username() {
                return globalVars.username;
            }
        }

        // initiate default screen
        this.currentScreen = new MenuScreen(
            this.sceneRouterCallback.bind(this), 
            this.screenRouterCallback.bind(this),
            this.sceneVars
        )
    }

    // standard, no need to change if not neccesary
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