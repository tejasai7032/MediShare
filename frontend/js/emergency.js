/* =========================================================
   MEDISHARE EMERGENCY REQUESTS
   ========================================================= */

let allEmergencyRequests = [];


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const emergencyForm =
    document.getElementById("emergencyForm");

const emergencyList =
    document.getElementById("emergencyList");

const emergencyTotal =
    document.getElementById("emergencyTotal");

const emergencyMessage =
    document.getElementById("emergencyMessage");

const resourceType =
    document.getElementById("resourceType");

const priority =
    document.getElementById("priority");

const resourceName =
    document.getElementById("resourceName");

const quantityRequired =
    document.getElementById("quantityRequired");

const contactNumber =
    document.getElementById("contactNumber");

const emergencyLocation =
    document.getElementById("emergencyLocation");

const reason =
    document.getElementById("reason");

const emergencyFormPanel =
    document.getElementById("emergencyFormPanel");

const cancelEmergency =
    document.getElementById("cancelEmergency");


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        setupEmergencyForm();

        setupEmergencyFilters();

        await loadEmergencyRequests();

    }
);


/* =========================================================
   OPEN / CLOSE FORM
   ========================================================= */

const showEmergencyForm =
    document.getElementById(
        "showEmergencyForm"
    );


if (showEmergencyForm) {

    showEmergencyForm.addEventListener(
        "click",
        openEmergencyForm
    );

}


if (cancelEmergency) {

    cancelEmergency.addEventListener(
        "click",
        closeEmergencyForm
    );

}


function openEmergencyForm() {

    if (!emergencyFormPanel) {
        return;
    }

    emergencyFormPanel.style.display =
        "block";

    emergencyFormPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


function closeEmergencyForm() {

    if (!emergencyFormPanel) {
        return;
    }

    emergencyFormPanel.style.display =
        "none";

}


/* =========================================================
   FORM SETUP
   ========================================================= */

function setupEmergencyForm() {

    if (!emergencyForm) {
        return;
    }

    emergencyForm.addEventListener(
        "submit",
        submitEmergencyRequest
    );

}


/* =========================================================
   CREATE EMERGENCY REQUEST
   ========================================================= */

async function submitEmergencyRequest(
    event
) {

    event.preventDefault();

    clearEmergencyMessage();


    const requestData = {

        resourceType:
            resourceType.value,

        resourceName:
            resourceName.value.trim(),

        quantityRequired:
            Number(
                quantityRequired.value
            ),

        priority:
            priority.value,

        reason:
            reason.value.trim(),

        location:
            emergencyLocation.value.trim(),

        contactNumber:
            contactNumber.value.trim()

    };


    /* -----------------------------------------
       VALIDATION
    ----------------------------------------- */

    if (!requestData.resourceType) {

        showEmergencyMessage(
            "Please select a resource type.",
            "error"
        );

        return;
    }


    if (!requestData.resourceName) {

        showEmergencyMessage(
            "Please enter the resource name.",
            "error"
        );

        return;
    }


    if (
        !requestData.quantityRequired ||
        requestData.quantityRequired < 1
    ) {

        showEmergencyMessage(
            "Quantity must be at least 1.",
            "error"
        );

        return;
    }


    if (!requestData.priority) {

        showEmergencyMessage(
            "Please select a priority.",
            "error"
        );

        return;
    }


    if (!requestData.location) {

        showEmergencyMessage(
            "Please enter the required location.",
            "error"
        );

        return;
    }


    if (!requestData.contactNumber) {

        showEmergencyMessage(
            "Please enter a contact number.",
            "error"
        );

        return;
    }


    if (!requestData.reason) {

        showEmergencyMessage(
            "Please describe the emergency requirement.",
            "error"
        );

        return;
    }


    /* -----------------------------------------
       SUBMIT BUTTON
    ----------------------------------------- */

    const submitButton =
        document.getElementById(
            "submitEmergency"
        );


    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.innerHTML =
            `
                <span>
                    Submitting...
                </span>
            `;

    }


    try {

        const response =
            await apiRequest(
                "/emergency-requests",
                {
                    method: "POST",

                    body: JSON.stringify(
                        requestData
                    )
                }
            );


        showEmergencyMessage(
            response.message ||
            "Emergency request created successfully.",
            "success"
        );


        emergencyForm.reset();


        if (priority) {

            priority.value =
                "HIGH";

        }


        await loadEmergencyRequests();


        setTimeout(
            () => {

                closeEmergencyForm();

                clearEmergencyMessage();

            },
            1400
        );


    } catch (error) {

        console.error(
            "Failed to create emergency request:",
            error
        );


        showEmergencyMessage(
            error.message ||
            "Failed to create emergency request.",
            "error"
        );

    } finally {

        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.innerHTML =
                `
                    <span>
                        Submit Emergency Request
                    </span>
                `;

        }

    }

}


