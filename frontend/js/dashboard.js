requireLogin();


/*
|--------------------------------------------------------------------------
| INITIALIZE DASHBOARD
|--------------------------------------------------------------------------
*/

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const user = getUser();

        if (user) {

            updateUserDetails(user);

            updateDashboardHeading(user);

            updateDashboardActions(user);

            updateSidebar(user);

        }

        await loadDashboard();

    }
);


/*
|--------------------------------------------------------------------------
| USER DETAILS
|--------------------------------------------------------------------------
*/

function updateUserDetails(user) {

    const userName =
        document.getElementById(
            "userName"
        );

    const userRole =
        document.getElementById(
            "userRole"
        );


    if (userName) {

        userName.textContent =
            user.name || "User";

    }


    if (userRole) {

        userRole.textContent =
            user.role === "ADMIN"
                ? "Administrator"
                : "Organization";

    }

}


/*
|--------------------------------------------------------------------------
| LOAD DASHBOARD
|--------------------------------------------------------------------------
*/

async function loadDashboard() {

    try {

        const user =
            getUser();


        /*
        |--------------------------------------------------------------------------
        | LOAD DASHBOARD DATA
        |--------------------------------------------------------------------------
        */

        const [
            resources,
            rentals,
            emergencies,
            blood
        ] = await Promise.all([

            apiRequest(
                "/resources"
            ),

            apiRequest(
                "/rental-requests"
            ),

            apiRequest(
                "/emergency-requests"
            ),

            apiRequest(
                "/blood-inventory"
            )

        ]);


        /*
        |--------------------------------------------------------------------------
        | RESOURCE COUNT
        |--------------------------------------------------------------------------
        */

        const resourceCount =
            document.getElementById(
                "resourceCount"
            );


        if (resourceCount) {

            resourceCount.textContent =
                resources.count ?? 0;

        }


        /*
        |--------------------------------------------------------------------------
        | RENTAL COUNT
        |--------------------------------------------------------------------------
        */

        const rentalCount =
            document.getElementById(
                "rentalCount"
            );


        if (rentalCount) {

            rentalCount.textContent =
                rentals.count ?? 0;

        }


        /*
        |--------------------------------------------------------------------------
        | EMERGENCY COUNT
        |--------------------------------------------------------------------------
        */

        const emergencyCount =
            document.getElementById(
                "emergencyCount"
            );


        if (emergencyCount) {

            emergencyCount.textContent =
                emergencies.count ?? 0;

        }


        /*
        |--------------------------------------------------------------------------
        | BLOOD COUNT
        |--------------------------------------------------------------------------
        */

        const bloodCount =
            document.getElementById(
                "bloodCount"
            );


        if (bloodCount) {

            bloodCount.textContent =
                blood.count ?? 0;

        }


        /*
        |--------------------------------------------------------------------------
        | RESOURCE LIST
        |--------------------------------------------------------------------------
        */

        renderResources(
            resources.resources || []
        );


        /*
        |--------------------------------------------------------------------------
        | DASHBOARD STATUS
        |--------------------------------------------------------------------------
        */

        renderDashboardStatus(

            rentals.rentalRequests || [],

            emergencies.emergencyRequests || [],

            blood.bloodInventory || []

        );


        /*
        |--------------------------------------------------------------------------
        | ROLE-SPECIFIC HEADING
        |--------------------------------------------------------------------------
        */

        updateDashboardHeading(
            user
        );


    } catch (error) {

        console.error(
            "Dashboard loading failed:",
            error
        );


        const resourceList =
            document.getElementById(
                "resourceList"
            );


        if (resourceList) {

            resourceList.innerHTML = `

                <div class="dashboard-error">

                    <strong>
                        Unable to load dashboard
                    </strong>

                    <span>
                        Please make sure the MediShare backend
                        is running and your session is valid.
                    </span>

                </div>

            `;

        }

    }

}


/*
|--------------------------------------------------------------------------
| DASHBOARD HEADING
|--------------------------------------------------------------------------
*/

