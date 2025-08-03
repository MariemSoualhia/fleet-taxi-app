// routes/messageRoutes.js
const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  sendMessage,
  getConversation,
  getMyContacts,
  markMessagesAsRead,
  getAvailableContacts,
  getEligibleChatContacts,
  getMessagesByConversation,
  getUnreadMessagesCount,
  getUnreadConversations,
  getUserConversationsWithUnread,
  markReadConversation,
} = require("../controllers/messageController");
const conversationController = require("../controllers/conversationController");

const router = express.Router();

router.post("/", protect, sendMessage);
router.get("/conversations/:userId", protect, getConversation);
router.get("/contacts", protect, getMyContacts);
router.put("/mark-read-all/", protect, markMessagesAsRead);
router.get("/available-contacts", protect, getAvailableContacts);
router.get("/chat-eligible", protect, getEligibleChatContacts); // 🆕 ICI
router.post("/conversations", conversationController.createConversation);
//router.get("/unread-conversations", protect, getUnreadConversations);
router.put("/mark-read/:userId", protect, markMessagesAsRead);
router.get("/unread-conversations", protect, getUserConversationsWithUnread);

// router.get(
//   "/conversations/:userId",
//   protect,
//   conversationController.getUserConversations
// );

// Messages
router.get("/messages/:conversationId", getMessagesByConversation);
router.get("/unread-count", protect, getUnreadMessagesCount);
router.put(
  "/mark-read-conversation/:conversationId",
  protect,
  markReadConversation
);
module.exports = router;
