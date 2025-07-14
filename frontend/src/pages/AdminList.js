import React, { useEffect, useState } from "react";
import { Table, Button, Modal, message, Spin } from "antd";
import axios from "axios";
import CreateAdmin from "./CreateAdmin";
import { useAuth } from "../context/AuthContext";

function AdminList() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/api/users/admins", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(res.data);
    } catch (error) {
      console.error("Error fetching admins:", error);
      message.error("Failed to load admin list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
  ];

  const handleCreateSuccess = () => {
    setModalVisible(false);
    fetchAdmins();
  };

  return (
    <>
      <Button
        type="primary"
        onClick={() => setModalVisible(true)}
        style={{ marginBottom: 16 }}
      >
        ➕ Create Admin
      </Button>

      {loading ? (
        <Spin />
      ) : (
        <Table
          dataSource={admins}
          columns={columns}
          rowKey={(record) => record._id || record.id}
          pagination={{ pageSize: 10 }}
        />
      )}

      <Modal
        open={modalVisible}
        title="Create New Admin"
        footer={null}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <CreateAdmin
          onSuccess={handleCreateSuccess}
          onCancel={() => setModalVisible(false)}
        />
      </Modal>
    </>
  );
}

export default AdminList;
