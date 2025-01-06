
class LandingScreen {
    constructor(sceneRouterCallback, screenRouterCallback) {
        // routing callback functions
        this.sceneRouterCallback = sceneRouterCallback;
        this.screenRouterCallback = screenRouterCallback;

        console.log('LandingScreen constructor');
        // class specific event listeners
        document.getElementById('landingScreen').classList.remove('d-none');
        document.getElementById('loginButton').addEventListener('click', this.switchToLoginScene.bind(this));
        document.getElementById('registerButton').addEventListener('click', this.switchToRegisterScene.bind(this));
    }

    clean() {
        console.log('closing landing screen');
        document.getElementById('loginButton').removeEventListener('click', this.switchToLoginScene.bind(this));
        document.getElementById('registerButton').removeEventListener('click', this.switchToRegisterScene.bind(this));
        document.getElementById('landingScreen').classList.add('d-none');
    }

    switchToLoginScene() {
        console.log('switching to login scene');
        this.sceneRouterCallback('loginScene');
    }

    switchToRegisterScene() {
        console.log('switching to register scene');
        this.sceneRouterCallback('registerScene');
    }
}

export default LandingScreen;
