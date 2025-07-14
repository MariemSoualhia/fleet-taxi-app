import { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Divider,
  Row,
  Col,
  Spin,
  Space,
} from "antd";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const Alert = MuiAlert;

function ProfilePage() {
  const { user, login, logout } = useAuth();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone,
      });
    }
  }, [user]);

  const handleProfileUpdate = async (values) => {
    try {
      setLoading(true);
      const res = await axios.put(
        `http://localhost:5000/api/users/${user.id}`,
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      login(res.data.user, res.data.token);
      setAlertSeverity("success");
      setAlertMessage("Profile updated successfully.");
    } catch {
      setAlertSeverity("error");
      setAlertMessage("Error updating profile.");
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handlePasswordChange = async (values) => {
    try {
      setLoading(true);
      await axios.put(
        `http://localhost:5000/api/users/${user.id}/change-password`,
        values,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAlertSeverity("success");
      setAlertMessage("Password changed successfully.");
      passwordForm.resetFields();
    } catch (err) {
      setAlertSeverity("error");
      setAlertMessage(
        err.response?.data?.message || "Error changing password."
      );
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    logout();
    navigate("/");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return;
    try {
      const formData = new FormData();
      formData.append("profileImage", selectedFile);
      const res = await axios.put(
        `http://localhost:5000/api/users/${user.id}/profile-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      login(res.data.user, res.data.token);
      setAlertSeverity("success");
      setAlertMessage("Profile photo updated.");
    } catch {
      setAlertSeverity("error");
      setAlertMessage("Error updating profile photo.");
    } finally {
      setSnackbarOpen(true);
    }
  };

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: "0 auto" }}>
      <Title level={2} style={{ textAlign: "center", color: "#1890ff" }}>
        My Profile
      </Title>

      <Row gutter={24}>
        <Col xs={24} md={8}>
          <Card title="User Info" bordered>
            <div style={{ textAlign: "center" }}>
              <img
                src={
                  previewImage || `http://localhost:5000${user?.profileImage}`
                }
                alt="Profile"
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginBottom: 16,
                }}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <Button
                type="primary"
                onClick={handleImageUpload}
                style={{ marginTop: 8 }}
                disabled={!selectedFile}
              >
                Update Photo
              </Button>
            </div>

            <Divider />

            <Space direction="vertical" size="small">
              <Text strong>Name:</Text> <Text>{user?.name}</Text>
              <Text strong>Email:</Text> <Text>{user?.email}</Text>
              <Text strong>Phone:</Text> <Text>{user?.phone || "—"}</Text>
              {user.role === "superAdmin" && (
                <>
                  <Text strong>Company:</Text>
                  <Text>{user?.companyDetails?.companyName || "—"}</Text>
                </>
              )}
              {user.role === "driver" && (
                <>
                  <Text strong>License Number:</Text>
                  <Text>{user?.driverDetails?.licenseNumber || "—"}</Text>
                  <Text strong>Status:</Text>
                  <Text>{user?.driverDetails?.status || "—"}</Text>
                </>
              )}
              <Text strong>Role:</Text> <Text>{user?.role}</Text>
              <Button danger style={{ marginTop: 16 }} onClick={handleLogout}>
                Logout
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card title="Edit Profile" style={{ marginBottom: 24 }}>
            <Form form={form} layout="vertical" onFinish={handleProfileUpdate}>
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <Form.Item name="phone" label="Phone">
                <Input />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card title="Change Password">
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordChange}
            >
              <Form.Item
                name="currentPassword"
                label="Current Password"
                rules={[{ required: true }]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[{ required: true }]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Change Password
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

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
  );
}

export default ProfilePage;
