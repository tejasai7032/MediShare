const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            enum: [
                "OT Equipment",
                "Medical Equipment",
                "Ambulance",
                "Blood",
                "Hospital Bed",
                "Emergency Service"
            ]
        },

        description: {
            type: String,
            trim: true,
            default: ""
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        availableQuantity: {
            type: Number,
            required: true,
            min: 0
        },

        status: {
            type: String,
            enum: [
                "AVAILABLE",
                "PARTIALLY_AVAILABLE",
                "UNAVAILABLE",
                "MAINTENANCE"
            ],
            default: "AVAILABLE"
        },

        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        contactNumber: {
            type: String,
            required: true,
            trim: true
        },

        rentalAvailable: {
            type: Boolean,
            default: false
        },

        pricePerDay: {
            type: Number,
            min: 0,
            default: 0
        },

        emergencyAvailable: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Resource", resourceSchema);