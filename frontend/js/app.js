const API_BASE_URL = "http://localhost:5050/api";


// =========================================
// AUTHENTICATION HELPERS
// =========================================

function getToken() {
    return localStorage.getItem("medishare_token");
}


function saveToken(token) {
    localStorage.setItem("medishare_token", token);
}


function removeToken() {
    localStorage.removeItem("medishare_token");
    localStorage.removeItem("medishare_user");
}


function saveUser(user) {
    localStorage.setItem(
        "medishare_user",
        JSON.stringify(user)
    );
}


function getUser() {
    const user = localStorage.getItem("medishare_user");

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch (error) {
        return null;
    }
}


// =========================================
// API REQUEST HELPER
// =========================================

async function apiRequest(
    endpoint,
    options = {}
) {
    const token = getToken();

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };


    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }


    try {

        const response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                ...options,
                headers
            }
        );


        const data = await response.json();


        if (!response.ok) {
            throw new Error(
                data.message || "Something went wrong"
            );
        }


        return data;

    } catch (error) {

        console.error(
            "MediShare API Error:",
            error.message
        );

        throw error;
    }
}


// =========================================
// LOGOUT
// =========================================

function logout() {

    removeToken();

    window.location.href = "login.html";
}


// =========================================
// PROTECT PAGE
// =========================================

function requireLogin() {

    const token = getToken();

    if (!token) {
        window.location.href = "login.html";
    }
}


// =========================================
// CHECK API CONNECTION
// =========================================

async function checkAPIConnection() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/health`
        );

        const data = await response.json();

        console.log(
            "MediShare API:",
            data
        );

        return data;

    } catch (error) {

        console.error(
            "Unable to connect to MediShare backend"
        );

        return null;
    }
}


// =========================================
// PAGE INITIALIZATION
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "MediShare frontend loaded"
        );

        checkAPIConnection();

    }
);