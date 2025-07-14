import React from "react";
import { Form, Input, Button, message } from "antd";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function CreateAdmin({ onSuccess, onCancel }) {
  const { token } = useAuth();
  const [form] = Form.useForm();

  const handleFinish = async (values) => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/register-admin",
        {
          name: values.name,
          email: values.email,
          phone: values.phone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      message.success("Admin created successfully!");
      form.resetFields();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating admin:", error);
      const errMsg =
        error.response?.data?.message || "Error while creating admin";
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
          { type: "email", message: "Invalid email address" },
        ]}
      >
        <Input placeholder="email@example.com" />
      </Form.Item>

      <Form.Item
        name="phone"
        label="Phone"
        rules={[{ required: true, message: "Please enter the phone number" }]}
      >
        <Input placeholder="+1 123 456 7890" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
          Create
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </Form.Item>
    </Form>
  );
}

export default CreateAdmin;
