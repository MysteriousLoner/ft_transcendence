import makeRequest from '../utils/requestWrapper.js';
import initPage from '../menu.js';

class MenuScreen {
    constructor(sceneRouterCallback, screenRouterCallback, sceneVars) {
        // routing callback functions standard
        this.sceneRouterCallback = sceneRouterCallback;
        this.screenRouterCallback = screenRouterCallback;

        // scene level shared variables
        this.sceneVars = sceneVars;
        
        // console.log('MenuScreen constructor');
        // class specific event listeners
        document.getElementById('menuScreen').classList.remove('d-none');
        
        // Add event listeners for game buttons
        document.getElementById("vanillaPong").addEventListener("click", this.playVanillaPong.bind(this));
        document.getElementById("friendsPong").addEventListener("click", this.playFriendsPong.bind(this));
        
        // Add event listeners for pagination
        // document.getElementById("prevPage").addEventListener("click", () => changePage(-1));
        // document.getElementById("nextPage").addEventListener("click", () => changePage(1));
        // document.getElementById("prevNewPage").addEventListener("click", () => changeNewPage(-1));
        // document.getElementById("nextNewPage").addEventListener("click", () => changeNewPage(1));
        
        // default page values
        // document.getElementById("usernameTitle1").textContent = this.sceneVars.username || "Default";
        // console.log("MenuScreen username: " + this.sceneVars.username);

        // this.test();
        initPage(this.sceneVars.username);
        // this.getFriendList();
        // this.addFriend();
    }

    clean() {
        console.log('closing menu screen');
        document.getElementById('menuScreen').classList.add('d-none');
    }


    playFriendsPong() {
        console.log('playFriendsPong');
        this.sceneVars.game_mode = 'friends';
        console.log("MenuScreen game_mode: " + this.sceneVars.game_mode);
        this.sceneRouterCallback('gameScene');
        // game_mode = 'friends';
    }

    playVanillaPong() {
        console.log('playVanillaPong');
        this.sceneVars.game_mode = 'vanilla';
        console.log("MenuScreen game_mode: " + this.sceneVars.game_mode);
        this.sceneRouterCallback('gameScene');
        // game_mode = 'vanilla';
    }
}

export default MenuScreen;
