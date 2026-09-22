requireLogin();


const resourceForm =
    document.getElementById("resourceForm");

const addResourcePanel =
    document.getElementById("addResourcePanel");

const showAddResource =
    document.getElementById("showAddResource");

const cancelResource =
    document.getElementById("cancelResource");

const resourceMessage =
    document.getElementById("resourceMessage");

const resourceGrid =
    document.getElementById("resourceGrid");

const resourceTotal =
    document.getElementById("resourceTotal");

const resourceSearch =
    document.getElementById("resourceSearch");

const categoryFilter =
    document.getElementById("categoryFilter");

const availabilityFilter =
    document.getElementById("availabilityFilter");


let allResources = [];

let currentUser = null;


/*
|--------------------------------------------------------------------------
| PAGE INITIALIZATION
|--------------------------------------------------------------------------
*/

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        currentUser = getUser();

        if (currentUser) {

            const userName =
                document.getElementById("userName");

            const userRole =
                document.getElementById("userRole");

            if (userName) {
                userName.textContent =
                    currentUser.name || "User";
            }

            if (userRole) {
                userRole.textContent =
                    currentUser.role === "ADMIN"
                        ? "Administrator"
                        : "Organization";
            }
        }


        if (addResourcePanel) {
            addResourcePanel.style.display =
                "none";
        }


        await loadResources();

    }
);


/*
|--------------------------------------------------------------------------
| SHOW ADD RESOURCE FORM
|--------------------------------------------------------------------------
*/

if (showAddResource) {

    showAddResource.addEventListener(
        "click",
        () => {

            addResourcePanel.style.display =
                "block";

            addResourcePanel.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
    );

}


/*
|--------------------------------------------------------------------------
| CANCEL ADD RESOURCE
|--------------------------------------------------------------------------
*/

if (cancelResource) {

    cancelResource.addEventListener(
        "click",
        () => {

            resourceForm.reset();

            resourceMessage.textContent = "";

            resourceMessage.className =
                "form-message";

            addResourcePanel.style.display =
                "none";

        }
    );

}


/*
|--------------------------------------------------------------------------
| LOAD RESOURCES
|--------------------------------------------------------------------------
*/

async function loadResources() {

    try {

        resourceGrid.innerHTML = `
            <div class="loading-state">
                Loading resources...
            </div>
        `;


        const response =
            await apiRequest(
                "/resources"
            );


        allResources =
            response.resources || [];


        updateResourceTotal(
            allResources.length
        );


        renderResources(
            allResources
        );


    } catch (error) {

        console.error(
            "Failed to load resources:",
            error
        );


        resourceGrid.innerHTML = `
            <div class="dashboard-error">

                <strong>
                    Unable to load resources
                </strong>

                <span>
                    ${escapeHTML(
                        error.message ||
                        "Please try again."
                    )}
                </span>

            </div>
        `;

    }

}


/*
|--------------------------------------------------------------------------
| RESOURCE SEARCH
|--------------------------------------------------------------------------
*/

if (resourceSearch) {

    resourceSearch.addEventListener(
        "input",
        applyFilters
    );

}


/*
|--------------------------------------------------------------------------
| CATEGORY FILTER
|--------------------------------------------------------------------------
*/

if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        applyFilters
    );

}


/*
|--------------------------------------------------------------------------
| AVAILABILITY FILTER
|--------------------------------------------------------------------------
*/

if (availabilityFilter) {

    availabilityFilter.addEventListener(
        "change",
        applyFilters
    );

}


/*
|--------------------------------------------------------------------------
| APPLY FILTERS
|--------------------------------------------------------------------------
*/

function applyFilters() {

    const search =
        resourceSearch.value
            .trim()
            .toLowerCase();


    const category =
        categoryFilter.value;


    const availability =
        availabilityFilter.value;


    const filteredResources =
        allResources.filter(
            resource => {

                const matchesSearch =
                    !search ||
                    resource.name
                        ?.toLowerCase()
                        .includes(search) ||
                    resource.description
                        ?.toLowerCase()
                        .includes(search) ||
                    resource.location
                        ?.toLowerCase()
                        .includes(search);


                const matchesCategory =
                    !category ||
                    resource.category === category;


                let matchesAvailability =
                    true;


                if (
                    availability ===
                    "available"
                ) {

                    matchesAvailability =
                        Number(
                            resource.availableQuantity
                        ) > 0;

                }


                if (
                    availability ===
                    "rental"
                ) {

                    matchesAvailability =
                        resource.rentalAvailable === true;

                }


                if (
                    availability ===
                    "emergency"
                ) {

                    matchesAvailability =
                        resource.emergencyAvailable === true;

                }


                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesAvailability
                );

            }
        );


    renderResources(
        filteredResources
    );

}


