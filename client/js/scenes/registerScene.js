import RegisterScreen from '../screens/registerScreen.js';
import VerificationScreen from '../screens/verificationScreen.js';

class RegisterScene {
    constructor(sceneRouterCallback) {
        console.log('RegisterScene constructor');
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

    cleanScreens() {
        this.currentScreen.clean();
        this.currentScreen = null;
    }

    switchToRegister(previousScreen) {
        previousScreen.closeScreen();
        this.currentScreen = new RegisterScreen(
            this.sceneRouterCallback.bind(this), 
            this.screenRouterCallback.bind(this), 
            this.sceneVars
        );
    }

    switchToVerification(previousScreen) {
        previousScreen.closeScreen();
        this.currentScreen = new VerificationScreen(
            this.sceneRouterCallback.bind(this)
        );
    }

    screenRouterCallback(screen) {
        if (screen === 'registerScreen') { 
            this.switchToRegister(this.currentScreen);
        } else if (screen === 'verificationScreen') {
            this.switchToVerification(this.currentScreen);
        } else {
            console.error('Invalid screen:', screen);
        }
    }
}

export default RegisterScene;