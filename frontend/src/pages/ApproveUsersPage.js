// src/pages/ApproveUsersPage.js
import { useEffect, useState } from "react";
import { Card, Table, Button, message, Spin } from "antd";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function ApproveUsersPage() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      console.log("r11");
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("r22", res);

      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to load pending users.");
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/users/${userId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success("User approved successfully!");
      fetchUsers();
    } catch (error) {
      console.error("Approval error:", error);
      message.error("Failed to approve user.");
    }
  };

  useEffect(() => {
    if (user?.role === "superAdmin") {
      fetchUsers();
    }
  }, [user]);

  if (loading) {
    return (
      <Spin style={{ display: "block", margin: "80px auto" }} size="large" />
    );
  }

  if (user?.role !== "superAdmin") {
    return (
      <div style={{ textAlign: "center", marginTop: 60 }}>Access denied</div>
    );
  }

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (role) => role.charAt(0).toUpperCase() + role.slice(1),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button type="primary" onClick={() => approveUser(record._id)}>
          Approve
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="Pending User Approvals">
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
}

export default ApproveUsersPage;
