const API_BASE_URL = "http://localhost:5050/api";

let pendingOrganizations = [];
let currentUser = null;


// ==================================================
// INITIALIZE ADMIN PAGE
// ==================================================

document.addEventListener("DOMContentLoaded", () => {

    const token =
        localStorage.getItem("medishare_token");

    const storedUser =
        localStorage.getItem("medishare_user");


    // ----------------------------------------------
    // Check login
    // ----------------------------------------------

    if (!token || !storedUser) {

        window.location.href = "login.html";

        return;
    }


    // ----------------------------------------------
    // Read user
    // ----------------------------------------------

    try {

        currentUser =
            JSON.parse(storedUser);

    } catch (error) {

        console.error(
            "Failed to read stored user:",
            error
        );

        localStorage.removeItem(
            "medishare_token"
        );

        localStorage.removeItem(
            "medishare_user"
        );

        window.location.href =
            "login.html";

        return;
    }


    // ----------------------------------------------
    // Admin-only protection
    // ----------------------------------------------

    if (
        !currentUser ||
        currentUser.role !== "ADMIN"
    ) {

        alert(
            "Administrator access required."
        );

        window.location.href =
            "dashboard.html";

        return;
    }


    initializeAdminUI();

    loadPendingOrganizations();
});


// ==================================================
// INITIALIZE UI
// ==================================================

function initializeAdminUI() {

    const navUserName =
        document.getElementById(
            "navUserName"
        );

    const navAvatar =
        document.getElementById(
            "navAvatar"
        );


    if (navUserName) {

        navUserName.textContent =
            currentUser.name || "Admin";
    }


    if (navAvatar) {

        navAvatar.textContent =
            getInitials(
                currentUser.name || "Admin"
            );
    }


    // ----------------------------------------------
    // Refresh button
    // ----------------------------------------------

    const refreshButton =
        document.getElementById(
            "refreshOrganizations"
        );


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadPendingOrganizations
        );
    }


    // ----------------------------------------------
    // Search
    // ----------------------------------------------

    const searchInput =
        document.getElementById(
            "organizationSearch"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            renderOrganizations
        );
    }


    // ----------------------------------------------
    // Logout
    // ----------------------------------------------

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            logout
        );
    }
}


// ==================================================
// LOAD PENDING ORGANIZATIONS
// ==================================================

