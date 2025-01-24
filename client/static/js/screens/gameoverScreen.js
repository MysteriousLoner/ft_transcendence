class GameOverScreen {
    constructor(sceneRouterCallback, screenRouterCallback, sceneVars) {
        // routing callback functions standard
        this.sceneRouterCallback = sceneRouterCallback;
        this.screenRouterCallback = screenRouterCallback;
        this.sceneVars = sceneVars;

        console.log('GameOverScreen constructor');
        console.log(this.sceneVars);

        document.getElementById('gameOverScreen').classList.remove('d-none');
    
        if (this.sceneVars.username == this.sceneVars.game_outcome.winner)
            this.message = 'Congratulations ' + this.sceneVars.displayName + ', you won!\nScore: '
                + this.sceneVars.game_outcome.leftscore_info + ' : ' + this.sceneVars.game_outcome.rightscore_info;
        else
            this.message = 'Sorry ' + this.sceneVars.displayName + ', you lost!\nScore: '
                + this.sceneVars.game_outcome.leftscore_info + ' : ' + this.sceneVars.game_outcome.rightscore_info;
        document.getElementById('gameOverText').textContent = this.message;

        // Add event listeners
        this.backToMenu3Callback = () => {
            this.screenRouterCallback("menuScreen");
        };

        document.getElementById('backToMenuButton_3').addEventListener('click', this.backToMenu3Callback);
    }

    clean() {
        console.log('closing GameOverScreen');
        // Remove event listener
        document.getElementById('backToMenuButton_3').removeEventListener('click', this.backToMenu3Callback);
        document.getElementById('gameOverScreen').classList.add('d-none');
    }
}

export default GameOverScreen;