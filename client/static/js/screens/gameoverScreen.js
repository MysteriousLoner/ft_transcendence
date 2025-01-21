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
            this.message = 'Congratulations ' + this.sceneVars.displayName + ', you won!'
        else
            this.message = 'Sorry ' + this.sceneVars.displayName + ', you lost!'

        document.getElementById('gameOverText').textContent = this.message;
        document.getElementById('backToMenuButton_3').addEventListener('click', () => {
            this.screenRouterCallback("menuScreen");
        });
    }

    clean() {
        console.log('closing GameOverScreen');
        document.getElementById('gameOverScreen').classList.add('d-none');
    }
}

export default GameOverScreen;