import makeRequest from "../utils/requestWrapper.js";
import Game from "./game.js";

class GameScreen {
    constructor(sceneRouterCallback, screenRouterCallback, sceneVars) {
        // routing callback functions standard
        this.sceneRouterCallback = sceneRouterCallback;
        this.screenRouterCallback = screenRouterCallback;
        this.sceneVars = sceneVars;

        console.log('GameScreen constructor');
        // class specific event listeners
        document.getElementById('gameContainer').classList.remove('d-none');
        console.log("Creating Game ...");
        console.log('GameScreen username: ' + this.sceneVars.username);
        console.log('GameScreen game_mode: ' + this.sceneVars.game_mode);
        console.log('GameScreen ai_lvl: ' + this.sceneVars.ai_lvl);

        // Here the game_mode options are 'vanilla, solo, tournaments and demo
        this.game = new Game(this.sceneVars.username, this.sceneVars.displayName, this.sceneVars.game_mode, this.sceneVars.ai_lvl, this.sceneRouterCallback, this.screenRouterCallback, this.sceneVars); // Yes its bit ugly lol
    }

    clean() {
        console.log('closing gameScreen');
        if (this.game) {
            document.getElementById('loadingScreen').classList.add('d-none');
            this.game = null;
        }
        document.getElementById('gameContainer').classList.add('d-none');
    }
}

export default GameScreen;