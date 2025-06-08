// TripMapPage.jsx
import { useSearchParams, useNavigate } from "react-router-dom";
import TripMapModal from "./TripMapModal";
import { Card, Typography, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function TripMapPage() {
  const [params] = useSearchParams();
  const start = params.get("start");
  const end = params.get("end");
  const navigate = useNavigate();

  if (!start || !end) return <p>Missing coordinates</p>;

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginRight: 16 }}
        >
          Back
        </Button>
        <Title level={3} style={{ margin: 0 }}>
          Trip Map
        </Title>
      </div>

      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        }}
      >
        <TripMapModal startLocation={start} endLocation={end} />
      </Card>
    </div>
  );
}
