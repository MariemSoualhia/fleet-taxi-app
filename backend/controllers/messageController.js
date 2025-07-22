const mongoose = require("mongoose");

const Message = require("../models/Message");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const sendMessage = async (req, res) => {
  try {
    const { conversationId, recipient, content } = req.body;
    const sender = req.user._id;
    console.log(req.body);
    // Vérifier que le contenu n'est pas vide
    if (!content || !recipient || !conversationId) {
      return res.status(400).json({ message: "Informations manquantes." });
    }

    const recipientUser = await User.findById(recipient);
    if (!recipientUser) {
      return res.status(404).json({ message: "Destinataire introuvable." });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation introuvable." });
    }

    const isSenderParticipant = conversation.participants.some(
      (p) => p.toString() === sender.toString()
    );
    const isRecipientParticipant = conversation.participants.some(
      (p) => p.toString() === recipient.toString()
    );
    if (!isSenderParticipant || !isRecipientParticipant) {
      return res
        .status(403)
        .json({ message: "Utilisateur non participant à la conversation." });
    }

    let superAdminId;
    if (req.user.role === "superAdmin") {
      superAdminId = req.user._id;
    } else if (req.user.role === "admin" || req.user.role === "driver") {
      superAdminId = req.user.superAdmin;
    } else {
      return res.status(400).json({ message: "Rôle utilisateur invalide." });
    }

    const newMessage = await Message.create({
      conversationId,
      sender,
      recipient,
      content,
      superAdmin: superAdminId,
    });

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("Erreur en envoyant le message :", error);
    return res
      .status(500)
      .json({ message: "Erreur serveur lors de l'envoi du message." });
  }
};

const getMessagesByConversation = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const messages = await Message.find({ conversationId }).sort({
      timestamp: 1,
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

const getConversation = async (req, res) => {
  const userId = req.user._id;
  const otherId = req.params.userId;

  const messages = await Message.find({
    $or: [
      { sender: userId, recipient: otherId },
      { sender: otherId, recipient: userId },
    ],
  })
    .sort({ createdAt: 1 })
    .populate("sender", "name profileImage")
    .populate("recipient", "name profileImage");

  res.json(messages);
};

const getMyContacts = async (req, res) => {
  const userId = req.user._id;

  const messages = await Message.find({
    $or: [{ sender: userId }, { recipient: userId }],
  });

  const contactIds = new Set();

  messages.forEach((msg) => {
    contactIds.add(
      msg.sender.toString() === userId.toString()
        ? msg.recipient.toString()
        : msg.sender.toString()
    );
  });

  const contacts = await User.find({ _id: { $in: [...contactIds] } }).select(
    "name profileImage role"
  );

  res.json(contacts);
};

const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    await Message.updateMany(
      { recipient: userId, read: false },
      { $set: { read: true } }
    );
    res.json({ message: "All messages marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getAvailableContacts = async (req, res) => {
  const user = req.user;

  try {
    let contacts = [];

    if (user.role === "superAdmin") {
      contacts = await User.find({
        _id: { $ne: user._id }, // pas lui-même
        $or: [
          { role: "admin", superAdmin: user._id },
          { role: "driver", superAdmin: user._id },
        ],
      }).select("name profileImage role");
    } else if (user.role === "admin") {
      contacts = await User.find({
        _id: { $ne: user._id },
        $or: [
          { _id: user.superAdmin }, // le super admin auquel il est rattaché
          { role: "driver", admin: user._id },
        ],
      }).select("name profileImage role");
    } else if (user.role === "driver") {
      contacts = await User.find({
        _id: { $in: [user.admin, user.superAdmin] }, // admin et superAdmin
      }).select("name profileImage role");
    }

    res.status(200).json(contacts);
  } catch (error) {
    console.error("getAvailableContacts error:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des contacts disponibles",
    });
  }
};
const getEligibleChatContacts = async (req, res) => {
  const userId = req.user.id;
  console.log(userId);
  let eligibleUsers = [];

  const user = await User.findById(userId);

  if (!user) return res.status(404).json({ message: "User not found" });

  const allUsers = await User.find({
    _id: { $ne: userId }, // exclure soi-même
  }).select("name profileImage role superAdmin admin");

  // Si superAdmin, il peut chatter avec ses admins et drivers
  if (user.role === "superAdmin") {
    eligibleUsers = allUsers.filter((u) => {
      return (
        (u.role === "admin" && u.superAdmin.toString() === userId.toString()) ||
        (u.role === "driver" && u.admin && u.admin.toString() in user.admins)
      );
    });
  }

  // Si admin, peut chatter avec son superAdmin + ses drivers
  else if (user.role === "admin") {
    eligibleUsers = allUsers.filter((u) => {
      return (
        (u.role === "superAdmin" &&
          u._id.toString() === user.superAdmin.toString()) ||
        (u.role === "driver" &&
          u.admin &&
          u.admin.toString() === userId.toString())
      );
    });
  }

  // Si driver, peut chatter avec son admin
  else if (user.role === "driver") {
    eligibleUsers = allUsers.filter(
      (u) => u.role === "admin" && u._id.toString() === user.admin.toString()
    );
  }

  res.json(eligibleUsers);
};

const getUnreadMessagesCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const count = await Message.countDocuments({
      recipient: userId,
      read: false,
      //sender: { $ne: userId },
    });
    console.log(count);
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getUnreadConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Group by conversationId and sender
    const unread = await Message.aggregate([
      {
        $match: {
          recipient: userId,
          read: false,
          sender: { $ne: userId },
        },
      },
      {
        $group: {
          _id: { conversationId: "$conversationId", sender: "$sender" },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.sender",
          foreignField: "_id",
          as: "fromUser",
        },
      },
      {
        $unwind: "$fromUser",
      },
      {
        $project: {
          conversationId: "$_id.conversationId",
          fromUser: {
            _id: "$fromUser._id",
            name: "$fromUser.name",
            email: "$fromUser.email",
          },
          unreadCount: "$count",
        },
      },
    ]);

    res.json(unread);
  } catch (err) {
    console.error("getUnreadConversations error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserConversationsWithUnread = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const conversations = await Conversation.aggregate([
      {
        $match: {
          participants: userId, // Vérifie que le user fait partie de la conversation
        },
      },
      {
        $lookup: {
          from: "messages",
          let: { convId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$conversationId", "$$convId"] },
                    { $eq: ["$recipient", userId] },
                    { $eq: ["$read", false] },
                  ],
                },
              },
            },
          ],
          as: "unreadMessages",
        },
      },
      {
        $addFields: {
          unreadCount: { $size: "$unreadMessages" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          as: "participantsInfo",
        },
      },
      {
        $project: {
          _id: 1,
          participants: 1,
          unreadCount: 1,
          participantsInfo: {
            _id: 1,
            name: 1,
            role: 1,
            profileImage: 1,
          },
        },
      },
    ]);

    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = {
  sendMessage,
  getMessagesByConversation,
  getConversation,
  getUnreadConversations,
  getMyContacts,
  markMessagesAsRead,
  getAvailableContacts,
  getEligibleChatContacts,
  getUnreadMessagesCount,
  getUserConversationsWithUnread,
};
