import makeRequest from "../utils/requestWrapper.js";

class RegisterScreen {
    constructor(sceneRouterCallback, screenRouterCallback, sceneVars) {
        console.log('RegisterScreen constructor');

        this.sceneVars = sceneVars;
        this.sceneRouterCallback = sceneRouterCallback;
        this.screenRouterCallback = screenRouterCallback;

        this.submitFormHandler = this.submitForm.bind(this);
        this.backToHomeHandler = this.backToHome.bind(this);

        document.getElementById('registerForm').addEventListener('submit', this.submitFormHandler);
        document.getElementById('backbtn2').addEventListener('click', this.backToHomeHandler);

        document.getElementById('registerScreen').classList.remove('d-none');
        document.getElementById('errorMessage2').classList.add('d-none');
    }

    clean() {
        document.getElementById('registerForm').removeEventListener('submit', this.submitFormHandler);
        document.getElementById('backbtn2').removeEventListener('click', this.backToHomeHandler);
        
        document.getElementById('registerScreen').classList.add('d-none');
        document.getElementById('errorMessage2').classList.add('d-none');
    }

    backToHome(event) {
        event.preventDefault();
        console.log('Back button pressed');
        this.clean();
        this.sceneRouterCallback('homeScene');
    }

    async submitForm(event) {
        event.preventDefault();
        console.log('Submitting form');

        const username = document.getElementById('username1').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const data = { username, email, password };

        try {
            const response = await makeRequest('POST', 'api/auth/register/', data);
            if (response.error) {
                document.getElementById('errorText2').innerText = response.error;
                document.getElementById('errorMessage2').classList.remove('d-none');
                console.log('Form submission error: ', response.error);
                return;
            }

            document.getElementById('userEmail').innerText = email;
            this.sceneVars.username = username;
            this.clean();
            this.screenRouterCallback("verificationScreen");

            console.log('Form submission successful, switching to Verification Screen');
        } catch (error) {
            console.error('Form submission caught error: ', error);
            document.getElementById('errorText2').innerText = 'An unexpected error occurred. Please try again.';
            document.getElementById('errorMessage2').classList.remove('d-none');
        }
    }
}

export default RegisterScreen;
