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
      console.error("Error loading unread conversations:", err);
    }
  };

  const getUnreadCount = (conversation) => {
    console.log(conversation);
    console.log(
      "Searching unreadCount for conversation id:",
      conversation.conversationId
    );
    console.log("Unread conversations:", unreadConversations);
    const conv = unreadConversations.find(
      (c) => c._id === conversation.conversationId
    );
    console.log("Found unread conversation:", conversation);
    return conv ? conv.unreadCount : 0;
  };

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/messages/conversations/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setConversations(res.data))
      .catch((err) => console.error(err));
  }, [user.id]);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/messages/available-contacts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setContacts(res.data))
      .catch((err) => console.error(err));
  }, [user.id]);

  useEffect(() => {
    if (!selectedConv) return;
    axios
      .get(
        `http://localhost:5000/api/messages/messages/${selectedConv.conversationId}`
      )
      .then((res) => setMessages(res.data))
      .catch((err) => console.error(err));
  }, [selectedConv]);

  const handleSelectConversation = async (conv) => {
    setSelectedConv(conv);
    try {
      await axios.put(
        `http://localhost:5000/api/messages/mark-read-conversation/${conv.conversationId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUnreadConversations();
    } catch (err) {
      console.error("Error marking messages as read", err);
    }
  };

  const sendMessage = () => {
    console.log(selectedConv);
    if (!newMessage.trim()) return;

    const recipientId = selectedConv.participants.find(
      (p) => p._id.toString() !== user.id.toString()
    )?._id;

    if (!recipientId) {
      console.error("Recipient not found");
      return;
    }

    const msg = {
      conversationId: selectedConv.conversationId,
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
        fetchUnreadConversations();
      })
      .catch((err) => console.error(err));
  };

  const createConversation = async () => {
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
        console.log(res.data);
        setShowNewConv(false);
        axios
          .get(`http://localhost:5000/api/messages/conversations/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => setConversations(res.data))
          .catch((err) => console.error(err));
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchUnreadConversations();
  }, [user.id]);

  return (
    <div
      style={{
        display: "flex",
        height: "80vh",
        border: "1px solid #d9d9d9",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Conversations list */}
      <div
        style={{
          width: "30%",
          borderRight: "1px solid #ccc",
          overflowY: "auto",
          padding: "10px",
          backgroundColor: "#f7f9fc",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <h3 style={{ margin: 0 }}>Messages</h3>
          <button
            onClick={() => setShowNewConv(true)}
            style={{
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            +
          </button>
        </div>

        {conversations.map((conv) => {
          const otherUser = conv.participants.find((p) => p._id !== user.id);
          const unreadCount = getUnreadCount(conv);

          return (
            <div
              key={conv._id}
              onClick={() => handleSelectConversation(conv)}
              style={{
                padding: "10px",
                backgroundColor:
                  selectedConv?._id === conv._id ? "#e6f7ff" : "white",
                borderRadius: "5px",
                marginBottom: "5px",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #e0e0e0",
              }}
            >
              <span>{otherUser?.name || "User"}</span>
              {unreadCount > 0 && <Badge count={unreadCount} />}
            </div>
          );
        })}
      </div>

      {/* Chat area */}
      <div
        style={{
          width: "70%",
          padding: "15px",
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
                backgroundColor: "#e4e6eb",
                border: "none",
                padding: "6px 12px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              ← Back
            </button>

            <div
              style={{
                flexGrow: 1,
                overflowY: "auto",
                border: "1px solid #ddd",
                padding: "15px",
                borderRadius: "8px",
                backgroundColor: "#fafafa",
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
                      marginBottom: "10px",
                    }}
                  >
                    <span
                      style={{
                        maxWidth: "70%",
                        padding: "10px 15px",
                        backgroundColor: isSender ? "#d1e7dd" : "#f8d7da",
                        borderRadius: "20px",
                        color: "#000",
                        wordBreak: "break-word",
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
                  marginRight: "10px",
                }}
                placeholder="Write a message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  padding: "10px 20px",
                  borderRadius: "5px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </div>
          </>
        ) : showNewConv ? (
          <div>
            <h3>New Conversation</h3>
            <select
              onChange={(e) => setSelectedContactId(e.target.value)}
              value={selectedContactId || ""}
              style={{ padding: "10px", marginBottom: "10px", width: "100%" }}
            >
              <option value="">Select a contact</option>
              {contacts.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.role})
                </option>
              ))}
            </select>
            <div>
              <button
                onClick={createConversation}
                disabled={!selectedContactId}
                style={{
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "5px",
                  marginRight: "10px",
                }}
              >
                Create
              </button>
              <button
                onClick={() => setShowNewConv(false)}
                style={{
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "5px",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", marginTop: "30%", color: "#888" }}>
            Select a conversation or create a new one
          </div>
        )}
      </div>
    </div>
  );
}

export default Messenger;
