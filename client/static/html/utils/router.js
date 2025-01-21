import LandingScreen from '../pages/landingScreen.js';
import LoginScreen from '../pages/login.js';
import RegisterScreen from '../pages/registerScreen.js';
import VerificationScreen from './pages/verificationScreen.js';
// import GameContainer from './gameContainer.js';

const screenNames = {
    landingScreen: LandingScreen,
    loginScreen: LoginScreen,
    registerScreen: RegisterScreen,
    verificationPage: VerificationScreen,
    // gameContainer: GameContainer
};

const htmlElementTerms = {
    D_NONE: 'd-none',
    CONTAINER: '.container'
};

let currentScreen = null;

export default function navigateTo(screenId) {
    // Hide all screens
    console.log('navigateTo', screenId);
    document.querySelectorAll(htmlElementTerms.CONTAINER).forEach(screen => {
        screen.classList.add(htmlElementTerms.D_NONE);
    });
    currentScreen = null;

    // Show the target screen
    if (screenNames[screenId]) {
        console.log('showing', screenId);
        currentScreen = new screenNames[screenId]();
    } else {
        console.error(`No screen class found for ID: ${screenId}`);
    }
    history.replaceState({ screen: screenId }, '', '#');
}

function changeScene() {
    
}
