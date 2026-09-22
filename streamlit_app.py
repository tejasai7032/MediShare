import os
from textwrap import dedent

import requests
import streamlit as st


# ============================================================
# CONFIGURATION
# ============================================================

API_BASE_URL = os.getenv(
    "MEDISHARE_API_URL",
    "http://localhost:5050/api"
)

st.set_page_config(
    page_title="MediShare",
    page_icon="🏥",
    layout="wide",
    initial_sidebar_state="expanded"
)


# ============================================================
# HTML RENDER HELPER
# ============================================================

def render_html(content):
    st.html(
        dedent(content).strip()
    )


# ============================================================
# CUSTOM CSS
# ============================================================

st.html(
    """
    <style>

    /* =========================
       MAIN APPLICATION
       ========================= */

    .stApp {
        background: #f5f7fb;
    }

    .block-container {
        padding-top: 2rem;
        padding-bottom: 3rem;
        max-width: 1400px;
    }


    /* =========================
       HERO
       ========================= */

    .hero {
        padding: 3rem;
        border-radius: 26px;
        background: linear-gradient(
            135deg,
            #102a43 0%,
            #164e63 50%,
            #0f766e 100%
        );
        color: white;
        margin-bottom: 2rem;
        box-shadow: 0 18px 45px rgba(15, 23, 42, 0.18);
    }

    .badge {
        display: inline-block;
        padding: 0.5rem 0.9rem;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.13);
        border: 1px solid rgba(255, 255, 255, 0.25);
        color: white;
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        margin-bottom: 1rem;
    }

    .hero h1 {
        margin: 0;
        color: white;
        font-size: 3.2rem;
        line-height: 1.1;
        font-weight: 800;
    }

    .hero p {
        margin-top: 1rem;
        margin-bottom: 0;
        max-width: 900px;
        color: rgba(255, 255, 255, 0.88);
        font-size: 1.05rem;
        line-height: 1.75;
    }


    /* =========================
       SECTION HEADINGS
       ========================= */

    .section-title {
        margin-top: 1.8rem;
        margin-bottom: 1rem;
        color: #102a43;
        font-size: 1.65rem;
        font-weight: 800;
    }

    .section-subtitle {
        margin-bottom: 1.2rem;
        color: #64748b;
        font-size: 0.92rem;
    }


    /* =========================
       METRIC CARDS
       ========================= */

    .metric-card {
        min-height: 125px;
        padding: 1.4rem;
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        background: white;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
    }

    .metric-label {
        margin-bottom: 0.65rem;
        color: #64748b;
        font-size: 0.88rem;
        font-weight: 600;
    }

    .metric-value {
        color: #102a43;
        font-size: 2rem;
        font-weight: 800;
    }


    /* =========================
       INFORMATION CARDS
       ========================= */

    .info-card {
        min-height: 190px;
        padding: 1.5rem;
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        background: white;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
    }

    .info-card h3 {
        margin-top: 0;
        margin-bottom: 0.8rem;
        color: #102a43;
        font-size: 1.15rem;
    }

    .info-card p {
        margin: 0;
        color: #64748b;
        line-height: 1.7;
        font-size: 0.92rem;
    }


    /* =========================
       RESOURCE CARDS
       ========================= */

    .resource-card {
        margin-bottom: 1rem;
        padding: 1.4rem;
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        background: white;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
    }

    .resource-name {
        margin-bottom: 0.35rem;
        color: #102a43;
        font-size: 1.18rem;
        font-weight: 800;
    }

    .resource-category {
        margin-bottom: 0.9rem;
        color: #0f766e;
        font-size: 0.85rem;
        font-weight: 800;
    }

    .resource-info {
        color: #64748b;
        font-size: 0.9rem;
        line-height: 1.75;
    }

    .resource-info strong {
        color: #334155;
    }


    /* =========================
       STATUS BADGES
       ========================= */

    .status {
        display: inline-block;
        padding: 0.35rem 0.7rem;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 800;
    }

    .status-available {
        background: #dcfce7;
        color: #166534;
    }

    .status-partial {
        background: #fef3c7;
        color: #92400e;
    }

    .status-unavailable {
        background: #fee2e2;
        color: #991b1b;
    }

    .status-maintenance {
        background: #e2e8f0;
        color: #475569;
    }


    /* =========================
       FOOTER
       ========================= */

    .footer {
        margin-top: 2.5rem;
        padding: 2rem 0 1rem;
        color: #94a3b8;
        text-align: center;
        font-size: 0.83rem;
        line-height: 1.6;
    }

    </style>
    """
)


