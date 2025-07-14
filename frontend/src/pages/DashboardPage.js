import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  Statistic,
  message,
  List,
} from "antd";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

const { Title, Text } = Typography;

function DashboardPage() {
  const { user, login, token } = useAuth();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [stats, setStats] = useState(null);
  const [assignedTaxis, setAssignedTaxis] = useState([]);
  const [loadingTaxis, setLoadingTaxis] = useState(false);

  useEffect(() => {
    if (user?.role === "superAdmin" && token) {
      fetch("http://localhost:5000/api/users/superadmin-stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch((err) => {
          console.error("Error fetching stats:", err);
          message.error("Failed to load statistics");
        });
    }
  }, [user, token]);

  // Récupérer les taxis assignés si role = driver
  useEffect(() => {
    const fetchAssignedTaxis = async () => {
      if (user?.role === "driver" && token) {
        setLoadingTaxis(true);
        try {
          const res = await fetch(
            `http://localhost:5000/api/taxis/assigned-driver/${user.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const data = await res.json();
          setAssignedTaxis(data);
        } catch (error) {
          console.error("Error fetching assigned taxis:", error);
          message.error("Failed to load assigned taxis");
        } finally {
          setLoadingTaxis(false);
        }
      }
    };

    fetchAssignedTaxis();
  }, [user, token]);

  const showEditModal = () => {
    form.setFieldsValue(user?.companyDetails);
    setIsModalVisible(true);
  };

  const handleUpdate = async (values) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/users/update-company/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ companyDetails: values }),
        }
      );

      const data = await res.json();
      login(data.user, data.token);
      setIsModalVisible(false);
      message.success("Company information updated.");
    } catch (err) {
      console.error("Error updating company info:", err.message);
      message.error("Failed to update company info");
    }
  };

  const renderContent = () => {
    switch (user?.role) {
      case "superAdmin":
        return (
          <>
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Total Admins"
                    value={stats?.admins || 0}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Total Drivers"
                    value={stats?.drivers || 0}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Approved Drivers"
                    value={stats?.approvedUsers || 0}
                    valueStyle={{ color: "#faad14" }}
                  />
                </Card>
              </Col>
            </Row>

            <Row style={{ marginTop: 32 }}>
              <Col span={24}>
                <Card
                  title="Company Information"
                  bordered={false}
                  extra={
                    <Button type="link" onClick={showEditModal}>
                      Edit
                    </Button>
                  }
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <p>
                        <strong>Name:</strong>{" "}
                        {user?.companyDetails?.companyName || "-"}
                      </p>
                      <p>
                        <strong>Email:</strong>{" "}
                        {user?.companyDetails?.companyEmail || "-"}
                      </p>
                      <p>
                        <strong>Phone:</strong>{" "}
                        {user?.companyDetails?.companyPhone || "-"}
                      </p>
                    </Col>
                    <Col span={12}>
                      <p>
                        <strong>Address:</strong>{" "}
                        {user?.companyDetails?.companyAddress || "-"}
                      </p>
                      <p>
                        <strong>Website:</strong>{" "}
                        {user?.companyDetails?.website || "-"}
                      </p>
                      <p>
                        <strong>Description:</strong>{" "}
                        {user?.companyDetails?.description || "-"}
                      </p>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>

            <Modal
              title="Edit Company Information"
              open={isModalVisible}
              onCancel={() => setIsModalVisible(false)}
              onOk={() => form.submit()}
              okText="Save"
            >
              <Form form={form} layout="vertical" onFinish={handleUpdate}>
                <Form.Item name="companyName" label="Company Name">
                  <Input />
                </Form.Item>
                <Form.Item name="companyEmail" label="Company Email">
                  <Input />
                </Form.Item>
                <Form.Item name="companyPhone" label="Company Phone">
                  <Input />
                </Form.Item>
                <Form.Item name="companyAddress" label="Company Address">
                  <Input />
                </Form.Item>
                <Form.Item name="website" label="Website">
                  <Input />
                </Form.Item>
                <Form.Item name="description" label="Description">
                  <Input.TextArea rows={3} />
                </Form.Item>
              </Form>
            </Modal>
          </>
        );

      case "admin":
        return (
          <Row gutter={16}>
            <Col span={8}>
              <Card title="My Drivers" bordered={false}>
                <Text>12 drivers</Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Active Trips" bordered={false}>
                <Text>4 ongoing</Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Alerts" bordered={false}>
                <Text>2 pending alerts</Text>
              </Card>
            </Col>
          </Row>
        );

      case "driver":
        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Card title="My Next Trip" bordered={false}>
                  <Text>Pickup at 15:30 - Central Station</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card
                  title="My Vehicle(s)"
                  bordered={false}
                  loading={loadingTaxis}
                >
                  {assignedTaxis.length === 0 ? (
                    <Text>No taxi assigned</Text>
                  ) : (
                    <List
                      dataSource={assignedTaxis}
                      renderItem={(taxi) => (
                        <List.Item key={taxi._id}>
                          <Text strong>{taxi.model}</Text> - Plate:{" "}
                          {taxi.plateNumber} - Status:{" "}
                          {taxi.status === "available"
                            ? "Available"
                            : taxi.status === "inMaintenance"
                            ? "In Maintenance"
                            : taxi.status}
                        </List.Item>
                      )}
                    />
                  )}
                </Card>
              </Col>
            </Row>
          </>
        );

      default:
        return <Text>Role not recognized.</Text>;
    }
  };

  return (
    <div>
      <Title level={2}>Welcome, {user?.name || "User"} 👋</Title>
      {renderContent()}
    </div>
  );
}

export default DashboardPage;
