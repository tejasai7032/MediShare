const EmergencyRequest = require("../models/EmergencyRequest");


/* =========================================================
   CREATE EMERGENCY REQUEST
   ========================================================= */

const createEmergencyRequest = async (req, res) => {

    try {

        const requestData = {
            ...req.body
        };


        /*
         * Organization users cannot choose another
         * organization as the requester.
         */

        if (req.user.role === "ORGANIZATION") {

            requestData.requestingOrganization =
                req.user.organization;

        }


        const emergencyRequest =
            await EmergencyRequest.create(
                requestData
            );


        const populatedRequest =
            await EmergencyRequest
                .findById(
                    emergencyRequest._id
                )
                .populate(
                    "requestingOrganization"
                );


        res.status(201).json({

            success: true,

            message:
                "Emergency request created successfully",

            emergencyRequest:
                populatedRequest

        });


    } catch (error) {

        res.status(400).json({

            success: false,

            message:
                "Failed to create emergency request",

            error:
                error.message

        });

    }

};


/* =========================================================
   GET ALL EMERGENCY REQUESTS
   ========================================================= */

const getEmergencyRequests = async (
    req,
    res
) => {

    try {

        const filter = {};


        /*
         * ADMIN:
         * sees all emergency requests.
         *
         * ORGANIZATION:
         * sees:
         * 1. requests created by itself
         * 2. requests currently pending that it may coordinate
         */

        if (
            req.user.role ===
            "ORGANIZATION"
        ) {

            filter.$or = [

                {
                    requestingOrganization:
                        req.user.organization
                },

                {
                    status: "PENDING"
                }

            ];

        }


        const requests =
            await EmergencyRequest
                .find(filter)
                .populate(
                    "requestingOrganization"
                )
                .sort({
                    createdAt: -1
                });


        res.status(200).json({

            success: true,

            count:
                requests.length,

            emergencyRequests:
                requests

        });


    } catch (error) {

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch emergency requests",

            error:
                error.message

        });

    }

};


/* =========================================================
   GET EMERGENCY REQUEST BY ID
   ========================================================= */

const getEmergencyRequestById = async (
    req,
    res
) => {

    try {

        const request =
            await EmergencyRequest
                .findById(
                    req.params.id
                )
                .populate(
                    "requestingOrganization"
                );


        if (!request) {

            return res.status(404).json({

                success: false,

                message:
                    "Emergency request not found"

            });

        }


        /*
         * ADMIN can access everything.
         *
         * Organization can access:
         * - its own requests
         * - pending requests
         */

        if (
            req.user.role ===
            "ORGANIZATION"
        ) {

            const requesterId =
                request
                    .requestingOrganization
                    ?._id
                    ?.toString();


            const currentOrganizationId =
                req.user.organization
                    ?.toString();


            const isOwner =
                requesterId ===
                currentOrganizationId;


            const isPending =
                request.status ===
                "PENDING";


            if (
                !isOwner &&
                !isPending
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You do not have access to this emergency request"

                });

            }

        }


        res.status(200).json({

            success: true,

            emergencyRequest:
                request

        });


    } catch (error) {

        res.status(400).json({

            success: false,

            message:
                "Invalid emergency request ID",

            error:
                error.message

        });

    }

};


/* =========================================================
   UPDATE EMERGENCY REQUEST
   ========================================================= */

const updateEmergencyRequest = async (
    req,
    res
) => {

    try {

        const request =
            await EmergencyRequest.findById(
                req.params.id
            );


        if (!request) {

            return res.status(404).json({

                success: false,

                message:
                    "Emergency request not found"

            });

        }


        /*
         * Only the requesting organization
         * can edit its own request.
         */

        if (
            req.user.role ===
            "ORGANIZATION"
        ) {

            if (
                !req.user.organization ||
                request
                    .requestingOrganization
                    .toString() !==
                req.user.organization.toString()
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You can only modify your own emergency requests"

                });

            }

        }


        /*
         * Do not allow editing after
         * coordination has started.
         */

        if (
            request.status !==
            "PENDING"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Only pending emergency requests can be modified"

            });

        }


        const updateData = {
            ...req.body
        };


        /*
         * Never allow an organization user
         * to transfer ownership.
         */

        if (
            req.user.role ===
            "ORGANIZATION"
        ) {

            updateData.requestingOrganization =
                req.user.organization;

        }


        const updatedRequest =
            await EmergencyRequest
                .findByIdAndUpdate(
                    req.params.id,
                    updateData,
                    {
                        new: true,
                        runValidators: true
                    }
                )
                .populate(
                    "requestingOrganization"
                );


        res.status(200).json({

            success: true,

            message:
                "Emergency request updated successfully",

            emergencyRequest:
                updatedRequest

        });


    } catch (error) {

        res.status(400).json({

            success: false,

            message:
                "Failed to update emergency request",

            error:
                error.message

        });

    }

};


/* =========================================================
   ACCEPT EMERGENCY REQUEST
   ========================================================= */

