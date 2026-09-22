requireLogin();

const bloodForm =
    document.getElementById("bloodForm");

const bloodFormPanel =
    document.getElementById("bloodFormPanel");

const showBloodForm =
    document.getElementById("showBloodForm");

const cancelBlood =
    document.getElementById("cancelBlood");

const bloodMessage =
    document.getElementById("bloodMessage");

const bloodGrid =
    document.getElementById("bloodGrid");

const bloodTotal =
    document.getElementById("bloodTotal");

const bloodSearch =
    document.getElementById("bloodSearch");

const bloodGroupFilter =
    document.getElementById("bloodGroupFilter");

const bloodStatusFilter =
    document.getElementById("bloodStatusFilter");

let allBloodInventory = [];

let editingBloodId = null;


/*
|--------------------------------------------------------------------------
| INITIALIZE
|--------------------------------------------------------------------------
*/

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const user = getUser();

        if (user) {

            document.getElementById(
                "userName"
            ).textContent =
                user.name || "User";

            document.getElementById(
                "userRole"
            ).textContent =
                user.role === "ADMIN"
                    ? "Administrator"
                    : "Organization";
        }


        bloodFormPanel.style.display =
            "none";


        await loadBloodInventory();

    }
);


/*
|--------------------------------------------------------------------------
| SHOW FORM
|--------------------------------------------------------------------------
*/

showBloodForm.addEventListener(
    "click",
    () => {

        startCreateMode();

        bloodFormPanel.style.display =
            "block";

        bloodFormPanel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }
);


/*
|--------------------------------------------------------------------------
| CANCEL FORM
|--------------------------------------------------------------------------
*/

cancelBlood.addEventListener(
    "click",
    () => {

        resetBloodForm();

        bloodFormPanel.style.display =
            "none";

    }
);


/*
|--------------------------------------------------------------------------
| LOAD BLOOD INVENTORY
|--------------------------------------------------------------------------
*/

async function loadBloodInventory() {

    try {

        bloodGrid.innerHTML = `
            <div class="loading-state">
                Loading blood inventory...
            </div>
        `;


        const response =
            await apiRequest(
                "/blood-inventory"
            );


        allBloodInventory =
            response.bloodInventory || [];


        updateSummary(
            allBloodInventory
        );


        updateTotal(
            allBloodInventory.length
        );


        renderBloodInventory(
            allBloodInventory
        );


    } catch (error) {

        console.error(
            "Failed to load blood inventory:",
            error
        );


        bloodGrid.innerHTML = `
            <div class="dashboard-error">

                <strong>
                    Unable to load blood inventory
                </strong>

                <span>
                    ${escapeHTML(error.message)}
                </span>

            </div>
        `;

    }

}


/*
|--------------------------------------------------------------------------
| SUMMARY
|--------------------------------------------------------------------------
*/

function updateSummary(
    inventory
) {

    const total =
        inventory.length;


    const available =
        inventory.filter(
            item =>
                item.status === "AVAILABLE" &&
                Number(item.availableUnits) > 0
        ).length;


    const low =
        inventory.filter(
            item =>
                item.status === "LOW"
        ).length;


    document.getElementById(
        "bloodRecordCount"
    ).textContent =
        total;


    document.getElementById(
        "availableBloodCount"
    ).textContent =
        available;


    document.getElementById(
        "lowBloodCount"
    ).textContent =
        low;


    if (inventory.length) {

        const latest =
            [...inventory].sort(
                (a, b) =>
                    new Date(
                        b.lastUpdated
                    ) -
                    new Date(
                        a.lastUpdated
                    )
            )[0];


        document.getElementById(
            "lastBloodUpdate"
        ).textContent =
            formatShortDate(
                latest.lastUpdated
            );

    } else {

        document.getElementById(
            "lastBloodUpdate"
        ).textContent =
            "—";

    }

}


/*
|--------------------------------------------------------------------------
| FILTER EVENTS
|--------------------------------------------------------------------------
*/

bloodSearch.addEventListener(
    "input",
    applyFilters
);


bloodGroupFilter.addEventListener(
    "change",
    applyFilters
);


bloodStatusFilter.addEventListener(
    "change",
    applyFilters
);


/*
|--------------------------------------------------------------------------
| APPLY FILTERS
|--------------------------------------------------------------------------
*/

