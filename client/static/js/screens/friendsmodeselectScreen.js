class FriendsModeSelectScreen {
    constructor(sceneRouterCallback, screenRouterCallback, sceneVars) {
        // routing callback functions standard
        this.sceneRouterCallback = sceneRouterCallback;
        this.screenRouterCallback = screenRouterCallback;
        this.sceneVars = sceneVars;

        console.log('FriendsModeSelectScreen constructor');
        console.log(this.sceneVars);

        // class specific event listeners
        document.getElementById('friendsModeSelectScreen').classList.remove('d-none');

        // Add event listeners
        this.soloCallback = () => {
            this.sceneVars.game_mode = 'solo';
            console.log("Game Mode: " + this.sceneVars.game_mode);
            this.clean();
            this.screenRouterCallback("gameScreen");
        };

        this.tournamentCallback = () => {
            this.sceneVars.game_mode = 'tourney';
            console.log("Game Mode: " + this.sceneVars.game_mode);
            this.clean();
            this.screenRouterCallback("gameScreen");
        };

        this.backToMenu2Callback = () => {
            console.log('backToMenuButton clicked');
            this.clean();
            this.screenRouterCallback("menuScreen");
        };

        // Add event listeners
        document.getElementById('soloButton').addEventListener('click', this.soloCallback);
        document.getElementById('tournamentButton').addEventListener('click', this.tournamentCallback);
        document.getElementById('backToMenuButton_2').addEventListener('click', this.backToMenu2Callback);
    }
    
    clean() {
        console.log('closing AILvlSelectScreen');
        // Remove event listener
        document.getElementById('soloButton').removeEventListener('click', this.soloCallback);
        document.getElementById('tournamentButton').removeEventListener('click', this.tournamentCallback);
        document.getElementById('backToMenuButton_2').removeEventListener('click', this.backToMenu2Callback);
        document.getElementById('friendsModeSelectScreen').classList.add('d-none');
    }
}

export default FriendsModeSelectScreen;