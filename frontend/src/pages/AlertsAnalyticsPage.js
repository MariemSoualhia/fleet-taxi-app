// src/pages/AlertsAnalyticsPage.js
import { useEffect, useState } from "react";
import { Row, Col, Card, Spin } from "antd";
import { Pie, Bar } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
);

function AlertsAnalyticsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/alerts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts(res.data.alerts || res.data); // ⚡ selon ton backend
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  const totalAlerts = alerts.length;
  const activeAlerts = alerts.filter((a) => a.status === "active").length;
  const resolvedAlerts = alerts.filter((a) => a.status === "resolved").length;

  const typeCounts = alerts.reduce((acc, alert) => {
    acc[alert.type] = (acc[alert.type] || 0) + 1;
    return acc;
  }, {});

  const pieData = {
    labels: Object.keys(typeCounts),
    datasets: [
      {
        data: Object.values(typeCounts),
        backgroundColor: ["#fa541c", "#ff4d4f", "#faad14"],
      },
    ],
  };

  const alertsByDay = alerts.reduce((acc, alert) => {
    const date = new Date(alert.createdAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const barData = {
    labels: Object.keys(alertsByDay),
    datasets: [
      {
        label: "Alerts Created",
        data: Object.values(alertsByDay),
        backgroundColor: "#1890ff",
      },
    ],
  };

  return (
    <div style={{ padding: "24px" }}>
      <h2
        style={{ textAlign: "center", marginBottom: "24px", color: "#1890ff" }}
      >
        Alerts Analytics
      </h2>

      <Row gutter={[16, 16]} justify="center">
        <Col xs={24} sm={8}>
          <Card
            bordered={false}
            style={{ textAlign: "center", borderRadius: "12px" }}
          >
            <h3>Total Alerts</h3>
            <h1 style={{ fontSize: "28px", color: "#fa541c" }}>
              {totalAlerts}
            </h1>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            bordered={false}
            style={{ textAlign: "center", borderRadius: "12px" }}
          >
            <h3>Active Alerts</h3>
            <h1 style={{ fontSize: "28px", color: "#ff4d4f" }}>
              {activeAlerts}
            </h1>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            bordered={false}
            style={{ textAlign: "center", borderRadius: "12px" }}
          >
            <h3>Resolved Alerts</h3>
            <h1 style={{ fontSize: "28px", color: "#52c41a" }}>
              {resolvedAlerts}
            </h1>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: "40px" }} justify="center">
        <Col xs={24} md={12}>
          <Card title="Alerts by Type" style={{ borderRadius: "12px" }}>
            <Pie data={pieData} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Alerts Created Per Day" style={{ borderRadius: "12px" }}>
            <Bar data={barData} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AlertsAnalyticsPage;