function updateDashboardHeading(
    user
) {

    if (!user) {
        return;
    }


    const heading =
        document.querySelector(
            ".dashboard-heading h1"
        );


    const eyebrow =
        document.querySelector(
            ".dashboard-heading .dashboard-eyebrow"
        );


    const description =
        document.querySelector(
            ".dashboard-heading p"
        );


    /*
    |--------------------------------------------------------------------------
    | ADMIN
    |--------------------------------------------------------------------------
    */

    if (
        user.role ===
        "ADMIN"
    ) {

        if (eyebrow) {

            eyebrow.textContent =
                "ADMINISTRATION";

        }


        if (heading) {

            heading.textContent =
                "MediShare Administration";

        }


        if (description) {

            description.textContent =
                "Monitor organizations, resources, rentals and emergency coordination across the MediShare network.";

        }

    }


    /*
    |--------------------------------------------------------------------------
    | ORGANIZATION
    |--------------------------------------------------------------------------
    */

    else {

        if (eyebrow) {

            eyebrow.textContent =
                "ORGANIZATION DASHBOARD";

        }


        if (heading) {

            heading.textContent =
                "Resource overview";

        }


        if (description) {

            description.textContent =
                "Monitor your healthcare resources, rentals and emergency coordination.";

        }

    }

}


/*
|--------------------------------------------------------------------------
| DASHBOARD ACTIONS
|--------------------------------------------------------------------------
*/

function updateDashboardActions(
    user
) {

    if (!user) {
        return;
    }


    /*
    |--------------------------------------------------------------------------
    | MAIN HEADER ACTION
    |--------------------------------------------------------------------------
    */

    const dashboardAction =
        document.querySelector(
            ".dashboard-heading .dashboard-action"
        );


    if (
        dashboardAction
    ) {

        if (
            user.role ===
            "ADMIN"
        ) {

            dashboardAction.textContent =
                "Admin Overview";

            dashboardAction.href =
                "dashboard.html";

        } else {

            dashboardAction.textContent =
                "+ Add Resource";

            dashboardAction.href =
                "resources.html";

        }

    }


    /*
    |--------------------------------------------------------------------------
    | ORGANIZATION QUICK ACTIONS
    |--------------------------------------------------------------------------
    */

    const organizationLabel =
        document.querySelector(
            ".sidebar .sidebar-label:nth-of-type(2)"
        );


    if (
        user.role ===
        "ADMIN"
    ) {

        /*
         * Hide organization-only
         * sidebar section.
         */

        if (organizationLabel) {

            organizationLabel.style.display =
                "none";

        }


        const organizationLinks =
            document.querySelectorAll(
                ".sidebar .sidebar-label:nth-of-type(2) ~ .sidebar-link"
            );


        organizationLinks.forEach(
            link => {

                link.style.display =
                    "none";

            }
        );

    }

}


/*
|--------------------------------------------------------------------------
| SIDEBAR
|--------------------------------------------------------------------------
*/

function updateSidebar(
    user
) {

    if (!user) {
        return;
    }


    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    if (!sidebar) {
        return;
    }


    /*
    |--------------------------------------------------------------------------
    | ADMIN SIDEBAR
    |--------------------------------------------------------------------------
    */

    if (
        user.role ===
        "ADMIN"
    ) {

        /*
         * Change organization section
         * into administration section.
         */

        const labels =
            sidebar.querySelectorAll(
                ".sidebar-label"
            );


        if (
            labels.length >= 2
        ) {

            labels[1].textContent =
                "ADMINISTRATION";

        }


        /*
         * Find the second section links.
         */

        const divider =
            sidebar.querySelector(
                ".sidebar-divider"
            );


        if (divider) {

            const adminLabel =
                divider.nextElementSibling;


            if (adminLabel) {

                adminLabel.textContent =
                    "ADMINISTRATION";

            }


            /*
             * Remove/hide the existing
             * Add Resource link.
             */

            let next =
                adminLabel?.nextElementSibling;


            while (next) {

                if (
                    next.classList &&
                    next.classList.contains(
                        "sidebar-link"
                    )
                ) {

                    next.style.display =
                        "none";

                }

                next =
                    next.nextElementSibling;

            }

        }

    }

}


/*
|--------------------------------------------------------------------------
| RENDER RESOURCES
|--------------------------------------------------------------------------
*/

