const mongoose = require("mongoose");

const rentalRequestSchema = new mongoose.Schema(
    {
        requestingOrganization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true
        },

        resource: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Resource",
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        startDate: {
            type: Date,
            required: true
        },

        endDate: {
            type: Date,
            required: true
        },

        purpose: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "APPROVED",
                "REJECTED",
                "RESERVED",
                "DISPATCHED",
                "IN_USE",
                "RETURNED",
                "CANCELLED"
            ],
            default: "PENDING"
        },

        notes: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "RentalRequest",
    rentalRequestSchema
);