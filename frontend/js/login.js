const API_BASE_URL =
    "https://medishare-4h7g.onrender.com/api";


document.addEventListener("DOMContentLoaded", () => {

    console.log("MediShare login page loaded");


    const loginForm =
        document.getElementById("loginForm");

    const loginMessage =
        document.getElementById("loginMessage");


    if (!loginForm) {

        console.error(
            "Login form not found."
        );

        return;

    }


    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            await handleLogin(
                loginForm,
                loginMessage
            );

        }
    );

});


async function handleLogin(
    loginForm,
    loginMessage
) {

    const emailInput =
        document.getElementById("email");

    const passwordInput =
        document.getElementById("password");

    const loginButton =
        document.getElementById("loginButton");


    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    if (!email || !password) {

        showMessage(
            loginMessage,
            "Please enter your email and password.",
            "error"
        );

        return;

    }


    loginButton.disabled = true;

    loginButton.textContent =
        "Signing in...";


    try {

        console.log(
            "Sending login request to Render..."
        );


        const response =
            await fetch(
                `${API_BASE_URL}/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );


        const data =
            await response.json();


        console.log(
            "Login response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Login failed."
            );

        }


        if (!data.token || !data.user) {

            throw new Error(
                "Invalid response from server."
            );

        }


        localStorage.setItem(
            "medishare_token",
            data.token
        );


        localStorage.setItem(
            "medishare_user",
            JSON.stringify(data.user)
        );


        console.log(
            "Logged-in role:",
            data.user.role
        );


        showMessage(
            loginMessage,
            "Login successful. Redirecting...",
            "success"
        );


        setTimeout(() => {

            if (
                data.user.role === "ADMIN"
            ) {

                window.location.href =
                    "/admin.html";

            } else {

                window.location.href =
                    "/dashboard.html";

            }

        }, 300);


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        showMessage(
            loginMessage,
            error.message ||
            "Unable to login.",
            "error"
        );


        loginButton.disabled = false;

        loginButton.textContent =
            "Sign In";

    }

}


function showMessage(
    element,
    message,
    type
) {

    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        `login-message ${type}`;


    element.style.display =
        "block";

}