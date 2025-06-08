import { Card, Row, Col, Typography } from "antd";
import { useAuth } from "../context/AuthContext";

const { Title, Text } = Typography;

function DashboardPage() {
  const { user } = useAuth();

  const renderContent = () => {
    switch (user?.role) {
      case "superadmin":
        return (
          <Row gutter={16}>
            <Col span={8}>
              <Card title="Total Admins" bordered={false}>
                {/* Remplacer par de vraies données */}
                <Text>5 admins</Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="System Logs" bordered={false}>
                <Text>45 logins this week</Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="System Settings" bordered={false}>
                <Text>Last backup: 3 hours ago</Text>
              </Card>
            </Col>
          </Row>
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
          <Row gutter={16}>
            <Col span={12}>
              <Card title="My Next Trip" bordered={false}>
                <Text>Pickup at 15:30 - Central Station</Text>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="My Vehicle" bordered={false}>
                <Text>Ford Transit - TX1234</Text>
              </Card>
            </Col>
          </Row>
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