# ============================================================
# API HELPERS
# ============================================================

def get_resources():
    try:
        response = requests.get(
            f"{API_BASE_URL}/resources",
            timeout=8
        )

        if response.status_code != 200:
            return []

        data = response.json()

        if isinstance(data, list):
            return data

        if isinstance(data, dict):
            return data.get("data", [])

        return []

    except requests.RequestException:
        return []


def get_blood_inventory():
    try:
        response = requests.get(
            f"{API_BASE_URL}/blood-inventory",
            timeout=8
        )

        if response.status_code != 200:
            return []

        data = response.json()

        if isinstance(data, list):
            return data

        if isinstance(data, dict):
            return data.get("data", [])

        return []

    except requests.RequestException:
        return []


def get_emergency_requests():
    try:
        response = requests.get(
            f"{API_BASE_URL}/emergency-requests",
            timeout=8
        )

        if response.status_code != 200:
            return []

        data = response.json()

        if isinstance(data, list):
            return data

        if isinstance(data, dict):
            return data.get("data", [])

        return []

    except requests.RequestException:
        return []


# ============================================================
# SIDEBAR
# ============================================================

with st.sidebar:

    st.title("🏥 MediShare")

    st.caption(
        "Healthcare Resource Sharing Platform"
    )

    st.divider()

    page = st.radio(
        "Navigate",
        [
            "Overview",
            "Resources",
            "Blood Inventory",
            "Emergency Services"
        ]
    )

    st.divider()

    st.markdown("**Platform**")

    st.caption(
        "Resource coordination demo"
    )

    st.caption(
        "Node.js • Express • MongoDB"
    )


# ============================================================
# LOAD DATA
# ============================================================

resources = get_resources()
blood_inventory = get_blood_inventory()
emergency_requests = get_emergency_requests()


# ============================================================
# OVERVIEW
# ============================================================

if page == "Overview":

    render_html(
        """
        <div class="hero">

            <div class="badge">
                HEALTHCARE RESOURCE COORDINATION
            </div>

            <h1>
                MediShare
            </h1>

            <p>
                A centralized platform for healthcare organizations
                to discover, manage and coordinate medical resources,
                rentals, emergency services and blood inventory.
            </p>

        </div>
        """
    )

    render_html(
        """
        <div class="section-title">
            Platform Overview
        </div>
        """
    )

    available_resources = 0
    rental_resources = 0

    for resource in resources:

        status = resource.get(
            "status",
            "UNKNOWN"
        )

        if status in (
            "AVAILABLE",
            "PARTIALLY_AVAILABLE"
        ):
            available_resources += 1

        if resource.get(
            "rentalAvailable",
            False
        ):
            rental_resources += 1


    # =========================
    # METRICS
    # =========================

    col1, col2, col3, col4 = st.columns(4)

    with col1:

        render_html(
            f"""
            <div class="metric-card">

                <div class="metric-label">
                    Total Resources
                </div>

                <div class="metric-value">
                    {len(resources)}
                </div>

            </div>
            """
        )

    with col2:

        render_html(
            f"""
            <div class="metric-card">

                <div class="metric-label">
                    Available Resources
                </div>

                <div class="metric-value">
                    {available_resources}
                </div>

            </div>
            """
        )

    with col3:

        render_html(
            f"""
            <div class="metric-card">

                <div class="metric-label">
                    Rental Resources
                </div>

                <div class="metric-value">
                    {rental_resources}
                </div>

            </div>
            """
        )

    with col4:

        render_html(
            """
            <div class="metric-card">

                <div class="metric-label">
                    API Status
                </div>

                <div class="metric-value">
                    LIVE
                </div>

            </div>
            """
        )


    # =========================
    # HOW IT WORKS
    # =========================

    render_html(
        """
        <div class="section-title">
            How MediShare Works
        </div>
        """
    )

    col1, col2, col3 = st.columns(3)

    with col1:

        render_html(
            """
            <div class="info-card">

                <h3>
                    🔎 Discover
                </h3>

                <p>
                    Healthcare organizations can search available
                    equipment, ambulances, hospital resources and
                    other healthcare services.
                </p>

            </div>
            """
        )

    with col2:

        render_html(
            """
            <div class="info-card">

                <h3>
                    📋 Coordinate
                </h3>

                <p>
                    Organizations can coordinate resource requests,
                    rental workflows and emergency requirements
                    through structured REST APIs.
                </p>

            </div>
            """
        )

    with col3:

        render_html(
            """
            <div class="info-card">

                <h3>
                    🚑 Respond
                </h3>

                <p>
                    Emergency resources and blood inventory
                    information can be surfaced quickly for
                    coordination and direct confirmation.
                </p>

            </div>
            """
        )