const acceptEmergencyRequest = async (
    req,
    res
) => {

    try {

        const request =
            await EmergencyRequest.findById(
                req.params.id
            );


        if (!request) {

            return res.status(404).json({

                success: false,

                message:
                    "Emergency request not found"

            });

        }


        if (
            request.status !==
            "PENDING"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Only pending requests can be accepted"

            });

        }


        /*
         * The requesting organization
         * cannot accept its own request.
         */

        if (
            req.user.role ===
            "ORGANIZATION" &&
            req.user.organization &&
            request
                .requestingOrganization
                .toString() ===
            req.user.organization.toString()
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "The requesting organization cannot accept its own emergency request"

            });

        }


        request.status =
            "ACCEPTED";


        await request.save();


        const populatedRequest =
            await EmergencyRequest
                .findById(
                    request._id
                )
                .populate(
                    "requestingOrganization"
                );


        res.status(200).json({

            success: true,

            message:
                "Emergency request accepted successfully",

            emergencyRequest:
                populatedRequest

        });


    } catch (error) {

        res.status(400).json({

            success: false,

            message:
                "Failed to accept emergency request",

            error:
                error.message

        });

    }

};


/* =========================================================
   REJECT EMERGENCY REQUEST
   ========================================================= */

const rejectEmergencyRequest = async (
    req,
    res
) => {

    try {

        const request =
            await EmergencyRequest.findById(
                req.params.id
            );


        if (!request) {

            return res.status(404).json({

                success: false,

                message:
                    "Emergency request not found"

            });

        }


        if (
            request.status !==
            "PENDING"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Only pending requests can be rejected"

            });

        }


        if (
            req.user.role ===
            "ORGANIZATION" &&
            req.user.organization &&
            request
                .requestingOrganization
                .toString() ===
            req.user.organization.toString()
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "The requesting organization cannot reject its own emergency request"

            });

        }


        request.status =
            "REJECTED";


        await request.save();


        const populatedRequest =
            await EmergencyRequest
                .findById(
                    request._id
                )
                .populate(
                    "requestingOrganization"
                );


        res.status(200).json({

            success: true,

            message:
                "Emergency request rejected",

            emergencyRequest:
                populatedRequest

        });


    } catch (error) {

        res.status(400).json({

            success: false,

            message:
                "Failed to reject emergency request",

            error:
                error.message

        });

    }

};


/* =========================================================
   FULFILL EMERGENCY REQUEST
   ========================================================= */

const fulfillEmergencyRequest = async (
    req,
    res
) => {

    try {

        const request =
            await EmergencyRequest.findById(
                req.params.id
            );


        if (!request) {

            return res.status(404).json({

                success: false,

                message:
                    "Emergency request not found"

            });

        }


        if (
            request.status !==
            "ACCEPTED"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Only accepted requests can be fulfilled"

            });

        }


        request.status =
            "FULFILLED";


        await request.save();


        const populatedRequest =
            await EmergencyRequest
                .findById(
                    request._id
                )
                .populate(
                    "requestingOrganization"
                );


        res.status(200).json({

            success: true,

            message:
                "Emergency request fulfilled successfully",

            emergencyRequest:
                populatedRequest

        });


    } catch (error) {

        res.status(400).json({

            success: false,

            message:
                "Failed to fulfill emergency request",

            error:
                error.message

        });

    }

};


/* =========================================================
   CANCEL EMERGENCY REQUEST
   ========================================================= */

const cancelEmergencyRequest = async (
    req,
    res
) => {

    try {

        const request =
            await EmergencyRequest.findById(
                req.params.id
            );


        if (!request) {

            return res.status(404).json({

                success: false,

                message:
                    "Emergency request not found"

            });

        }


        /*
         * Only the requesting organization
         * can cancel its request.
         */

        if (
            req.user.role ===
            "ORGANIZATION"
        ) {

            if (
                !req.user.organization ||
                request
                    .requestingOrganization
                    .toString() !==
                req.user.organization.toString()
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You can only cancel your own emergency requests"

                });

            }

        }


        if (
            request.status ===
            "FULFILLED"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Fulfilled emergency requests cannot be cancelled"

            });

        }


        request.status =
            "CANCELLED";


        await request.save();


        const populatedRequest =
            await EmergencyRequest
                .findById(
                    request._id
                )
                .populate(
                    "requestingOrganization"
                );


        res.status(200).json({

            success: true,

            message:
                "Emergency request cancelled",

            emergencyRequest:
                populatedRequest

        });


    } catch (error) {

        res.status(400).json({

            success: false,

            message:
                "Failed to cancel emergency request",

            error:
                error.message

        });

    }

};


/* =========================================================
   DELETE EMERGENCY REQUEST
   ========================================================= */

const deleteEmergencyRequest = async (
    req,
    res
) => {

    try {

        const request =
            await EmergencyRequest.findById(
                req.params.id
            );


        if (!request) {

            return res.status(404).json({

                success: false,

                message:
                    "Emergency request not found"

            });

        }


        if (
            req.user.role ===
            "ORGANIZATION"
        ) {

            if (
                !req.user.organization ||
                request
                    .requestingOrganization
                    .toString() !==
                req.user.organization.toString()
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You can only delete your own emergency requests"

                });

            }

        }


        if (
            request.status !==
            "PENDING"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Only pending emergency requests can be deleted"

            });

        }


        await EmergencyRequest.findByIdAndDelete(
            req.params.id
        );


        res.status(200).json({

            success: true,

            message:
                "Emergency request deleted successfully"

        });


    } catch (error) {

        res.status(400).json({

            success: false,

            message:
                "Failed to delete emergency request",

            error:
                error.message

        });

    }

};


/* =========================================================
   EXPORTS
   ========================================================= */

module.exports = {

    createEmergencyRequest,

    getEmergencyRequests,

    getEmergencyRequestById,

    updateEmergencyRequest,

    acceptEmergencyRequest,

    rejectEmergencyRequest,

    fulfillEmergencyRequest,

    cancelEmergencyRequest,

    deleteEmergencyRequest

};