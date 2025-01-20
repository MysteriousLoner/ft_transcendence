import makeRequest from '../utils/requestWrapper.js';

class LoginScreen {
    constructor(sceneRouterCallback, screenRouterCallback, sceneVars) {
        this.sceneRouterCallback = sceneRouterCallback;
        this.screenRouterCallback = screenRouterCallback;
        this.sceneVars = sceneVars;
        // class specific event listeners
        this.clean();
        document.getElementById('loginForm').addEventListener('submit', (event) => this.submitForm(event));
		document.getElementById('backbtn').addEventListener('click', () => this.backToHome());
        document.getElementById('loginScreen').classList.remove('d-none');
    }

    clean() {
        document.getElementById('loginForm').removeEventListener('submit', (event) => this.submitForm(event));
		document.getElementById('backbtn').removeEventListener('click', () => this.backToHome());
        document.getElementById('loginScreen').classList.add('d-none');
		document.getElementById('errorMessage').classList.add('d-none');
    }

	backToHome() {
		event.preventDefault();
		this.clean();
		this.sceneRouterCallback('homeScene');
	}

    async submitForm(event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('userPassword').value;
        const data = {
            username: username,
            password: password
        };
        console.log(data.username);

        try {
            const response = await makeRequest('POST', 'api/auth/login/', data);
            if (response.error) {
                document.getElementById('errorText').innerText = response.error;
                document.getElementById('errorMessage').classList.remove('d-none');
            } else {
                this.sceneVars.username = data.username;
                this.clean();
                this.sceneRouterCallback('menuScene');
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('errorText').innerText = 'An unexpected error occurred. Please try again.';
            document.getElementById('errorMessage').classList.remove('d-none');
        }
    }
}

export default LoginScreen;