/*
|--------------------------------------------------------------------------
| CHECK RESOURCE OWNERSHIP
|--------------------------------------------------------------------------
*/

function isResourceOwner(resource) {

    if (!currentUser) {
        return false;
    }


    if (currentUser.role === "ADMIN") {
        return true;
    }


    if (
        currentUser.role !==
        "ORGANIZATION"
    ) {
        return false;
    }


    const userOrganization =
        currentUser.organization;


    const resourceOrganization =
        resource.organization?._id ||
        resource.organization;


    if (
        !userOrganization ||
        !resourceOrganization
    ) {
        return false;
    }


    return String(
        userOrganization
    ) === String(
        resourceOrganization
    );

}


/*
|--------------------------------------------------------------------------
| RENDER RESOURCES
|--------------------------------------------------------------------------
*/

function renderResources(resources) {

    if (!resources.length) {

        resourceGrid.innerHTML = `
            <div class="empty-state">

                <strong>
                    No resources found
                </strong>

                <span>
                    Try changing your search or filters.
                </span>

            </div>
        `;

        return;
    }


    resourceGrid.innerHTML =
        resources.map(
            resource => {

                const organization =
                    resource.organization?.name ||
                    "Healthcare Organization";


                const available =
                    Number(
                        resource.availableQuantity
                    ) || 0;


                const quantity =
                    Number(
                        resource.quantity
                    ) || 0;


                const availabilityPercentage =
                    quantity > 0
                        ? Math.round(
                            (available / quantity) * 100
                        )
                        : 0;


                const statusClass =
                    available > 0
                        ? "available"
                        : "unavailable";


                const rentalBadge =
                    resource.rentalAvailable
                        ? `
                            <span class="resource-badge rental">
                                Rental
                            </span>
                        `
                        : "";


                const emergencyBadge =
                    resource.emergencyAvailable
                        ? `
                            <span class="resource-badge emergency">
                                Emergency
                            </span>
                        `
                        : "";


                /*
                 * OWNERSHIP BADGE
                 */

                const ownedByCurrentUser =
                    isResourceOwner(resource);


                const ownershipBadge =
                    ownedByCurrentUser
                        ? `
                            <span class="resource-badge owned">
                                Your Resource
                            </span>
                        `
                        : "";


                /*
                 * MANAGEMENT BUTTONS
                 */

                const managementButtons =
                    ownedByCurrentUser
                        ? `
                            <div class="resource-management">

                                <button
                                    type="button"
                                    class="resource-action edit"
                                    onclick="editResource('${resource._id}')"
                                >
                                    ✏️ Edit
                                </button>

                                <button
                                    type="button"
                                    class="resource-action delete"
                                    onclick="deleteResource('${resource._id}')"
                                >
                                    🗑️ Delete
                                </button>

                            </div>
                        `
                        : "";


                return `
                    <article class="resource-card">

                        <div class="resource-card-top">

                            <div class="resource-card-icon">
                                ${getResourceIcon(
                                    resource.category
                                )}
                            </div>


                            <div class="resource-card-status">

                                <span
                                    class="status-dot ${statusClass}"
                                ></span>

                                ${escapeHTML(
                                    resource.status ||
                                    "AVAILABLE"
                                )}

                            </div>

                        </div>


                        <div class="resource-card-body">

                            <span class="resource-card-category">
                                ${escapeHTML(
                                    resource.category
                                )}
                            </span>


                            <h3>
                                ${escapeHTML(
                                    resource.name
                                )}
                            </h3>


                            <p>
                                ${escapeHTML(
                                    resource.description ||
                                    "Healthcare resource available through the MediShare network."
                                )}
                            </p>


                            <div class="resource-organization">

                                <span>
                                    Organization
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        organization
                                    )}
                                </strong>

                            </div>


                            <div class="resource-location">

                                <span>
                                    Location
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        resource.location
                                    )}
                                </strong>

                            </div>


                            <div class="resource-availability">

                                <div>

                                    <span>
                                        Availability
                                    </span>

                                    <strong>
                                        ${available}
                                        /
                                        ${quantity}
                                    </strong>

                                </div>


                                <div class="availability-bar">

                                    <span
                                        style="width: ${availabilityPercentage}%"
                                    ></span>

                                </div>

                            </div>


                            <div class="resource-badges">

                                ${ownershipBadge}

                                ${rentalBadge}

                                ${emergencyBadge}

                            </div>

                        </div>


                        <div class="resource-card-footer">

                            <span>
                                Contact:
                                ${escapeHTML(
                                    resource.contactNumber
                                )}
                            </span>


                            ${
                                resource.rentalAvailable
                                    ? `
                                        <span>
                                            ₹${Number(
                                                resource.pricePerDay || 0
                                            ).toLocaleString()}
                                            / day
                                        </span>
                                    `
                                    : `
                                        <span>
                                            Direct coordination
                                        </span>
                                    `
                            }

                        </div>


                        ${managementButtons}

                    </article>
                `;

            }
        ).join("");

}


