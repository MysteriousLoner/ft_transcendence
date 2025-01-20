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
        this.game = new Game(this.sceneVars.username, this.sceneVars.game_mode, this.sceneVars.ai_lvl, this.sceneRouterCallback, this.screenRouterCallback);
    }

    clean() {
        console.log('Cleaning game screen');
        try {
            if (this.game){
                this.game.cleanup();
                console.log('Game cleaned up');
            }
        } catch (error) {
            console.error('Error cleaning up game', error);
        }
        document.getElementById('gameContainer').classList.add('d-none');
        console.log('Game screen cleaned');

    }
}

export default GameScreen;