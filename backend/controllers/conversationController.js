// controllers/conversationController.js
const Conversation = require("../models/Conversation");

exports.createConversation = async (req, res) => {
  try {
    const { participants } = req.body;

    if (!participants || participants.length < 2) {
      return res
        .status(400)
        .json({ error: "Il faut au moins deux participants" });
    }

    // Vérifie si conversation existe déjà (mêmes participants)
    const existingConv = await Conversation.findOne({
      participants: { $all: participants, $size: participants.length },
    });

    if (existingConv) {
      return res.status(200).json(existingConv);
    }

    const newConv = new Conversation({ participants });
    await newConv.save();

    res.status(201).json(newConv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.params.userId;
    const conversations = await Conversation.find({
      participants: userId,
    }).populate("participants", "name role"); // adapte selon ton modèle User

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};
