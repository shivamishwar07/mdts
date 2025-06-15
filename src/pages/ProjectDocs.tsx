import { Table, Card, Typography, Tooltip, Row, Col, Modal, Button, Space, message } from "antd";
import { BellOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import "../styles/ProjectDocs.css";
import { useEffect, useState } from "react";
import { db } from "../Utils/dataStorege.ts";
const { Text, Title } = Typography;

const ProjectDocs = (project: any) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [_projectDetails, setProjectDetails] = useState<any>({});
    const [documents, setDocuments] = useState<any[]>([]);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewContent, setPreviewContent] = useState<string | null>(null);
    const showModal = () => setIsModalVisible(true);
    const handleOk = () => setIsModalVisible(false);
    const handleCancel = () => setIsModalVisible(false);

    const dataSummary = [
        { count: 15, label: "Notification" },
        { count: 8, label: "Letters" },
        { count: 12, label: "Review Meeting MoM" },
        { count: 25, label: "Approved NFAs" },
    ];

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

        const fetchDocuments = async () => {
            const allDocs = await db.getAllDocuments();
            setDocuments(allDocs);
        };

        if (project?.code) {
            getProjectDetails();
            fetchDocuments();
        }
    }, [project?.code]);


    const handlePreview = async (record: any) => {
        if (record.files && record.files.length > 0) {
            const filePath = record.files[0]?.path;
            const fileData = await db.getDiskEntry(filePath);

            if (fileData) {
                setPreviewContent(fileData);
                setPreviewVisible(true);
            } else {
                message.error("File not found in IndexedDB.");
            }
        }
    };

    const gradientColors = [
        "linear-gradient(135deg, #74ebd5, #ACB6E5)",
        "linear-gradient(135deg, #ff9a9e, #fad0c4)",
        "linear-gradient(135deg, #a18cd1, #fbc2eb)",
        "linear-gradient(135deg, #fddb92, #d1fdff)",
    ];

    const columns: any = [
        {
            title: "Doc. Name",
            dataIndex: "documentname",
            render: (_: any, record: any) => {
                if (record.documentName?.trim()) {
                    return record.documentName;
                }
                if (record.files && record.files.length > 0) {
                    return record.files.map((file: any) => file.name).join(", ");
                }
                return "Unnamed Document";
            }
        },
        {
            title: "Date Of Issuance",
            dataIndex: "uploadedAt",
            render: (text: string) => new Date(text).toLocaleDateString(),
        },
        {
            title: "Type",
            dataIndex: "linkedDoc",
        },
        {
            title: "Linked Activity",
            dataIndex: "linkedActivity",
        },
        {
            title: "Milestone",
            dataIndex: "milestone",
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button icon={<EyeOutlined />} onClick={() => handlePreview(record)} size="small" />
                    <Button icon={<DeleteOutlined />} size="small" disabled />
                </Space>
            ),
        },
    ];

    return (
        <div className="project-document-cont">
            <div className="header-row">
                <Title level={3} style={{ margin: 0 }}>Project Documents</Title>
                <Tooltip title="Whats New">
                    <BellOutlined onClick={showModal} className="bell-notif" />
                </Tooltip>
            </div>

            <Row gutter={[16, 16]} className="summary-cards-flex">
                {dataSummary.map((item, index) => (
                    <Col xs={12} sm={12} md={6} key={index}>
                        <Card
                            className="summary-card"
                            hoverable
                            style={{ background: gradientColors[index % gradientColors.length] }}
                        >
                            <Text className="count">{item.count}</Text>
                            <br />
                            <Text className="label">{item.label}</Text>
                        </Card>

                    </Col>
                ))}
            </Row>

            <div className="table-data">
                <Table
                    columns={columns}
                    dataSource={documents}
                    pagination={false}
                    className="document-table"
                    bordered
                    rowKey="guid"
                />
            </div>

            <Modal title="What's New" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} footer={null} className="modal-container">
                <div style={{ padding: "10px" }}>
                    <p><strong>BH review meeting MoM</strong> dated <strong>17-05-2024</strong> has been uploaded!</p>
                    <p>New document types and filters are now available.</p>
                </div>
            </Modal>

            <Modal
                visible={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                footer={null}
                width="80%"
                bodyStyle={{ height: '75vh' }}
                title="Preview Document"
                className="modal-container"
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px", height: "calc(100vh - 180px)" }}>
                    {previewContent?.startsWith("data:application/pdf") ? (
                        <iframe
                            src={previewContent}
                            title="PDF Preview"
                            width="100%"
                            height="100%"
                            style={{ border: "none" }}
                        />
                    ) : previewContent?.startsWith("data:image/") ? (
                        <img
                            src={previewContent}
                            alt="Document Preview"
                            style={{ maxWidth: "100%", maxHeight: "100%" }}
                        />
                    ) : (
                        <div>
                            <p>Preview not available for this file type. Please download to view.</p>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default ProjectDocs;