function applyFilters() {

    const search =
        bloodSearch.value
            .trim()
            .toLowerCase();


    const group =
        bloodGroupFilter.value;


    const status =
        bloodStatusFilter.value;


    const filtered =
        allBloodInventory.filter(
            item => {

                const organization =
                    item.organization?.name ||
                    "";


                const matchesSearch =
                    !search ||
                    item.bloodGroup
                        ?.toLowerCase()
                        .includes(search) ||
                    item.component
                        ?.toLowerCase()
                        .includes(search) ||
                    organization
                        .toLowerCase()
                        .includes(search);


                const matchesGroup =
                    !group ||
                    item.bloodGroup === group;


                const matchesStatus =
                    !status ||
                    item.status === status;


                return (
                    matchesSearch &&
                    matchesGroup &&
                    matchesStatus
                );

            }
        );


    updateTotal(
        filtered.length
    );


    renderBloodInventory(
        filtered
    );

}


/*
|--------------------------------------------------------------------------
| RENDER INVENTORY
|--------------------------------------------------------------------------
*/

function renderBloodInventory(
    inventory
) {

    if (!inventory.length) {

        bloodGrid.innerHTML = `
            <div class="empty-state">

                <strong>
                    No blood inventory found
                </strong>

                <span>
                    Try changing your search or filters.
                </span>

            </div>
        `;

        return;

    }


    const user =
        getUser();


    bloodGrid.innerHTML =
        inventory.map(
            item => {

                const organization =
                    item.organization?.name ||
                    "Healthcare Organization";


                const units =
                    Number(
                        item.availableUnits
                    ) || 0;


                const status =
                    item.status ||
                    "UNAVAILABLE";


                const statusClass =
                    getStatusClass(
                        status
                    );


                const canManage =
                    canManageInventory(
                        item,
                        user
                    );


                return `
                    <article class="blood-card">

                        <div class="blood-card-top">

                            <div class="blood-group-circle">

                                ${escapeHTML(
                                    item.bloodGroup
                                )}

                            </div>


                            <div class="blood-status">

                                <span
                                    class="status-dot ${statusClass}"
                                ></span>

                                ${escapeHTML(
                                    status
                                )}

                            </div>

                        </div>


                        <div class="blood-card-body">

                            <span class="resource-card-category">

                                ${escapeHTML(
                                    item.component
                                )}

                            </span>


                            <h3>

                                ${escapeHTML(
                                    item.bloodGroup
                                )}

                                Blood

                            </h3>


                            <div class="blood-units">

                                <strong>
                                    ${units}
                                </strong>

                                <span>
                                    units available
                                </span>

                            </div>


                            <div class="blood-organization">

                                <span>
                                    Organization
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        organization
                                    )}
                                </strong>

                            </div>


                            <div class="blood-contact">

                                <span>
                                    Contact
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        item.contactNumber
                                    )}
                                </strong>

                            </div>

                        </div>


                        <div class="blood-card-footer">

                            <span>
                                Updated
                                ${formatShortDate(
                                    item.lastUpdated
                                )}
                            </span>

                            <span>
                                Verify before use
                            </span>

                        </div>


                        ${
                            canManage
                                ? `
                                    <div class="blood-card-actions">

                                        <button
                                            type="button"
                                            class="blood-action blood-action-edit"
                                            onclick="editBloodInventory('${item._id}')"
                                        >
                                            ✎ Edit
                                        </button>

                                        <button
                                            type="button"
                                            class="blood-action blood-action-delete"
                                            onclick="deleteBloodInventory('${item._id}')"
                                        >
                                            × Delete
                                        </button>

                                    </div>
                                `
                                : ""
                        }

                    </article>
                `;

            }
        ).join("");

}


/*
|--------------------------------------------------------------------------
| CREATE / EDIT MODE
|--------------------------------------------------------------------------
*/

function startCreateMode() {

    editingBloodId = null;

    bloodForm.reset();

    document.getElementById(
        "bloodStatus"
    ).value =
        "AVAILABLE";


    document.querySelector(
        "#bloodFormPanel h2"
    ).textContent =
        "Add blood inventory";


    document.getElementById(
        "saveBlood"
    ).querySelector(
        "span"
    ).textContent =
        "Save Inventory";


    showMessage(
        "",
        ""
    );

}


