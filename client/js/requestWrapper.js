/**
 * This file contains wrapper functions I made to handle request to the servers.
 * Since we use JWT to secure the server, these wrapper funnctionns will handle the token passing.
 * Standard input should be (apiEndpoint, requestMethod, jsonMessage)
 * Standard output will always be a json object.
 */

async function makeRequest(method, url, jsonMessage) {
    let refreshToken = getCookie('refresh');
    let accessToken = getCookie('access');

    // Ensures user is authenticated
    if ((refreshToken === null || accessToken === null) && !isPublicEndpoint(url)) {
        console.log('unauthenticated user, register/login first');
        return NO_JWT;
    }

    // start building request object with method and header first
    let request = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonMessage),
    };

    // check if JWT, return error if refresh token expired
    if (!isPublicEndpoint(url) && isTokenExpired(accessToken)) {
        console.log('access token expired, refreshing');
        accessToken = refreshAccessToken(refreshToken);
        if (accessToken === null) {
            return INVALID_JWT;
        }
    }

    // add JWT to header
    if (!isPublicEndpoint(url)) {
        request.headers['Authorization'] = 'Bearer ' + accessToken;
    }

    // make the request and return the response
    console.log('making request to ' + ServerIp + url);
    const response = await fetch(ServerIp + url, request);

    const data = await response.json();

    // add new JWTs to cookies
    if (data.refresh) {
        console.log('refresh token: ' + data.refresh);
        document.cookie = `refresh=${data.refresh}; Secure; SameSite=None; path=/`;
        refreshToken = getCookie('refresh');
        console.log('refresh token updated');
    }
    if (data.access) {
        console.log('access token: ' + data.access);
        document.cookie = `access=${data.access}; Secure; SameSite=None; path=/`;
        accessToken = getCookie('access');
        console.log('access token updated');
    }
    console.log('refresh: ' + refreshToken);
    console.log('access: ' + accessToken);
    return data;
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

const ServerIp = "http://localhost:8000/";
