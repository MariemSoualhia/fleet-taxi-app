import React, { useEffect, useState } from "react";
import { Table, Tag, Card, Select, Button, Space, message } from "antd";
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

const { Option } = Select;

const MyTripsPageDriver = () => {
  const { token } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [tripStatusFilter, setTripStatusFilter] = useState("all");
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState("all");
  const navigate = useNavigate();

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/trips", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrips(res.data);
      setFilteredTrips(res.data);
    } catch (error) {
      console.error("Error fetching driver trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    let data = [...trips];
    if (tripStatusFilter !== "all") {
      data = data.filter((trip) => trip.tripStatus === tripStatusFilter);
    }
    if (deliveryStatusFilter !== "all") {
      data = data.filter(
        (trip) => trip.deliveryStatus === deliveryStatusFilter
      );
    }
    setFilteredTrips(data);
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    handleFilterChange();
  }, [tripStatusFilter, deliveryStatusFilter]);

  const handleStatusUpdate = async (tripId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/trips/${tripId}`,
        { tripStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("Trip status updated.");
      fetchTrips();
    } catch (err) {
      message.error("Error updating trip status.");
    }
  };

  const columns = [
    {
      title: "Taxi",
      dataIndex: ["taxiId", "plateNumber"],
      key: "taxi",
    },
    {
      title: "Start",
      dataIndex: "startLocation",
    },
    {
      title: "End",
      dataIndex: "endLocation",
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
      render: (value) => new Date(value).toLocaleString(),
    },
    {
      title: "End Time",
      dataIndex: "endTime",
      render: (value) => new Date(value).toLocaleString(),
    },
    {
      title: "Status",
      dataIndex: "tripStatus",
      render: (status, record) => (
        <Space>
          <Tag
            color={
              status === "completed"
                ? "green"
                : status === "ongoing"
                ? "blue"
                : "red"
            }
          >
            {status.toUpperCase()}
          </Tag>
          {status !== "completed" && (
            <Button
              size="small"
              onClick={() => handleStatusUpdate(record._id, "completed")}
            >
              Mark Completed
            </Button>
          )}
        </Space>
      ),
    },
    {
      title: "Delivery",
      dataIndex: "deliveryStatus",
      render: (status) => (
        <Tag color={status === "on-time" ? "green" : "orange"}>
          {status.toUpperCase()}
        </Tag>
      ),
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
  ];

  return (
    <Card
      title="My Trips"
      extra={
        <Space>
          <Select
            value={tripStatusFilter}
            onChange={setTripStatusFilter}
            style={{ width: 160 }}
          >
            <Option value="all">All Statuses</Option>
            <Option value="ongoing">Ongoing</Option>
            <Option value="completed">Completed</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
          <Select
            value={deliveryStatusFilter}
            onChange={setDeliveryStatusFilter}
            style={{ width: 160 }}
          >
            <Option value="all">All Deliveries</Option>
            <Option value="on-time">On-Time</Option>
            <Option value="delayed">Delayed</Option>
          </Select>
        </Space>
      }
    >
      <Table
        dataSource={filteredTrips}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 8 }}
      />
    </Card>
  );
};

export default MyTripsPageDriver;
