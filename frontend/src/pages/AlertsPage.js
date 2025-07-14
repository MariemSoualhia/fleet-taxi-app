import { useEffect, useState } from "react";
import { Table, Button, Tag, Popconfirm, Select, Tooltip } from "antd";
import { CheckCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { useAuth } from "../context/AuthContext";

const Alert = MuiAlert;
const { Option } = Select;

function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const { user } = useAuth();

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/alerts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolve = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/alerts/${id}/resolve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAlertSeverity("success");
      setAlertMessage("Alert resolved successfully!");
      setSnackbarOpen(true);
      fetchAlerts(); // Refresh alerts
    } catch (error) {
      setAlertSeverity("error");
      setAlertMessage(error.response?.data?.message || "Error resolving alert");
      setSnackbarOpen(true);
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    return (
      (!filterType || alert.type === filterType) &&
      (!filterStatus || alert.status === filterStatus)
    );
  });

  const columns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        let color = "blue";
        if (type === "fuelOverconsumption") color = "volcano";
        else if (type === "excessiveDelay") color = "red";
        else if (type === "maintenanceNeeded") color = "orange";
        return <Tag color={color}>{type.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
    },
    {
      title: "Taxi",
      dataIndex: ["taxiId", "plateNumber"],
      key: "taxi",
      render: (_, record) =>
        record.taxiId ? (
          <>
            <div>
              <b>Plate:</b> {record.taxiId.plateNumber}
            </div>
            <div>
              <b>Model:</b> {record.taxiId.model || "N/A"}
            </div>
          </>
        ) : (
          <i>—</i>
        ),
    },
    {
      title: "Admin",
      dataIndex: ["admin", "name"],
      key: "admin",
      render: (name) => name || <i>—</i>,
    },
    {
      title: "Super Admin",
      dataIndex: ["superAdmin", "name"],
      key: "superAdmin",
      render: (name) => name || <i>—</i>,
    },
    {
      title: "Related Trip",
      dataIndex: "relatedTripId",
      key: "relatedTrip",
      render: (trip) =>
        trip ? (
          <>
            <div>
              <b>Start:</b>{" "}
              {trip.startTime
                ? new Date(trip.startTime).toLocaleString()
                : "N/A"}
            </div>
            <div>
              <b>End:</b>{" "}
              {trip.endTime ? new Date(trip.endTime).toLocaleString() : "N/A"}
            </div>
            <div>
              <b>Status:</b> {trip.deliveryStatus || "N/A"}
            </div>
          </>
        ) : (
          <i>—</i>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "red" : "green"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) =>
        record.status === "active" ? (
          <Popconfirm
            title="Mark this alert as resolved?"
            onConfirm={() => handleResolve(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" icon={<CheckCircleOutlined />} size="small">
              Resolve
            </Button>
          </Popconfirm>
        ) : (
          <span>—</span>
        ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <h2>Alerts Management</h2>

      <div
        style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}
      >
        <div>
          <label style={{ fontSize: 12 }}>Type</label>
          <Select
            placeholder="Filter by Type"
            style={{ width: 200 }}
            allowClear
            value={filterType}
            onChange={setFilterType}
          >
            <Option value="fuelOverconsumption">Fuel Overconsumption</Option>
            <Option value="excessiveDelay">Excessive Delay</Option>
            <Option value="maintenanceNeeded">Maintenance Needed</Option>
          </Select>
        </div>

        <div>
          <label style={{ fontSize: 12 }}>Status</label>
          <Select
            placeholder="Filter by Status"
            style={{ width: 200 }}
            allowClear
            value={filterStatus}
            onChange={setFilterStatus}
          >
            <Option value="active">Active</Option>
            <Option value="resolved">Resolved</Option>
          </Select>
        </div>

        <Tooltip title="Reset Filters">
          <Button
            shape="circle"
            icon={<ReloadOutlined />}
            onClick={() => {
              setFilterType("");
              setFilterStatus("");
            }}
            style={{ marginTop: 22 }}
          />
        </Tooltip>
      </div>

      <Table
        columns={columns}
        dataSource={filteredAlerts}
        loading={loading}
        rowKey="_id"
      />

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

export default AlertsPage;
