// src/pages/LeaveManagementPage.js
import React, { useEffect, useState } from "react";
import { Table, Tag, Button, message, Popconfirm } from "antd";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function LeaveManagementPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/leaves", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaves(res.data);
    } catch (error) {
      message.error("Error fetching leaves");
    } finally {
      setLoading(false);
    }
  };

  const updateLeaveStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      const url =
        status === "approved"
          ? `http://localhost:5000/api/leaves/${id}`
          : `http://localhost:5000/api/leaves/${id}/reject`;

      await axios.put(
        url,
        {}, // Pas besoin de body
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      message.success(`Leave ${status} successfully`);
      fetchLeaves(); // Refresh the list
    } catch (error) {
      message.error("Failed to update leave status");
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const columns = [
    {
      title: "Driver",
      dataIndex: ["driver", "name"],
      key: "driver",
    },
    {
      title: "Dates",
      key: "dates",
      render: (_, record) =>
        `${new Date(record.startDate).toLocaleDateString()} - ${new Date(
          record.endDate
        ).toLocaleDateString()}`,
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color =
          status === "pending"
            ? "orange"
            : status === "approved"
            ? "green"
            : "red";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) =>
        record.status === "pending" ? (
          <>
            <Popconfirm
              title="Approve this leave?"
              onConfirm={() => updateLeaveStatus(record._id, "approved")}
            >
              <Button type="primary" size="small" style={{ marginRight: 8 }}>
                Approve
              </Button>
            </Popconfirm>

            <Popconfirm
              title="Reject this leave?"
              onConfirm={() => updateLeaveStatus(record._id, "rejected")}
            >
              <Button danger size="small">
                Reject
              </Button>
            </Popconfirm>
          </>
        ) : (
          <span>—</span>
        ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Leave Management</h2>
      <Table
        dataSource={leaves}
        columns={columns}
        rowKey="_id"
        loading={loading}
      />
    </div>
  );
}

export default LeaveManagementPage;
