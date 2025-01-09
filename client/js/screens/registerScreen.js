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
		document.getElementById('backbtn2').addEventListener('click', () => this.backToHome());
	}	

	clean() {
		document.getElementById('registerForm').removeEventListener('submit', (event) => this.submitForm(event));
		document.getElementById('backbtn2').removeEventListener('click', () => this.backToHome());
		document.getElementById('registerScreen').classList.add('d-none');
		document.getElementById('errorMessage2').classList.add('d-none');
	}

	backToHome() {
		event.preventDefault();
		this.clean();
		this.sceneRouterCallback('homeScene');
	}

	async submitForm(event) {
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
		try {
			const response = await makeRequest('POST', 'api/auth/register/', data)
			if (response.error) {
				document.getElementById('errorText2').innerText = response.error;
				document.getElementById('errorMessage2').classList.remove('d-none');
			} else {
				document.getElementById('userEmail').innerText = email;
				this.sceneVars.username = username;
				this.screenRouterCallback("verificationScreen");
			}
		}
		catch (error) {
			console.error('Error:', error);
			document.getElementById('errorText2').innerText = 'An unexpected error occurred. Please try again.';
			document.getElementById('errorMessage2').classList.remove('d-none');
		};
	}
}

export default RegisterScreen;