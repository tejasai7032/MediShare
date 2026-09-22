const RentalRequest = require("../models/RentalRequest");
const Resource = require("../models/Resource");


/* =========================================================
   CREATE RENTAL REQUEST
========================================================= */

const createRentalRequest = async (req, res) => {
    try {
        const {
            resource,
            quantity,
            startDate,
            endDate,
            purpose,
            notes
        } = req.body;

        if (
            !resource ||
            !quantity ||
            !startDate ||
            !endDate ||
            !purpose
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide all required rental request fields"
            });
        }

        const resourceData =
            await Resource.findById(resource);

        if (!resourceData) {
            return res.status(404).json({
                success: false,
                message: "Resource not found"
            });
        }

        if (!resourceData.rentalAvailable) {
            return res.status(400).json({
                success: false,
                message:
                    "This resource is not available for rental"
            });
        }

        if (
            resourceData.availableQuantity <
            quantity
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `Only ${resourceData.availableQuantity} unit(s) are currently available`
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (
            isNaN(start.getTime()) ||
            isNaN(end.getTime())
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid rental dates"
            });
        }

        if (start >= end) {
            return res.status(400).json({
                success: false,
                message:
                    "End date must be after start date"
            });
        }

        const requestingOrganization =
            req.user.role === "ORGANIZATION"
                ? req.user.organization
                : req.body.requestingOrganization;

        if (!requestingOrganization) {
            return res.status(400).json({
                success: false,
                message:
                    "Requesting organization is required"
            });
        }

        /* PREVENT SELF-RENTAL */

        if (
            resourceData.organization &&
            resourceData.organization.toString() ===
            requestingOrganization.toString()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "An organization cannot request its own resource"
            });
        }

        const rentalRequest =
            await RentalRequest.create({
                requestingOrganization,
                resource,
                quantity,
                startDate: start,
                endDate: end,
                purpose,
                notes: notes || "",
                status: "PENDING"
            });

        const populatedRequest =
            await RentalRequest.findById(
                rentalRequest._id
            )
                .populate(
                    "requestingOrganization"
                )
                .populate({
                    path: "resource",
                    populate: {
                        path: "organization"
                    }
                });

        res.status(201).json({
            success: true,
            message:
                "Rental request created successfully",
            rentalRequest:
                populatedRequest
        });

    } catch (error) {
        console.error(
            "❌ Rental request creation error:"
        );

        console.error(error);

        res.status(400).json({
            success: false,
            message:
                "Failed to create rental request",
            error:
                error.message
        });
    }
};


/* =========================================================
   GET RENTAL REQUESTS
   ORGANIZATION-SPECIFIC ACCESS
========================================================= */

const getRentalRequests = async (req, res) => {
    try {
        let rentalRequests;

        /* ADMIN CAN SEE EVERYTHING */

        if (req.user.role === "ADMIN") {
            rentalRequests =
                await RentalRequest.find()
                    .populate(
                        "requestingOrganization"
                    )
                    .populate({
                        path: "resource",
                        populate: {
                            path: "organization"
                        }
                    })
                    .sort({
                        createdAt: -1
                    });
        }

        /* ORGANIZATION ACCESS */

        else if (
            req.user.role === "ORGANIZATION"
        ) {
            if (!req.user.organization) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Your account is not linked to an organization"
                });
            }

            const organizationId =
                req.user.organization;

            /*
             * Find resources owned by
             * the logged-in organization.
             */

            const ownedResources =
                await Resource.find({
                    organization:
                        organizationId
                }).select("_id");

            const resourceIds =
                ownedResources.map(
                    resource =>
                        resource._id
                );

            /*
             * Show requests where:
             *
             * 1. Logged-in organization
             *    is the requester
             *
             * OR
             *
             * 2. Logged-in organization
             *    owns the requested resource
             */

            rentalRequests =
                await RentalRequest.find({
                    $or: [
                        {
                            requestingOrganization:
                                organizationId
                        },
                        {
                            resource: {
                                $in:
                                    resourceIds
                            }
                        }
                    ]
                })
                    .populate(
                        "requestingOrganization"
                    )
                    .populate({
                        path: "resource",
                        populate: {
                            path: "organization"
                        }
                    })
                    .sort({
                        createdAt: -1
                    });
        }

        else {
            return res.status(403).json({
                success: false,
                message:
                    "Access denied"
            });
        }

        res.status(200).json({
            success: true,
            count:
                rentalRequests.length,
            rentalRequests
        });

    } catch (error) {
        console.error(
            "❌ Failed to fetch rental requests:"
        );

        console.error(error);

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch rental requests",
            error:
                error.message
        });
    }
};


/* =========================================================
   GET RENTAL REQUEST BY ID
========================================================= */

