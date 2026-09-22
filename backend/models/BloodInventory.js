const mongoose = require("mongoose");

const bloodInventorySchema = new mongoose.Schema(
    {
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true
        },

        bloodGroup: {
            type: String,
            required: true,
            enum: [
                "A+",
                "A-",
                "B+",
                "B-",
                "AB+",
                "AB-",
                "O+",
                "O-"
            ]
        },

        component: {
            type: String,
            required: true,
            enum: [
                "Whole Blood",
                "Red Blood Cells",
                "Platelets",
                "Plasma"
            ]
        },

        availableUnits: {
            type: Number,
            required: true,
            min: 0
        },

        status: {
            type: String,
            enum: [
                "AVAILABLE",
                "LOW",
                "UNAVAILABLE"
            ],
            default: "AVAILABLE"
        },

        lastUpdated: {
            type: Date,
            default: Date.now
        },

        contactNumber: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "BloodInventory",
    bloodInventorySchema
);