/*
|--------------------------------------------------------------------------
| CREATE RESOURCE
|--------------------------------------------------------------------------
*/

if (resourceForm) {

    resourceForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const saveButton =
                document.getElementById(
                    "saveResource"
                );


            const name =
                document.getElementById(
                    "resourceName"
                ).value.trim();


            const category =
                document.getElementById(
                    "resourceCategory"
                ).value;


            const quantity =
                Number(
                    document.getElementById(
                        "resourceQuantity"
                    ).value
                );


            const availableQuantity =
                Number(
                    document.getElementById(
                        "availableQuantity"
                    ).value
                );


            const location =
                document.getElementById(
                    "resourceLocation"
                ).value.trim();


            const contactNumber =
                document.getElementById(
                    "contactNumber"
                ).value.trim();


            const description =
                document.getElementById(
                    "resourceDescription"
                ).value.trim();


            const pricePerDay =
                Number(
                    document.getElementById(
                        "pricePerDay"
                    ).value
                ) || 0;


            const rentalAvailable =
                document.getElementById(
                    "rentalAvailable"
                ).checked;


            const emergencyAvailable =
                document.getElementById(
                    "emergencyAvailable"
                ).checked;


            /*
             * CLIENT-SIDE VALIDATION
             */

            if (
                quantity < 1
            ) {

                showMessage(
                    "Total quantity must be at least 1.",
                    "error"
                );

                return;
            }


            if (
                availableQuantity < 0
            ) {

                showMessage(
                    "Available quantity cannot be negative.",
                    "error"
                );

                return;
            }


            if (
                availableQuantity >
                quantity
            ) {

                showMessage(
                    "Available quantity cannot be greater than total quantity.",
                    "error"
                );

                return;
            }


            if (
                rentalAvailable &&
                pricePerDay < 0
            ) {

                showMessage(
                    "Price per day cannot be negative.",
                    "error"
                );

                return;
            }


            /*
             * DETERMINE RESOURCE STATUS
             */

            let status =
                "UNAVAILABLE";


            if (
                availableQuantity ===
                quantity
            ) {

                status =
                    "AVAILABLE";

            }

            else if (
                availableQuantity > 0
            ) {

                status =
                    "PARTIALLY_AVAILABLE";

            }


            /*
             * DISABLE BUTTON
             */

            saveButton.disabled =
                true;


            saveButton.querySelector(
                "span"
            ).textContent =
                "Saving...";


            showMessage(
                "",
                ""
            );


            try {

                const response =
                    await apiRequest(
                        "/resources",
                        {
                            method: "POST",

                            body: JSON.stringify({

                                name,

                                category,

                                description,

                                quantity,

                                availableQuantity,

                                status,

                                location,

                                contactNumber,

                                rentalAvailable,

                                pricePerDay,

                                emergencyAvailable

                            })

                        }
                    );


                console.log(
                    "Resource created:",
                    response
                );


                showMessage(
                    "Resource added successfully.",
                    "success"
                );


                resourceForm.reset();


                document.getElementById(
                    "resourceQuantity"
                ).value =
                    "1";


                document.getElementById(
                    "availableQuantity"
                ).value =
                    "1";


                document.getElementById(
                    "pricePerDay"
                ).value =
                    "0";


                await loadResources();


                setTimeout(
                    () => {

                        addResourcePanel.style.display =
                            "none";

                        resourceMessage.textContent =
                            "";

                    },
                    1200
                );


            } catch (error) {

                console.error(
                    "Resource creation failed:",
                    error
                );


                showMessage(
                    error.message ||
                    "Unable to create resource.",
                    "error"
                );


            } finally {

                saveButton.disabled =
                    false;


                saveButton.querySelector(
                    "span"
                ).textContent =
                    "Save Resource";

            }

        }
    );

}


/*
|--------------------------------------------------------------------------
| EDIT RESOURCE
|--------------------------------------------------------------------------
*/