/* =========================================================
   LOAD REQUESTS
   ========================================================= */

async function loadEmergencyRequests() {

    try {

        if (emergencyList) {

            emergencyList.innerHTML = `
                <div class="loading-state">
                    Loading emergency requests...
                </div>
            `;

        }


        const response =
            await apiRequest(
                "/emergency-requests"
            );


        allEmergencyRequests =
            response.emergencyRequests ||
            response.requests ||
            [];


        updateEmergencyTotal(
            allEmergencyRequests.length
        );


        renderEmergencyRequests(
            allEmergencyRequests
        );


    } catch (error) {

        console.error(
            "Failed to load emergency requests:",
            error
        );


        if (emergencyList) {

            emergencyList.innerHTML = `
                <div class="dashboard-error">

                    <strong>
                        Unable to load emergency requests
                    </strong>

                    <span>
                        ${escapeHTML(
                            error.message ||
                            "Unknown error"
                        )}
                    </span>

                </div>
            `;

        }

    }

}


/* =========================================================
   FILTERS
   ========================================================= */

function setupEmergencyFilters() {

    const search =
        document.getElementById(
            "emergencySearch"
        );

    const priorityFilter =
        document.getElementById(
            "emergencyPriorityFilter"
        );

    const statusFilter =
        document.getElementById(
            "emergencyStatusFilter"
        );


    if (search) {

        search.addEventListener(
            "input",
            applyEmergencyFilters
        );

    }


    if (priorityFilter) {

        priorityFilter.addEventListener(
            "change",
            applyEmergencyFilters
        );

    }


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            applyEmergencyFilters
        );

    }

}


function applyEmergencyFilters() {

    const searchInput =
        document.getElementById(
            "emergencySearch"
        );

    const priorityFilter =
        document.getElementById(
            "emergencyPriorityFilter"
        );

    const statusFilter =
        document.getElementById(
            "emergencyStatusFilter"
        );


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const selectedPriority =
        priorityFilter
            ? priorityFilter.value
            : "";


    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "";


    const filtered =
        allEmergencyRequests.filter(
            request => {

                const matchesSearch =
                    !search ||
                    request.resourceName
                        ?.toLowerCase()
                        .includes(search) ||
                    request.resourceType
                        ?.toLowerCase()
                        .includes(search) ||
                    request.location
                        ?.toLowerCase()
                        .includes(search) ||
                    request.reason
                        ?.toLowerCase()
                        .includes(search);


                const matchesPriority =
                    !selectedPriority ||
                    request.priority ===
                    selectedPriority;


                const matchesStatus =
                    !selectedStatus ||
                    request.status ===
                    selectedStatus;


                return (
                    matchesSearch &&
                    matchesPriority &&
                    matchesStatus
                );

            }
        );


    renderEmergencyRequests(
        filtered
    );

}


/* =========================================================
   RENDER REQUESTS
   ========================================================= */

function renderEmergencyRequests(
    requests
) {

    if (!emergencyList) {
        return;
    }


    if (!requests.length) {

        emergencyList.innerHTML = `
            <div class="emergency-empty">

                <div class="emergency-empty-icon">
                    ⚠
                </div>

                <h3>
                    No emergency requests found
                </h3>

                <p>
                    There are currently no requests
                    matching your selected filters.
                </p>

            </div>
        `;

        return;
    }


    emergencyList.innerHTML =
        requests
            .map(
                request =>
                    createEmergencyCard(
                        request
                    )
            )
            .join("");

}


/* =========================================================
   EMERGENCY CARD
   ========================================================= */

