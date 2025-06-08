import { Form, Input, Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import "./login.css";
const { Title } = Typography;
const Alert = MuiAlert;

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const onFinish = async (values) => {
    try {
      const data = await loginUser(values.email, values.password);
      console.log("login terminé");
      if (data && data.token && data.user) {
        login(data.user, data.token); // utilise la fonction du contexte

        setAlertSeverity("success");
        setAlertMessage("Login successful!");
        setSnackbarOpen(true);

        navigate("/dashboard");
      } else {
        setAlertSeverity("error");
        setAlertMessage("Invalid server response");
        setSnackbarOpen(true);
      }
    } catch (error) {
      setAlertSeverity("error");
      setAlertMessage(
        error.response?.data?.message || "Invalid email or password"
      );
      setSnackbarOpen(true);
    }
  };

  return (
    <div className="body-login">
      <div className="login-page">
        <Title
          level={3}
          style={{ textAlign: "center", marginBottom: 24, color: "#1890ff" }}
        >
          FleetPulse Login
        </Title>

        <Form name="login" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              style={{ backgroundColor: "#1890ff" }}
            >
              Log in
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: "center", marginTop: 10 }}>
          Don't have an account? <a href="/register">Register here</a>
        </div>
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <a href="/forgot-password">Forgot Password?</a>
        </div>

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

export default LoginPage;
