import makeRequest from "../utils/requestWrapper.js";
import Game from "./game.js";

class GameScreen {
    constructor(sceneRouterCallback, screenRouterCallback) {
        // routing callback functions standard
        this.sceneRouterCallback = sceneRouterCallback;
        this.screenRouterCallback = screenRouterCallback;

        console.log('GameScreen constructor');
        // class specific event listeners
        document.getElementById('gameContainer').classList.remove('d-none');
        this.game = new Game();
    }

    clean() {
        console.log('closing game screen');
        document.getElementById('gameContainer').classList.add('d-none');
    }
}

export default GameScreen;