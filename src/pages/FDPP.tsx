import { useEffect, useState } from "react";
import { db } from "../Utils/dataStorege.ts";
import { Card, Col, Form, Input, List, Modal, Row, Timeline, Tooltip, Typography } from "antd";
import dayjs from "dayjs";
import '../styles/fdpp.css'
import { CloseCircleOutlined, DownloadOutlined } from "@ant-design/icons";
import { ToastContainer } from "react-toastify";
import { notify } from "../Utils/ToastNotify.tsx";
const { Title } = Typography;

const EDPP = (project: any) => {
  const [projectDetails, setProjectDetails] = useState<any>({});

  useEffect(() => {
    const getProjectDetails = async () => {
      try {
        let storedData = await db.getProjects();
        storedData = storedData.filter((item: any) => item.id === project.code);
        if (!Array.isArray(storedData) || storedData.length === 0) {
          console.warn("No projects found.");
          setProjectDetails({});
          return;
        }

        setProjectDetails(storedData[0]);
      } catch (error) {
        console.error("An unexpected error occurred while fetching projects:", error);
      }
    };

    if (project?.code) {
      getProjectDetails();
    }
  }, [project?.code]);

  const formatValue = (value: any) => {
    if (value && typeof value === 'object' && value.$isDayjsObject) {
      return dayjs(value.$d).format('YYYY-MM-DD');
    }
    return value !== null && value !== undefined ? String(value) : "";
  };

  const handleDeleteDocument = (docId: any) => {
    Modal.confirm({
      title: "Delete Document?",
      content: "Are you sure you want to delete this document? This action cannot be undone.",
      okText: "Yes, Delete",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const updatedDocs = projectDetails.documents.filter((d: any) => d.id !== docId);

          const updatedProjectDetails = {
            ...projectDetails,
            documents: updatedDocs,
          };
          await db.updateProject(project.code, updatedProjectDetails);
          setProjectDetails(updatedProjectDetails);

          notify.success("Document deleted successfully.");
        } catch (error) {
          notify.error("Failed to delete document.");
        }
      },
    });
  };


  const capitalizeLabel = (label: any) =>
    label
      .replace(/([A-Z])/g, " $1")
      .trim()
      .replace(/\b\w/g, (char: any) => char.toUpperCase());

  return (
    <div className="edpp-main-cont">
      <Card title="Project Details" style={{ marginBottom: 20 }}>
        <Form layout="horizontal" labelCol={{ span: 8, style: { textAlign: 'left' } }} wrapperCol={{ span: 16 }}>
          <Row gutter={16}>
            {projectDetails?.projectParameters &&
              Object.entries(projectDetails.projectParameters).map(([key, value]) => (
                <Col span={12} key={key}>
                  <Form.Item
                    label={<span style={{ fontWeight: 'bold' }}>{capitalizeLabel(key)}</span>}
                    colon={false}
                  >
                    <Input value={formatValue(value)} readOnly />
                  </Form.Item>
                </Col>
              ))}
          </Row>
        </Form>
      </Card>

      <Card title="Location Details" style={{ marginBottom: 20 }}>
        <Form layout="horizontal" labelCol={{ span: 8, style: { textAlign: 'left' } }} wrapperCol={{ span: 16 }}>
          <Row gutter={16}>
            {projectDetails?.locations &&
              Object.entries(projectDetails.locations).map(([key, value]) => (
                <Col span={12} key={key}>
                  <Form.Item
                    label={<span style={{ fontWeight: 'bold' }}>{capitalizeLabel(key)}</span>}
                    colon={false}
                  >
                    <Input value={formatValue(value)} readOnly />
                  </Form.Item>
                </Col>
              ))}
          </Row>
        </Form>
      </Card>

      <Card title="Contractual Details" style={{ marginBottom: 20 }}>
        <Form layout="horizontal" labelCol={{ span: 8, style: { textAlign: 'left' } }} wrapperCol={{ span: 16 }}>
          <Row gutter={16}>
            {projectDetails?.contractualDetails &&
              Object.entries(projectDetails.contractualDetails).map(([key, value]) => (
                <Col span={12} key={key}>
                  <Form.Item
                    label={<span style={{ fontWeight: 'bold' }}>{capitalizeLabel(key)}</span>}
                    colon={false}
                  >
                    <Input value={formatValue(value)} readOnly />
                  </Form.Item>
                </Col>
              ))}
          </Row>
        </Form>
        {projectDetails?.documents?.length > 0 && (
          <div style={{ marginTop: 30 }}>
            <Title level={5} style={{ marginBottom: 16, fontWeight: "600", color: "#333" }}>
              📎 Attached Contractual Documents
            </Title>

            <List
              dataSource={projectDetails.documents}
              bordered
              itemLayout="horizontal"
              renderItem={(doc: any) => (
                <List.Item
                  style={{
                    padding: "16px 24px",
                    background: "#f9f9f9",
                    borderRadius: 8,
                    marginBottom: 12,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                  actions={[
                    <Tooltip title="Download">
                      <DownloadOutlined
                        style={{ fontSize: 20, color: "green", cursor: "pointer" }}
                        onClick={() => {
                          const file = doc.files[0];
                          const url = URL.createObjectURL(file);
                          const link = document.createElement("a");
                          link.href = url;
                          link.download = file.name;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          URL.revokeObjectURL(url);
                        }}
                      />
                    </Tooltip>,
                    <Tooltip title="Delete">
                      <CloseCircleOutlined
                        style={{ fontSize: 20, color: "red", cursor: "pointer" }}
                        onClick={() => handleDeleteDocument(doc.id)}
                      />
                    </Tooltip>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <span style={{ fontWeight: 600 }}>{doc.documentName}</span>
                    }
                    description={
                      <span style={{ fontSize: 13, color: "#666" }}>
                        Uploaded on: {new Date(doc.uploadedAt).toLocaleString()}
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}
      </Card>

      <Card title="Initial Status - Activities" style={{ marginBottom: 20 }}>
        {projectDetails?.initialStatus?.library && (
          <Title level={5}>{formatValue(projectDetails.initialStatus.library)}</Title>
        )}
        <Timeline>
          {projectDetails?.initialStatus?.items?.[0]?.activities?.map((activity: any) => (
            <Timeline.Item key={activity.code}>
              <strong>{formatValue(activity.activityName)}</strong> - Duration: {formatValue(activity.duration)} days
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>
      <ToastContainer />
    </div>
  );
};

export default EDPP;