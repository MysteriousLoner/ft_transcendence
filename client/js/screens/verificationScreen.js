import makeRequest from "../utils/requestWrapper.js";

class VerificationScreen {
    constructor(sceneRouterCallback, screenRouterCallback, sceneVars) {
        this.sceneVars = sceneVars;
        this.sceneRouterCallback = sceneRouterCallback;
        this.screenRouterCallback = screenRouterCallback;
        // class specific event listeners
        document.getElementById('verificationScreen').classList.remove('d-none');
        document.getElementById('verificationForm').addEventListener('submit', (event) => this.submitForm(event));
    }

    clean() {
        document.getElementById('verificationForm').removeEventListener('submit', (event) => this.submitForm(event));
        document.getElementById('verificationScreen').classList.add('d-none');
    }
    
    submitForm(event) {
        event.preventDefault();
        const verificationCode = document.getElementById('verificationCode').value;
        const username = this.sceneVars.username;
        const data = {
            verificationCode: verificationCode,
            username: username
        };
        makeRequest('POST', 'api/auth/verify/', data)
        .then(response => {
            if (response.error) {
                alert(response.error);
            } else {
                alert('User registered successfully!');
                this.sceneRouterCallback("homeScene");
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('An unexpected error occurred. Please try again.');
        });
    }
}

export default VerificationScreen;