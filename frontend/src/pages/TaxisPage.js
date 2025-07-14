import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const { Option } = Select;
const Alert = MuiAlert;

function TaxisPage() {
  const [taxis, setTaxis] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaxi, setEditingTaxi] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  const { user } = useAuth();
  const [form] = Form.useForm();

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const fetchTaxis = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/taxis", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTaxis(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/users/driversbyadmin",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDrivers(res.data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  useEffect(() => {
    fetchTaxis();
    fetchDrivers();
  }, []);

  const onFinish = async (values) => {
    const token = localStorage.getItem("token");

    try {
      if (editingTaxi) {
        await axios.put(
          `http://localhost:5000/api/taxis/${editingTaxi._id}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAlertSeverity("success");
        setAlertMessage("Taxi updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/taxis", values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAlertSeverity("success");
        setAlertMessage("Taxi added successfully!");
      }

      setSnackbarOpen(true);
      setIsModalOpen(false);
      fetchTaxis();
      setEditingTaxi(null);
      form.resetFields();
    } catch (error) {
      setAlertSeverity("error");
      setAlertMessage(
        error.response?.data?.message || "Error while saving taxi"
      );
      setSnackbarOpen(true);
    }
  };

  const handleEdit = (taxi) => {
    setEditingTaxi(taxi);
    setIsModalOpen(true);
    form.setFieldsValue({
      plateNumber: taxi.plateNumber,
      model: taxi.model,
      fuelType: taxi.fuelType,
      status: taxi.status,
      capacity: taxi.capacity,
      assignedDriver: taxi.assignedDriver?._id || undefined,
    });
  };

  const handleDelete = async (taxiId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/taxis/${taxiId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlertSeverity("success");
      setAlertMessage("Taxi deleted successfully!");
      setSnackbarOpen(true);
      fetchTaxis();
    } catch (error) {
      setAlertSeverity("error");
      setAlertMessage(
        error.response?.data?.message || "Error while deleting taxi"
      );
      setSnackbarOpen(true);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <h2>Taxi Management</h2>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => {
          setEditingTaxi(null);
          form.resetFields();
          setIsModalOpen(true);
        }}
        style={{ marginBottom: 16 }}
      >
        Add Taxi
      </Button>

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
            title: "Fuel Type",
            dataIndex: "fuelType",
            key: "fuelType",
          },
          {
            title: "Capacity",
            dataIndex: "capacity",
            key: "capacity",
          },
          {
            title: "Status",
            dataIndex: "status",
            key: "status",
          },
          {
            title: "Assigned Driver",
            key: "assignedDriver",
            render: (_, record) =>
              record.assignedDriver?.fullName ||
              record.assignedDriver?.email ||
              "N/A",
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
                  title="Are you sure to delete this taxi?"
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
        dataSource={taxis}
        loading={loading}
        rowKey="_id"
      />

      <Modal
        title={editingTaxi ? "Edit Taxi" : "Add Taxi"}
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
            <Input placeholder="Enter taxi model" />
          </Form.Item>

          <Form.Item name="fuelType" label="Fuel Type" initialValue="diesel">
            <Select>
              <Option value="diesel">Diesel</Option>
              <Option value="electric">Electric</Option>
              <Option value="hybrid">Hybrid</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="capacity"
            label="Capacity"
            rules={[{ required: true, message: "Please enter taxi capacity" }]}
          >
            <Input type="number" min={1} placeholder="e.g. 4" />
          </Form.Item>

          <Form.Item name="status" label="Status" initialValue="available">
            <Select>
              <Option value="available">Available</Option>
              <Option value="inMaintenance">In Maintenance</Option>
            </Select>
          </Form.Item>

          <Form.Item name="assignedDriver" label="Assigned Driver">
            <Select allowClear placeholder="Select a driver">
              {drivers.map((driver) => (
                <Option key={driver._id} value={driver._id}>
                  {driver.fullName || driver.name || driver.email}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingTaxi ? "Update Taxi" : "Add Taxi"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

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

export default TaxisPage;
