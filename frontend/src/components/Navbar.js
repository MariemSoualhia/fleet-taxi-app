import { useEffect, useState, useRef } from "react";
import { Layout, Button, Badge, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { BellOutlined } from "@ant-design/icons";

const { Header } = Layout;

function Navbar() {
  const { user, logout, loading, token } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef();

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/users/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Merge old + new without duplicates
      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n._id));
        const merged = [
          ...res.data.filter((n) => !existingIds.has(n._id)),
          ...prev,
        ];
        return merged.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      });
    } catch (error) {
      console.error("Error fetching notifications", error);
      message.error("Failed to load notifications.");
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(
        "http://localhost:5000/api/users/notifications/mark-all-read",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking notifications as read", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        if (openDropdown && unreadCount > 0) {
          markAllAsRead();
        }
        setOpenDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown, unreadCount]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const dropdownContent = (
    <div
      style={{
        maxHeight: "500px",
        overflowY: "auto",
        padding: "10px",
        width: "500px",
        background: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        borderRadius: "8px",
      }}
    >
      {notifications.length === 0 ? (
        <div style={{ textAlign: "center", color: "#888" }}>
          No notifications
        </div>
      ) : (
        notifications.map((notif, index) => (
          <div
            key={index}
            style={{
              padding: "8px",
              marginBottom: "5px",
              backgroundColor: notif.read ? "#f5f5f5" : "#e6f7ff",
              borderLeft: notif.read
                ? "4px solid transparent"
                : "4px solid #1890ff",
              borderRadius: "5px",
              fontWeight: notif.read ? "normal" : "bold",
              fontSize: "14px",
            }}
          >
            {notif.message}
          </div>
        ))
      )}
    </div>
  );

  if (loading) {
    return (
      <Header
        style={{
          background: "#fff",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={{ color: "#1890ff", fontWeight: "bold", fontSize: 20 }}>
          FleetPulse
        </div>
      </Header>
    );
  }

  return (
    <Header
      style={{
        background: "#fff",
        padding: "0 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
      }}
    >
      <div style={{ color: "#1890ff", fontWeight: "bold", fontSize: 20 }}>
        FleetPulse
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        {/* 🔔 Notifications */}
        <div
          ref={dropdownRef}
          style={{ position: "relative", marginRight: 16 }}
        >
          <Badge count={unreadCount} size="small">
            <BellOutlined
              style={{ fontSize: "20px", cursor: "pointer" }}
              onClick={() => setOpenDropdown(!openDropdown)}
            />
          </Badge>
          {openDropdown && (
            <div
              style={{ position: "absolute", top: 30, right: 0, zIndex: 1000 }}
            >
              {dropdownContent}
            </div>
          )}
        </div>

        {/* 👤 User Info */}
        <span style={{ marginRight: 16 }}>
          👋 Hello, <b>{user?.name || user?.email || "User"}</b>
        </span>

        <Button
          style={{ marginRight: 8 }}
          type="default"
          onClick={() => navigate("/profile")}
        >
          Profile
        </Button>

        <Button onClick={handleLogout} type="primary" danger>
          Logout
        </Button>
      </div>
    </Header>
  );
}

export default Navbar;
