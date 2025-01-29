import makeRequest from "../utils/requestWrapper.js";

class VerificationScreen {
    constructor(sceneRouterCallback, screenRouterCallback, sceneVars) {
        this.sceneVars = sceneVars;
        this.sceneRouterCallback = sceneRouterCallback;
        this.screenRouterCallback = screenRouterCallback;

        // Store the event listener function as a class property
        this.submitFormHandler = (event) => this.submitForm(event);

        // Clean up any previous instance
        this.clean();

        // Initialize the screen
        document.getElementById('verificationCode').value = '';
        document.getElementById('verificationScreen').classList.remove('d-none');

        // Add the event listener
        document.getElementById('verificationForm').addEventListener('submit', this.submitFormHandler);
    }

    clean() {
        // Remove the event listener using the stored function reference
        document.getElementById('verificationForm').removeEventListener('submit', this.submitFormHandler);
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
                    Toastify({
                        text: response.error,
                        duration: 3000,
                        position: "center",
                        close: true
                    }).showToast();
                    // alert(response.error);
                    this.sceneRouterCallback("registerScene");
                } else {
                    Toastify({
                        text: '✅ User registered successfully!',
                        duration: 3000,
                        position: "center",
                        close: true
                    }).showToast();
                    // alert('User registered successfully!');
                    this.sceneRouterCallback("homeScene");
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                Toastify({
                    text: 'An unexpected error occurred. Please try again.',
                    duration: 3000,
                    position: "center",
                    close: true
                }).showToast();
                // alert('An unexpected error occurred. Please try again.');
            });
    }
}

export default VerificationScreen;