# ============================================================
# RESOURCES
# ============================================================

elif page == "Resources":

    render_html(
        """
        <div class="hero">

            <div class="badge">
                MEDICAL RESOURCE DIRECTORY
            </div>

            <h1>
                Resources
            </h1>

            <p>
                Browse healthcare resources currently available
                through the MediShare platform.
            </p>

        </div>
        """
    )

    if not resources:

        st.info(
            "No resources are currently available."
        )

    else:

        col1, col2 = st.columns(2)

        with col1:

            search = st.text_input(
                "Search resources",
                placeholder="Equipment, ambulance..."
            )

        with col2:

            categories = sorted(
                set(
                    resource.get(
                        "category",
                        "Other"
                    )
                    for resource in resources
                )
            )

            selected_category = st.selectbox(
                "Category",
                ["All"] + categories
            )

        search_lower = search.lower()

        filtered_resources = []

        for resource in resources:

            name = resource.get(
                "name",
                ""
            )

            description = resource.get(
                "description",
                ""
            )

            category = resource.get(
                "category",
                "Other"
            )

            matches_search = (
                search_lower in name.lower()
                or search_lower in description.lower()
            )

            matches_category = (
                selected_category == "All"
                or category == selected_category
            )

            if (
                matches_search
                and matches_category
            ):
                filtered_resources.append(
                    resource
                )

        render_html(
            f"""
            <div class="section-subtitle">
                Showing {len(filtered_resources)}
                resource(s)
            </div>
            """
        )

        for resource in filtered_resources:

            name = resource.get(
                "name",
                "Unnamed Resource"
            )

            category = resource.get(
                "category",
                "Other"
            )

            description = resource.get(
                "description",
                "No description available."
            )

            quantity = resource.get(
                "quantity",
                0
            )

            available_quantity = resource.get(
                "availableQuantity",
                0
            )

            location = resource.get(
                "location",
                "Not specified"
            )

            contact = resource.get(
                "contactNumber",
                "Not specified"
            )

            status = resource.get(
                "status",
                "UNKNOWN"
            )

            rental_available = resource.get(
                "rentalAvailable",
                False
            )

            emergency_available = resource.get(
                "emergencyAvailable",
                False
            )


            # Status style

            if status == "AVAILABLE":

                status_class = (
                    "status-available"
                )

            elif status == "PARTIALLY_AVAILABLE":

                status_class = (
                    "status-partial"
                )

            elif status == "MAINTENANCE":

                status_class = (
                    "status-maintenance"
                )

            else:

                status_class = (
                    "status-unavailable"
                )


            rental_text = (
                "💰 Rental Available"
                if rental_available
                else ""
            )

            emergency_text = (
                "🚑 Emergency Available"
                if emergency_available
                else ""
            )


            render_html(
                f"""
                <div class="resource-card">

                    <div class="resource-name">
                        {name}
                    </div>

                    <div class="resource-category">
                        {category}
                    </div>

                    <div class="resource-info">

                        <strong>
                            Description:
                        </strong>

                        {description}

                        <br>

                        <strong>
                            Availability:
                        </strong>

                        {available_quantity}
                        / {quantity}

                        <br>

                        <strong>
                            Location:
                        </strong>

                        {location}

                        <br>

                        <strong>
                            Contact:
                        </strong>

                        {contact}

                        <br><br>

                        <span class="status {status_class}">
                            {status}
                        </span>

                        &nbsp;&nbsp;

                        {rental_text}

                        &nbsp;&nbsp;

                        {emergency_text}

                    </div>

                </div>
                """
            )


