import LoginScreen from "../screens/loginScreen.js";

class LoginScene {
  constructor(sceneRouterCallback, globalVars) {
    this.sceneRouterCallback = sceneRouterCallback;
    this.currentScreen = null;

    this.sceneVars = {
      get username() {
        return globalVars.username;
      },
      set username(value) {
        globalVars.username = value;
      }
    };

    // initiate default screen
    this.currentScreen = new LoginScreen(
        this.sceneRouterCallback.bind(this), 
        this.screenRouterCallback.bind(this),
        this.sceneVars
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