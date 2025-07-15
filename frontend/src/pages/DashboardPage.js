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
  Spin,
} from "antd";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import {
  CarOutlined,
  AlertOutlined,
  TeamOutlined,
  LineChartOutlined,
  DashboardOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

function DashboardPage() {
  const { user, login, token } = useAuth();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [stats, setStats] = useState(null); // superadmin-stats
  const [kpis, setKpis] = useState(null); // overview KPIs
  const [assignedTaxis, setAssignedTaxis] = useState([]);
  const [loadingTaxis, setLoadingTaxis] = useState(false);
  const [loadingKpis, setLoadingKpis] = useState(false);

  // SuperAdmin: fetch stats + KPIs
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

      setLoadingKpis(true);
      fetch("http://localhost:5000/api/kpis/overview", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setKpis(data))
        .catch((err) => {
          console.error("Error fetching KPIs:", err);
          message.error("Failed to load KPIs");
        })
        .finally(() => setLoadingKpis(false));
    }
  }, [user, token]);

  // Driver: fetch assigned taxis
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

  const renderKpis = () => {
    if (!kpis) return null;

    return (
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={6}>
          <Card bordered hoverable>
            <DashboardOutlined style={{ fontSize: 28, color: "#722ed1" }} />
            <Title level={4}>{kpis.totalTrips}</Title>
            <Text>Total Trips</Text>
          </Card>
        </Col>

        <Col span={6}>
          <Card bordered hoverable>
            <LineChartOutlined style={{ fontSize: 28, color: "#13c2c2" }} />
            <Title level={4}>{kpis.totalDistanceDriven} km</Title>
            <Text>Total Distance Driven</Text>
          </Card>
        </Col>

        <Col span={6}>
          <Card bordered hoverable>
            <TeamOutlined style={{ fontSize: 28, color: "#52c41a" }} />
            <Title level={4}>{kpis.totalDrivers}</Title>
            <Text>Total Drivers</Text>
          </Card>
        </Col>

        <Col span={6}>
          <Card bordered hoverable>
            <CarOutlined style={{ fontSize: 28, color: "#1890ff" }} />
            <Title level={4}>{kpis.totalTaxis}</Title>
            <Text>Total Taxis</Text>
          </Card>
        </Col>

        <Col span={6}>
          <Card bordered hoverable>
            <CarOutlined style={{ fontSize: 28, color: "#faad14" }} />
            <Title level={4}>{kpis.availableTaxis}</Title>
            <Text>Available Taxis</Text>
          </Card>
        </Col>

        <Col span={6}>
          <Card bordered hoverable>
            <CarOutlined style={{ fontSize: 28, color: "#f5222d" }} />
            <Title level={4}>{kpis.inMaintenanceTaxis}</Title>
            <Text>Taxis in Maintenance</Text>
          </Card>
        </Col>

        <Col span={6}>
          <Card bordered hoverable>
            <AlertOutlined style={{ fontSize: 28, color: "#ff4d4f" }} />
            <Title level={4}>{kpis.delayedTrips}</Title>
            <Text>Delayed Trips</Text>
          </Card>
        </Col>

        <Col span={6}>
          <Card bordered hoverable>
            <AlertOutlined style={{ fontSize: 28, color: "#52c41a" }} />
            <Title level={4}>{kpis.onTimeTrips}</Title>
            <Text>On-Time Trips</Text>
          </Card>
        </Col>
      </Row>
    );
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

            {loadingKpis ? <Spin style={{ marginTop: 40 }} /> : renderKpis()}

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

      // Admin & Driver (inchangés)
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
        );

      default:
        return <Text>Role not recognized.</Text>;
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Welcome, {user?.name || "User"} 👋</Title>
      {renderContent()}
    </div>
  );
}

export default DashboardPage;