function createEmergencyCard(
    request
) {

    const organization =
        request.requestingOrganization ||
        {};


    const organizationName =
        organization.name ||
        "Healthcare Organization";


    const priorityValue =
        request.priority ||
        "HIGH";


    const statusValue =
        request.status ||
        "PENDING";


    const priorityClass =
        priorityValue.toLowerCase();


    const statusClass =
        statusValue.toLowerCase();


    const initials =
        getInitials(
            organizationName
        );


    const quantity =
        Number(
            request.quantityRequired
        ) || 0;


    const actions =
        getEmergencyActions(
            request
        );


    return `

        <article
            class="emergency-card"
            data-request-id="${escapeHTML(
                request._id
            )}"
        >

            <div class="emergency-card-top">

                <div class="emergency-card-icon">
                    ⚠
                </div>


                <div
                    class="
                        emergency-priority
                        ${priorityClass}
                    "
                >

                    <span
                        class="emergency-priority-dot"
                    ></span>

                    ${escapeHTML(
                        formatLabel(
                            priorityValue
                        )
                    )}

                </div>

            </div>


            <div class="emergency-card-body">

                <span
                    class="emergency-card-category"
                >
                    ${escapeHTML(
                        request.resourceType ||
                        "Emergency Service"
                    )}
                </span>


                <h3>
                    ${escapeHTML(
                        request.resourceName ||
                        "Emergency Resource"
                    )}
                </h3>


                <p class="emergency-reason">
                    ${escapeHTML(
                        request.reason ||
                        "No additional information provided."
                    )}
                </p>


                <div class="emergency-info-grid">

                    <div class="emergency-info-item">

                        <span>
                            Quantity
                        </span>

                        <strong>
                            ${quantity}
                            unit${quantity === 1 ? "" : "s"}
                        </strong>

                    </div>


                    <div class="emergency-info-item">

                        <span>
                            Status
                        </span>

                        <strong>
                            ${escapeHTML(
                                formatLabel(
                                    statusValue
                                )
                            )}
                        </strong>

                    </div>

                </div>


                <div class="emergency-location">

                    <div class="emergency-location-icon">
                        ⌖
                    </div>

                    <div>

                        <span>
                            Required Location
                        </span>

                        <strong>
                            ${escapeHTML(
                                request.location ||
                                "Location not provided"
                            )}
                        </strong>

                    </div>

                </div>


                <div class="emergency-organization">

                    <div
                        class="emergency-organization-avatar"
                    >
                        ${escapeHTML(
                            initials
                        )}
                    </div>


                    <div>

                        <span>
                            Requested By
                        </span>

                        <strong>
                            ${escapeHTML(
                                organizationName
                            )}
                        </strong>

                    </div>

                </div>


                <div
                    class="
                        emergency-status
                        ${statusClass}
                    "
                >

                    <span
                        class="emergency-priority-dot"
                    ></span>

                    ${escapeHTML(
                        formatLabel(
                            statusValue
                        )
                    )}

                </div>


                ${
                    actions
                        ? `
                            <div class="emergency-actions">
                                ${actions}
                            </div>
                        `
                        : ""
                }

            </div>


            <div class="emergency-card-footer">

                <span class="emergency-request-id">

                    Request ID:

                    <strong>
                        ${escapeHTML(
                            String(
                                request._id ||
                                ""
                            ).slice(-8)
                        )}
                    </strong>

                </span>

            </div>

        </article>

    `;

}


/* =========================================================
   EMERGENCY ACTIONS
   ========================================================= */

function getEmergencyActions(
    request
) {

    const user =
        typeof getUser ===
        "function"
            ? getUser()
            : null;


    if (!user) {
        return "";
    }


    const requesterId =
        getObjectId(
            request.requestingOrganization
        );


    const currentOrganizationId =
        getObjectId(
            user.organization
        );


    const isAdmin =
        user.role === "ADMIN";


    const isRequester =
        isAdmin ||
        (
            currentOrganizationId &&
            requesterId &&
            currentOrganizationId ===
            requesterId
        );


    const actions = [];


    /* -----------------------------------------
       PENDING
    ----------------------------------------- */

    if (
        request.status ===
        "PENDING"
    ) {

        /*
         * A different organization can
         * coordinate the request.
         */

        if (
            !isRequester
        ) {

            actions.push(`
                <button
                    class="
                        emergency-action
                        accept
                    "
                    onclick="
                        acceptEmergencyRequest(
                            '${request._id}'
                        )
                    "
                >
                    Accept
                </button>
            `);


            actions.push(`
                <button
                    class="
                        emergency-action
                        reject
                    "
                    onclick="
                        rejectEmergencyRequest(
                            '${request._id}'
                        )
                    "
                >
                    Reject
                </button>
            `);

        }


        /*
         * Requesting organization can
         * cancel its own pending request.
         */

        if (
            isRequester
        ) {

            actions.push(`
                <button
                    class="
                        emergency-action
                        cancel
                    "
                    onclick="
                        cancelEmergencyRequest(
                            '${request._id}'
                        )
                    "
                >
                    Cancel
                </button>
            `);

        }

    }


    /* -----------------------------------------
       ACCEPTED
    ----------------------------------------- */

    if (
        request.status ===
        "ACCEPTED"
    ) {

        actions.push(`
            <button
                class="
                    emergency-action
                    fulfill
                "
                onclick="
                    fulfillEmergencyRequest(
                        '${request._id}'
                    )
                "
            >
                Mark Fulfilled
            </button>
        `);

    }


    return actions.join("");

}


