const BloodInventory = require("../models/BloodInventory");


/*
|--------------------------------------------------------------------------
| CREATE BLOOD INVENTORY
|--------------------------------------------------------------------------
*/

const createBloodInventory = async (req, res) => {

    try {

        const inventoryData = {
            ...req.body
        };


        /*
        |--------------------------------------------------------------------------
        | ORGANIZATION OWNERSHIP
        |--------------------------------------------------------------------------
        */

        if (req.user.role === "ORGANIZATION") {

            if (!req.user.organization) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Your account is not linked to an organization"
                });

            }

            inventoryData.organization =
                req.user.organization;

        }


        /*
        |--------------------------------------------------------------------------
        | CREATE RECORD
        |--------------------------------------------------------------------------
        */

        const bloodInventory =
            await BloodInventory.create(
                inventoryData
            );


        /*
        |--------------------------------------------------------------------------
        | RETURN POPULATED RECORD
        |--------------------------------------------------------------------------
        */

        const populatedInventory =
            await BloodInventory.findById(
                bloodInventory._id
            ).populate("organization");


        res.status(201).json({

            success: true,

            message:
                "Blood inventory created successfully",

            bloodInventory:
                populatedInventory

        });


    } catch (error) {

        console.error(
            "❌ Blood inventory creation error:"
        );

        console.error(
            error
        );


        res.status(400).json({

            success: false,

            message:
                "Failed to create blood inventory",

            error:
                error.message

        });

    }

};



/*
|--------------------------------------------------------------------------
| GET ALL BLOOD INVENTORY
|--------------------------------------------------------------------------
*/

const getBloodInventory = async (req, res) => {

    try {

        const bloodInventory =
            await BloodInventory.find()
                .populate("organization")
                .sort({
                    lastUpdated: -1
                });


        res.status(200).json({

            success: true,

            count:
                bloodInventory.length,

            bloodInventory

        });


    } catch (error) {

        console.error(
            "❌ Failed to fetch blood inventory:"
        );

        console.error(
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to fetch blood inventory",

            error:
                error.message

        });

    }

};



/*
|--------------------------------------------------------------------------
| GET BLOOD INVENTORY BY ID
|--------------------------------------------------------------------------
*/

const getBloodInventoryById = async (
    req,
    res
) => {

    try {

        const bloodInventory =
            await BloodInventory.findById(
                req.params.id
            ).populate("organization");


        if (!bloodInventory) {

            return res.status(404).json({

                success: false,

                message:
                    "Blood inventory record not found"

            });

        }


        res.status(200).json({

            success: true,

            bloodInventory

        });


    } catch (error) {

        console.error(
            "❌ Failed to fetch blood inventory record:"
        );

        console.error(
            error
        );


        res.status(400).json({

            success: false,

            message:
                "Invalid blood inventory ID",

            error:
                error.message

        });

    }

};



/*
|--------------------------------------------------------------------------
| UPDATE BLOOD INVENTORY
|--------------------------------------------------------------------------
*/

const updateBloodInventory = async (
    req,
    res
) => {

    try {

        const bloodInventory =
            await BloodInventory.findById(
                req.params.id
            );


        if (!bloodInventory) {

            return res.status(404).json({

                success: false,

                message:
                    "Blood inventory record not found"

            });

        }


        /*
        |--------------------------------------------------------------------------
        | OWNERSHIP CHECK
        |--------------------------------------------------------------------------
        */

        if (
            req.user.role ===
            "ORGANIZATION"
        ) {

            if (
                !req.user.organization ||
                bloodInventory.organization.toString() !==
                req.user.organization.toString()
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You can only modify blood inventory belonging to your organization"

                });

            }

        }


        /*
        |--------------------------------------------------------------------------
        | UPDATE DATA
        |--------------------------------------------------------------------------
        */

        const updateData = {
            ...req.body
        };


        if (
            req.user.role ===
            "ORGANIZATION"
        ) {

            updateData.organization =
                req.user.organization;

        }


        updateData.lastUpdated =
            new Date();


        /*
        |--------------------------------------------------------------------------
        | UPDATE RECORD
        |--------------------------------------------------------------------------
        */

        const updatedInventory =
            await BloodInventory.findByIdAndUpdate(
                req.params.id,
                updateData,
                {
                    new: true,
                    runValidators: true
                }
            ).populate("organization");


        res.status(200).json({

            success: true,

            message:
                "Blood inventory updated successfully",

            bloodInventory:
                updatedInventory

        });


    } catch (error) {

        console.error(
            "❌ Blood inventory update error:"
        );

        console.error(
            error
        );


        res.status(400).json({

            success: false,

            message:
                "Failed to update blood inventory",

            error:
                error.message

        });

    }

};



/*
|--------------------------------------------------------------------------
| DELETE BLOOD INVENTORY
|--------------------------------------------------------------------------
*/

const deleteBloodInventory = async (
    req,
    res
) => {

    try {

        const bloodInventory =
            await BloodInventory.findById(
                req.params.id
            );


        if (!bloodInventory) {

            return res.status(404).json({

                success: false,

                message:
                    "Blood inventory record not found"

            });

        }


        /*
        |--------------------------------------------------------------------------
        | OWNERSHIP CHECK
        |--------------------------------------------------------------------------
        */

        if (
            req.user.role ===
            "ORGANIZATION"
        ) {

            if (
                !req.user.organization ||
                bloodInventory.organization.toString() !==
                req.user.organization.toString()
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You can only delete blood inventory belonging to your organization"

                });

            }

        }


        await BloodInventory.findByIdAndDelete(
            req.params.id
        );


        res.status(200).json({

            success: true,

            message:
                "Blood inventory deleted successfully"

        });


    } catch (error) {

        console.error(
            "❌ Blood inventory deletion error:"
        );

        console.error(
            error
        );


        res.status(400).json({

            success: false,

            message:
                "Invalid blood inventory ID",

            error:
                error.message

        });

    }

};



/*
|--------------------------------------------------------------------------
| EXPORT CONTROLLERS
|--------------------------------------------------------------------------
*/

module.exports = {

    createBloodInventory,

    getBloodInventory,

    getBloodInventoryById,

    updateBloodInventory,

    deleteBloodInventory

};