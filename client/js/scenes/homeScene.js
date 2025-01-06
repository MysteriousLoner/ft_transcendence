import LandingScreen from "../screens/landingScreen.js";

class HomeScene {
  constructor(sceneRouterCallback) {
    this.currentScreen = null;
    this.sceneRouterCallback = sceneRouterCallback;

    // initiate default scene
    this.currentScreen = new LandingScreen(
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

export default HomeScene;