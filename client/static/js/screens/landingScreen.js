
class LandingScreen {
    constructor(sceneRouterCallback, screenRouterCallback) {
        // routing callback functions
        this.sceneRouterCallback = sceneRouterCallback;
        this.screenRouterCallback = screenRouterCallback;

        // console.log('LandingScreen constructor');
        // class specific event listeners
        document.getElementById('landingScreen').classList.remove('d-none');

        // Add event listeners
        this.boundSwitchToLoginScene = this.switchToLoginScene.bind(this);
        this.boundSwitchToRegisterScene = this.switchToRegisterScene.bind(this);

        document.getElementById('loginButton').addEventListener('click', this.boundSwitchToLoginScene);
        document.getElementById('registerButton').addEventListener('click', this.boundSwitchToRegisterScene);
    }

    clean() {
        console.log('closing landing screen');
        // Remove event listener
        document.getElementById('loginButton').removeEventListener('click', this.boundSwitchToLoginScene);
        document.getElementById('registerButton').removeEventListener('click', this.boundSwitchToRegisterScene);
        document.getElementById('landingScreen').classList.add('d-none');
    }

    switchToLoginScene() {
        this.clean();
        this.sceneRouterCallback('loginScene');
    }

    switchToRegisterScene() {
        // console.log('switching to register scene');
        this.sceneRouterCallback('registerScene');
    }
}

export default LandingScreen;
