import { Layout } from "antd";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const { Content } = Layout;

function DashboardLayout() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Navbar />
      <Layout>
        <Sidebar />
        <Layout style={{ padding: "24px" }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: "#fff",
            }}
          >
            <Outlet /> {/* Les sous-pages viendront ici */}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default DashboardLayout;
