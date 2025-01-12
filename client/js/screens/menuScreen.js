import makeRequest from '../utils/requestWrapper.js';
import initPage from '../menu.js';

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

        // Add event listeners for game buttons
        document.getElementById("vanillaPong").addEventListener("click", this.playVanillaPong.bind(this));
        document.getElementById("friendsPong").addEventListener("click", this.playFriendsPong.bind(this));

        // Add event listeners for pagination
        document.getElementById("prevPage").addEventListener("click", () => changePage(-1));
        document.getElementById("nextPage").addEventListener("click", () => changePage(1));
        document.getElementById("prevNewPage").addEventListener("click", () => changeNewPage(-1));
        document.getElementById("nextNewPage").addEventListener("click", () => changeNewPage(1));

		initPage();
    }

    clean() {
        console.log('closing menu screen');
        document.getElementById('menuScreen').classList.add('d-none');
    }


    playFriendsPong() {
        console.log('playFriendsPong');
        this.sceneRouterCallback('gameScene');
    }

    playVanillaPong() {
        console.log('playVanillaPong');
        this.sceneRouterCallback('gameScene');
    }
}

export default MenuScreen;