async function loadPendingOrganizations() {

    const token =
        localStorage.getItem(
            "medishare_token"
        );


    if (!token) {

        logout();

        return;
    }


    showLoading(true);

    hideMessage();


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/organizations/verification/pending`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "Pending organizations response:",
            data
        );


        // ------------------------------------------
        // Authentication expired
        // ------------------------------------------

        if (response.status === 401) {

            logout();

            return;
        }


        // ------------------------------------------
        // Not admin
        // ------------------------------------------

        if (response.status === 403) {

            showMessage(
                "You do not have administrator access.",
                "error"
            );

            return;
        }


        // ------------------------------------------
        // Other API error
        // ------------------------------------------

        if (!response.ok) {

            throw new Error(
                data.message ||
                data.error ||
                "Failed to load organizations."
            );
        }


        // ------------------------------------------
        // Store organizations
        // ------------------------------------------

        pendingOrganizations =
            Array.isArray(data.organizations)
                ? data.organizations
                : [];


        updateStats();

        renderOrganizations();


    } catch (error) {

        console.error(
            "Failed to load pending organizations:",
            error
        );


        showMessage(
            error.message ||
            "Unable to load pending organizations.",
            "error"
        );


    } finally {

        showLoading(false);
    }
}


// ==================================================
// UPDATE STATS
// ==================================================

function updateStats() {

    const pendingCount =
        document.getElementById(
            "pendingCount"
        );

    const queueCount =
        document.getElementById(
            "queueCount"
        );


    const count =
        pendingOrganizations.length;


    if (pendingCount) {

        pendingCount.textContent =
            count;
    }


    if (queueCount) {

        queueCount.textContent =
            count;
    }
}


// ==================================================
// RENDER ORGANIZATIONS
// ==================================================

function renderOrganizations() {

    const grid =
        document.getElementById(
            "organizationGrid"
        );

    const emptyState =
        document.getElementById(
            "adminEmpty"
        );


    if (!grid) {
        return;
    }


    const searchInput =
        document.getElementById(
            "organizationSearch"
        );


    const searchTerm =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const filteredOrganizations =
        pendingOrganizations.filter(
            (organization) => {

                const searchableText = [

                    organization.name,

                    organization.type,

                    organization.registrationNumber,

                    organization.contactPerson,

                    organization.contactNumber,

                    organization.email,

                    organization.city,

                    organization.address

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                return searchableText.includes(
                    searchTerm
                );
            }
        );


    grid.innerHTML = "";


    // ------------------------------------------
    // No pending organizations
    // ------------------------------------------

    if (
        pendingOrganizations.length === 0
    ) {

        grid.hidden = true;

        if (emptyState) {
            emptyState.hidden = false;
        }

        return;
    }


    // ------------------------------------------
    // Search found nothing
    // ------------------------------------------

    if (
        filteredOrganizations.length === 0
    ) {

        grid.hidden = false;

        if (emptyState) {
            emptyState.hidden = true;
        }


        grid.innerHTML = `

            <div class="admin-no-results">

                <div class="admin-no-results-icon">
                    ⌕
                </div>

                <h3>
                    No matching organizations
                </h3>

                <p>
                    Try a different organization name,
                    city or registration number.
                </p>

            </div>

        `;

        return;
    }


    // ------------------------------------------
    // Render cards
    // ------------------------------------------

    grid.hidden = false;

    if (emptyState) {
        emptyState.hidden = true;
    }


    filteredOrganizations.forEach(
        (organization) => {

            const card =
                createOrganizationCard(
                    organization
                );

            grid.appendChild(card);
        }
    );
}


// ==================================================
// CREATE ORGANIZATION CARD
// ==================================================

function createOrganizationCard(
    organization
) {

    const card =
        document.createElement("article");


    card.className =
        "organization-admin-card";


    const createdDate =
        formatDate(
            organization.createdAt
        );


    const typeIcon =
        getOrganizationIcon(
            organization.type
        );


    card.innerHTML = `

        <div class="organization-admin-top">

            <div class="organization-admin-icon">
                ${typeIcon}
            </div>


            <div class="organization-admin-heading">

                <span class="organization-admin-status">

                    <span></span>

                    PENDING REVIEW

                </span>


                <h3>
                    ${escapeHTML(
                        organization.name
                    )}
                </h3>


                <p>
                    ${escapeHTML(
                        organization.type
                    )}
                </p>

            </div>

        </div>


        <div class="organization-admin-details">

            <div class="organization-admin-detail">

                <span>
                    Registration Number
                </span>

                <strong>
                    ${escapeHTML(
                        organization.registrationNumber ||
                        "Not provided"
                    )}
                </strong>

            </div>


            <div class="organization-admin-detail">

                <span>
                    Contact Person
                </span>

                <strong>
                    ${escapeHTML(
                        organization.contactPerson ||
                        "Not provided"
                    )}
                </strong>

            </div>


            <div class="organization-admin-detail">

                <span>
                    Email
                </span>

                <strong>
                    ${escapeHTML(
                        organization.email ||
                        "Not provided"
                    )}
                </strong>

            </div>


            <div class="organization-admin-detail">

                <span>
                    Contact Number
                </span>

                <strong>
                    ${escapeHTML(
                        organization.contactNumber ||
                        "Not provided"
                    )}
                </strong>

            </div>


            <div class="organization-admin-detail">

                <span>
                    Location
                </span>

                <strong>
                    ${escapeHTML(
                        organization.city ||
                        "Not provided"
                    )}
                </strong>

            </div>


            <div class="organization-admin-detail">

                <span>
                    Registered
                </span>

                <strong>
                    ${createdDate}
                </strong>

            </div>

        </div>


        <div class="organization-admin-address">

            <span>
                Address
            </span>

            <p>
                ${escapeHTML(
                    organization.address ||
                    "No address provided"
                )}
            </p>

        </div>


        <div class="organization-admin-actions">

            <button
                type="button"
                class="organization-admin-button reject"
                data-action="reject"
                data-id="${organization._id}"
            >
                Reject
            </button>


            <button
                type="button"
                class="organization-admin-button approve"
                data-action="approve"
                data-id="${organization._id}"
            >
                ✓ Approve Organization
            </button>

        </div>

    `;


    // ------------------------------------------
    // Approve
    // ------------------------------------------

    const approveButton =
        card.querySelector(
            '[data-action="approve"]'
        );


    if (approveButton) {

        approveButton.addEventListener(
            "click",
            () => {

                handleApproval(
                    organization._id
                );
            }
        );
    }


    // ------------------------------------------
    // Reject
    // ------------------------------------------

    const rejectButton =
        card.querySelector(
            '[data-action="reject"]'
        );


    if (rejectButton) {

        rejectButton.addEventListener(
            "click",
            () => {

                handleRejection(
                    organization._id
                );
            }
        );
    }


    return card;
}


// ==================================================
// APPROVE ORGANIZATION
// ==================================================

async function handleApproval(
    organizationId
) {

    const organization =
        pendingOrganizations.find(
            (item) =>
                item._id === organizationId
        );


    if (!organization) {
        return;
    }


    const confirmed =
        window.confirm(
            `Approve "${organization.name}" as a verified MediShare organization?`
        );


    if (!confirmed) {
        return;
    }


    await updateVerificationStatus(
        organizationId,
        "verify"
    );
}


// ==================================================
// REJECT ORGANIZATION
// ==================================================

async function handleRejection(
    organizationId
) {

    const organization =
        pendingOrganizations.find(
            (item) =>
                item._id === organizationId
        );


    if (!organization) {
        return;
    }


    const confirmed =
        window.confirm(
            `Reject "${organization.name}"? The associated organization accounts will be deactivated.`
        );


    if (!confirmed) {
        return;
    }


    await updateVerificationStatus(
        organizationId,
        "reject"
    );
}


// ==================================================
// VERIFY / REJECT API
// ==================================================

async function updateVerificationStatus(
    organizationId,
    action
) {

    const token =
        localStorage.getItem(
            "medishare_token"
        );


    if (!token) {

        logout();

        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/organizations/${organizationId}/${action}`,
                {
                    method: "PATCH",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            `${action} response:`,
            data
        );


        if (response.status === 401) {

            logout();

            return;
        }


        if (response.status === 403) {

            showMessage(
                "Administrator permission required.",
                "error"
            );

            return;
        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                data.error ||
                `Failed to ${action} organization.`
            );
        }


        // ------------------------------------------
        // Success
        // ------------------------------------------

        showMessage(
            data.message ||
            `Organization ${action}d successfully.`,
            "success"
        );


        pendingOrganizations =
            pendingOrganizations.filter(
                (organization) =>
                    organization._id !== organizationId
            );


        updateStats();

        renderOrganizations();


    } catch (error) {

        console.error(
            `${action} organization error:`,
            error
        );


        showMessage(
            error.message ||
            `Failed to ${action} organization.`,
            "error"
        );
    }
}


