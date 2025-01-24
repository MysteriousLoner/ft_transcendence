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

        // Add event listeners
        this.easyAICallback = () => {
            this.sceneVars.ai_lvl = 'easy';
            console.log("AI Level: " + this.sceneVars.ai_lvl);
            this.screenRouterCallback("gameScreen");
        };

        this.hardAICallback = () => {
            this.sceneVars.ai_lvl = 'hard';
            console.log("AI Level: " + this.sceneVars.ai_lvl);
            this.screenRouterCallback("gameScreen");
        };

        this.backToMenuCallback = () => {
            this.screenRouterCallback("menuScreen");
        };

        // Add event listeners
        document.getElementById('easyAIButton').addEventListener('click', this.easyAICallback);
        document.getElementById('hardAIButton').addEventListener('click', this.hardAICallback);
        document.getElementById('backToMenuButton_1').addEventListener('click', this.backToMenuCallback);
    }

    clean() {

        console.log('closing AILvlSelectScreen');
        // Remove event listener
        document.getElementById('easyAIButton').removeEventListener('click', this.easyAICallback);
        document.getElementById('hardAIButton').removeEventListener('click', this.hardAICallback);
        document.getElementById('backToMenuButton_1').removeEventListener('click', this.backToMenuCallback);
        document.getElementById('ailvlSelectScreen').classList.add('d-none');
    }

    // async test() {
    //     console.log('testing');
    //     const response = await makeRequest('GET', 'api/ailvl/getAILevels/');
    //     console.log(response);
    // }
}

export default AILvlSelectScreen;