function startEditMode(
    inventory
) {

    editingBloodId =
        inventory._id;


    document.getElementById(
        "bloodGroup"
    ).value =
        inventory.bloodGroup;


    document.getElementById(
        "component"
    ).value =
        inventory.component;


    document.getElementById(
        "availableUnits"
    ).value =
        inventory.availableUnits;


    document.getElementById(
        "bloodStatus"
    ).value =
        inventory.status;


    document.getElementById(
        "bloodContact"
    ).value =
        inventory.contactNumber;


    document.querySelector(
        "#bloodFormPanel h2"
    ).textContent =
        "Update blood inventory";


    document.getElementById(
        "saveBlood"
    ).querySelector(
        "span"
    ).textContent =
        "Update Inventory";


    showMessage(
        "",
        ""
    );


    bloodFormPanel.style.display =
        "block";


    bloodFormPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/*
|--------------------------------------------------------------------------
| EDIT INVENTORY
|--------------------------------------------------------------------------
*/

async function editBloodInventory(
    id
) {

    try {

        const inventory =
            allBloodInventory.find(
                item =>
                    item._id === id
            );


        if (!inventory) {

            showMessage(
                "Blood inventory record could not be found.",
                "error"
            );

            return;

        }


        startEditMode(
            inventory
        );

    } catch (error) {

        console.error(
            "Edit blood inventory error:",
            error
        );

    }

}


/*
|--------------------------------------------------------------------------
| CREATE / UPDATE SUBMIT
|--------------------------------------------------------------------------
*/

bloodForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const saveButton =
            document.getElementById(
                "saveBlood"
            );


        const bloodGroup =
            document.getElementById(
                "bloodGroup"
            ).value;


        const component =
            document.getElementById(
                "component"
            ).value;


        const availableUnits =
            Number(
                document.getElementById(
                    "availableUnits"
                ).value
            );


        const status =
            document.getElementById(
                "bloodStatus"
            ).value;


        const contactNumber =
            document.getElementById(
                "bloodContact"
            ).value.trim();


        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        if (!bloodGroup) {

            showMessage(
                "Please select a blood group.",
                "error"
            );

            return;

        }


        if (!component) {

            showMessage(
                "Please select a blood component.",
                "error"
            );

            return;

        }


        if (
            Number.isNaN(
                availableUnits
            ) ||
            availableUnits < 0
        ) {

            showMessage(
                "Available units cannot be negative.",
                "error"
            );

            return;

        }


        if (!contactNumber) {

            showMessage(
                "Please provide a contact number.",
                "error"
            );

            return;

        }


        /*
        |--------------------------------------------------------------------------
        | SUBMIT STATE
        |--------------------------------------------------------------------------
        */

        saveButton.disabled =
            true;


        saveButton.querySelector(
            "span"
        ).textContent =
            editingBloodId
                ? "Updating..."
                : "Saving...";


        showMessage(
            "",
            ""
        );


        try {

            const payload = {

                bloodGroup,

                component,

                availableUnits,

                status,

                contactNumber

            };


            let response;


            if (editingBloodId) {

                response =
                    await apiRequest(
                        `/blood-inventory/${editingBloodId}`,
                        {
                            method: "PUT",

                            body:
                                JSON.stringify(
                                    payload
                                )
                        }
                    );

            } else {

                response =
                    await apiRequest(
                        "/blood-inventory",
                        {
                            method: "POST",

                            body:
                                JSON.stringify(
                                    payload
                                )
                        }
                    );

            }


            console.log(
                "Blood inventory response:",
                response
            );


            showMessage(
                editingBloodId
                    ? "Blood inventory updated successfully."
                    : "Blood inventory added successfully.",
                "success"
            );


            await loadBloodInventory();


            setTimeout(
                () => {

                    resetBloodForm();

                    bloodFormPanel.style.display =
                        "none";

                },
                1000
            );


        } catch (error) {

            console.error(
                "Blood inventory save failed:",
                error
            );


            showMessage(
                error.message ||
                "Unable to save blood inventory.",
                "error"
            );

        } finally {

            saveButton.disabled =
                false;

            saveButton.querySelector(
                "span"
            ).textContent =
                editingBloodId
                    ? "Update Inventory"
                    : "Save Inventory";

        }

    }
);


