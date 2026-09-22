const Resource = require("../models/Resource");


// Create a new resource
const createResource = async (req, res) => {
    try {
        const resourceData = {
            ...req.body
        };

        // Organization users can only create resources
        // for their own organization
        if (req.user.role === "ORGANIZATION") {
            resourceData.organization = req.user.organization;
        }

        const resource = await Resource.create(resourceData);

        const populatedResource = await Resource.findById(resource._id)
            .populate("organization");

        res.status(201).json({
            success: true,
            message: "Resource created successfully",
            resource: populatedResource
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to create resource",
            error: error.message
        });
    }
};


// Get all resources with search and filters
const getResources = async (req, res) => {
    try {
        const {
            category,
            location,
            status,
            rentalAvailable,
            emergencyAvailable,
            search
        } = req.query;

        const filter = {};

        if (category) {
            filter.category = category;
        }

        if (location) {
            filter.location = {
                $regex: location,
                $options: "i"
            };
        }

        if (status) {
            filter.status = status;
        }

        if (rentalAvailable !== undefined) {
            filter.rentalAvailable = rentalAvailable === "true";
        }

        if (emergencyAvailable !== undefined) {
            filter.emergencyAvailable = emergencyAvailable === "true";
        }

        if (search) {
            filter.$or = [
                {
                    name: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        const resources = await Resource.find(filter)
            .populate("organization")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: resources.length,
            filters: req.query,
            resources
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch resources",
            error: error.message
        });
    }
};


// Get one resource
const getResourceById = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id)
            .populate("organization");

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Resource not found"
            });
        }

        res.status(200).json({
            success: true,
            resource
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Invalid resource ID",
            error: error.message
        });
    }
};


// Update a resource
const updateResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Resource not found"
            });
        }


        // Organization users can update only
        // resources belonging to their organization
        if (req.user.role === "ORGANIZATION") {
            if (
                !req.user.organization ||
                resource.organization.toString() !==
                req.user.organization.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message: "You can only modify resources belonging to your organization"
                });
            }
        }


        // Prevent organization users from changing
        // the resource ownership
        const updateData = {
            ...req.body
        };

        if (req.user.role === "ORGANIZATION") {
            updateData.organization = req.user.organization;
        }


        const updatedResource = await Resource.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).populate("organization");

        res.status(200).json({
            success: true,
            message: "Resource updated successfully",
            resource: updatedResource
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to update resource",
            error: error.message
        });
    }
};


// Delete a resource
const deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Resource not found"
            });
        }


        // Organization users can delete only
        // resources belonging to their organization
        if (req.user.role === "ORGANIZATION") {
            if (
                !req.user.organization ||
                resource.organization.toString() !==
                req.user.organization.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message: "You can only delete resources belonging to your organization"
                });
            }
        }


        await Resource.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Resource deleted successfully"
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Invalid resource ID",
            error: error.message
        });
    }
};


module.exports = {
    createResource,
    getResources,
    getResourceById,
    updateResource,
    deleteResource
};