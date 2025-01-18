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
        this.getFriendList();
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

    async getPfp() {
        const defaultPfp = await makeRequest('POST', 'api/menu/getProfilePicture/', { username: this.sceneVars.username });
        console.log("MenuScreen defaultPfp: " + defaultPfp.image);
        console.log("MenuScreen code: " + defaultPfp.code);
    }

    async getProfileData() {
        const profileData = await makeRequest('POST', 'api/menu/getProfileData/', { username: this.sceneVars.username });
        console.log("MenuScreen profileData: ");
        console.log("displayName: ", profileData.displayName);
        console.log("wr: ", profileData.winRate);
        console.log("username: ", profileData.username);
    }

    async updateDisplayName(newDisplayName) {
        const oldDisplayName = await makeRequest('POST', 'api/menu/getProfileData/', { username: this.sceneVars.username });
        console.log("display name before update: " + oldDisplayName.displayName);
        const response = await makeRequest('POST', 'api/menu/updateDisplayName/', { username: this.sceneVars.username, displayName: newDisplayName });
        console.log("server responnse: " + response.message);
    }

    async test() {
        console.log("testing menu screen api calls");
        // await this.getPfp();
        await this.getProfileData();
        const newDisplayName = "newDisplay";
        console.log("updating display name to: " + newDisplayName);
        await this.updateDisplayName(newDisplayName);
        let profileData = await makeRequest('POST', 'api/menu/getProfileData/', { username: this.sceneVars.username });
        console.log("display name after update: " + profileData.displayName);
        console.log("usernanme after update: " + profileData.username);
        console.log("ennd of test");
    }

    async getFriendList() {
        const friendList = await makeRequest('POST', 'api/menu/getFriendList/', { username: this.sceneVars.username });
        console.log("MenuScreen friendList: ");
        console.log(friendList);
    }
}

export default MenuScreen;
