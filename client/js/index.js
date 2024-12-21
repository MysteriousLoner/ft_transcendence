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

document.getElementById('startGameButton-vp').addEventListener('click', function() {
    navigateTo('gameContainer');
    history.pushState({ screen: 'gameContainer' }, '', '#register');
    startGame();
});


document.getElementById('registerForm').addEventListener('submit', function(event) { 
    event.preventDefault();

    const username = document.getElementById('username1').value; 
    const email = document.getElementById('email').value; 
    const password = document.getElementById('password').value; 
    const data = { 
        username: username, 
        email: email, 
        password: password 
    }; 

    console.log("username: " + username);
    console.log("email: " + email);
    console.log("password: " + password);

    fetch('http://127.0.0.1:8000/api/auth/create/', { 
        method: 'POST', 
        headers: { 
            'Content-Type': 'application/json' 
        }, 
        body: JSON.stringify(data) 
    }) 
    .then(response => response.json()) 
    .then(data => { 
        console.log('Success:', data); 
        if (data.error) {
            document.getElementById('errorText').innerText = data.error;
            document.getElementById('errorMessage').classList.remove('d-none');
        } else {
            navigateTo('verificationPage');
        }
    }) 
    .catch((error) => { 
        console.error('Error:', error);
        document.getElementById('errorText').innerText = 'An unexpected error occurred. Please try again.';
        document.getElementById('errorMessage').classList.remove('d-none');
    }); 
});

document.getElementById('loginForm').addEventListener('submit', function(event) { 
    event.preventDefault();

    const username = document.getElementById('username').value; 
    const password = document.getElementById('userPassword').value; 
    const data = { 
        username: username, 
        password: password 
    }; 

    console.log("username: " + username);
    console.log("password: " + password);

    fetch('http://127.0.0.1:8000/api/auth/login/', { 
        method: 'POST', 
        headers: { 
            'Content-Type': 'application/json' 
        }, 
        body: JSON.stringify(data) 
    }) 
    .then(response => response.json()) 
    .then(data => { 
        console.log('Success:', data); 
        if (data.error) {
            document.getElementById('errorText').innerText = data.error;
            document.getElementById('errorMessage').classList.remove('d-none');
        } else {
            navigateTo('menuScreen');
        }
    }) 
    .catch((error) => { 
        console.error('Error:', error);
        document.getElementById('errorText').innerText = 'An unexpected error occurred. Please try again.';
        document.getElementById('errorMessage').classList.remove('d-none');
    }); 
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