const getRentalRequestById = async (
    req,
    res
) => {
    try {
        const rentalRequest =
            await RentalRequest.findById(
                req.params.id
            )
                .populate(
                    "requestingOrganization"
                )
                .populate({
                    path: "resource",
                    populate: {
                        path: "organization"
                    }
                });

        if (!rentalRequest) {
            return res.status(404).json({
                success: false,
                message:
                    "Rental request not found"
            });
        }

        /*
         * ORGANIZATION ACCESS CHECK
         */

        if (
            req.user.role ===
            "ORGANIZATION"
        ) {
            const organizationId =
                req.user.organization;

            const requesterId =
                rentalRequest
                    .requestingOrganization
                    ?._id;

            const resourceOwnerId =
                rentalRequest
                    .resource
                    ?.organization
                    ?._id;

            const isRequester =
                requesterId &&
                String(requesterId) ===
                String(organizationId);

            const isOwner =
                resourceOwnerId &&
                String(resourceOwnerId) ===
                String(organizationId);

            if (
                !isRequester &&
                !isOwner
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You do not have access to this rental request"
                });
            }
        }

        res.status(200).json({
            success: true,
            rentalRequest
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message:
                "Invalid rental request ID",
            error:
                error.message
        });
    }
};


/* =========================================================
   UPDATE RENTAL REQUEST
========================================================= */

const updateRentalRequest = async (
    req,
    res
) => {
    try {
        const rentalRequest =
            await RentalRequest.findById(
                req.params.id
            );

        if (!rentalRequest) {
            return res.status(404).json({
                success: false,
                message:
                    "Rental request not found"
            });
        }

        if (
            req.user.role ===
            "ORGANIZATION"
        ) {
            if (
                !req.user.organization ||
                rentalRequest.requestingOrganization.toString() !==
                req.user.organization.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You can only modify rental requests belonging to your organization"
                });
            }
        }

        if (
            rentalRequest.status !==
            "PENDING"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `Request cannot be edited from ${rentalRequest.status} status`
            });
        }

        const updateData = {
            ...req.body
        };

        if (
            req.user.role ===
            "ORGANIZATION"
        ) {
            updateData.requestingOrganization =
                req.user.organization;
        }

        const updatedRequest =
            await RentalRequest.findByIdAndUpdate(
                req.params.id,
                updateData,
                {
                    new: true,
                    runValidators: true
                }
            )
                .populate(
                    "requestingOrganization"
                )
                .populate({
                    path: "resource",
                    populate: {
                        path: "organization"
                    }
                });

        res.status(200).json({
            success: true,
            message:
                "Rental request updated successfully",
            rentalRequest:
                updatedRequest
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message:
                "Failed to update rental request",
            error:
                error.message
        });
    }
};


/* =========================================================
   APPROVE RENTAL REQUEST
   PENDING → APPROVED
========================================================= */

const approveRentalRequest = async (
    req,
    res
) => {
    try {
        const rentalRequest =
            await RentalRequest.findById(
                req.params.id
            );

        if (!rentalRequest) {
            return res.status(404).json({
                success: false,
                message:
                    "Rental request not found"
            });
        }

        if (
            rentalRequest.status !==
            "PENDING"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `Request cannot be approved from ${rentalRequest.status} status`
            });
        }

        const resource =
            await Resource.findById(
                rentalRequest.resource
            );

        if (!resource) {
            return res.status(404).json({
                success: false,
                message:
                    "Requested resource not found"
            });
        }

        /* RESOURCE OWNER CHECK */

        if (
            req.user.role ===
            "ORGANIZATION"
        ) {
            if (
                !req.user.organization ||
                !resource.organization ||
                resource.organization.toString() !==
                req.user.organization.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Only the resource-owning organization can approve this request"
                });
            }
        }

        /* AVAILABILITY CHECK */

        if (
            resource.availableQuantity <
            rentalRequest.quantity
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `Only ${resource.availableQuantity} unit(s) are currently available`
            });
        }

        /* RESERVE RESOURCE */

        resource.availableQuantity =
            resource.availableQuantity -
            rentalRequest.quantity;

        /* UPDATE RESOURCE STATUS */

        if (
            resource.availableQuantity === 0
        ) {
            resource.status =
                "UNAVAILABLE";
        }

        else if (
            resource.availableQuantity <
            resource.quantity
        ) {
            resource.status =
                "PARTIALLY_AVAILABLE";
        }

        else {
            resource.status =
                "AVAILABLE";
        }

        await resource.save();

        /* UPDATE REQUEST */

        rentalRequest.status =
            "APPROVED";

        await rentalRequest.save();

        const populatedRequest =
            await RentalRequest.findById(
                rentalRequest._id
            )
                .populate(
                    "requestingOrganization"
                )
                .populate({
                    path: "resource",
                    populate: {
                        path: "organization"
                    }
                });

        res.status(200).json({
            success: true,
            message:
                "Rental request approved and resource quantity reserved successfully",
            rentalRequest:
                populatedRequest
        });

    } catch (error) {
        console.error(
            "❌ Rental approval error:"
        );

        console.error(error);

        res.status(400).json({
            success: false,
            message:
                "Failed to approve rental request",
            error:
                error.message
        });
    }
};


