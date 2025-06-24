import { useEffect, useState } from "react";
import { db } from "../Utils/dataStorege.ts";
import { Card, Col, Form, Input, Row, Timeline, Typography } from "antd";
import dayjs from "dayjs";
import '../styles/fdpp.css'

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

    </div>
  );
};

export default EDPP;