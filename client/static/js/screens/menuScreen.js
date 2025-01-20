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

		document.getElementById("logoutButton").addEventListener("click", this.logout.bind(this));
        

        initPage(this.sceneVars.username);

    }

    clean() {
        console.log('closing menu screen');
        document.getElementById('menuScreen').classList.add('d-none');
    }

	logout() {
		this.clean();
		this.sceneRouterCallback('homeScene');
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
