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
        
        // Add event listeners for game buttons
        document.getElementById("vanillaPong").addEventListener("click", this.playVanillaPong.bind(this));
        document.getElementById("friendsPong").addEventListener("click", this.playFriendsPong.bind(this));
        
        // Add event listeners for pagination
        document.getElementById("prevPage").addEventListener("click", () => changePage(-1));
        document.getElementById("nextPage").addEventListener("click", () => changePage(1));
        document.getElementById("prevNewPage").addEventListener("click", () => changeNewPage(-1));
        document.getElementById("nextNewPage").addEventListener("click", () => changeNewPage(1));
        
        // default page values
        document.getElementById("usernameTitle1").textContent = this.sceneVars.username || "Default";
        console.log("MenuScreen username: " + this.sceneVars.username);

        const defaultPfp = makeRequest('POST', 'api/menu/getProfilePicture', { username: this.sceneVars.username });
        console.log("MenuScreen defaultPfp: " + defaultPfp.image);
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

    getUsername() {
        return this.sceneVars.username;
    }
}

export default MenuScreen;
