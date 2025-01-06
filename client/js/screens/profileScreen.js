import navigateTo from "../router.js";
import makeRequest from "../requestWrapper.js";

class ProfileScreen {
    constructor() {
        // class specific event listeners
        // constructor functions
        document.get
        
    }

    async logout() {
        try {
            const response = await makeRequest('POST', 'api/auth/logout/');
            if (response.error) {
                alert(response.error);
            } else {
                localStorage.removeItem('token');
                navigateTo('landingScreen');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An unexpected error occurred. Please try again.');
        }
    }
}