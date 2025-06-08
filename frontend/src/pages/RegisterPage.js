import { Form, Input, Button, Typography, Select } from "antd";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const { Title } = Typography;
const { Option } = Select;
const Alert = MuiAlert;

function RegisterPage() {
  const navigate = useNavigate();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const onFinish = async (values) => {
    try {
      await registerUser(values);
      setAlertSeverity("success");
      setAlertMessage("Registration successful! You can now log in.");
      setSnackbarOpen(true);
      setTimeout(() => navigate("/"), 1000); // petite pause avant de rediriger
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Registration failed. Please try again.";

      setAlertSeverity("error");
      setAlertMessage(msg);
      setSnackbarOpen(true);
    }
  };

  return (
    <div className="body-login">
      <div className="login-page">
        <Title level={3} style={{ textAlign: "center", color: "#52c41a" }}>
          Create Account
        </Title>

        <Form name="register" onFinish={onFinish} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Full Name" />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ required: true }]}>
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select placeholder="Select role">
              <Option value="manager">Manager</Option>
              <Option value="logisticsOperator">Logistics Operator</Option>
              <Option value="companyOwner">Company Owner</Option>
              <Option value="supervisor">Supervisor</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              style={{ backgroundColor: "#52c41a" }}
            >
              Register
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center", marginTop: 10 }}>
          You have an account? <a href="/">Login here</a>
        </div>

        {/* Snackbar toast */}
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
    </div>
  );
}

export default RegisterPage;
