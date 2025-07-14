// UserManagement.js (ENGLISH VERSION)
import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Popconfirm,
  message,
  Select,
  Spin,
  Modal,
} from "antd";
import {
  DeleteOutlined,
  ReloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import axios from "axios";
import CreateAdmin from "./CreateAdmin";
import CreateDriver from "./CreateDriver";

const { Option } = Select;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredRole, setFilteredRole] = useState("all");
  const [loading, setLoading] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [showCreateDriver, setShowCreateDriver] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/users/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(res.data);
    } catch (err) {
      message.error("Error loading users.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("User deleted successfully");
      fetchUsers();
    } catch (err) {
      message.error("Failed to delete user");
    }
  };

  const filteredUsers =
    filteredRole === "all"
      ? users
      : users.filter((user) => user.role === filteredRole);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (role) => {
        let color =
          role === "admin"
            ? "geekblue"
            : role === "driver"
            ? "green"
            : "volcano";
        return <Tag color={color}>{role.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Popconfirm
          title="Delete this user?"
          onConfirm={() => handleDelete(record._id)}
          okText="Yes"
          cancelText="No"
        >
          <Button danger icon={<DeleteOutlined />} size="small">
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">User Management</h2>
        <div className="flex items-center gap-2">
          <Select
            value={filteredRole}
            onChange={(value) => setFilteredRole(value)}
            style={{ width: 150 }}
          >
            <Option value="all">All</Option>
            <Option value="admin">Admins</Option>
            <Option value="driver">Drivers</Option>
          </Select>
          <Button
            icon={<PlusOutlined />}
            onClick={() => setShowCreateAdmin(true)}
          >
            Add Admin
          </Button>
          <Button
            icon={<PlusOutlined />}
            onClick={() => setShowCreateDriver(true)}
          >
            Add Driver
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
            Refresh
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="text-center">
          <Spin />
        </div>
      ) : (
        <Table dataSource={filteredUsers} columns={columns} rowKey="_id" />
      )}

      <Modal
        title="Create Admin"
        open={showCreateAdmin}
        onCancel={() => setShowCreateAdmin(false)}
        footer={null}
      >
        <CreateAdmin
          onSuccess={() => {
            setShowCreateAdmin(false);
            fetchUsers();
          }}
          onCancel={() => setShowCreateAdmin(false)}
        />
      </Modal>

      <Modal
        title="Create Driver"
        open={showCreateDriver}
        onCancel={() => setShowCreateDriver(false)}
        footer={null}
      >
        <CreateDriver
          onSuccess={() => {
            setShowCreateDriver(false);
            fetchUsers();
          }}
          onCancel={() => setShowCreateDriver(false)}
          admins={users.filter((u) => u.role === "admin")}
        />
      </Modal>
    </div>
  );
};

export default UserManagement;