# ============================================================
# BLOOD INVENTORY
# ============================================================

elif page == "Blood Inventory":

    render_html(
        """
        <div class="hero">

            <div class="badge">
                VERIFIED INVENTORY INFORMATION
            </div>

            <h1>
                Blood Inventory
            </h1>

            <p>
                View reported blood component availability
                from registered healthcare organizations.
                Always confirm current availability directly
                with the responsible blood bank or clinical service.
            </p>

        </div>
        """
    )

    if not blood_inventory:

        st.info(
            "No blood inventory records are currently available."
        )

    else:

        for item in blood_inventory:

            blood_group = item.get(
                "bloodGroup",
                "Unknown"
            )

            component = item.get(
                "component",
                "Unknown"
            )

            units = item.get(
                "availableUnits",
                0
            )

            status = item.get(
                "status",
                "UNKNOWN"
            )

            contact = item.get(
                "contactNumber",
                "Not specified"
            )

            organization = item.get(
                "organization",
                {}
            )

            if isinstance(
                organization,
                dict
            ):

                organization_name = (
                    organization.get(
                        "name",
                        "Healthcare Organization"
                    )
                )

            else:

                organization_name = (
                    "Healthcare Organization"
                )


            render_html(
                f"""
                <div class="resource-card">

                    <div class="resource-name">
                        🩸 {blood_group}
                    </div>

                    <div class="resource-category">
                        {component}
                    </div>

                    <div class="resource-info">

                        <strong>
                            Organization:
                        </strong>

                        {organization_name}

                        <br>

                        <strong>
                            Available Units:
                        </strong>

                        {units}

                        <br>

                        <strong>
                            Status:
                        </strong>

                        {status}

                        <br>

                        <strong>
                            Contact:
                        </strong>

                        {contact}

                    </div>

                </div>
                """
            )


# ============================================================
# EMERGENCY SERVICES
# ============================================================

elif page == "Emergency Services":

    render_html(
        """
        <div class="hero">

            <div class="badge">
                EMERGENCY RESOURCE COORDINATION
            </div>

            <h1>
                Emergency Services
            </h1>

            <p>
                View emergency resource requests submitted
                through the MediShare platform.
            </p>

        </div>
        """
    )

    if not emergency_requests:

        st.info(
            "No emergency requests are currently available."
        )

    else:

        for item in emergency_requests:

            priority = item.get(
                "priority",
                "HIGH"
            )

            resource_name = item.get(
                "resourceName",
                "Emergency Resource"
            )

            resource_type = item.get(
                "resourceType",
                "Emergency Service"
            )

            quantity = item.get(
                "quantityRequired",
                1
            )

            location = item.get(
                "location",
                "Not specified"
            )

            reason = item.get(
                "reason",
                "No reason provided."
            )

            status = item.get(
                "status",
                "PENDING"
            )

            contact = item.get(
                "contactNumber",
                "Not specified"
            )


            render_html(
                f"""
                <div class="resource-card">

                    <div class="resource-name">
                        🚨 {resource_name}
                    </div>

                    <div class="resource-category">
                        {resource_type}
                    </div>

                    <div class="resource-info">

                        <strong>
                            Priority:
                        </strong>

                        {priority}

                        <br>

                        <strong>
                            Quantity Required:
                        </strong>

                        {quantity}

                        <br>

                        <strong>
                            Location:
                        </strong>

                        {location}

                        <br>

                        <strong>
                            Reason:
                        </strong>

                        {reason}

                        <br>

                        <strong>
                            Status:
                        </strong>

                        {status}

                        <br>

                        <strong>
                            Contact:
                        </strong>

                        {contact}

                    </div>

                </div>
                """
            )


# ============================================================
# FOOTER
# ============================================================

render_html(
    """
    <div class="footer">

        MediShare • Healthcare Resource Sharing Platform

        <br>

        Node.js • Express • MongoDB • Streamlit

    </div>
    """
)