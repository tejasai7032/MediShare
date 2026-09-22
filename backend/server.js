const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");

const resourceRoutes = require("./routes/resourceRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const emergencyRequestRoutes = require("./routes/emergencyRequestRoutes");
const rentalRequestRoutes = require("./routes/rentalRequestRoutes");
const bloodInventoryRoutes = require("./routes/bloodInventoryRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

const PORT = process.env.PORT || 5050;

// =====================================================
// CONNECT TO MONGODB
// =====================================================

connectDB();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());

// =====================================================
// SERVE FRONTEND
// =====================================================

app.use(
    express.static(
        path.join(__dirname, "../frontend")
    )
);

// =====================================================
// API ROUTES
// =====================================================

app.use("/api/resources", resourceRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/emergency-requests", emergencyRequestRoutes);
app.use("/api/rental-requests", rentalRequestRoutes);
app.use("/api/blood-inventory", bloodInventoryRoutes);
app.use("/api/auth", authRoutes);

// =====================================================
// API ROOT
// =====================================================

app.get("/api", (req, res) => {
    res.json({
        application: "MediShare",
        message: "Healthcare Resource Sharing Platform API",
        status: "running"
    });
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", (req, res) => {
    res.json({
        status: "healthy",
        application: "MediShare",
        database: "MongoDB"
    });
});

// =====================================================
// HOME PAGE
// =====================================================

app.get("/", (req, res) => {
    res.redirect("/login.html");
});

// =====================================================
// START SERVER
// =====================================================

const server = app.listen(
    PORT,
    "0.0.0.0",
    () => {
        console.log(
            `🚑 MediShare server running on 0.0.0.0:${PORT}`
        );
    }
);

// =====================================================
// RENDER CONNECTION STABILITY
// =====================================================

server.keepAliveTimeout = 120000;
server.headersTimeout = 120000;