/* =========================================================
   MEDISHARE RENTALS
   ========================================================= */

let allRentalRequests = [];
let rentalResources = [];


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const rentalForm =
    document.getElementById("rentalForm");

const rentalResource =
    document.getElementById("resource");

const rentalQuantity =
    document.getElementById("quantity");

const rentalStartDate =
    document.getElementById("startDate");

const rentalEndDate =
    document.getElementById("endDate");

const rentalPurpose =
    document.getElementById("purpose");

const rentalNotes =
    document.getElementById("notes");

const rentalMessage =
    document.getElementById("rentalMessage");

const rentalList =
    document.getElementById("rentalList");

const rentalCount =
    document.getElementById("rentalCount");

const resourcePrice =
    document.getElementById("resourcePrice");


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            setMinimumDate();

            await loadRentalResources();

            await loadRentalRequests();

            setupRentalForm();

        } catch (error) {

            console.error(
                "Rental initialization failed:",
                error
            );

            showRentalMessage(
                error.message ||
                "Unable to initialize rentals.",
                "error"
            );

        }

    }
);


/* =========================================================
   MINIMUM DATE
   ========================================================= */

function setMinimumDate() {

    if (!rentalStartDate) {
        return;
    }

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    rentalStartDate.min = today;

    if (rentalEndDate) {
        rentalEndDate.min = today;
    }
}


/* =========================================================
   LOAD RENTAL-AVAILABLE RESOURCES
   ========================================================= */

async function loadRentalResources() {

    try {

        const response =
            await apiRequest(
                "/resources?rentalAvailable=true"
            );

        rentalResources =
            response.resources || [];

        populateResourceDropdown();

    } catch (error) {

        console.error(
            "Failed to load rental resources:",
            error
        );

        if (rentalResource) {

            rentalResource.innerHTML = `
                <option value="">
                    Unable to load resources
                </option>
            `;

        }

        throw error;
    }
}


/* =========================================================
   RESOURCE DROPDOWN
   ========================================================= */

