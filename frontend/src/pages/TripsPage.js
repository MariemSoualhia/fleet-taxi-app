// TripsPage.jsx
import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  Popconfirm,
  InputNumber,
  Tooltip,
  Input,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import dayjs from "dayjs";
import AddressAutoComplete from "../components/AddressAutoComplete";

const { Option } = Select;
const Alert = MuiAlert;

function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [taxis, setTaxis] = useState([]);
  const [filteredTaxis, setFilteredTaxis] = useState([]);
  const [filterTripStatus, setFilterTripStatus] = useState("");

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [formValid, setFormValid] = useState(false);

  const navigate = useNavigate();

  const [filterDriver, setFilterDriver] = useState("");
  const [filterTaxi, setFilterTaxi] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterStartLocation, setFilterStartLocation] = useState("");

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  // Fetch trips
  const fetchTrips = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/trips", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrips(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch drivers and taxis
  const fetchDriversAndTaxis = async () => {
    try {
      const token = localStorage.getItem("token");
      const [driversRes, taxisRes] = await Promise.all([
        axios.get("http://localhost:5000/api/users/driversbyadmin", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/taxis", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setDrivers(driversRes.data);
      setTaxis(taxisRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTrips();
    fetchDriversAndTaxis();
  }, []);

  // When driver changes, filter taxis linked to that driver
  const onDriverChange = (driverId) => {
    console.log("Selected driverId:", driverId);
    form.setFieldsValue({ taxiId: null });
    setFilterTaxi("");

    if (!driverId) {
      setFilteredTaxis([]);
      return;
    }

    const filtered = taxis.filter((taxi) => {
      if (!taxi.assignedDriver) return false;

      const assignedDriverId =
        typeof taxi.assignedDriver === "object" && taxi.assignedDriver._id
          ? taxi.assignedDriver._id.toString()
          : taxi.assignedDriver.toString();

      return assignedDriverId === driverId;
    });

    console.log("Filtered taxis:", filtered);
    setFilteredTaxis(filtered);
  };

  const handleEdit = (trip) => {
    setEditingTrip(trip);
    console.log(trip);
    form.setFieldsValue({
      ...trip,
      driverId: trip.taxiId?.assignedDriver?._id || null, // ✅ mettre l'ID ici
      taxiId: trip.taxiId?._id,
      startTime: dayjs(trip.startTime),
      endTime: dayjs(trip.endTime),
    });

    // Filtrage des taxis en fonction du driver si nécessaire
    const filteredTaxis = taxis.filter(
      (taxi) =>
        !trip.taxiId?.assignedDriver?._id ||
        taxi.assignedDriver?._id === trip.taxiId?.assignedDriver?._id
    );
    setFilteredTaxis(filteredTaxis);

    setIsModalOpen(true);
  };

  // Submit form handler
  const onFinish = async (values) => {
    const token = localStorage.getItem("token");
    // Récupérer userId, adminId, superAdminId depuis le contexte/auth ou le localStorage
    // Ici un exemple fictif, adapte selon ta gestion d’authentification
    const user = JSON.parse(localStorage.getItem("user")); // ou autre source

    const payload = {
      ...values,
      startTime: values.startTime.toISOString(),
      endTime: values.endTime.toISOString(),
      admin: user.role === "admin" ? user._id : undefined,
      superAdmin: user.role === "superAdmin" ? user._id : undefined,
    };

    try {
      if (editingTrip) {
        await axios.put(
          `http://localhost:5000/api/trips/${editingTrip._id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAlertMessage("Trip updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/trips", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAlertMessage("Trip added successfully!");
      }
      setAlertSeverity("success");
      setSnackbarOpen(true);
      setIsModalOpen(false);
      fetchTrips();
      setEditingTrip(null);
      form.resetFields();
      setFilteredTaxis([]);
    } catch (error) {
      setAlertSeverity("error");
      setAlertMessage(
        error.response?.data?.message || "Error while saving trip"
      );
      setSnackbarOpen(true);
    }
  };

  // Edit trip handler

  // Delete trip handler
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/trips/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlertSeverity("success");
      setAlertMessage("Trip deleted successfully!");
      setSnackbarOpen(true);
      fetchTrips();
    } catch (err) {
      setAlertSeverity("error");
      setAlertMessage("Error while deleting trip");
      setSnackbarOpen(true);
    }
  };

  // Filtering trips for display
  const filteredTrips = trips.filter((trip) => {
    return (
      (!filterDriver || trip.taxiId?.assignedDriver?._id === filterDriver) &&
      (!filterTaxi || trip.taxiId?.plateNumber === filterTaxi) &&
      (!filterStatus || trip.deliveryStatus === filterStatus) &&
      (!filterTripStatus || trip.tripStatus === filterTripStatus) &&
      (!filterStartLocation ||
        trip.startLocation
          ?.toLowerCase()
          .includes(filterStartLocation.toLowerCase()))
    );
  });

  return (
    <div style={{ padding: 24 }}>
      <h2>Trips Management</h2>

      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 16 }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: 4 }}>Driver</label>
          <Select
            placeholder="Driver"
            style={{ width: 180 }}
            value={filterDriver}
            onChange={setFilterDriver}
            allowClear
          >
            {drivers.map((d) => (
              <Option key={d._id} value={d._id}>
                {d.name}
              </Option>
            ))}
          </Select>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: 4 }}>Taxi</label>
          <Select
            placeholder="Taxi"
            style={{ width: 180 }}
            value={filterTaxi}
            onChange={setFilterTaxi}
            allowClear
          >
            {taxis.map((t) => (
              <Option key={t._id} value={t.plateNumber}>
                {t.plateNumber}
              </Option>
            ))}
          </Select>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: 4 }}>Status</label>
          <Select
            placeholder="Status"
            style={{ width: 180 }}
            value={filterStatus}
            onChange={setFilterStatus}
            allowClear
          >
            <Option value="on-time">On-Time</Option>
            <Option value="delayed">Delayed</Option>
          </Select>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: 4 }}>Trip Status</label>
          <Select
            placeholder="Trip Status"
            style={{ width: 180 }}
            value={filterTripStatus}
            onChange={setFilterTripStatus}
            allowClear
          >
            <Option value="ongoing">Ongoing</Option>
            <Option value="completed">Completed</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: 4 }}>Start Location</label>
          <AddressAutoComplete
            value={filterStartLocation}
            onChange={setFilterStartLocation}
            placeholder="Start Location Filter"
          />
        </div>

        <Tooltip title="Reset Filters">
          <Button
            shape="circle"
            icon={<ReloadOutlined />}
            onClick={() => {
              setFilterDriver("");
              setFilterTaxi("");
              setFilterStatus("");
              setFilterStartLocation("");
              setFilterTripStatus("");
            }}
          />
        </Tooltip>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields();
            setFilteredTaxis([]);
            setEditingTrip(null);
            setIsModalOpen(true);
          }}
        >
          Add Trip
        </Button>
      </div>

      <Table
        columns={[
          {
            title: "Driver",
            dataIndex: ["taxiId", "assignedDriver", "name"],
            key: "driver",
            render: (text) => text || "-",
          },

          { title: "Taxi", render: (_, r) => r.taxiId?.plateNumber || "-" },
          { title: "Start Location", dataIndex: "startLocation" },
          { title: "End Location", dataIndex: "endLocation" },
          {
            title: "Start Time",
            render: (_, r) => dayjs(r.startTime).format("YYYY-MM-DD HH:mm"),
          },
          {
            title: "End Time",
            render: (_, r) => dayjs(r.endTime).format("YYYY-MM-DD HH:mm"),
          },
          { title: "Distance (km)", dataIndex: "distanceDriven" },
          { title: "Fuel Used (L)", dataIndex: "fuelUsed" },
          { title: "Status", dataIndex: "deliveryStatus" },
          { title: "Delay Reason", dataIndex: "delayReason" },
          {
            title: "Trip Status",
            dataIndex: "tripStatus",
            key: "tripStatus",
            render: (status) => {
              const colorMap = {
                ongoing: "blue",
                completed: "green",
                cancelled: "red",
              };
              return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
            },
          },
          {
            title: "Map",
            render: (_, r) => (
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() =>
                  navigate(
                    `/trip-map?start=${encodeURIComponent(
                      r.startLocation
                    )}&end=${encodeURIComponent(r.endLocation)}`
                  )
                }
              />
            ),
          },

          {
            title: "Actions",
            render: (_, r) => (
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  icon={<EditOutlined />}
                  type="text"
                  onClick={() => handleEdit(r)}
                />
                <Popconfirm
                  title="Delete this trip?"
                  onConfirm={() => handleDelete(r._id)}
                >
                  <Button icon={<DeleteOutlined />} type="text" danger />
                </Popconfirm>
              </div>
            ),
          },
        ]}
        dataSource={filteredTrips}
        rowKey="_id"
        loading={loading}
      />

      <Modal
        okButtonProps={{ disabled: !formValid }}
        open={isModalOpen}
        title={editingTrip ? "Edit Trip" : "Add Trip"}
        onCancel={() => {
          setEditingTrip(null);
          setIsModalOpen(false);
          setFilteredTaxis([]);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFieldsChange={() => {
            const hasErrors = form
              .getFieldsError()
              .some(({ errors }) => errors.length > 0);
            setFormValid(!hasErrors);
          }}
        >
          {" "}
          <Form.Item
            name="driverId"
            label="Driver"
            rules={[{ required: true, message: "Please select a driver" }]}
          >
            <Select
              placeholder="Select Driver"
              onChange={onDriverChange}
              allowClear
            >
              {drivers.map((d) => (
                <Option key={d._id} value={d._id}>
                  {d.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="taxiId"
            label="Taxi"
            rules={[{ required: true, message: "Please select a taxi" }]}
          >
            <Select
              placeholder={
                filteredTaxis.length === 0
                  ? "Select a driver first"
                  : "Select Taxi"
              }
              disabled={filteredTaxis.length === 0}
              allowClear
            >
              {filteredTaxis.map((t) => (
                <Option key={t._id} value={t._id}>
                  {t.plateNumber}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="startLocation"
            label="Start Location"
            rules={[{ required: true, message: "Please enter start location" }]}
          >
            <AddressAutoComplete />
          </Form.Item>
          <Form.Item
            name="endLocation"
            label="End Location"
            rules={[{ required: true, message: "Please enter end location" }]}
          >
            <AddressAutoComplete />
          </Form.Item>
          <Form.Item
            name="startTime"
            label="Start Time"
            rules={[{ required: true, message: "Please select start time" }]}
          >
            <DatePicker
              showTime
              style={{ width: "100%" }}
              format="YYYY-MM-DD HH:mm"
            />
          </Form.Item>
          <Form.Item
            name="endTime"
            label="End Time"
            rules={[{ required: true, message: "Please select end time" }]}
          >
            <DatePicker
              showTime
              style={{ width: "100%" }}
              format="YYYY-MM-DD HH:mm"
            />
          </Form.Item>
          <Form.Item
            name="distanceDriven"
            label="Distance Driven (km)"
            rules={[
              { required: true, message: "Please enter distance driven" },
              {
                type: "number",
                min: 0,
                message: "Distance must be positive",
              },
            ]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
          <Form.Item
            name="fuelUsed"
            label="Fuel Used (L)"
            rules={[
              { required: true, message: "Please enter fuel used" },
              {
                type: "number",
                min: 0,
                message: "Fuel used must be positive",
              },
            ]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
          <Form.Item
            name="deliveryStatus"
            label="Delivery Status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select placeholder="Select status">
              <Option value="on-time">On-Time</Option>
              <Option value="delayed">Delayed</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="delayReason"
            label="Delay Reason"
            dependencies={["deliveryStatus"]}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (getFieldValue("deliveryStatus") === "delayed" && !value) {
                    return Promise.reject(
                      new Error("Please specify delay reason")
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input.TextArea
              disabled={form.getFieldValue("deliveryStatus") !== "delayed"}
            />
          </Form.Item>
          <Form.Item
            name="tripStatus"
            label="Trip Status"
            rules={[{ required: true, message: "Please select a trip status" }]}
          >
            <Select placeholder="Select trip status" allowClear>
              <Option value="ongoing">Ongoing</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={alertSeverity}
          sx={{ width: "100%" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default TripsPage;
