// index.js
document.getElementById('loginButton').addEventListener('click', function() {
    navigateTo('loginScreen');
    history.pushState({ screen: 'loginScreen' }, '', '#login');
});

document.getElementById('registerButton').addEventListener('click', function() {
    navigateTo('registerScreen');
    history.pushState({ screen: 'registerScreen' }, '', '#register');
});

window.addEventListener('popstate', function(event) {
    if (event.state && event.state.screen) {
        navigateTo(event.state.screen);
    } else {
        navigateTo('landingScreen');
    }
});

document.getElementById('loginForm').addEventListener('submit', function(event) { 
    event.preventDefault(); 
    navigateTo('gameContainer'); 
    startGame(); 
});

function navigateTo(screenId) {
    // Hide all screens
    document.querySelectorAll('.container').forEach(screen => {
        screen.classList.add('d-none');
    });
    // Show the target screen
    document.getElementById(screenId).classList.remove('d-none');
}

// Initial load: show the landing screen
document.getElementById('landingScreen').classList.remove('d-none');
history.replaceState({ screen: 'landingScreen' }, '', '#');
