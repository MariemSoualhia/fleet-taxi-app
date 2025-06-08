import { useEffect, useState } from "react";
import { Layout, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const { Header } = Layout;

function Navbar() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  useEffect(() => {
    console.log("hiiiii", user);
  }, []);

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
      }}
    >
      <div style={{ color: "#1890ff", fontWeight: "bold", fontSize: 20 }}>
        FleetPulse
      </div>

      <div>
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
