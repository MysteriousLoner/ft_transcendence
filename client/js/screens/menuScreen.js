import initPage from '../menu.js';
import makeRequest from '../utils/requestWrapper.js';

class MenuScreen {
    constructor(sceneRouterCallback, screenRouterCallback, sceneVars) {
        // routing callback functions standard
        this.sceneRouterCallback = sceneRouterCallback;
        this.screenRouterCallback = screenRouterCallback;

        // scene level shared variables
        this.sceneVars = sceneVars;

        console.log('MenuScreen constructor');
        // class specific event listeners
        document.getElementById('menuScreen').classList.remove('d-none');

        // route to gamescene
        document.getElementById('startGameButton-vp').addEventListener('click', this.switchToGameScene.bind(this));
        // Add event listeners for game buttons
        document.getElementById("vanillaPong").addEventListener("click", playVanillaPong);
        document.getElementById("friendsPong").addEventListener("click", playFriendsPong);

        // Add event listeners for pagination
        document.getElementById("prevPage").addEventListener("click", () => changePage(-1));
        document.getElementById("nextPage").addEventListener("click", () => changePage(1));
        document.getElementById("prevNewPage").addEventListener("click", () => changeNewPage(-1));
        document.getElementById("nextNewPage").addEventListener("click", () => changeNewPage(1));
    }

    clean() {
        console.log('closing menu screen');
        document.getElementById('menuScreen').classList.add('d-none');
    }


}

export default MenuScreen;
