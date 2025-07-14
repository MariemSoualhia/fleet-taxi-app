import React, { useState, useEffect } from "react";
import { Form, Input, DatePicker, Button, message, Tag, List } from "antd";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const { RangePicker } = DatePicker;

function DriverLeaveRequestPage() {
  const [loading, setLoading] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/leaves/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaveRequests(res.data);
    } catch (error) {
      message.error("Failed to load leave requests");
    }
  };

  const onFinish = async (values) => {
    const [startDate, endDate] = values.dates;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/leaves/request",
        {
          startDate,
          endDate,
          reason: values.reason,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success("Leave request submitted successfully!");
      fetchLeaves(); // Refresh list
    } catch (error) {
      message.error(error.response?.data?.message || "Error submitting leave");
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "approved":
        return <Tag color="green">Approved</Tag>;
      case "rejected":
        return <Tag color="red">Rejected</Tag>;
      default:
        return <Tag color="orange">Pending</Tag>;
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 16 }}>My Leave Requests</h2>

      <List
        bordered
        dataSource={leaveRequests}
        locale={{ emptyText: "No leave requests yet." }}
        renderItem={(leave) => (
          <List.Item>
            <div style={{ flex: 1 }}>
              <strong>
                {new Date(leave.startDate).toLocaleDateString()} -{" "}
                {new Date(leave.endDate).toLocaleDateString()}
              </strong>
              <div>Reason: {leave.reason}</div>
            </div>
            <div>{getStatusTag(leave.status)}</div>
          </List.Item>
        )}
        style={{ marginBottom: 40 }}
      />

      <h2>Request a Leave</h2>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="dates"
          label="Select Dates"
          rules={[{ required: true, message: "Please select a date range" }]}
        >
          <RangePicker />
        </Form.Item>
        <Form.Item
          name="reason"
          label="Reason"
          rules={[{ required: true, message: "Please enter a reason" }]}
        >
          <Input.TextArea rows={4} placeholder="Explain your reason..." />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit Leave Request
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default DriverLeaveRequestPage;
