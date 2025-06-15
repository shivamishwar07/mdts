import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, Typography, Row, Col, Divider, Button, Tooltip, Avatar, Space } from "antd";
import { ArrowLeftOutlined, BellOutlined, BellFilled } from "@ant-design/icons";

interface User {
  name: string;
  profilePhoto?: string;
  company?: string;
  project?: string;
  mobile?: string;
  email?: string;
  whatsapp?: string;
  registrationDate?: string;
}

interface Notifications {
  mobile: boolean;
  email: boolean;
  whatsapp: boolean;
}

const ViewUser: React.FC = () => {

  const location = useLocation();
  const { user } = location.state as { user?: User };
  const [notifications, _setNotifications] = useState<Notifications>({
    mobile: true,
    email: false,
    whatsapp: true,
  });

  if (!user) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#f0f4f8", padding: "20px" }}>
        <Typography.Text>No user data available</Typography.Text>
      </div>
    );
  }

  const getNotificationIcon = (status: boolean) => {
    return status ? (
      <BellFilled style={{ color: "#4caf50" }} />
    ) : (
      <BellOutlined style={{ color: "#f44336" }} />
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh", backgroundColor: "#f0f4f8", padding: "20px" }}>
      <Card
        style={{
          width: "100%",
          maxWidth: 800,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          borderRadius: "16px",
          backgroundColor: "#ffffff",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "16px" }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => window.history.back()}
            style={{
              backgroundColor: "#e3f2fd",
              borderColor: "#bbdefb",
              color: "#1976d2",
              boxShadow: "none",
            }}
          >
            Back
          </Button>
        </div>

        {/* User Profile Picture */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: "24px" }}>
          <Avatar
            src={user.profilePhoto || ""}
            alt={user.name || "User"}
            size={100}
            style={{
              marginRight: "16px",
              backgroundColor: "#e0e0e0",
            }}
          >
            {user.name ? user.name.charAt(0).toUpperCase() : "?"}
          </Avatar>
          <div>
            <Typography.Title level={3} style={{ fontWeight: "bold", color: "#1976d2", marginBottom: "8px" }}>
              {user.name || "User Name"}
            </Typography.Title>
          </div>
        </div>

        <Divider style={{ marginBottom: "20px" }} />

        {/* User Info */}
        <Row gutter={16}>
          {[
            { label: "Name", value: user.name },
            { label: "Company", value: user.company },
            { label: "Project", value: user.project },
            { label: "Mobile", value: user.mobile, notificationKey: "mobile" },
            { label: "Email", value: user.email, notificationKey: "email" },
            { label: "WhatsApp", value: user.whatsapp, notificationKey: "whatsapp" },
            { label: "Registration Date", value: user.registrationDate },
          ].map((item, index) => (
            <React.Fragment key={index}>
              <Col span={8}>
                <Typography.Text
                  style={{ fontWeight: "bold", fontSize: "1.1rem", color: "#595959" }}
                >
                  {item.label}:
                </Typography.Text>
              </Col>
              <Col span={16}>
                <Typography.Text
                  style={{
                    fontSize: "1.1rem",
                    color: item.label === "Email" ? "#1565c0" : "inherit",
                    wordBreak: "break-word",
                  }}
                >
                  {item.value || "N/A"}
                </Typography.Text>
                {item.notificationKey && (
                  <Tooltip
                    title={
                      notifications[item.notificationKey as keyof Notifications]
                        ? "Notification Enabled"
                        : "Notification Disabled"
                    }
                    arrow
                  >
                    <Space style={{ marginLeft: "8px" }}>
                      {getNotificationIcon(
                        notifications[item.notificationKey as keyof Notifications]
                      )}
                    </Space>
                  </Tooltip>
                )}
              </Col>
            </React.Fragment>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default ViewUser;
