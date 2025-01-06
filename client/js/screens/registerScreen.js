// functions for the register screen components
import makeRequest from "../utils/requestWrapper.js";

class RegisterScreen {
    constructor(sceneRouterCallback, screenRouterCallback, sceneVars) {
        console.log('RegisterScreen constructor');
        // class specific event listeners
        this.sceneVars = sceneVars;
        this.sceneRouterCallback = sceneRouterCallback;
        this.screenRouterCallback = screenRouterCallback;
        document.getElementById('registerScreen').classList.remove('d-none');
        document.getElementById('registerForm').addEventListener('submit', (event) => this.submitForm(event));
    }

    clean() {
        document.getElementById('registerForm').removeEventListener('submit', (event) => this.submitForm(event));
        document.getElementById('registerScreen').classList.add('d-none');
    }

    submitForm(event) {
        // the username here will be used in verification screen too.
        event.preventDefault();

        const username = document.getElementById('username1').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const data = {
            username: username,
            email: email,
            password: password
        };

        makeRequest('POST', 'api/auth/register/', data)
        .then(response => {
            if (response.error) {
                document.getElementById('errorText').innerText = response.error;
                document.getElementById('errorMessage').classList.remove('d-none');
            } else {
                document.getElementById('userEmail').innerText = email;
                this.sceneVars.username = username;
                this.screenRouterCallback("verificationPage");
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            document.getElementById('errorText').innerText = 'An unexpected error occurred. Please try again.';
            document.getElementById('errorMessage').classList.remove('d-none');
        });
    }
}

export default RegisterScreen;