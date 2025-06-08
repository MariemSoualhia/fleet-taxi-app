import { Layout, Menu, Spin } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  CarOutlined,
  SolutionOutlined,
  UserAddOutlined,
  UserOutlined,
  CheckCircleOutlined,
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
      { key: "admin-list", icon: <TeamOutlined />, label: "Admins" },
      { key: "create-admin", icon: <UserAddOutlined />, label: "Add Admin" },
      {
        key: "usersapp",
        icon: <CheckCircleOutlined />,
        label: "Approve Users",
      },
    ],
    admin: [
      { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
      { key: "drivers", icon: <TeamOutlined />, label: "Drivers" },
      { key: "vehicles", icon: <CarOutlined />, label: "Vehicles" },
      { key: "trips", icon: <SolutionOutlined />, label: "Trips" },
    ],
    driver: [
      { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
      { key: "my-trips", icon: <SolutionOutlined />, label: "My Trips" },
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