/* =========================================================
   REJECT RENTAL REQUEST
   PENDING → REJECTED
========================================================= */

const rejectRentalRequest = async (
    req,
    res
) => {
    try {
        const rentalRequest =
            await RentalRequest.findById(
                req.params.id
            );

        if (!rentalRequest) {
            return res.status(404).json({
                success: false,
                message:
                    "Rental request not found"
            });
        }

        if (
            rentalRequest.status !==
            "PENDING"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `Request cannot be rejected from ${rentalRequest.status} status`
            });
        }

        const resource =
            await Resource.findById(
                rentalRequest.resource
            );

        if (!resource) {
            return res.status(404).json({
                success: false,
                message:
                    "Requested resource not found"
            });
        }

        /* RESOURCE OWNER CHECK */

        if (
            req.user.role ===
            "ORGANIZATION"
        ) {
            if (
                !req.user.organization ||
                !resource.organization ||
                resource.organization.toString() !==
                req.user.organization.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Only the resource-owning organization can reject this request"
                });
            }
        }

        rentalRequest.status =
            "REJECTED";

        await rentalRequest.save();

        const populatedRequest =
            await RentalRequest.findById(
                rentalRequest._id
            )
                .populate(
                    "requestingOrganization"
                )
                .populate({
                    path: "resource",
                    populate: {
                        path: "organization"
                    }
                });

        res.status(200).json({
            success: true,
            message:
                "Rental request rejected successfully",
            rentalRequest:
                populatedRequest
        });

    } catch (error) {
        console.error(
            "❌ Rental rejection error:"
        );

        console.error(error);

        res.status(400).json({
            success: false,
            message:
                "Failed to reject rental request",
            error:
                error.message
        });
    }
};


/* =========================================================
   DISPATCH RENTAL
   APPROVED → DISPATCHED
========================================================= */

const dispatchRentalRequest = async (
    req,
    res
) => {
    try {
        const rentalRequest =
            await RentalRequest.findById(
                req.params.id
            );

        if (!rentalRequest) {
            return res.status(404).json({
                success: false,
                message:
                    "Rental request not found"
            });
        }

        if (
            rentalRequest.status !==
            "APPROVED"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `Request cannot be dispatched from ${rentalRequest.status} status`
            });
        }

        const resource =
            await Resource.findById(
                rentalRequest.resource
            );

        if (!resource) {
            return res.status(404).json({
                success: false,
                message:
                    "Requested resource not found"
            });
        }

        if (
            req.user.role ===
            "ORGANIZATION"
        ) {
            if (
                !req.user.organization ||
                !resource.organization ||
                resource.organization.toString() !==
                req.user.organization.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Only the resource-owning organization can dispatch this request"
                });
            }
        }

        rentalRequest.status =
            "DISPATCHED";

        await rentalRequest.save();

        const populatedRequest =
            await RentalRequest.findById(
                rentalRequest._id
            )
                .populate(
                    "requestingOrganization"
                )
                .populate({
                    path: "resource",
                    populate: {
                        path: "organization"
                    }
                });

        res.status(200).json({
            success: true,
            message:
                "Rental request marked as dispatched",
            rentalRequest:
                populatedRequest
        });

    } catch (error) {
        console.error(
            "❌ Rental dispatch error:"
        );

        console.error(error);

        res.status(400).json({
            success: false,
            message:
                "Failed to dispatch rental request",
            error:
                error.message
        });
    }
};


/* =========================================================
   MARK RENTAL IN USE
   DISPATCHED → IN_USE
========================================================= */

