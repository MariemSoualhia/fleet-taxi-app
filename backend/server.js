const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const createSuperAdmin = require("./config/initSuperAdmin");
const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/userRoutes");
const app = express();
connectDB();
app.use(cors());
app.use(express.json());
createSuperAdmin();
app.get("/", (req, res) => res.send("API Running"));
app.use("/api/auth", authRoutes);

app.use("/api/users", usersRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
