const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const createSuperAdmin = require("./config/initSuperAdmin");
const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/userRoutes");
const taxisRoutes = require("./routes/taxiRoutes");
const tripRoutes = require("./routes/tripRoutes");
const leaveRoutes = require("./routes/leaveRoutes");

const { scheduleMaintenanceCheck } = require("./cron/maintenanceCheck");

const path = require("path");

const app = express();
connectDB();
app.use(cors());
app.use(express.json());
createSuperAdmin();
app.get("/", (req, res) => res.send("API Running"));
app.use("/api/auth", authRoutes);

app.use("/api/users", usersRoutes);
app.use("/api/taxis", taxisRoutes);
app.use("/api/trips", tripRoutes);
const alertRoutes = require("./routes/alertRoutes");

app.use("/api/alerts", alertRoutes);

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/leaves", leaveRoutes);

// ➡️ Démarrer le cron job
scheduleMaintenanceCheck();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
