import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Badge } from "antd";

function Messenger({ currentUserId }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [contacts, setContacts] = useState([]);
  const [showNewConv, setShowNewConv] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [unreadConversations, setUnreadConversations] = useState([]);
  const { user, token } = useAuth();

  // 🔴 Récupère les conversations avec messages non lus
  const fetchUnreadConversations = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/messages/unread-conversations",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUnreadConversations(data);
    } catch (err) {
      console.error("Erreur chargement des conversations non lues :", err);
    }
  };

  const hasUnreadMessages = (conversationId) => {
    return unreadConversations.some(
      (conv) => conv.conversationId === conversationId
    );
  };

  const getUnreadCount = (conversationId) => {
    const conv = unreadConversations.find(
      (c) => c.conversationId === conversationId
    );
    return conv ? conv.unreadCount : 0;
  };

  // 🔁 Chargement des conversations
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/messages/conversations/${user.id}`)
      .then((res) => setConversations(res.data))
      .catch((err) => console.error(err));
  }, [user.id]);

  // 🔁 Chargement des contacts disponibles
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/messages/available-contacts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setContacts(res.data))
      .catch((err) => console.error(err));
  }, [user.id]);

  // 🔁 Messages d'une conversation
  useEffect(() => {
    if (!selectedConv) return;
    axios
      .get(`http://localhost:5000/api/messages/messages/${selectedConv._id}`)
      .then((res) => setMessages(res.data))
      .catch((err) => console.error(err));
  }, [selectedConv]);

  // 🔁 Conversation lue => messages marqués comme lus
  const handleSelectConversation = async (conv) => {
    setSelectedConv(conv);
    try {
      await axios.put(
        //  `http://localhost:5000/api/messages/mark-read/${conv._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchUnreadConversations(); // MAJ après lecture
    } catch (err) {
      console.error("Erreur marquage messages comme lus", err);
    }
  };

  // ✉️ Envoi d’un message
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const recipientId = selectedConv.participants.find(
      (p) => p._id.toString() !== user.id.toString()
    )?._id;

    if (!recipientId) {
      console.error("Destinataire introuvable");
      return;
    }

    const msg = {
      conversationId: selectedConv._id,
      recipient: recipientId,
      content: newMessage,
    };

    axios
      .post("http://localhost:5000/api/messages", msg, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setMessages((prev) => [...prev, res.data]);
        setNewMessage("");
        fetchUnreadConversations(); // Recharger après envoi
      })
      .catch((err) => console.error(err));
  };

  // ➕ Créer nouvelle conversation
  const createConversation = () => {
    if (!selectedContactId) return;

    axios
      .post(
        "http://localhost:5000/api/messages/conversations",
        {
          participants: [user.id, selectedContactId],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        setConversations((prev) => [...prev, res.data]);
        setSelectedConv(res.data);
        setShowNewConv(false);
      })
      .catch((err) => console.error(err));
  };

  // 🔁 Récupère au démarrage les conversations non lues
  useEffect(() => {
    fetchUnreadConversations();
  }, [user.id]);

  return (
    <div style={{ display: "flex", height: "80vh", border: "1px solid #ccc" }}>
      {/* Liste des conversations */}
      <div
        style={{
          width: "30%",
          borderRight: "1px solid #ccc",
          overflowY: "auto",
          padding: "10px",
        }}
      >
        <h3>Conversations</h3>
        <button onClick={() => setShowNewConv(true)}>
          Nouvelle Conversation
        </button>
        {conversations.map((conv) => (
          <div
            key={conv._id}
            onClick={() => handleSelectConversation(conv)}
            style={{
              padding: "10px",
              cursor: "pointer",
              backgroundColor:
                selectedConv?._id === conv._id ? "#eee" : "white",
              borderRadius: "5px",
              marginTop: "5px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <b>
              {conv.participants.find((p) => p._id !== user.id)?.name ||
                "Conversation"}
            </b>
            {hasUnreadMessages(conv._id) && (
              <Badge
                count={getUnreadCount(conv._id)}
                style={{ backgroundColor: "#f5222d" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Fenêtre de chat */}
      <div
        style={{
          width: "70%",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {selectedConv ? (
          <>
            <button
              onClick={() => setSelectedConv(null)}
              style={{
                alignSelf: "flex-start",
                marginBottom: "10px",
                backgroundColor: "#eee",
                border: "none",
                padding: "5px 10px",
                cursor: "pointer",
                borderRadius: "5px",
              }}
            >
              ← Retour
            </button>

            <div
              style={{
                flexGrow: 1,
                overflowY: "auto",
                border: "1px solid #ddd",
                padding: "10px",
                borderRadius: "5px",
                backgroundColor: "#f9f9f9",
              }}
            >
              {messages.map((msg) => {
                const isSender = msg.sender.toString() === user.id.toString();
                return (
                  <div
                    key={msg._id}
                    style={{
                      display: "flex",
                      justifyContent: isSender ? "flex-end" : "flex-start",
                      margin: "5px 0",
                    }}
                  >
                    <span
                      style={{
                        maxWidth: "70%",
                        padding: "8px 12px",
                        backgroundColor: isSender ? "#d3d3d3" : "#add8e6",
                        borderRadius: "15px",
                        color: "black",
                        wordWrap: "break-word",
                      }}
                    >
                      {msg.content}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: "10px", display: "flex" }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                style={{
                  flexGrow: 1,
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
                placeholder="Écrire un message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  marginLeft: "10px",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Envoyer
              </button>
            </div>
          </>
        ) : showNewConv ? (
          <div>
            <h3>Nouvelle Conversation</h3>
            <select
              onChange={(e) => setSelectedContactId(e.target.value)}
              value={selectedContactId || ""}
            >
              <option value="">Sélectionner un contact</option>
              {contacts.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.role})
                </option>
              ))}
            </select>
            <button onClick={createConversation} disabled={!selectedContactId}>
              Créer
            </button>
            <button onClick={() => setShowNewConv(false)}>Annuler</button>
          </div>
        ) : (
          <div style={{ textAlign: "center", marginTop: "20%" }}>
            Sélectionnez une conversation ou créez-en une nouvelle
          </div>
        )}
      </div>
    </div>
  );
}

export default Messenger;
