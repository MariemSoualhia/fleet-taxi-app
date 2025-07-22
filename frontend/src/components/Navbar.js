import { useEffect, useState, useRef } from "react";
import { Layout, Button, Badge, message as antdMessage, Spin } from "antd";
import { BellOutlined, MessageOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Messenger from "../pages/Messenger";
import { useAuth } from "../context/AuthContext";

const { Header } = Layout;

function Navbar() {
  const { user, logout, loading, token } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [openNotif, setOpenNotif] = useState(false);
  const notifRef = useRef();

  const [openChat, setOpenChat] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const chatRef = useRef();

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/users/notifications",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) => {
        const existing = new Set(prev.map((n) => n._id));
        const merged = [...data.filter((d) => !existing.has(d._id)), ...prev];
        return merged.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      });
    } catch (err) {
      console.error(err);
      antdMessage.error("Failed to load notifications");
    }
  };

  const markAllNotifRead = async () => {
    try {
      await axios.put(
        "http://localhost:5000/api/users/notifications/mark-all-read",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((p) => p.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUnreadMessagesCount = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/messages/unread-count",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnreadMessages(data.count);
    } catch (err) {
      console.error("Failed to fetch unread messages count", err);
    }
  };

  const unreadNotif = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (token) {
      fetchNotifications();
      fetchUnreadMessagesCount();
      const intervalNotif = setInterval(fetchNotifications, 30000);
      const intervalMsg = setInterval(fetchUnreadMessagesCount, 30000);
      return () => {
        clearInterval(intervalNotif);
        clearInterval(intervalMsg);
      };
    }
  }, [user, token]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        if (openNotif && unreadNotif > 0) markAllNotifRead();
        setOpenNotif(false);
      }
      if (chatRef.current && !chatRef.current.contains(e.target)) {
        setOpenChat(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openNotif, unreadNotif, openChat]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleChatClick = async () => {
    const isOpening = !openChat;
    setOpenChat(isOpening);
    setOpenNotif(false);

    if (isOpening && unreadMessages > 0) {
      try {
        await axios.put(
          "http://localhost:5000/api/messages/mark-read-all",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUnreadMessages(0);
      } catch (err) {
        console.error("Erreur lors de la mise à jour des messages lus", err);
      }
    }
  };

  if (loading) {
    return (
      <Header style={styles.header}>
        <div style={styles.logo}>FleetPulse</div>
        <Spin />
      </Header>
    );
  }

  return (
    <Header style={styles.header}>
      <div style={styles.logo}>FleetPulse</div>

      <div style={{ display: "flex", alignItems: "center" }}>
        {/* 🔔 Notifications */}
        <div ref={notifRef} style={{ position: "relative", marginRight: 16 }}>
          <Badge count={unreadNotif} size="small">
            <BellOutlined
              style={styles.icon}
              onClick={() => {
                setOpenNotif(!openNotif);
                setOpenChat(false);
              }}
            />
          </Badge>
          {openNotif && (
            <div style={styles.dropdown}>
              {notifications.length === 0 ? (
                <div style={styles.empty}>No notifications</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    style={{
                      ...styles.notif,
                      backgroundColor: n.read ? "#f5f5f5" : "#e6f7ff",
                      borderLeftColor: n.read ? "transparent" : "#1890ff",
                      fontWeight: n.read ? "normal" : "bold",
                    }}
                  >
                    {n.message}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 💬 Messenger */}
        <div ref={chatRef} style={{ position: "relative", marginRight: 16 }}>
          <Badge count={unreadMessages} size="small" offset={[0, 0]}>
            <MessageOutlined style={styles.icon} onClick={handleChatClick} />
          </Badge>
          {openChat && (
            <div style={styles.chatWrapper}>
              <Messenger currentUserId={user.id} />
            </div>
          )}
        </div>

        {/* Auth */}
        <span style={{ marginRight: 16 }}>
          👋 Hello, <b>{user?.name || user?.email}</b>
        </span>
        <Button style={{ marginRight: 8 }} onClick={() => navigate("/profile")}>
          Profile
        </Button>
        <Button danger type="primary" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </Header>
  );
}

const styles = {
  header: {
    background: "#fff",
    padding: "0 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
  },
  logo: { color: "#1890ff", fontWeight: "bold", fontSize: 20 },
  icon: { fontSize: 20, cursor: "pointer" },
  dropdown: {
    position: "absolute",
    top: 30,
    right: 0,
    zIndex: 1000,
    width: 500,
    maxHeight: 500,
    overflowY: "auto",
    background: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    borderRadius: 8,
    padding: 10,
  },
  chatWrapper: {
    position: "absolute",
    top: 30,
    right: 0,
    zIndex: 1000,
    width: 500,
    height: 400,
    background: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    borderRadius: 8,
    display: "flex",
  },
  notif: {
    padding: 10,
    marginBottom: 6,
    borderLeft: "4px solid transparent",
    borderRadius: 4,
    cursor: "default",
  },
  empty: {
    padding: 20,
    textAlign: "center",
    color: "#999",
  },
};

export default Navbar;