/*
|--------------------------------------------------------------------------
| DELETE INVENTORY
|--------------------------------------------------------------------------
*/

async function deleteBloodInventory(
    id
) {

    const inventory =
        allBloodInventory.find(
            item =>
                item._id === id
        );


    if (!inventory) {

        alert(
            "Blood inventory record not found."
        );

        return;

    }


    const organization =
        inventory.organization?.name ||
        "this organization";


    const confirmed =
        window.confirm(
            `Delete ${inventory.bloodGroup} ${inventory.component} inventory from ${organization}?\n\nThis action cannot be undone.`
        );


    if (!confirmed) {
        return;
    }


    try {

        await apiRequest(
            `/blood-inventory/${id}`,
            {
                method: "DELETE"
            }
        );


        await loadBloodInventory();


        showTemporaryMessage(
            "Blood inventory deleted successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Blood inventory deletion failed:",
            error
        );


        showTemporaryMessage(
            error.message ||
            "Unable to delete blood inventory.",
            "error"
        );

    }

}


/*
|--------------------------------------------------------------------------
| OWNERSHIP
|--------------------------------------------------------------------------
*/

function canManageInventory(
    inventory,
    user
) {

    if (!user) {
        return false;
    }


    if (user.role === "ADMIN") {
        return true;
    }


    if (
        user.role !==
        "ORGANIZATION"
    ) {
        return false;
    }


    const userOrganization =
        getObjectId(
            user.organization
        );


    const inventoryOrganization =
        getObjectId(
            inventory.organization
        );


    return (
        userOrganization &&
        inventoryOrganization &&
        userOrganization ===
        inventoryOrganization
    );

}


/*
|--------------------------------------------------------------------------
| OBJECT ID HELPER
|--------------------------------------------------------------------------
*/

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


    if (
        typeof value ===
        "object" &&
        value._id
    ) {
        return value._id;
    }


    return null;

}


/*
|--------------------------------------------------------------------------
| RESET FORM
|--------------------------------------------------------------------------
*/

function resetBloodForm() {

    editingBloodId =
        null;


    bloodForm.reset();


    document.getElementById(
        "bloodStatus"
    ).value =
        "AVAILABLE";


    document.querySelector(
        "#bloodFormPanel h2"
    ).textContent =
        "Add blood inventory";


    document.getElementById(
        "saveBlood"
    ).querySelector(
        "span"
    ).textContent =
        "Save Inventory";


    showMessage(
        "",
        ""
    );

}


/*
|--------------------------------------------------------------------------
| STATUS CLASS
|--------------------------------------------------------------------------
*/

function getStatusClass(
    status
) {

    const classes = {

        AVAILABLE:
            "available",

        LOW:
            "low",

        UNAVAILABLE:
            "unavailable"

    };


    return classes[status] ||
        "unavailable";

}


/*
|--------------------------------------------------------------------------
| UPDATE TOTAL
|--------------------------------------------------------------------------
*/

function updateTotal(
    count
) {

    bloodTotal.textContent =
        `${count} ${
            count === 1
                ? "record"
                : "records"
        }`;

}


/*
|--------------------------------------------------------------------------
| SHORT DATE
|--------------------------------------------------------------------------
*/

function formatShortDate(
    date
) {

    if (!date) {
        return "—";
    }


    const parsedDate =
        new Date(date);


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return "—";
    }


    return parsedDate.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short"
        }
    );

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

    bloodMessage.textContent =
        message;


    if (type) {

        bloodMessage.className =
            `form-message ${type}`;

    } else {

        bloodMessage.className =
            "form-message";

    }

}


/*
|--------------------------------------------------------------------------
| TEMPORARY MESSAGE
|--------------------------------------------------------------------------
*/

function showTemporaryMessage(
    message,
    type
) {

    showMessage(
        message,
        type
    );


    setTimeout(
        () => {

            showMessage(
                "",
                ""
            );

        },
        2500
    );

}


/*
|--------------------------------------------------------------------------
| ESCAPE HTML
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


/*
|--------------------------------------------------------------------------
| GLOBAL ACTIONS
|--------------------------------------------------------------------------
*/

window.editBloodInventory =
    editBloodInventory;

window.deleteBloodInventory =
    deleteBloodInventory;