import MenuScreen from "../screens/menuScreen.js";
import makeRequest from "../utils/requestWrapper.js";

class MenuScene {
    constructor(sceneRouterCallback, globalVars) {
        // console.log('MenuScene constructor');
        this.sceneRouterCallback = sceneRouterCallback;
        
        // scene level shared variables
        this.currentScreen = null;
        profileData = makeRequest('POST', 'api/menu/getProfileData/', { username: globalVars.username });
        this.sceneVars = {
            get username() {
                return globalVars.username;
            },
            get profilePicture() {
                return profileData.profilePicture;
            },
            get friendList() {
                return profileData.friendList;
            },
            get winRate() {
                return profileData.winRate;
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