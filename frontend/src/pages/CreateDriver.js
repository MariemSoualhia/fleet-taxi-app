import React, { useEffect, useState } from "react";
import { Form, Input, Button, Select, message, DatePicker } from "antd";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const { Option } = Select;

const CreateDriver = ({ onSuccess, onCancel }) => {
  const { token } = useAuth();
  const [form] = Form.useForm();
  const [admins, setAdmins] = useState([]);

  // Fetch all admins of the current superAdmin
  const fetchAdmins = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/admins", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAdmins(res.data);
    } catch (err) {
      message.error("Failed to load admins.");
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleFinish = async (values) => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/register-driver-by-superadmin",
        {
          name: values.name,
          email: values.email,
          phone: values.phone,
          adminId: values.adminId,
          driverDetails: {
            licenseNumber: values.licenseNumber,
            hireDate: values.hireDate.format("YYYY-MM-DD"),
            status: values.status,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      message.success("Driver created successfully!");
      form.resetFields();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating driver:", error);
      const errMsg =
        error.response?.data?.message || "Failed to create driver.";
      message.error(errMsg);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      autoComplete="off"
    >
      <Form.Item
        name="name"
        label="Name"
        rules={[{ required: true, message: "Please enter the name" }]}
      >
        <Input placeholder="Full name" />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: "Please enter the email" },
          { type: "email", message: "Invalid email" },
        ]}
      >
        <Input placeholder="email@example.com" />
      </Form.Item>

      <Form.Item
        name="phone"
        label="Phone"
        rules={[{ required: true, message: "Please enter the phone number" }]}
      >
        <Input placeholder="+1 234 567 8900" />
      </Form.Item>

      <Form.Item
        name="licenseNumber"
        label="License Number"
        rules={[{ required: true, message: "Please enter license number" }]}
      >
        <Input placeholder="Enter license number" />
      </Form.Item>

      <Form.Item
        name="hireDate"
        label="Hire Date"
        rules={[{ required: true, message: "Please select hire date" }]}
      >
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name="status"
        label="Status"
        rules={[{ required: true, message: "Please select status" }]}
        initialValue="active"
      >
        <Select>
          <Option value="active">Active</Option>
          <Option value="inactive">Inactive</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="adminId"
        label="Assign to Admin"
        rules={[{ required: true, message: "Please select an admin" }]}
      >
        <Select placeholder="Select an admin">
          {admins.map((admin) => (
            <Option key={admin._id} value={admin._id}>
              {admin.name} ({admin.email})
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
          Create
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </Form.Item>
    </Form>
  );
};

export default CreateDriver;