function populateResourceDropdown() {

    if (!rentalResource) {
        return;
    }

    rentalResource.innerHTML = `
        <option value="">
            Select a resource
        </option>
    `;

    rentalResources.forEach(
        resource => {

            const available =
                Number(
                    resource.availableQuantity
                ) || 0;

            if (
                !resource.rentalAvailable ||
                available <= 0
            ) {
                return;
            }

            const option =
                document.createElement("option");

            option.value =
                resource._id;

            option.textContent =
                `${resource.name} — ${resource.location} (${available} available)`;

            rentalResource.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   RESOURCE SELECTION
   ========================================================= */

if (rentalResource) {

    rentalResource.addEventListener(
        "change",
        () => {

            const resourceId =
                rentalResource.value;

            const selectedResource =
                rentalResources.find(
                    resource =>
                        resource._id === resourceId
                );

            if (!selectedResource) {

                if (resourcePrice) {
                    resourcePrice.textContent = "";
                }

                return;
            }


            const price =
                Number(
                    selectedResource.pricePerDay
                ) || 0;


            const available =
                Number(
                    selectedResource.availableQuantity
                ) || 0;


            if (resourcePrice) {

                resourcePrice.textContent =
                    `₹${price.toLocaleString()} / day • ${available} available`;

            }


            if (rentalQuantity) {

                rentalQuantity.max =
                    available;

                if (
                    Number(
                        rentalQuantity.value
                    ) > available
                ) {

                    rentalQuantity.value =
                        available;

                }

            }

        }
    );

}


/* =========================================================
   DATE VALIDATION
   ========================================================= */

if (rentalStartDate) {

    rentalStartDate.addEventListener(
        "change",
        () => {

            const startDate =
                rentalStartDate.value;

            if (!startDate) {
                return;
            }

            if (rentalEndDate) {

                rentalEndDate.min =
                    startDate;

                if (
                    rentalEndDate.value &&
                    rentalEndDate.value < startDate
                ) {

                    rentalEndDate.value =
                        startDate;

                }

            }

        }
    );

}


/* =========================================================
   RENTAL FORM
   ========================================================= */

function setupRentalForm() {

    if (!rentalForm) {
        return;
    }

    rentalForm.addEventListener(
        "submit",
        submitRentalRequest
    );

}


/* =========================================================
   CREATE RENTAL REQUEST
   ========================================================= */

async function submitRentalRequest(
    event
) {

    event.preventDefault();

    clearRentalMessage();


    const resourceId =
        rentalResource.value;

    const quantity =
        Number(
            rentalQuantity.value
        );

    const startDate =
        rentalStartDate.value;

    const endDate =
        rentalEndDate.value;

    const purpose =
        rentalPurpose.value.trim();

    const notes =
        rentalNotes.value.trim();


    /* -----------------------------------------
       VALIDATION
    ----------------------------------------- */

    if (!resourceId) {

        showRentalMessage(
            "Please select a healthcare resource.",
            "error"
        );

        return;
    }


    if (
        !quantity ||
        quantity < 1
    ) {

        showRentalMessage(
            "Quantity must be at least 1.",
            "error"
        );

        return;
    }


    if (!startDate || !endDate) {

        showRentalMessage(
            "Please select both rental dates.",
            "error"
        );

        return;
    }


    if (
        new Date(endDate) <
        new Date(startDate)
    ) {

        showRentalMessage(
            "End date cannot be before the start date.",
            "error"
        );

        return;
    }


    if (!purpose) {

        showRentalMessage(
            "Please provide the purpose of the rental.",
            "error"
        );

        return;
    }


    const selectedResource =
        rentalResources.find(
            resource =>
                resource._id === resourceId
        );


    if (!selectedResource) {

        showRentalMessage(
            "Selected resource is no longer available.",
            "error"
        );

        return;
    }


    const available =
        Number(
            selectedResource.availableQuantity
        ) || 0;


    if (quantity > available) {

        showRentalMessage(
            `Only ${available} unit(s) are currently available.`,
            "error"
        );

        return;
    }


    /* -----------------------------------------
       DISABLE SUBMIT
    ----------------------------------------- */

    const submitButton =
        rentalForm.querySelector(
            'button[type="submit"]'
        );


    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.textContent =
            "Submitting...";

    }


    try {

        const response =
            await apiRequest(
                "/rental-requests",
                {
                    method: "POST",

                    body: JSON.stringify({
                        resource:
                            resourceId,

                        quantity:
                            quantity,

                        startDate:
                            startDate,

                        endDate:
                            endDate,

                        purpose:
                            purpose,

                        notes:
                            notes
                    })
                }
            );


        showRentalMessage(
            response.message ||
            "Rental request created successfully.",
            "success"
        );


        rentalForm.reset();

        setMinimumDate();

        if (resourcePrice) {
            resourcePrice.textContent = "";
        }


        await loadRentalResources();

        await loadRentalRequests();


        setTimeout(
            () => {

                if (
                    typeof closeRentalForm ===
                    "function"
                ) {

                    closeRentalForm();

                }

                clearRentalMessage();

            },
            1200
        );


    } catch (error) {

        console.error(
            "Failed to create rental request:",
            error
        );

        showRentalMessage(
            error.message ||
            "Failed to create rental request.",
            "error"
        );

    } finally {

        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.innerHTML =
                `
                    <span>
                        Submit Rental Request
                    </span>
                `;

        }

    }

}


/* =========================================================
   LOAD RENTAL REQUESTS
   ========================================================= */

async function loadRentalRequests() {

    try {

        if (rentalList) {

            rentalList.innerHTML = `
                <div class="loading-state">
                    Loading rental requests...
                </div>
            `;

        }


        const response =
            await apiRequest(
                "/rental-requests"
            );


        allRentalRequests =
            response.rentalRequests ||
            response.requests ||
            [];


        updateRentalCount(
            allRentalRequests.length
        );


        renderRentalRequests(
            allRentalRequests
        );


    } catch (error) {

        console.error(
            "Failed to load rental requests:",
            error
        );


        if (rentalList) {

            rentalList.innerHTML = `
                <div class="dashboard-error">

                    <strong>
                        Unable to load rental requests
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
   RENDER RENTAL REQUESTS
   ========================================================= */

function renderRentalRequests(
    requests
) {

    if (!rentalList) {
        return;
    }


    if (!requests.length) {

        rentalList.innerHTML = `
            <div class="rental-empty">

                <div class="rental-empty-icon">
                    ⇄
                </div>

                <h3>
                    No rental requests found
                </h3>

                <p>
                    Create a rental request to start
                    coordinating healthcare equipment.
                </p>

            </div>
        `;

        return;
    }


    rentalList.innerHTML =
        requests
            .map(
                rental =>
                    createRentalCard(
                        rental
                    )
            )
            .join("");

}


/* =========================================================
   RENTAL CARD
   ========================================================= */

function createRentalCard(
    rental
) {

    const resource =
        rental.resource || {};


    const organization =
        rental.requestingOrganization ||
        {};


    const resourceOrganization =
        resource.organization ||
        {};


    const status =
        rental.status ||
        "PENDING";


    const statusClass =
        status
            .toLowerCase()
            .replace(
                /_/g,
                "-"
            );


    const resourceName =
        resource.name ||
        "Healthcare Resource";


    const category =
        resource.category ||
        "Medical Equipment";


    const quantity =
        Number(
            rental.quantity
        ) || 0;


    const startDate =
        formatDate(
            rental.startDate
        );


    const endDate =
        formatDate(
            rental.endDate
        );


    const organizationName =
        organization.name ||
        "Healthcare Organization";


    const resourceOwner =
        resourceOrganization.name ||
        "Resource Provider";


    const purpose =
        rental.purpose ||
        "No purpose provided";


    const initials =
        getInitials(
            organizationName
        );


    const actions =
        getRentalActions(
            rental
        );


    return `

        <article
            class="rental-card"
            data-rental-id="${escapeHTML(
                rental._id
            )}"
        >

            <!-- CARD TOP -->

            <div class="rental-card-top">

                <div class="rental-card-icon">
                    ⇄
                </div>


                <div
                    class="
                        rental-card-status
                        ${statusClass}
                    "
                >

                    <span
                        class="rental-status-dot"
                    ></span>

                    ${escapeHTML(
                        formatStatus(
                            status
                        )
                    )}

                </div>

            </div>


            <!-- CARD BODY -->

            <div class="rental-card-body">

                <span
                    class="rental-card-category"
                >
                    ${escapeHTML(category)}
                </span>


                <h3>
                    ${escapeHTML(resourceName)}
                </h3>


                <p
                    class="rental-card-description"
                >
                    ${escapeHTML(purpose)}
                </p>


                <!-- INFO -->

                <div class="rental-info-grid">

                    <div class="rental-info-item">

                        <span>
                            Quantity
                        </span>

                        <strong>
                            ${quantity} unit${quantity === 1 ? "" : "s"}
                        </strong>

                    </div>


                    <div class="rental-info-item">

                        <span>
                            Provider
                        </span>

                        <strong>
                            ${escapeHTML(
                                resourceOwner
                            )}
                        </strong>

                    </div>

                </div>


                <!-- DATES -->

                <div class="rental-dates">

                    <div class="rental-date">

                        <span>
                            Start Date
                        </span>

                        <strong>
                            ${startDate}
                        </strong>

                    </div>


                    <div class="rental-date-arrow">
                        →
                    </div>


                    <div class="rental-date">

                        <span>
                            End Date
                        </span>

                        <strong>
                            ${endDate}
                        </strong>

                    </div>

                </div>


                <!-- ORGANIZATION -->

                <div class="rental-organization">

                    <div
                        class="rental-organization-avatar"
                    >
                        ${escapeHTML(initials)}
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


                <!-- ACTIONS -->

                ${
                    actions
                        ? `
                            <div class="rental-actions">
                                ${actions}
                            </div>
                        `
                        : ""
                }

            </div>


            <!-- FOOTER -->

            <div class="rental-card-footer">

                <span class="rental-quantity">

                    Request ID:

                    <strong>
                        ${escapeHTML(
                            String(
                                rental._id ||
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
   RENTAL ACTIONS
   ========================================================= */

function getRentalActions(
    rental
) {

    const user =
        typeof getUser ===
        "function"
            ? getUser()
            : null;


    if (!user) {
        return "";
    }


    const status =
        rental.status;


    const requestingOrganizationId =
        getObjectId(
            rental.requestingOrganization
        );


    const resourceOrganizationId =
        getObjectId(
            rental.resource?.organization
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
            requestingOrganizationId &&
            currentOrganizationId ===
            requestingOrganizationId
        );


    const isResourceOwner =
        isAdmin ||
        (
            currentOrganizationId &&
            resourceOrganizationId &&
            currentOrganizationId ===
            resourceOrganizationId
        );


    const actions = [];


    /* -----------------------------------------
       PENDING
    ----------------------------------------- */

    if (
        status === "PENDING" &&
        isResourceOwner
    ) {

        actions.push(`
            <button
                class="rental-action approve"
                onclick="approveRental('${rental._id}')"
            >
                Approve
            </button>
        `);


        actions.push(`
            <button
                class="rental-action reject"
                onclick="rejectRental('${rental._id}')"
            >
                Reject
            </button>
        `);

    }


    /* -----------------------------------------
       APPROVED
    ----------------------------------------- */

    if (
        status === "APPROVED" &&
        isResourceOwner
    ) {

        actions.push(`
            <button
                class="rental-action dispatch"
                onclick="dispatchRental('${rental._id}')"
            >
                Dispatch
            </button>
        `);

    }


    /* -----------------------------------------
       DISPATCHED
    ----------------------------------------- */

    if (
        status === "DISPATCHED" &&
        isRequester
    ) {

        actions.push(`
            <button
                class="rental-action use"
                onclick="markRentalInUse('${rental._id}')"
            >
                Mark In Use
            </button>
        `);

    }


    /* -----------------------------------------
       IN USE
    ----------------------------------------- */

    if (
        status === "IN_USE" &&
        (
            isRequester ||
            isResourceOwner
        )
    ) {

        actions.push(`
            <button
                class="rental-action return"
                onclick="returnRental('${rental._id}')"
            >
                Return
            </button>
        `);

    }


    /* -----------------------------------------
       PENDING REQUESTER DELETE
    ----------------------------------------- */

    if (
        status === "PENDING" &&
        isRequester
    ) {

        actions.push(`
            <button
                class="rental-action cancel"
                onclick="deleteRental('${rental._id}')"
            >
                Delete
            </button>
        `);

    }


    return actions.join("");

}


/* =========================================================
   APPROVE
   ========================================================= */

async function approveRental(
    rentalId
) {

    if (
        !confirm(
            "Approve this rental request?"
        )
    ) {
        return;
    }


    await rentalAction(
        `/rental-requests/${rentalId}/approve`,
        "Rental request approved."
    );

}


/* =========================================================
   REJECT
   ========================================================= */

async function rejectRental(
    rentalId
) {

    if (
        !confirm(
            "Reject this rental request?"
        )
    ) {
        return;
    }


    await rentalAction(
        `/rental-requests/${rentalId}/reject`,
        "Rental request rejected."
    );

}


/* =========================================================
   DISPATCH
   ========================================================= */

async function dispatchRental(
    rentalId
) {

    if (
        !confirm(
            "Mark this rental as dispatched?"
        )
    ) {
        return;
    }


    await rentalAction(
        `/rental-requests/${rentalId}/dispatch`,
        "Rental marked as dispatched."
    );

}


/* =========================================================
   MARK IN USE
   ========================================================= */

async function markRentalInUse(
    rentalId
) {

    if (
        !confirm(
            "Mark this rental as currently in use?"
        )
    ) {
        return;
    }


    await rentalAction(
        `/rental-requests/${rentalId}/in-use`,
        "Rental marked as in use."
    );

}


/* =========================================================
   RETURN
   ========================================================= */

async function returnRental(
    rentalId
) {

    if (
        !confirm(
            "Mark this rental as returned?"
        )
    ) {
        return;
    }


    await rentalAction(
        `/rental-requests/${rentalId}/return`,
        "Rental marked as returned."
    );

}


/* =========================================================
   GENERIC RENTAL ACTION
   ========================================================= */

async function rentalAction(
    endpoint,
    successMessage
) {

    try {

        const response =
            await apiRequest(
                endpoint,
                {
                    method: "PATCH"
                }
            );


        showRentalMessage(
            response.message ||
            successMessage,
            "success"
        );


        await loadRentalResources();

        await loadRentalRequests();


        setTimeout(
            clearRentalMessage,
            1800
        );


    } catch (error) {

        console.error(
            "Rental action failed:",
            error
        );


        showRentalMessage(
            error.message ||
            "Rental action failed.",
            "error"
        );

    }

}


/* =========================================================
   DELETE
   ========================================================= */

async function deleteRental(
    rentalId
) {

    if (
        !confirm(
            "Delete this pending rental request?"
        )
    ) {
        return;
    }


    try {

        const response =
            await apiRequest(
                `/rental-requests/${rentalId}`,
                {
                    method: "DELETE"
                }
            );


        showRentalMessage(
            response.message ||
            "Rental request deleted.",
            "success"
        );


        await loadRentalRequests();


        setTimeout(
            clearRentalMessage,
            1800
        );


    } catch (error) {

        console.error(
            "Failed to delete rental:",
            error
        );


        showRentalMessage(
            error.message ||
            "Unable to delete rental request.",
            "error"
        );

    }

}


/* =========================================================
   MESSAGE
   ========================================================= */

function showRentalMessage(
    message,
    type = "success"
) {

    if (!rentalMessage) {
        return;
    }


    rentalMessage.textContent =
        message;


    rentalMessage.className =
        `rental-message ${type}`;


    rentalMessage.style.display =
        "block";

}


function clearRentalMessage() {

    if (!rentalMessage) {
        return;
    }


    rentalMessage.textContent =
        "";


    rentalMessage.className =
        "rental-message";


    rentalMessage.style.display =
        "none";

}


/* =========================================================
   COUNT
   ========================================================= */

function updateRentalCount(
    count
) {

    if (!rentalCount) {
        return;
    }


    rentalCount.textContent =
        `${count} request${count === 1 ? "" : "s"}`;

}


/* =========================================================
   FORMAT STATUS
   ========================================================= */

function formatStatus(
    status
) {

    return String(status)
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
   FORMAT DATE
   ========================================================= */

function formatDate(
    value
) {

    if (!value) {
        return "—";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

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
   SAFE HTML
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
   EXPOSE ACTIONS
   ========================================================= */

window.approveRental =
    approveRental;

window.rejectRental =
    rejectRental;

window.dispatchRental =
    dispatchRental;

window.markRentalInUse =
    markRentalInUse;

window.returnRental =
    returnRental;

window.deleteRental =
    deleteRental;