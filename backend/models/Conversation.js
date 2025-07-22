// models/Conversation.js
const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Conversation", ConversationSchema);