function renderResources(
    resources
) {

    const container =
        document.getElementById(
            "resourceList"
        );


    if (!container) {
        return;
    }


    if (!resources.length) {

        container.innerHTML = `

            <div class="empty-state">

                <strong>
                    No resources listed yet
                </strong>

                <span>
                    Add your first healthcare resource.
                </span>

            </div>

        `;

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | SHOW FIVE MOST RECENT
    |--------------------------------------------------------------------------
    */

    const visibleResources =
        resources.slice(
            0,
            5
        );


    container.innerHTML =
        visibleResources
            .map(
                resource => {

                    const organization =
                        resource.organization?.name ||
                        "Healthcare Organization";


                    const availableQuantity =
                        Number(
                            resource.availableQuantity ??
                            0
                        );


                    const totalQuantity =
                        Number(
                            resource.quantity ??
                            0
                        );


                    const statusClass =
                        availableQuantity > 0
                            ? "available"
                            : "unavailable";


                    return `

                        <div class="dashboard-resource">

                            <div class="resource-type-icon">

                                ${getResourceIcon(
                                    resource.category
                                )}

                            </div>


                            <div class="dashboard-resource-info">

                                <strong>

                                    ${escapeHTML(
                                        resource.name
                                    )}

                                </strong>


                                <span>

                                    ${escapeHTML(
                                        resource.category
                                    )}

                                    ·

                                    ${escapeHTML(
                                        organization
                                    )}

                                </span>

                            </div>


                            <div class="dashboard-resource-status">

                                <strong>

                                    ${availableQuantity}

                                </strong>


                                <span>

                                    available

                                    ${
                                        totalQuantity
                                            ? ` / ${totalQuantity}`
                                            : ""
                                    }

                                </span>


                                <small
                                    class="${statusClass}"
                                >

                                    ${escapeHTML(
                                        resource.status ||
                                        "UNKNOWN"
                                    )}

                                </small>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/*
|--------------------------------------------------------------------------
| DASHBOARD STATUS
|--------------------------------------------------------------------------
*/

function renderDashboardStatus(
    rentals,
    emergencies,
    blood
) {

    /*
    |--------------------------------------------------------------------------
    | PENDING RENTALS
    |--------------------------------------------------------------------------
    */

    const pendingRentals =
        rentals.filter(
            rental =>
                rental.status ===
                "PENDING"
        ).length;


    /*
    |--------------------------------------------------------------------------
    | ACTIVE RENTALS
    |--------------------------------------------------------------------------
    */

    const activeRentals =
        rentals.filter(
            rental =>
                [
                    "APPROVED",
                    "DISPATCHED",
                    "IN_USE"
                ].includes(
                    rental.status
                )
        ).length;


    /*
    |--------------------------------------------------------------------------
    | PENDING EMERGENCIES
    |--------------------------------------------------------------------------
    */

    const pendingEmergencies =
        emergencies.filter(
            request =>
                request.status ===
                "PENDING"
        ).length;


    /*
    |--------------------------------------------------------------------------
    | AVAILABLE BLOOD
    |--------------------------------------------------------------------------
    */

    const availableBlood =
        blood.filter(
            item =>
                item.status ===
                "AVAILABLE" &&
                Number(
                    item.availableUnits
                ) > 0
        ).length;


    /*
    |--------------------------------------------------------------------------
    | OPTIONAL DASHBOARD ELEMENTS
    |--------------------------------------------------------------------------
    */

    const pendingRentalElement =
        document.getElementById(
            "pendingRentalCount"
        );


    if (
        pendingRentalElement
    ) {

        pendingRentalElement.textContent =
            pendingRentals;

    }


    const activeRentalElement =
        document.getElementById(
            "activeRentalCount"
        );


    if (
        activeRentalElement
    ) {

        activeRentalElement.textContent =
            activeRentals;

    }


    const pendingEmergencyElement =
        document.getElementById(
            "pendingEmergencyCount"
        );


    if (
        pendingEmergencyElement
    ) {

        pendingEmergencyElement.textContent =
            pendingEmergencies;

    }


    const availableBloodElement =
        document.getElementById(
            "availableBloodCount"
        );


    if (
        availableBloodElement
    ) {

        availableBloodElement.textContent =
            availableBlood;

    }

}


/*
|--------------------------------------------------------------------------
| RESOURCE ICONS
|--------------------------------------------------------------------------
*/

function getResourceIcon(
    category
) {

    const icons = {

        "OT Equipment":
            "⚕",

        "Medical Equipment":
            "✚",

        "Ambulance":
            "🚑",

        "Blood":
            "♥",

        "Hospital Bed":
            "▰",

        "Emergency Service":
            "⚠"

    };


    return (
        icons[category] ||
        "✚"
    );

}


/*
|--------------------------------------------------------------------------
| HTML ESCAPING
|--------------------------------------------------------------------------
*/

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}