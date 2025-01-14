import RegisterScreen from '../screens/registerScreen.js';
import VerificationScreen from '../screens/verificationScreen.js';

class RegisterScene {
    constructor(sceneRouterCallback) {
        // console.log('RegisterScene constructor');
        this.sceneRouterCallback = sceneRouterCallback;
        
        // scene level shared variables
        this.currentScreen = null;
        this.sceneVars = {
            username: null
        }

        // initiate default screen
        this.currentScreen = new RegisterScreen(
            this.sceneRouterCallback.bind(this), 
            this.screenRouterCallback.bind(this),
            this.sceneVars
        );
    }

    // standard, no nneed to change if not neccesary
    cleanScreens() {
        this.currentScreen.clean();
        this.currentScreen = null;
    }

    screenRouterCallback(screen) {
        if (screen === 'registerScreen') { 
            this.cleanScreens();
            this.currentScreen = new RegisterScreen(
                this.sceneRouterCallback.bind(this), 
                this.screenRouterCallback.bind(this), 
                this.sceneVars
            );
        } else if (screen === 'verificationScreen') {
            this.cleanScreens();
            this.currentScreen = new VerificationScreen(
                this.sceneRouterCallback.bind(this), 
                this.screenRouterCallback.bind(this), 
                this.sceneVars
            );
        } else {
            console.error('Invalid screen:', screen);
        }
    }
}

export default RegisterScene;