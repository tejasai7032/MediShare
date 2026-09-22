const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            required: true,
            enum: [
                "Hospital",
                "Clinic",
                "Blood Bank",
                "Diagnostic Center",
                "Ambulance Service",
                "Medical Supplier",
                "Other"
            ]
        },

        registrationNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        contactPerson: {
            type: String,
            required: true,
            trim: true
        },

        contactNumber: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },

        address: {
            type: String,
            required: true,
            trim: true
        },

        city: {
            type: String,
            required: true,
            trim: true
        },

        verified: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Organization", organizationSchema);