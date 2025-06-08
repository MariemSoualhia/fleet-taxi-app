import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const { Option } = Select;
const Alert = MuiAlert;

function TrucksPage() {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  const [searchPlate, setSearchPlate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const { user } = useAuth();
  const [form] = Form.useForm();

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const fetchTrucks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/trucks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrucks(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrucks();
  }, []);

  const onFinish = async (values) => {
    const token = localStorage.getItem("token");

    try {
      if (editingTruck) {
        await axios.put(
          `http://localhost:5000/api/trucks/${editingTruck._id}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAlertSeverity("success");
        setAlertMessage("Truck updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/trucks", values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAlertSeverity("success");
        setAlertMessage("Truck added successfully!");
      }

      setSnackbarOpen(true);
      setIsModalOpen(false);
      fetchTrucks();
      setEditingTruck(null);
      form.resetFields();
    } catch (error) {
      setAlertSeverity("error");
      setAlertMessage(
        error.response?.data?.message || "Error while saving truck"
      );
      setSnackbarOpen(true);
    }
  };

  const handleEdit = (truck) => {
    setEditingTruck(truck);
    setIsModalOpen(true);
    form.setFieldsValue({
      plateNumber: truck.plateNumber,
      model: truck.model,
      capacity: truck.capacity,
      status: truck.status,
    });
  };

  const handleDelete = async (truckId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/trucks/${truckId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlertSeverity("success");
      setAlertMessage("Truck deleted successfully!");
      setSnackbarOpen(true);
      fetchTrucks();
    } catch (error) {
      setAlertSeverity("error");
      setAlertMessage(
        error.response?.data?.message || "Error while deleting truck"
      );
      setSnackbarOpen(true);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <h2>Trucks Management</h2>

      {/* 🔍 Filtres */}
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "24px",
        }}
      >
        <div>
          <label style={{ fontWeight: "500" }}>Search by plate</label>
          <Input
            placeholder="e.g. 123ABC"
            value={searchPlate}
            onChange={(e) => setSearchPlate(e.target.value)}
            style={{ width: 200 }}
          />
        </div>

        <div>
          <label style={{ fontWeight: "500" }}>Filter by status</label>
          <Select
            placeholder="Select status"
            value={filterStatus}
            onChange={(value) => setFilterStatus(value)}
            allowClear
            style={{ width: 200 }}
          >
            <Option value="available">Available</Option>
            <Option value="inMaintenance">In Maintenance</Option>
          </Select>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingTruck(null);
            form.resetFields();
            setIsModalOpen(true);
          }}
        >
          Add Truck
        </Button>
      </div>

      {/* 📋 Tableau */}
      <Table
        columns={[
          {
            title: "Plate Number",
            dataIndex: "plateNumber",
            key: "plateNumber",
          },
          {
            title: "Model",
            dataIndex: "model",
            key: "model",
          },
          {
            title: "Capacity (tons)",
            dataIndex: "capacity",
            key: "capacity",
          },
          {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) =>
              status === "available"
                ? "Available"
                : status === "inMaintenance"
                ? "In Maintenance"
                : status,
          },
          {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
              <div style={{ display: "flex", gap: "8px" }}>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                />
                <Popconfirm
                  title="Are you sure to delete this truck?"
                  onConfirm={() => handleDelete(record._id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </div>
            ),
          },
        ]}
        dataSource={trucks.filter((truck) => {
          const plateMatch = truck.plateNumber
            .toLowerCase()
            .includes(searchPlate.toLowerCase());
          const statusMatch = filterStatus
            ? truck.status === filterStatus
            : true;
          return plateMatch && statusMatch;
        })}
        loading={loading}
        rowKey="_id"
      />

      {/* ➕ / ✏️ Modal */}
      <Modal
        title={editingTruck ? "Edit Truck" : "Add Truck"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item
            name="plateNumber"
            label="Plate Number"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter plate number" />
          </Form.Item>

          <Form.Item name="model" label="Model" rules={[{ required: true }]}>
            <Input placeholder="Enter truck model" />
          </Form.Item>

          <Form.Item
            name="capacity"
            label="Capacity (tons)"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter capacity" type="number" />
          </Form.Item>

          <Form.Item name="status" label="Status" initialValue="available">
            <Select>
              <Option value="available">Available</Option>
              <Option value="inMaintenance">In Maintenance</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingTruck ? "Update Truck" : "Add Truck"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* ✅ Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity={alertSeverity}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default TrucksPage;