async function editResource(resourceId) {

    const resource =
        allResources.find(
            item =>
                String(item._id) ===
                String(resourceId)
        );


    if (!resource) {

        alert(
            "Resource could not be found."
        );

        return;
    }


    if (!isResourceOwner(resource)) {

        alert(
            "You are not authorized to edit this resource."
        );

        return;
    }


    /*
     * Ask for updated values.
     *
     * We keep this simple for now.
     * A premium modal can replace this later.
     */

    const name =
        prompt(
            "Resource name:",
            resource.name || ""
        );


    if (name === null) {
        return;
    }


    const description =
        prompt(
            "Description:",
            resource.description || ""
        );


    if (description === null) {
        return;
    }


    const location =
        prompt(
            "Location:",
            resource.location || ""
        );


    if (location === null) {
        return;
    }


    const contactNumber =
        prompt(
            "Contact number:",
            resource.contactNumber || ""
        );


    if (contactNumber === null) {
        return;
    }


    const quantityInput =
        prompt(
            "Total quantity:",
            resource.quantity || 1
        );


    if (quantityInput === null) {
        return;
    }


    const quantity =
        Number(quantityInput);


    if (
        !Number.isInteger(quantity) ||
        quantity < 1
    ) {

        alert(
            "Total quantity must be a positive whole number."
        );

        return;
    }


    const availableInput =
        prompt(
            "Available quantity:",
            resource.availableQuantity || 0
        );


    if (availableInput === null) {
        return;
    }


    const availableQuantity =
        Number(availableInput);


    if (
        !Number.isInteger(
            availableQuantity
        ) ||
        availableQuantity < 0
    ) {

        alert(
            "Available quantity must be a non-negative whole number."
        );

        return;
    }


    if (
        availableQuantity >
        quantity
    ) {

        alert(
            "Available quantity cannot be greater than total quantity."
        );

        return;
    }


    /*
     * Determine updated status.
     */

    let status =
        "UNAVAILABLE";


    if (
        availableQuantity ===
        quantity
    ) {

        status =
            "AVAILABLE";

    }

    else if (
        availableQuantity > 0
    ) {

        status =
            "PARTIALLY_AVAILABLE";

    }


    try {

        await apiRequest(
            `/resources/${resourceId}`,
            {
                method: "PUT",

                body: JSON.stringify({

                    name:
                        name.trim(),

                    description:
                        description.trim(),

                    location:
                        location.trim(),

                    contactNumber:
                        contactNumber.trim(),

                    quantity,

                    availableQuantity,

                    status

                })

            }
        );


        alert(
            "Resource updated successfully."
        );


        await loadResources();


    } catch (error) {

        console.error(
            "Resource update failed:",
            error
        );


        alert(
            error.message ||
            "Unable to update resource."
        );

    }

}


/*
|--------------------------------------------------------------------------
| DELETE RESOURCE
|--------------------------------------------------------------------------
*/

async function deleteResource(resourceId) {

    const resource =
        allResources.find(
            item =>
                String(item._id) ===
                String(resourceId)
        );


    if (!resource) {

        alert(
            "Resource could not be found."
        );

        return;
    }


    if (!isResourceOwner(resource)) {

        alert(
            "You are not authorized to delete this resource."
        );

        return;
    }


    const confirmed =
        confirm(
            `Delete "${resource.name}"?\n\nThis action cannot be undone.`
        );


    if (!confirmed) {
        return;
    }


    try {

        await apiRequest(
            `/resources/${resourceId}`,
            {
                method: "DELETE"
            }
        );


        alert(
            "Resource deleted successfully."
        );


        await loadResources();


    } catch (error) {

        console.error(
            "Resource deletion failed:",
            error
        );


        alert(
            error.message ||
            "Unable to delete resource."
        );

    }

}


/*
|--------------------------------------------------------------------------
| RESOURCE ICONS
|--------------------------------------------------------------------------
*/

function getResourceIcon(category) {

    const icons = {

        "OT Equipment": "⚕",

        "Medical Equipment": "✚",

        "Ambulance": "🚑",

        "Blood": "♥",

        "Hospital Bed": "▰",

        "Emergency Service": "⚠"

    };


    return icons[category] || "✚";

}


/*
|--------------------------------------------------------------------------
| MESSAGE
|--------------------------------------------------------------------------
*/

function showMessage(
    message,
    type
) {

    resourceMessage.textContent =
        message;


    if (type) {

        resourceMessage.className =
            `form-message ${type}`;

    }

    else {

        resourceMessage.className =
            "form-message";

    }

}


/*
|--------------------------------------------------------------------------
| UPDATE RESOURCE COUNT
|--------------------------------------------------------------------------
*/

function updateResourceTotal(
    count
) {

    resourceTotal.textContent =
        `${count} ${
            count === 1
                ? "resource"
                : "resources"
        }`;

}


/*
|--------------------------------------------------------------------------
| ESCAPE HTML
|--------------------------------------------------------------------------
*/

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}