const markRentalInUse = async (
    req,
    res
) => {
    try {
        const rentalRequest =
            await RentalRequest.findById(
                req.params.id
            );

        if (!rentalRequest) {
            return res.status(404).json({
                success: false,
                message:
                    "Rental request not found"
            });
        }

        if (
            rentalRequest.status !==
            "DISPATCHED"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `Request cannot be marked in use from ${rentalRequest.status} status`
            });
        }

        /*
         * Only the requesting organization
         * should mark the resource as in use.
         */

        if (
            req.user.role ===
            "ORGANIZATION"
        ) {
            if (
                !req.user.organization ||
                rentalRequest.requestingOrganization.toString() !==
                req.user.organization.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Only the requesting organization can mark this rental as in use"
                });
            }
        }

        rentalRequest.status =
            "IN_USE";

        await rentalRequest.save();

        const populatedRequest =
            await RentalRequest.findById(
                rentalRequest._id
            )
                .populate(
                    "requestingOrganization"
                )
                .populate({
                    path: "resource",
                    populate: {
                        path: "organization"
                    }
                });

        res.status(200).json({
            success: true,
            message:
                "Rental resource marked as in use",
            rentalRequest:
                populatedRequest
        });

    } catch (error) {
        console.error(
            "❌ Rental in-use error:"
        );

        console.error(error);

        res.status(400).json({
            success: false,
            message:
                "Failed to mark rental as in use",
            error:
                error.message
        });
    }
};


/* =========================================================
   RETURN RENTAL
   IN_USE → RETURNED
========================================================= */

const returnRentalRequest = async (
    req,
    res
) => {
    try {
        const rentalRequest =
            await RentalRequest.findById(
                req.params.id
            );

        if (!rentalRequest) {
            return res.status(404).json({
                success: false,
                message:
                    "Rental request not found"
            });
        }

        if (
            rentalRequest.status !==
            "IN_USE"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `Request cannot be returned from ${rentalRequest.status} status`
            });
        }

        const resource =
            await Resource.findById(
                rentalRequest.resource
            );

        if (!resource) {
            return res.status(404).json({
                success: false,
                message:
                    "Requested resource not found"
            });
        }

        /*
         * Requesting organization or
         * resource owner can complete return.
         */

        if (
            req.user.role ===
            "ORGANIZATION"
        ) {
            const isOwner =
                req.user.organization &&
                resource.organization &&
                resource.organization.toString() ===
                req.user.organization.toString();

            const isRequester =
                req.user.organization &&
                rentalRequest.requestingOrganization &&
                rentalRequest.requestingOrganization.toString() ===
                req.user.organization.toString();

            if (
                !isOwner &&
                !isRequester
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Only the requesting or resource-owning organization can return this rental"
                });
            }
        }

        /* RESTORE RESOURCE QUANTITY */

        resource.availableQuantity =
            resource.availableQuantity +
            rentalRequest.quantity;

        /*
         * Never exceed total quantity.
         */

        if (
            resource.availableQuantity >
            resource.quantity
        ) {
            resource.availableQuantity =
                resource.quantity;
        }

        /* UPDATE RESOURCE STATUS */

        if (
            resource.availableQuantity === 0
        ) {
            resource.status =
                "UNAVAILABLE";
        }

        else if (
            resource.availableQuantity <
            resource.quantity
        ) {
            resource.status =
                "PARTIALLY_AVAILABLE";
        }

        else {
            resource.status =
                "AVAILABLE";
        }

        await resource.save();

        /* UPDATE REQUEST */

        rentalRequest.status =
            "RETURNED";

        await rentalRequest.save();

        const populatedRequest =
            await RentalRequest.findById(
                rentalRequest._id
            )
                .populate(
                    "requestingOrganization"
                )
                .populate({
                    path: "resource",
                    populate: {
                        path: "organization"
                    }
                });

        res.status(200).json({
            success: true,
            message:
                "Rental returned successfully and resource quantity restored",
            rentalRequest:
                populatedRequest
        });

    } catch (error) {
        console.error(
            "❌ Rental return error:"
        );

        console.error(error);

        res.status(400).json({
            success: false,
            message:
                "Failed to return rental",
            error:
                error.message
        });
    }
};


/* =========================================================
   DELETE RENTAL REQUEST
========================================================= */

const deleteRentalRequest = async (
    req,
    res
) => {
    try {
        const rentalRequest =
            await RentalRequest.findById(
                req.params.id
            );

        if (!rentalRequest) {
            return res.status(404).json({
                success: false,
                message:
                    "Rental request not found"
            });
        }

        if (
            req.user.role ===
            "ORGANIZATION"
        ) {
            if (
                !req.user.organization ||
                rentalRequest.requestingOrganization.toString() !==
                req.user.organization.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You can only delete rental requests belonging to your organization"
                });
            }
        }

        await RentalRequest.findByIdAndDelete(
            req.params.id
        );

        res.status(200).json({
            success: true,
            message:
                "Rental request deleted successfully"
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message:
                "Invalid rental request ID",
            error:
                error.message
        });
    }
};


/* =========================================================
   EXPORT CONTROLLERS
========================================================= */

module.exports = {
    createRentalRequest,
    getRentalRequests,
    getRentalRequestById,
    updateRentalRequest,
    approveRentalRequest,
    rejectRentalRequest,
    dispatchRentalRequest,
    markRentalInUse,
    returnRentalRequest,
    deleteRentalRequest
};