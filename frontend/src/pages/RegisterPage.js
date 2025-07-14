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
  const [selectedRole, setSelectedRole] = useState(null);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const onFinish = async (values) => {
    try {
      await registerUser(values);
      setAlertSeverity("success");
      setAlertMessage("Registration successful! You can now log in.");
      setSnackbarOpen(true);
      setTimeout(() => navigate("/"), 1000);
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
            <Select
              placeholder="Select role"
              onChange={(value) => setSelectedRole(value)}
            >
              <Option value="superAdmin">Super Admin</Option>
              {/* D'autres rôles ici si besoin */}
            </Select>
          </Form.Item>

          {selectedRole === "superAdmin" && (
            <>
              <Form.Item
                name={["companyDetails", "companyName"]}
                label="Company Name"
                rules={[
                  { required: true, message: "Company name is required" },
                ]}
              >
                <Input placeholder="Company Name" />
              </Form.Item>

              <Form.Item
                name={["companyDetails", "companyAddress"]}
                label="Company Address"
              >
                <Input placeholder="Company Address" />
              </Form.Item>

              <Form.Item
                name={["companyDetails", "companyEmail"]}
                label="Company Email"
              >
                <Input placeholder="Company Email" />
              </Form.Item>

              <Form.Item
                name={["companyDetails", "companyPhone"]}
                label="Company Phone"
              >
                <Input placeholder="Company Phone" />
              </Form.Item>

              <Form.Item
                name={["companyDetails", "website"]}
                label="Company Website"
              >
                <Input placeholder="Company Website" />
              </Form.Item>

              <Form.Item
                name={["companyDetails", "description"]}
                label="Company Description"
              >
                <Input.TextArea placeholder="Company Description" />
              </Form.Item>
            </>
          )}

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