// ==================================================
// LOADING
// ==================================================

function showLoading(show) {

    const loading =
        document.getElementById(
            "adminLoading"
        );


    if (loading) {

        loading.hidden =
            !show;
    }
}


// ==================================================
// MESSAGE
// ==================================================

function showMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "adminMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        `admin-message ${type}`;


    element.hidden = false;
}


function hideMessage() {

    const element =
        document.getElementById(
            "adminMessage"
        );


    if (!element) {
        return;
    }


    element.textContent = "";

    element.hidden = true;
}


// ==================================================
// LOGOUT
// ==================================================

function logout() {

    localStorage.removeItem(
        "medishare_token"
    );

    localStorage.removeItem(
        "medishare_user"
    );


    window.location.href =
        "login.html";
}


// ==================================================
// ORGANIZATION ICON
// ==================================================

function getOrganizationIcon(type) {

    const icons = {

        Hospital: "H",

        Clinic: "C",

        "Blood Bank": "+",

        "Diagnostic Center": "D",

        "Ambulance Service": "A",

        "Medical Supplier": "S",

        Other: "O"
    };


    return icons[type] || "M";
}


// ==================================================
// DATE FORMAT
// ==================================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "Unknown";
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Unknown";
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// ==================================================
// INITIALS
// ==================================================

function getInitials(name) {

    return String(name)
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
            (part) =>
                part.charAt(0).toUpperCase()
        )
        .join("");
}


// ==================================================
// ESCAPE HTML
// ==================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}