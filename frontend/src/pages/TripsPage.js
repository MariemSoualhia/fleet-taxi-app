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
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");
  const [form] = Form.useForm();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [filterDriver, setFilterDriver] = useState("");
  const [filterTruck, setFilterTruck] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterStartLocation, setFilterStartLocation] = useState("");

  const handleCloseSnackbar = () => setSnackbarOpen(false);

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

  const fetchDriversAndTrucks = async () => {
    try {
      const token = localStorage.getItem("token");
      const [driversRes, trucksRes] = await Promise.all([
        axios.get("http://localhost:5000/api/drivers", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/trucks", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setDrivers(driversRes.data);
      setTrucks(trucksRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTrips();
    fetchDriversAndTrucks();
  }, []);

  const onFinish = async (values) => {
    const token = localStorage.getItem("token");
    const payload = {
      ...values,
      startTime: values.startTime.toISOString(),
      endTime: values.endTime.toISOString(),
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
    } catch (error) {
      setAlertSeverity("error");
      setAlertMessage(
        error.response?.data?.message || "Error while saving trip"
      );
      setSnackbarOpen(true);
    }
  };

  const handleEdit = (trip) => {
    setEditingTrip(trip);
    form.setFieldsValue({
      ...trip,
      driverId: trip.driverId?._id,
      truckId: trip.truckId?._id,
      startTime: dayjs(trip.startTime),
      endTime: dayjs(trip.endTime),
    });
    setIsModalOpen(true);
  };

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

  const filteredTrips = trips.filter((trip) => {
    return (
      (!filterDriver || trip.driverId?.name === filterDriver) &&
      (!filterTruck || trip.truckId?.plateNumber === filterTruck) &&
      (!filterStatus || trip.deliveryStatus === filterStatus) &&
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
        <Select
          placeholder="Driver"
          style={{ width: 180 }}
          value={filterDriver}
          onChange={setFilterDriver}
          allowClear
        >
          {drivers.map((d) => (
            <Option key={d._id} value={d.name}>
              {d.name}
            </Option>
          ))}
        </Select>

        <Select
          placeholder="Truck"
          style={{ width: 180 }}
          value={filterTruck}
          onChange={setFilterTruck}
          allowClear
        >
          {trucks.map((t) => (
            <Option key={t._id} value={t.plateNumber}>
              {t.plateNumber}
            </Option>
          ))}
        </Select>

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

        <AddressAutoComplete
          value={filterStartLocation}
          onChange={setFilterStartLocation}
          placeholder="Start Location Filter"
        />

        <Tooltip title="Reset Filters">
          <Button
            shape="circle"
            icon={<ReloadOutlined />}
            onClick={() => {
              setFilterDriver("");
              setFilterTruck("");
              setFilterStatus("");
              setFilterStartLocation("");
            }}
          />
        </Tooltip>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Trip
        </Button>
      </div>

      <Table
        columns={[
          { title: "Driver", render: (_, r) => r.driverId?.name || "-" },
          { title: "Truck", render: (_, r) => r.truckId?.plateNumber || "-" },
          { title: "Start", dataIndex: "startLocation" },
          { title: "End", dataIndex: "endLocation" },
          {
            title: "Start Time",
            render: (_, r) => dayjs(r.startTime).format("YYYY-MM-DD HH:mm"),
          },
          {
            title: "End Time",
            render: (_, r) => dayjs(r.endTime).format("YYYY-MM-DD HH:mm"),
          },
          { title: "Distance (km)", dataIndex: "distanceDriven" },
          { title: "Fuel (L)", dataIndex: "fuelUsed" },
          { title: "Status", dataIndex: "deliveryStatus" },
          { title: "Reason", dataIndex: "delayReason" },
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
                  title="Delete trip?"
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
        open={isModalOpen}
        title={editingTrip ? "Edit Trip" : "Add Trip"}
        onCancel={() => {
          setEditingTrip(null);
          setIsModalOpen(false);
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="driverId"
            label="Driver"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select Driver">
              {drivers.map((d) => (
                <Option key={d._id} value={d._id}>
                  {d.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="truckId" label="Truck" rules={[{ required: true }]}>
            <Select placeholder="Select Truck">
              {trucks.map((t) => (
                <Option key={t._id} value={t._id}>
                  {t.plateNumber}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="startLocation"
            label="Start Address"
            rules={[{ required: true }]}
          >
            <AddressAutoComplete
              value={form.getFieldValue("startLocation")}
              onChange={(val) => form.setFieldValue("startLocation", val)}
              placeholder="Type an address (e.g. 10 rue...)"
            />
          </Form.Item>

          <Form.Item
            name="endLocation"
            label="End Address"
            rules={[{ required: true }]}
          >
            <AddressAutoComplete
              value={form.getFieldValue("endLocation")}
              onChange={(val) => form.setFieldValue("endLocation", val)}
              placeholder="Type an address (e.g. 1 avenue...)"
            />
          </Form.Item>

          <Form.Item
            name="startTime"
            label="Start Time"
            rules={[{ required: true }]}
          >
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="endTime"
            label="End Time"
            rules={[{ required: true }]}
          >
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="distanceDriven" label="Distance (km)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="fuelUsed" label="Fuel Used (L)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="deliveryStatus" label="Status">
            <Select>
              <Option value="on-time">On-Time</Option>
              <Option value="delayed">Delayed</Option>
            </Select>
          </Form.Item>

          <Form.Item name="delayReason" label="Delay Reason">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          {/* ⬇️ ADD THIS BUTTON HERE */}
          <Button
            type="dashed"
            block
            onClick={async () => {
              const values = form.getFieldsValue();
              const { startLocation, endLocation, truckId } = values;
              if (!startLocation || !endLocation || !truckId) {
                return alert(
                  "Please fill in start location, end location, and truck."
                );
              }
              try {
                const { data } = await axios.post(
                  "http://localhost:5000/api/trips/estimate",
                  { startLocation, endLocation, truckId },
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  }
                );
                alert(
                  `Estimated Distance: ${data.estimatedDistance.toFixed(
                    1
                  )} km\nEstimated Fuel: ${data.estimatedFuel.toFixed(1)} L`
                );
              } catch (e) {
                alert("No estimation available for this trip.");
              }
            }}
          >
            Estimate Fuel & Distance
          </Button>
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

export default TripsPage;
