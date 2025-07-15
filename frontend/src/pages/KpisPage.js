import { useEffect, useState } from "react";
import { Card, Row, Col, Spin } from "antd";
import axios from "axios";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { motion } from "framer-motion";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const Alert = MuiAlert;

function KpisPage() {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  const fetchKpis = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/kpis/overview", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKpis(res.data);
    } catch (error) {
      setAlertSeverity("error");
      setAlertMessage(error.response?.data?.message || "Error loading KPIs");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKpis();
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (loading || !kpis) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  const avgDistancePerTrip =
    kpis.totalTrips > 0
      ? (kpis.totalDistanceDriven / kpis.totalTrips).toFixed(2)
      : 0;

  const taxisData = {
    labels: ["Available Taxis", "In Maintenance"],
    datasets: [
      {
        data: [kpis.availableTaxis, kpis.inMaintenanceTaxis],
        backgroundColor: ["#52c41a", "#faad14"],
      },
    ],
  };

  const tripsData = {
    labels: ["On-Time Deliveries", "Delayed Deliveries"],
    datasets: [
      {
        data: [kpis.onTimeTrips, kpis.delayedTrips],
        backgroundColor: ["#1890ff", "#ff4d4f"],
      },
    ],
  };

  const tripsPerDayData = {
    labels: kpis.tripsPerDay.map((trip) => trip._id),
    datasets: [
      {
        label: "Number of Trips",
        data: kpis.tripsPerDay.map((trip) => trip.count),
        backgroundColor: "#1890ff",
      },
    ],
  };

  const tripsPerDayOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };
  const reportTypeCounts = {
    custom: 0,
    daily: 0,
    weekly: 0,
  };

  kpis.reportsByType.forEach((r) => {
    reportTypeCounts[r._id] = r.count;
  });

  const reportPieData = {
    labels: ["Custom", "Daily", "Weekly"],
    datasets: [
      {
        data: [
          reportTypeCounts.custom,
          reportTypeCounts.daily,
          reportTypeCounts.weekly,
        ],
        backgroundColor: ["#722ed1", "#1890ff", "#faad14"],
      },
    ],
  };

  return (
    <div style={{ padding: "24px", background: "#f7f9fc", minHeight: "100vh" }}>
      <h2
        style={{ textAlign: "center", marginBottom: "24px", color: "#1890ff" }}
      >
        Fleet Overview KPIs
      </h2>

      <Row gutter={[16, 16]} justify="center">
        <Col xs={24} sm={8}>
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <Card
              bordered={false}
              style={{
                textAlign: "center",
                borderRadius: "12px",
                height: "120px",
              }}
            >
              <h3>Total Drivers</h3>
              <h1
                style={{
                  marginTop: "10px",
                  fontSize: "28px",
                  color: "#52c41a",
                }}
              >
                {kpis.totalDrivers}
              </h1>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} sm={8}>
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <Card
              bordered={false}
              style={{
                textAlign: "center",
                borderRadius: "12px",
                height: "120px",
              }}
            >
              <h3>Total Taxis</h3>
              <h1
                style={{
                  marginTop: "10px",
                  fontSize: "28px",
                  color: "#faad14",
                }}
              >
                {kpis.totalTaxis}
              </h1>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} sm={8}>
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <Card
              bordered={false}
              style={{
                textAlign: "center",
                borderRadius: "12px",
                height: "120px",
              }}
            >
              <h3>Total Trips</h3>
              <h1
                style={{
                  marginTop: "10px",
                  fontSize: "28px",
                  color: "#1890ff",
                }}
              >
                {kpis.totalTrips}
              </h1>
            </Card>
          </motion.div>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: "40px" }} justify="center">
        <Col xs={24} md={6}>
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <Card
              title="Trips Made Per Day"
              style={{ borderRadius: "12px", height: "400px" }}
            >
              <Bar
                data={tripsPerDayData}
                options={tripsPerDayOptions}
                height={300}
              />
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} md={6}>
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <Card
              title="Total Distance Driven"
              style={{
                borderRadius: "12px",
                height: "400px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  marginTop: "140px",
                  fontSize: "26px",
                  fontWeight: "bold",
                  color: "#722ed1",
                }}
              >
                {kpis.totalDistanceDriven} km
              </div>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} md={6}>
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <Card
              title="Avg Distance per Trip"
              style={{
                borderRadius: "12px",
                height: "400px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  marginTop: "140px",
                  fontSize: "26px",
                  fontWeight: "bold",
                  color: "#13c2c2",
                }}
              >
                {avgDistancePerTrip} km
              </div>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} md={6}>
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <Card
              title="Taxis Status"
              style={{ borderRadius: "12px", height: "400px" }}
            >
              <Pie data={taxisData} height={300} />
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} md={6}>
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <Card
              title="Trips Delivery Status"
              style={{ borderRadius: "12px", height: "400px" }}
            >
              <Pie data={tripsData} height={300} />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={8}>
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <Card
              bordered={false}
              style={{
                textAlign: "center",
                borderRadius: "12px",
                height: "120px",
              }}
            >
              <h3>Total Reports</h3>
              <h1
                style={{
                  marginTop: "10px",
                  fontSize: "28px",
                  color: "#eb2f96",
                }}
              >
                {kpis.totalReports}
              </h1>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} md={6}>
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <Card
              title="Reports by Type"
              style={{ borderRadius: "12px", height: "400px" }}
            >
              <Pie data={reportPieData} height={300} />
            </Card>
          </motion.div>
        </Col>
      </Row>

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

export default KpisPage;
