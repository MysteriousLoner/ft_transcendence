import makeRequest from '../utils/requestWrapper.js';

class LoginScreen {
    constructor(sceneRouterCallback, screenRouterCallback) {
        this.sceneRouterCallback = sceneRouterCallback;
        this.screenRouterCallback = screenRouterCallback;
        // class specific event listeners
        document.getElementById('loginForm').addEventListener('submit', (event) => this.submitForm(event));
        document.getElementById('loginScreen').classList.remove('d-none');
    }

    clean() {
        document.getElementById('loginForm').removeEventListener('submit', (event) => this.submitForm(event));
        document.getElementById('loginScreen').classList.add('d-none');
    }

    async submitForm(event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('userPassword').value;
        const data = {
            username: username,
            password: password
        };

        try {
            const response = await makeRequest('POST', 'api/auth/login/', data);
            if (response.error) {
                document.getElementById('errorText').innerText = response.error;
                document.getElementById('errorMessage').classList.remove('d-none');
            } else {
                this.clean();
                console.log('User logged in successfully!');
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('errorText').innerText = 'An unexpected error occurred. Please try again.';
            document.getElementById('errorMessage').classList.remove('d-none');
        }
    }
}

export default LoginScreen;