/* =========================================================
   ACCEPT REQUEST
   ========================================================= */

async function acceptEmergencyRequest(
    requestId
) {

    const confirmed =
        confirm(
            "Accept this emergency request?"
        );


    if (!confirmed) {
        return;
    }


    await performEmergencyAction(
        requestId,
        "accept",
        "Emergency request accepted successfully."
    );

}


/* =========================================================
   REJECT REQUEST
   ========================================================= */

async function rejectEmergencyRequest(
    requestId
) {

    const confirmed =
        confirm(
            "Reject this emergency request?"
        );


    if (!confirmed) {
        return;
    }


    await performEmergencyAction(
        requestId,
        "reject",
        "Emergency request rejected."
    );

}


/* =========================================================
   FULFILL REQUEST
   ========================================================= */

async function fulfillEmergencyRequest(
    requestId
) {

    const confirmed =
        confirm(
            "Mark this emergency request as fulfilled?"
        );


    if (!confirmed) {
        return;
    }


    await performEmergencyAction(
        requestId,
        "fulfill",
        "Emergency request fulfilled successfully."
    );

}


/* =========================================================
   CANCEL REQUEST
   ========================================================= */

async function cancelEmergencyRequest(
    requestId
) {

    const confirmed =
        confirm(
            "Cancel this emergency request?"
        );


    if (!confirmed) {
        return;
    }


    await performEmergencyAction(
        requestId,
        "cancel",
        "Emergency request cancelled."
    );

}


/* =========================================================
   PERFORM ACTION
   ========================================================= */

async function performEmergencyAction(
    requestId,
    action,
    successMessage
) {

    try {

        const response =
            await apiRequest(
                `/emergency-requests/${requestId}/${action}`,
                {
                    method: "PATCH"
                }
            );


        showEmergencyMessage(
            response.message ||
            successMessage,
            "success"
        );


        await loadEmergencyRequests();


        setTimeout(
            clearEmergencyMessage,
            1800
        );


    } catch (error) {

        console.error(
            `Emergency action failed (${action}):`,
            error
        );


        showEmergencyMessage(
            error.message ||
            `Unable to ${action} emergency request.`,
            "error"
        );

    }

}


/* =========================================================
   MESSAGE
   ========================================================= */

function showEmergencyMessage(
    message,
    type = "success"
) {

    if (!emergencyMessage) {
        return;
    }


    emergencyMessage.textContent =
        message;


    emergencyMessage.className =
        `form-message ${type}`;


    emergencyMessage.style.display =
        "block";

}


function clearEmergencyMessage() {

    if (!emergencyMessage) {
        return;
    }


    emergencyMessage.textContent =
        "";


    emergencyMessage.className =
        "form-message";


    emergencyMessage.style.display =
        "none";

}


/* =========================================================
   COUNT
   ========================================================= */

function updateEmergencyTotal(
    count
) {

    if (!emergencyTotal) {
        return;
    }


    emergencyTotal.textContent =
        `${count} request${count === 1 ? "" : "s"}`;

}


/* =========================================================
   FORMAT LABEL
   ========================================================= */

function formatLabel(
    value
) {

    return String(value)
        .replace(
            /_/g,
            " "
        )
        .replace(
            /\b\w/g,
            character =>
                character.toUpperCase()
        );

}


/* =========================================================
   GET OBJECT ID
   ========================================================= */

function getObjectId(
    value
) {

    if (!value) {
        return null;
    }


    if (
        typeof value ===
        "string"
    ) {

        return value;

    }


    if (value._id) {

        return String(
            value._id
        );

    }


    return String(value);

}


/* =========================================================
   GET INITIALS
   ========================================================= */

function getInitials(
    name
) {

    if (!name) {
        return "MS";
    }


    const words =
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (!words.length) {
        return "MS";
    }


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   EXPOSE FUNCTIONS
   ========================================================= */

window.openEmergencyForm =
    openEmergencyForm;

window.closeEmergencyForm =
    closeEmergencyForm;

window.acceptEmergencyRequest =
    acceptEmergencyRequest;

window.rejectEmergencyRequest =
    rejectEmergencyRequest;

window.fulfillEmergencyRequest =
    fulfillEmergencyRequest;

window.cancelEmergencyRequest =
    cancelEmergencyRequest;