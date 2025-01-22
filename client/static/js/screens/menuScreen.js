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
        document.getElementById('saveUsernameBtn').addEventListener('click', this.saveUsername.bind(this));
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

    async saveUsername() {
        const newUsername = document.getElementById('usernameInput').value;
        if (newUsername) {
            document.getElementById('displaynameTitle').textContent = newUsername;
            try {
                const response = await makeRequest('POST', 'api/account/updateDisplayName/', { username: this.sceneVars.username, displayName: newUsername });
                console.log(response.message);
            }
            catch (error) {
                console.error('Change Display name error:', error);
            }
            this.sceneVars.displayName = newUsername;
            this.closeEditProfileModal();
        } else {
            alert('Please enter a valid display Name');
        }
    }

    async closeEditProfileModal() {
        let profilePicture = await makeRequest('POST', 'api/account/getProfilePicture/', { username: this.sceneVars.username });
        document.getElementById("profilePictureMenu1").src = profilePicture.image;
        document.getElementById('editProfileModal').style.display = 'none';
    }
}

export default MenuScreen;
