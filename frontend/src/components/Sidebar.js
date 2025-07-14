import { Layout, Menu, Spin } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  CarOutlined,
  SolutionOutlined,
  UserAddOutlined,
  UserOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const { Sider } = Layout;

function Sidebar() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentKey = location.pathname.split("/")[1] || "dashboard";

  if (loading) {
    return (
      <Sider
        width={200}
        style={{
          background: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin />
      </Sider>
    );
  }

  const menuByRole = {
    superAdmin: [
      { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
      { key: "users", icon: <TeamOutlined />, label: "User Management" },
      { key: "admin-list", icon: <TeamOutlined />, label: "Admins" },
      {
        key: "usersapp",
        icon: <CheckCircleOutlined />,
        label: "Approve Users",
      },
      { key: "alerts", icon: <AlertOutlined />, label: "Alerts" },
      {
        key: "alerts-analytics",
        icon: <AlertOutlined />,
        label: "Alerts Analytics",
      },
      {
        key: "leaves",
        icon: <CalendarOutlined />,
        label: "Leave Management",
      },
    ],
    admin: [
      { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
      { key: "drivers", icon: <TeamOutlined />, label: "Drivers" },
      { key: "taxis", icon: <CarOutlined />, label: "Vehicles" },
      { key: "trips", icon: <SolutionOutlined />, label: "Trips" },
      { key: "alerts", icon: <AlertOutlined />, label: "Alerts" },

      {
        key: "alerts-analytics",
        icon: <AlertOutlined />,
        label: "Alerts Analytics",
      },
    ],
    driver: [
      { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
      { key: "my-trips", icon: <SolutionOutlined />, label: "My Trips" },
      {
        key: "leave-request",
        icon: <CalendarOutlined />,
        label: "My leave request",
      },
      { key: "profile", icon: <UserOutlined />, label: "My Profile" },
    ],
  };

  const role = user?.role || "driver";
  const menuItems = menuByRole[role] || [];

  const handleClick = (e) => {
    navigate(`/${e.key}`);
  };

  return (
    <Sider width={200} style={{ background: "#fff" }}>
      <Menu
        mode="inline"
        selectedKeys={[currentKey]}
        style={{ height: "100%", borderRight: 0 }}
        onClick={handleClick}
        items={menuItems}
      />
    </Sider>
  );
}

export default Sidebar;
