import makeRequest from "../utils/requestWrapper.js";
import GameScreen from "./gameScreen.js";

class AILvlSelectScreen {
    constructor(sceneRouterCallback, screenRouterCallback, sceneVars) {
        // routing callback functions standard
        this.sceneRouterCallback = sceneRouterCallback;
        this.screenRouterCallback = screenRouterCallback;
        this.sceneVars = sceneVars;

        console.log('AILvlSelectScreen constructor');
        console.log(this.sceneVars);

        // class specific event listeners
        document.getElementById('ailvlSelectScreen').classList.remove('d-none');
        document.getElementById('easyAIButton').addEventListener('click', () => {
            this.sceneVars.ai_lvl = 'easy';
            console.log("AI Level: " + this.sceneVars.ai_lvl);
            this.screenRouterCallback("gameScreen");
        });
        document.getElementById('hardAIButton').addEventListener('click', () => {
            this.sceneVars.ai_lvl = 'hard';
            console.log("AI Level: " + this.sceneVars.ai_lvl);
            this.screenRouterCallback("gameScreen");
        });
        document.getElementById('backToMenuButton_1').addEventListener('click', () => {
            this.screenRouterCallback("menuScreen");
        });
    }

    clean() {
        console.log('closing AILvlSelectScreen');
        document.getElementById('ailvlSelectScreen').classList.add('d-none');
    }

    // async test() {
    //     console.log('testing');
    //     const response = await makeRequest('GET', 'api/ailvl/getAILevels/');
    //     console.log(response);
    // }
}

export default AILvlSelectScreen;