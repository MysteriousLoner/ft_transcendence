// import GameScreen from "../screens/gameScreen.js";
import AILvlSelectScreen from "../screens/ailvlselectScreen.js";
import GameScreen from "../screens/gameScreen.js";
import FriendsModeSelectScreen from "../screens/friendsmodeselectScreen.js"
import MenuScreen from "../screens/menuScreen.js";

class GameScene {
    constructor(sceneRouterCallback, globalVars) {
        this.sceneRouterCallback = sceneRouterCallback;
        this.currentScreen = null;

        this.sceneVars = {
            get username() {
                return globalVars.username;
            },
            get displayName() {
                return globalVars.displayName;
            },
            get game_mode() {
                return globalVars.game_mode;
            },
            set game_mode(value) {
                globalVars.game_mode = value;
            },
            get ai_lvl() {
                return globalVars.ai_lvl;
            },
            set ai_lvl(value) {
                globalVars.ai_lvl = value;
            },
        }
    
        // initiate default screen
        if (this.sceneVars.game_mode == 'vanilla') {
            this.currentScreen = new AILvlSelectScreen(
                this.sceneRouterCallback.bind(this), 
                this.screenRouterCallback.bind(this),
                this.sceneVars
            );
        } else if (this.sceneVars.game_mode == 'friends') {
            this.currentScreen = new FriendsModeSelectScreen(
                this.sceneRouterCallback.bind(this), 
                this.screenRouterCallback.bind(this),
                this.sceneVars
            );
        }
    }
    
    cleanScreens() {
        this.currentScreen.clean();
        this.currentScreen = null;
    }
    
    screenRouterCallback(screen) {
        if (screen == 'aiLvlSelectScreen') {
            this.cleanScreens();
            this.currentScreen = new AILvlSelectScreen(
                this.sceneRouterCallback.bind(this), 
                this.screenRouterCallback.bind(this),
                this.sceneVars
            );
        } else if (screen == 'friendsModeSelectScreen') {
            this.cleanScreens();
            this.currentScreen = new FriendsModeSelectScreen(
                this.sceneRouterCallback.bind(this), 
                this.screenRouterCallback.bind(this),
                this.sceneVars
            );
        } else if (screen == 'gameScreen') {
            this.cleanScreens();
            this.currentScreen = new GameScreen(
                this.sceneRouterCallback.bind(this), 
                this.screenRouterCallback.bind(this),
                this.sceneVars
            );
        } else if (screen === 'menuScreen') { 
            this.cleanScreens();
            this.currentScreen = new MenuScreen(
                this.sceneRouterCallback.bind(this), 
                this.screenRouterCallback.bind(this),
                this.sceneVars
            )
        } else {
            console.error("No available screens for this sceene");
            this.currentScreen = null;
        }
    }
}

export default GameScene;