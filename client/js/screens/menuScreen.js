class MenuScreen {
    constructor(sceneRouterCallback, screenRouterCallback) {
        // routing callback functions standard
        this.sceneRouterCallback = sceneRouterCallback;
        this.screenRouterCallback = screenRouterCallback;

        console.log('MenuScreen constructor');
        // class specific event listeners
        document.getElementById('menuScreen').classList.remove('d-none');

        // route to gamescene
        document.getElementById('startGameButton-vp').addEventListener('click', this.switchToGameScene.bind(this));
    }

    clean() {
        console.log('closing menu screen');
        document.getElementById('menuScreen').classList.add('d-none');
        document.getElementById('startGameButton-vp').removeEventListener('click', this.switchToGameScene.bind(this));
    }

    switchToGameScene() {
        console.log('switching to game scene');
        this.sceneRouterCallback('gameScene');
    }
}

export default MenuScreen;
