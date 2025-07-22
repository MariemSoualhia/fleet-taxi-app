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
const http = require("http");
const { Server } = require("socket.io");
const { scheduleMaintenanceCheck } = require("./cron/maintenanceCheck");

const path = require("path");

const app = express();

// const server = http.createServer(app);
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
const reportRoutes = require("./routes/reportRoutes");

app.use("/api/reports", reportRoutes);
app.use("/api/alerts", alertRoutes);

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/leaves", leaveRoutes);
const kpiRoutes = require("./routes/kpiRoutes");

app.use("/api/kpis", kpiRoutes);
const messageRoutes = require("./routes/messageRoutes");
app.use("/api/messages", messageRoutes);

// ➡️ Démarrer le cron job

scheduleMaintenanceCheck();

// const io = new Server(server, {
//   cors: {
//     origin: "*", // ou spécifie l’URL du frontend si tu veux sécuriser
//     methods: ["GET", "POST"],
//   },
// });
// let onlineUsers = new Map(); // userId -> socketId

// io.on("connection", (socket) => {
//   console.log("🟢 New socket connected", socket.id);

//   // Lorsqu’un utilisateur s’identifie
//   socket.on("addUser", (userId) => {
//     onlineUsers.set(userId, socket.id);
//     console.log("✅ User connected:", userId);
//     io.emit("getOnlineUsers", [...onlineUsers.keys()]); // broadcast liste
//   });

//   // Envoi de message
//   socket.on("sendMessage", ({ senderId, receiverId, content }) => {
//     const receiverSocketId = onlineUsers.get(receiverId);
//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("receiveMessage", {
//         senderId,
//         content,
//         createdAt: new Date().toISOString(),
//       });
//     }
//   });

//   // Déconnexion
//   socket.on("disconnect", () => {
//     console.log("🔴 Socket disconnected", socket.id);
//     for (let [userId, socketId] of onlineUsers.entries()) {
//       if (socketId === socket.id) {
//         onlineUsers.delete(userId);
//         break;
//       }
//     }
//     io.emit("getOnlineUsers", [...onlineUsers.keys()]);
//   });
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
