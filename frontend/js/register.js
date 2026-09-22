const API_BASE_URL = "http://localhost:5050/api";


document.addEventListener("DOMContentLoaded", () => {

    const registerForm =
        document.getElementById("registerForm");

    if (!registerForm) {
        return;
    }

    registerForm.addEventListener(
        "submit",
        handleRegistration
    );

});


// =====================================================
// REGISTRATION
// =====================================================

async function handleRegistration(event) {

    event.preventDefault();


    const messageElement =
        document.getElementById("registerMessage");

    const registerButton =
        document.getElementById("registerButton");

    const buttonText =
        registerButton.querySelector(".button-text");

    const buttonLoading =
        registerButton.querySelector(".button-loading");


    // =================================================
    // GET FORM VALUES
    // =================================================

    const name =
        document.getElementById("userName")
            .value.trim();

    const email =
        document.getElementById("email")
            .value.trim();

    const password =
        document.getElementById("password")
            .value;

    const confirmPassword =
        document.getElementById("confirmPassword")
            .value;

    const organizationName =
        document.getElementById("organizationName")
            .value.trim();

    const organizationType =
        document.getElementById("organizationType")
            .value;

    const registrationNumber =
        document.getElementById("registrationNumber")
            .value.trim();

    const contactPerson =
        document.getElementById("contactPerson")
            .value.trim();

    const contactNumber =
        document.getElementById("contactNumber")
            .value.trim();

    const address =
        document.getElementById("address")
            .value.trim();

    const city =
        document.getElementById("city")
            .value.trim();


    clearMessage(messageElement);


    // =================================================
    // VALIDATION
    // =================================================

    if (
        !name ||
        !email ||
        !password ||
        !confirmPassword ||
        !organizationName ||
        !organizationType ||
        !registrationNumber ||
        !contactPerson ||
        !contactNumber ||
        !address ||
        !city
    ) {

        showMessage(
            messageElement,
            "Please complete all required fields.",
            "error"
        );

        return;
    }


    if (password.length < 6) {

        showMessage(
            messageElement,
            "Password must contain at least 6 characters.",
            "error"
        );

        return;
    }


    if (password !== confirmPassword) {

        showMessage(
            messageElement,
            "Passwords do not match.",
            "error"
        );

        return;
    }


    // =================================================
    // LOADING STATE
    // =================================================

    registerButton.disabled = true;

    buttonText.hidden = true;

    buttonLoading.hidden = false;


    try {

        // =============================================
        // REGISTER
        // =============================================

        const response = await fetch(
            `${API_BASE_URL}/auth/register`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    name,

                    email,

                    password,

                    organizationName,

                    organizationType,

                    registrationNumber,

                    contactPerson,

                    contactNumber,

                    address,

                    city

                })
            }
        );


        const data =
            await response.json();


        console.log(
            "Registration response:",
            data
        );


        // =============================================
        // ERROR
        // =============================================

        if (!response.ok) {

            throw new Error(
                data.message ||
                data.error ||
                "Registration failed."
            );

        }


        // =============================================
        // SAVE AUTHENTICATION
        // =============================================

        if (data.token && data.user) {

            localStorage.setItem(
                "medishare_token",
                data.token
            );


            localStorage.setItem(
                "medishare_user",
                JSON.stringify(data.user)
            );

        }


        // =============================================
        // SUCCESS
        // =============================================

        showMessage(
            messageElement,

            "Account created successfully. Redirecting to your dashboard...",

            "success"
        );


        // =============================================
        // REDIRECT DIRECTLY TO DASHBOARD
        // =============================================

        setTimeout(() => {

            window.location.href =
                "/dashboard.html";

        }, 800);


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        showMessage(
            messageElement,

            error.message ||
            "Registration failed. Please try again.",

            "error"
        );


    } finally {

        registerButton.disabled = false;

        buttonText.hidden = false;

        buttonLoading.hidden = true;

    }

}


// =====================================================
// SHOW MESSAGE
// =====================================================

function showMessage(
    element,
    message,
    type
) {

    element.textContent =
        message;

    element.className =
        `auth-message auth-message-${type}`;

    element.hidden = false;

}


// =====================================================
// CLEAR MESSAGE
// =====================================================

function clearMessage(element) {

    element.textContent = "";

    element.className =
        "auth-message";

    element.hidden = true;

}