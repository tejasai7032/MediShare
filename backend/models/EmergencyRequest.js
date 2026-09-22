const mongoose = require("mongoose");

const emergencyRequestSchema = new mongoose.Schema(
    {
        requestingOrganization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true
        },

        resourceType: {
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

        resourceName: {
            type: String,
            required: true,
            trim: true
        },

        quantityRequired: {
            type: Number,
            required: true,
            min: 1
        },

        priority: {
            type: String,
            enum: [
                "LOW",
                "MEDIUM",
                "HIGH",
                "CRITICAL"
            ],
            default: "HIGH"
        },

        reason: {
            type: String,
            required: true,
            trim: true
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

        status: {
            type: String,
            enum: [
                "PENDING",
                "ACCEPTED",
                "REJECTED",
                "FULFILLED",
                "CANCELLED"
            ],
            default: "PENDING"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "EmergencyRequest",
    emergencyRequestSchema
);