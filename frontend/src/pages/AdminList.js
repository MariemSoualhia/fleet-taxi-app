import React, { useEffect, useState } from "react";
import { Table, Button, Modal, message, Spin } from "antd";
import axios from "axios";
import CreateAdmin from "./CreateAdmin"; // Ta pop-up de création admin
import { useAuth } from "../context/AuthContext";

function AdminList() {
  const { token } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch admins depuis backend
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/users/admins", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(res.data);
    } catch (error) {
      console.error("Erreur lors du fetch admins:", error);
      message.error("Impossible de charger la liste des admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Colonnes pour la table
  const columns = [
    { title: "Nom", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Rôle", dataIndex: "role", key: "role" },
    // Ajoute plus de colonnes si besoin
  ];

  // Fermeture de la modal + refresh de la liste si succès
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
        ➕ Créer un admin
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
        visible={modalVisible}
        title="Créer un nouvel admin"
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
