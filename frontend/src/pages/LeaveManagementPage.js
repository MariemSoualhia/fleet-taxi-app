// src/pages/LeaveManagementPage.js
import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  message,
  Popconfirm,
  Calendar,
  Badge,
  ConfigProvider,
} from "antd";
import axios from "axios";
import { Tooltip } from "antd";

import { useAuth } from "../context/AuthContext";
import "./leave-calendar-style.css";

import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import "dayjs/locale/en";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.locale("en");

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
      message.error("Error loading leaves");
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
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      message.success(
        `Leave successfully ${status === "approved" ? "approved" : "rejected"}`
      );
      fetchLeaves();
    } catch (error) {
      message.error("Failed to update status");
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const approvedLeaves = leaves.filter((leave) => leave.status === "approved");

  const dateCellRender = (value) => {
    const current = dayjs(value);
    const leavesOnDate = approvedLeaves.filter((leave) => {
      const start = dayjs(leave.startDate);
      const end = dayjs(leave.endDate);
      return (
        current.isSameOrAfter(start, "day") &&
        current.isSameOrBefore(end, "day")
      );
    });

    // Unique par driver pour éviter doublons
    const uniqueLeaves = [];
    const seenDrivers = new Set();
    for (const leave of leavesOnDate) {
      if (!seenDrivers.has(leave.driver?._id)) {
        uniqueLeaves.push(leave);
        seenDrivers.add(leave.driver?._id);
      }
    }

    return (
      <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
        {uniqueLeaves.map((leave) => (
          <Tooltip
            key={leave._id}
            title={leave.driver?.name || "Driver"}
            placement="top"
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                border: "2px solid red",
                cursor: "pointer",
              }}
            />
          </Tooltip>
        ))}
      </div>
    );
  };

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

      <div
        style={{
          display: "flex",
          marginTop: 20,
          gap: 24 /* espace entre colonnes */,
        }}
      >
        {/* Table prend 2/3 */}
        <div style={{ flex: 2 }}>
          <Table
            dataSource={leaves}
            columns={columns}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 8 }}
            scroll={{ x: "max-content" }}
          />
        </div>

        {/* Calendrier prend 1/3 */}
        <div
          className="custom-calendar"
          style={{
            flex: 1,
            maxWidth: 400,
            minWidth: 300,
            height: 400,
            overflowY: "auto",
            border: "1px solid #f0f0f0",
            borderRadius: 6,
            padding: 16,
            boxShadow: "0 2px 8px rgb(0 0 0 / 0.1)",
            background: "white",
          }}
        >
          <h3>Approved Leaves Calendar</h3>
          <ConfigProvider>
            <Calendar fullscreen={false} dateCellRender={dateCellRender} />
          </ConfigProvider>
        </div>
      </div>
    </div>
  );
}

export default LeaveManagementPage;
