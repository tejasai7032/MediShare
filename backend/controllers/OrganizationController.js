const Organization = require("../models/Organization");
const User = require("../models/User");


// --------------------------------------------------
// Create organization
// --------------------------------------------------

const createOrganization = async (req, res) => {
    try {
        const organization = await Organization.create(req.body);

        res.status(201).json({
            success: true,
            message: "Organization created successfully",
            organization
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to create organization",
            error: error.message
        });
    }
};


// --------------------------------------------------
// Get all organizations
// --------------------------------------------------

const getOrganizations = async (req, res) => {
    try {

        const organizations =
            await Organization.find()
                .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: organizations.length,
            organizations
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Failed to fetch organizations",
            error: error.message
        });
    }
};


// --------------------------------------------------
// Get organization by ID
// --------------------------------------------------

const getOrganizationById = async (req, res) => {
    try {

        const organization =
            await Organization.findById(req.params.id);

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            });
        }

        res.status(200).json({
            success: true,
            organization
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: "Invalid organization ID",
            error: error.message
        });
    }
};


// --------------------------------------------------
// Update organization
// --------------------------------------------------

const updateOrganization = async (req, res) => {
    try {

        const organization =
            await Organization.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            );

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Organization updated successfully",
            organization
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: "Failed to update organization",
            error: error.message
        });
    }
};


// --------------------------------------------------
// Delete organization
// --------------------------------------------------

const deleteOrganization = async (req, res) => {
    try {

        const organization =
            await Organization.findByIdAndDelete(
                req.params.id
            );

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Organization deleted successfully"
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: "Invalid organization ID",
            error: error.message
        });
    }
};


// --------------------------------------------------
// Get pending organizations
// ADMIN ONLY
// --------------------------------------------------

const getPendingOrganizations = async (req, res) => {
    try {

        const organizations =
            await Organization.find({
                verified: false
            }).sort({
                createdAt: -1
            });

        res.status(200).json({
            success: true,
            count: organizations.length,
            organizations
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Failed to fetch pending organizations",
            error: error.message
        });
    }
};


// --------------------------------------------------
// Verify organization
// ADMIN ONLY
// --------------------------------------------------

const verifyOrganization = async (req, res) => {
    try {

        const organization =
            await Organization.findById(
                req.params.id
            );

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            });
        }


        if (organization.verified) {
            return res.status(400).json({
                success: false,
                message: "Organization is already verified"
            });
        }


        organization.verified = true;

        await organization.save();


        res.status(200).json({
            success: true,
            message: "Organization verified successfully",
            organization
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: "Failed to verify organization",
            error: error.message
        });
    }
};


// --------------------------------------------------
// Reject organization
// ADMIN ONLY
// --------------------------------------------------

const rejectOrganization = async (req, res) => {
    try {

        const organization =
            await Organization.findById(
                req.params.id
            );

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            });
        }


        if (organization.verified) {
            return res.status(400).json({
                success: false,
                message:
                    "Verified organizations cannot be rejected"
            });
        }


        // Find users belonging to this organization
        const organizationUsers =
            await User.find({
                organization: organization._id
            });


        // Deactivate organization users
        if (organizationUsers.length > 0) {

            await User.updateMany(
                {
                    organization: organization._id
                },
                {
                    isActive: false
                }
            );
        }


        res.status(200).json({
            success: true,
            message:
                "Organization rejected and associated accounts deactivated",
            organizationId: organization._id
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: "Failed to reject organization",
            error: error.message
        });
    }
};


// --------------------------------------------------
// Exports
// --------------------------------------------------

module.exports = {
    createOrganization,
    getOrganizations,
    getOrganizationById,
    updateOrganization,
    deleteOrganization,
    getPendingOrganizations,
    verifyOrganization,
    rejectOrganization
};