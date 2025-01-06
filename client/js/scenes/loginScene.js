import LoginScreen from "../screens/loginScreen.js";

class LoginScene {
  constructor(sceneRouterCallback) {
    this.sceneRouterCallback = sceneRouterCallback;
    this.currentScreen = null;

    // initiate default screen
    this.currentScreen = new LoginScreen(
        this.sceneRouterCallback.bind(this), 
        this.screenRouterCallback.bind(this)
    );
  }

  cleanScreens() {
    this.currentScreen.clean();
    this.currentScreen = null;
  }

  screenRouterCallback(screen) {
    console.error("No available screens for this sceene");
    this.currentScreen = null;
  }
}

export default LoginScene;