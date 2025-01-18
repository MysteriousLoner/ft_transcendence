/**
 * This file contains wrapper functions I made to handle request to the servers.
 * Since we use JWT to secure the server, these wrapper funnctionns will handle the token passing.
 * Standard input should be (apiEndpoint, requestMethod, jsonMessage)
 * Standard output will always be a json object.
 * 
 * IMPORTANT
 * This is an async function, so you should always use await or other methods to wait for the output when calling this function and use them in an async funnction
 */
let isRequestInProgress = false;
const verbose = false;

async function makeRequest(method, url, jsonMessage) {
    if (verbose) { console.log('Making request'); }
    
    if (isRequestInProgress) {
        if (verbose)
            console.log('Request already in progress');
        return { error: 'Request already in progress' };
    }

    isRequestInProgress = true;

    try {
        let refreshToken = getCookie('refresh');
        let accessToken = getCookie('access');

        // Ensures user is authenticated
        if ((refreshToken === null || accessToken === null) && !isPublicEndpoint(url)) {
            if (verbose)
                console.error('Unauthenticated user, register/login first');
            return ErrorMessages.NO_JWT;
        }

        let request = {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonMessage)
        };

        if (!isPublicEndpoint(url) && isTokenExpired(accessToken)) {
            if (verbose)
                console.log('Access token expired, refreshing');
            accessToken = await refreshAccessToken(refreshToken);

            if (accessToken === null) {
                return ErrorMessages.INVALID_JWT;
            }
        }

        if (!isPublicEndpoint(url)) {
            request.headers['Authorization'] = 'Bearer ' + accessToken;
        }

        if (verbose)
            console.log('Making request to ' + ServerIp + url);
        const response = await fetch(ServerIp + url, request);
        const data = await response.json();

        if (data.error) {
            if (verbose)
                console.error('Error:', data.error);
        }

        if (data.refresh) {
            // console.log('Refresh token received: ' + data.refresh);
            document.cookie = `refresh=${data.refresh}; Secure; SameSite=None; path=/`;
        }
        if (data.access) {
            // console.log('Access token received: ' + data.access);
            document.cookie = `access=${data.access}; Secure; SameSite=None; path=/`;
        }

        if (verbose)
            console.log('Request successful', data);
        return data;

    } catch (error) {
        if (verbose)
            console.error('Request failed:', error);
        return { error: 'An unexpected error occurred. Please try again.' };
    
    } finally {
        isRequestInProgress = false;
        if (verbose)
            console.log('Request completed - finally block');
    }
}

// utility functions
// get cookie by name
function getCookie(name) {
    const cookieArr = document.cookie.split(';');
    for (let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split('=');
        if (name === cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}

// checks if url is a public endpoint (no need JWT)
function isPublicEndpoint(url) { 
    return Object.values(PublicEndpoints).some(endpoint => url.includes(endpoint));
}

// checks if JWT access token is expired
function isTokenExpired(token) {
    if (token === null) {
        return true;
    }
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    return decodedToken.exp < (Date.now() / 1000);
}

// obtain new access token with refresh token
function refreshAccessToken(refreshToken) {
    if (refreshToken === null) {
        return null;
    }

    let request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'refresh': refreshToken })
    };

    const response = fetch(ServerIp + PublicEndpoints.REFRESH, request);
    if (response.ok) {
        const data = response.json();
        return data.access;
    } else {
        return null;
    }
}

// Parse JWT into JSON object
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}


// constant variables
const ErrorMessages = {
    NO_JWT: { 
        "error": "Access token / refresh token is null, user unauthenticated, accesing protected endpoint", 
        "code": "NO_JWT",
     },
    INVALID_JWT: { 
        "error": "Invalid JWT token, please login again", 
        "code": "INVALID_JWT",
    },
}

const PublicEndpoints = {
    LOGIN: "api/auth/login/",
    REGISTER: "api/auth/register/",
    VERIFICATION: "api/auth/verify/",
    REFRESH: "api/token/refresh/",
}

const ProtectedEndpoints = {
    PROFILE: "",
}

const ServerIp = "http://localhost:8000/";

export default makeRequest;
