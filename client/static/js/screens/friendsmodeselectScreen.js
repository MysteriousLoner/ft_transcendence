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
        document.getElementById('soloButton').addEventListener('click', () => {
            this.sceneVars.game_mode = 'solo';
            console.log("Game Mode: " + this.sceneVars.game_mode);
            this.clean();
            this.screenRouterCallback("gameScreen");
        });
        document.getElementById('tournamentButton').addEventListener('click', () => {
            this.sceneVars.game_mode = 'tourney';
            console.log("Game Mode: " + this.sceneVars.game_mode);
            this.clean();
            this.screenRouterCallback("gameScreen");
        });
        document.getElementById('backToMenuButton_2').addEventListener('click', () => {
            console.log('backToMenuButton clicked');
            this.clean();
            this.screenRouterCallback("menuScreen");
        });
    }
    
    clean() {
        console.log('closing AILvlSelectScreen');
        document.getElementById('friendsModeSelectScreen').classList.add('d-none');
    }
}

export default FriendsModeSelectScreen;