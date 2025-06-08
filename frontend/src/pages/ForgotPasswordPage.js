// src/pages/ForgotPasswordPage.js
import { Form, Input, Button, Typography } from "antd";
import { useState } from "react";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const { Title } = Typography;
const Alert = MuiAlert;

function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/users/forgot-password", {
        email: values.email,
      });
      setAlertSeverity("success");
      setAlertMessage("Temporary password sent to your email.");
    } catch (err) {
      setAlertSeverity("error");
      setAlertMessage(
        err.response?.data?.message || "Failed to reset password"
      );
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  return (
    <div className="body-login">
      <div className="login-page">
        <Title level={3} style={{ textAlign: "center", color: "#1890ff" }}>
          Forgot Password
        </Title>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Please enter your email" }]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{ backgroundColor: "#1890ff" }}
            >
              Send Temporary Password
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center", marginTop: 10 }}>
          <a href="/login">Back to Login</a>
        </div>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={alertSeverity}
            variant="filled"
          >
            {alertMessage}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
