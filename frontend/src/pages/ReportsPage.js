// src/pages/ReportsPage.js
import { useEffect, useRef, useState } from "react";
import {
  Button,
  Row,
  Col,
  Card,
  Spin,
  DatePicker,
  Form,
  Select,
  message,
  Checkbox,
} from "antd";
import { DownloadOutlined, FileExcelOutlined } from "@ant-design/icons";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import Chart from "chart.js/auto";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
const { RangePicker } = DatePicker;
const { Option } = Select;

const createReportEntry = async (
  reportType,
  periodStart,
  periodEnd,
  fileUrl,
  reportName,
  fileType,
  totalRecords
) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  try {
    await axios.post(
      "http://localhost:5000/api/reports",
      {
        generatedByUserId: user._id,
        reportType,
        reportName,
        fileType,
        totalRecords,
        reportPeriodStart: periodStart,
        reportPeriodEnd: periodEnd,
        fileUrl,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("✅ Report saved to database");
  } catch (error) {
    console.error(
      "❌ Error saving report:",
      error.response?.data || error.message
    );
  }
};

function ReportsPage() {
  const [trips, setTrips] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const chartRef = useRef(null);
  const chartInstance = useRef(null); // ✅ NE PAS mettre let chartInstance

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const [tripsRes, alertsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/trips", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/alerts", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setTrips(tripsRes.data);
      setAlerts(alertsRes.data);
    } catch (error) {
      console.error("Error fetching reports data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const generateExcelReport = (data, type) => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, type.toUpperCase());
    const fileName = `${type}_report_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
    saveAs(fileName);
  };

  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);
  const createChartAndGetImage = async ({ labels, data, title }) => {
    const canvas = chartRef.current;
    if (!canvas) return null;

    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    chartInstance.current = new Chart(canvas.getContext("2d"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: title,
            data,
            backgroundColor: ["#f56a00", "#1890ff", "#52c41a", "#722ed1"],
          },
        ],
      },
      options: {
        animation: false,
        responsive: false,
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 200));

    return canvas.toDataURL("image/png");
  };

  const generateChartImage = async () => {
    const canvas = chartRef.current;
    if (!canvas) return null;

    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    // Créer le graphique
    chartInstance.current = new Chart(canvas.getContext("2d"), {
      type: "bar",
      data: {
        labels: ["Fuel Overuse", "Delay", "Maintenance"],
        datasets: [
          {
            label: "Alert Count",
            data: [
              alerts.filter((a) => a.type === "fuelOverconsumption").length,
              alerts.filter((a) => a.type === "excessiveDelay").length,
              alerts.filter((a) => a.type === "maintenanceNeeded").length,
            ],
            backgroundColor: ["#f56a00", "#1890ff", "#52c41a"],
          },
        ],
      },
      options: {
        animation: false,
        responsive: false,
      },
    });

    // ✅ Petit délai pour que Chart.js termine le rendu
    await new Promise((resolve) => setTimeout(resolve, 200));

    // ✅ Pas besoin de html2canvas ici !
    const imgData = canvas.toDataURL("image/png");
    return imgData;
  };

  const generateBasicReport = async (type) => {
    const doc = new jsPDF();
    const today = new Date();
    let fileName = "";
    let data = [];
    let head = [];

    if (type === "trips") {
      doc.text("Trips Report", 14, 20);
      fileName = `trips_report_${today.toISOString().slice(0, 10)}.pdf`;
      data = trips.map((trip) => [
        trip.startLocation,
        trip.endLocation,
        new Date(trip.startTime).toLocaleDateString(),
        new Date(trip.endTime).toLocaleDateString(),
        trip.distanceDriven,
        trip.fuelUsed,
        trip.deliveryStatus,
      ]);
      head = [
        [
          "Start Location",
          "End Location",
          "Start Date",
          "End Date",
          "Distance (km)",
          "Fuel Used (L)",
          "Status",
        ],
      ];
      await createReportEntry(
        "trips",
        today,
        today,
        fileName,
        "Trips Report - " + today.toLocaleDateString(),
        "pdf",
        trips.length
      );
    } else if (type === "alerts") {
      doc.text("Alerts Report", 14, 20);
      fileName = `alerts_report_${today.toISOString().slice(0, 10)}.pdf`;
      data = alerts.map((alert) => [
        alert.type,
        alert.message,
        alert.status,
        new Date(alert.createdAt).toLocaleDateString(),
      ]);
      head = [["Type", "Message", "Status", "Date Created"]];
      await createReportEntry(
        "alerts",
        today,
        today,
        fileName,
        "Alerts Report - " + today.toLocaleDateString(),
        "pdf",
        alerts.length
      );
    } else if (type === "summary") {
      doc.text("Fleet Summary Report", 14, 20);
      autoTable(doc, {
        startY: 30,
        head: [["Metric", "Value"]],
        body: [
          ["Total Trips", trips.length],
          ["Total Alerts", alerts.length],
          [
            "On-Time Deliveries",
            trips.filter((t) => t.deliveryStatus === "on-time").length,
          ],
          [
            "Delayed Deliveries",
            trips.filter((t) => t.deliveryStatus === "delayed").length,
          ],
        ],
      });

      const fileName = `summary_report_${today.toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);

      await createReportEntry(
        "summary",
        today,
        today,
        fileName,
        "Fleet Summary Report - " + today.toLocaleDateString(),
        "pdf",
        1
      );
      return;
    }

    autoTable(doc, { head, body: data, startY: 30 });
    doc.save(fileName);
  };

  const handleCustomReport = async (values) => {
    const { dateRange, reportContent: sections, preview } = values;
    const [start, end] = dateRange;

    const doc = new jsPDF();
    doc.text("Custom Fleet Report", 14, 20);
    let y = 30;

    if (sections.includes("summary")) {
      doc.text("Fleet Summary", 14, y);
      autoTable(doc, {
        startY: y + 5,
        head: [["Metric", "Value"]],
        body: [
          ["Total Trips", trips.length],
          ["Total Alerts", alerts.length],
          [
            "On-Time Deliveries",
            trips.filter((t) => t.deliveryStatus === "on-time").length,
          ],
          [
            "Delayed Deliveries",
            trips.filter((t) => t.deliveryStatus === "delayed").length,
          ],
        ],
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    if (sections.includes("trips")) {
      doc.text("Trip Data", 14, y);
      autoTable(doc, {
        startY: y + 5,
        head: [
          [
            "Start",
            "End",
            "Start Time",
            "End Time",
            "Distance",
            "Fuel",
            "Status",
          ],
        ],
        body: trips
          .filter(
            (t) =>
              new Date(t.startTime) >= start.toDate() &&
              new Date(t.endTime) <= end.toDate()
          )
          .map((t) => [
            t.startLocation,
            t.endLocation,
            new Date(t.startTime).toLocaleDateString(),
            new Date(t.endTime).toLocaleDateString(),
            t.distanceDriven,
            t.fuelUsed,
            t.deliveryStatus,
          ]),
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    if (sections.includes("alerts")) {
      doc.text("Alert Logs", 14, y);
      autoTable(doc, {
        startY: y + 5,
        head: [["Type", "Message", "Status", "Date"]],
        body: alerts
          .filter(
            (a) =>
              new Date(a.createdAt) >= start.toDate() &&
              new Date(a.createdAt) <= end.toDate()
          )
          .map((a) => [
            a.type,
            a.message,
            a.status,
            new Date(a.createdAt).toLocaleDateString(),
          ]),
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    if (sections.includes("charts")) {
      try {
        // ➕ Chart 1 – Trip Summary
        const img1 = await createChartAndGetImage({
          labels: ["Total Trips", "On-Time", "Delayed"],
          data: [
            trips.length,
            trips.filter((t) => t.deliveryStatus === "on-time").length,
            trips.filter((t) => t.deliveryStatus === "delayed").length,
          ],
          title: "Trip Summary",
        });
        if (img1) {
          doc.addPage();
          doc.text("Trip Summary Chart", 14, 20);
          doc.addImage(img1, "PNG", 20, 30, 160, 100);
        }

        // ➕ Chart 2 – Delivery Status
        const img2 = await createChartAndGetImage({
          labels: ["On-Time", "Delayed"],
          data: [
            trips.filter((t) => t.deliveryStatus === "on-time").length,
            trips.filter((t) => t.deliveryStatus === "delayed").length,
          ],
          title: "Trip Delivery Status",
        });
        if (img2) {
          doc.addPage();
          doc.text("Delivery Status Chart", 14, 20);
          doc.addImage(img2, "PNG", 20, 30, 160, 100);
        }

        // ➕ Chart 3 – Alert Distribution
        const img3 = await createChartAndGetImage({
          labels: ["Fuel Overuse", "Delay", "Maintenance"],
          data: [
            alerts.filter((a) => a.type === "fuelOverconsumption").length,
            alerts.filter((a) => a.type === "excessiveDelay").length,
            alerts.filter((a) => a.type === "maintenanceNeeded").length,
          ],
          title: "Alert Distribution",
        });
        if (img3) {
          doc.addPage();
          doc.text("Alert Distribution Chart", 14, 20);
          doc.addImage(img3, "PNG", 20, 30, 160, 100);
        }
      } catch (error) {
        console.error("Chart image error:", error);
        message.error("Some charts could not be added to the PDF");
      }
    }

    const fileName = `custom_report_${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;
    preview ? doc.output("dataurlnewwindow") : doc.save(fileName);

    await createReportEntry(
      "custom",
      start.toDate(),
      end.toDate(),
      fileName,
      `Custom Report - ${start.format("YYYY-MM-DD")} to ${end.format(
        "YYYY-MM-DD"
      )}`,
      "pdf",
      0
    );

    message.success("Custom report generated and saved");
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <h2
        style={{
          textAlign: "center",
          marginBottom: "32px",
          color: "#1890ff",
          fontWeight: "bold",
        }}
      >
        Reports Management
      </h2>

      {/* Section 1 – Export Buttons */}
      <Card style={{ marginBottom: 40 }}>
        <h3>Quick Download</h3>
        <Row gutter={[16, 16]} justify="center">
          <Col>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => generateBasicReport("summary")}
              type="primary"
            >
              Download Summary
            </Button>
          </Col>
          <Col>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => generateBasicReport("trips")}
              type="primary"
            >
              Download Trips
            </Button>
          </Col>
          <Col>
            <Button
              icon={<FileExcelOutlined />}
              type="default"
              onClick={() => generateExcelReport(trips, "trips")}
            >
              Export Trips Excel
            </Button>
          </Col>
          <Col>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => generateBasicReport("alerts")}
              type="primary"
            >
              Download Alerts
            </Button>
          </Col>
          <Col>
            <Button
              icon={<FileExcelOutlined />}
              type="default"
              onClick={() => generateExcelReport(alerts, "alerts")}
            >
              Export Alerts Excel
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Section 2 – Custom Report Generator */}
      <Card
        title="Custom Report Generator"
        bordered
        style={{ maxWidth: 700, margin: "0 auto" }}
      >
        <Form layout="vertical" onFinish={handleCustomReport}>
          <Form.Item
            name="dateRange"
            label="Select Period"
            rules={[{ required: true, message: "Please select a date range" }]}
          >
            <RangePicker />
          </Form.Item>

          <Form.Item
            name="reportContent"
            label="Include in Report"
            rules={[
              { required: true, message: "Please choose at least one option" },
            ]}
          >
            <Select mode="multiple" placeholder="Select report sections">
              <Option value="summary">Summary</Option>
              <Option value="trips">Trips</Option>
              <Option value="alerts">Alerts</Option>
              <Option value="charts">Charts</Option>
            </Select>
          </Form.Item>

          <Form.Item name="preview" valuePropName="checked">
            <Checkbox>👀 Preview before downloading</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button htmlType="submit" type="primary" block>
              Generate Custom Report
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Hidden Canvas for Chart Image */}
      <canvas
        ref={chartRef}
        width={400}
        height={200}
        style={{
          position: "absolute",
          top: "-10000px",
          left: "-10000px",
          zIndex: -1,
          opacity: 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export default ReportsPage;
