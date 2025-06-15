import React, { useEffect, useState } from "react";
import { Table, Button, Space, notification, Modal, Form, Input, Select, List, message } from "antd";
import { DeleteOutlined, ExclamationCircleOutlined, PlusOutlined, UploadOutlined, CloseCircleOutlined, EyeOutlined } from "@ant-design/icons";
import "../styles/documents.css";
import { getAllDocuments, getModules } from "../Utils/moduleStorage";
import { useDropzone, Accept } from "react-dropzone";
import { Typography } from "antd";
import "../styles/documents.css";
import { db } from "../Utils/dataStorege.ts";
import { v4 as uuidv4 } from 'uuid';
const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface Document {
    id: number;
    documentName: string;
    fileName: string;
    milestone: string;
    description: string;
    actions: string[];
}
interface Module {
    moduleName: string;
    activities: any
}

const Document: React.FC = () => {
    const [documents, setDocuments] = useState<any>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
    const [documentName, setDocumentName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [milestone, setMilestone] = useState<string>("");
    const [linkedActivity, SetLinkedActivity] = useState<string>("");
    const [files, setFiles] = useState<File[]>([]);
    const [_milestones, setMilestones] = useState<Module[]>([]);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [modulesData, setModulesData] = useState<Module[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [activityDocs, setActivityDocs] = useState<string[]>([]);
    const [selectedDocName, setSelectedDocName] = useState<string | null>(null);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewContent, setPreviewContent] = useState<string | null>(null);

    useEffect(() => {
        const savedDocuments = getAllDocuments();
        setDocuments(savedDocuments);
    }, []);

    useEffect(() => {
        const savedModules = getModules();
        if (Array.isArray(savedModules)) {
            setMilestones(savedModules);
        }
    }, []);

    useEffect(() => {
        db.getModules().then(setModulesData);
    }, []);

    useEffect(() => {
        db.getAllDocuments().then(setDocuments);
    }, []);

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

    const columns: any = [
        {
            title: "Id",
            dataIndex: "id",
            key: "id",
            width: "10%",
        },
        {
            title: "Document Name",
            dataIndex: "documentname",
            key: "documentname",
            width: "20%",
            align: "left",
        },
        {
            title: "Milestone",
            dataIndex: "milestone",
            key: "milestone",
            width: "30%",
            align: "left",
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            width: "30%",
            align: "left",
        },
        {
            title: "Actions",
            key: "actions",
            width: "10%",
            render: (_: any, record: any) => (
                <Space size="middle" style={{ display: "flex", gap: "28px", justifyContent: "center" }}>
                    {record.files && record.files.length > 0 && (
                        <Button
                            className="view-btn"
                            icon={<EyeOutlined />}
                            onClick={() => handlePreview(record)}
                            size="small"
                        />

                    )}
                    <Button
                        className="delete-btn"
                        icon={<DeleteOutlined />}
                        onClick={() => showDeleteModal(record.id)}
                        danger
                        size="small"
                    />
                </Space>
            ),
        },
    ];

    const showDeleteModal = (id: number) => {
        setSelectedDocumentId(id);
        setIsModalVisible(true);
    };

    const handleDelete = async () => {
        if (selectedDocumentId !== null) {
            await db.deleteDocument(selectedDocumentId);
            const updatedDocs = await db.getAllDocuments();
            setDocuments(updatedDocs);

            notification.success({
                message: "Document Deleted",
                description: "The document has been successfully deleted.",
            });

            setIsModalVisible(false);
            setSelectedDocumentId(null);
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setSelectedDocumentId(null);
    };

    const onDrop = (acceptedFiles: File[]) => {
        setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: 'image/*,application/pdf' as unknown as Accept,
        multiple: true,
    });

    const handleSave = async () => {
        if (!milestone || files.length === 0 || !linkedActivity) {
            message.error("Please fill all fields and upload files.");
            return;
        }

        const encodedFiles: { docId: string; name: string; path: string }[] = [];

        try {
            for (const file of files) {
                const docId = uuidv4();
                await saveFileToDisk(file, docId);
                encodedFiles.push({
                    docId,
                    name: file.name,
                    path: `documents/${docId}`
                });
            }

            const documentGUID = uuidv4();
            const userRaw = localStorage.getItem("user");
            const user = userRaw ? JSON.parse(userRaw) : null;

            if (!user) {
                message.error("User information is missing in local storage.");
                return;
            }

            const newDocumentEntry = {
                guid: documentGUID,
                documentName,
                description,
                milestone,
                linkedActivity,
                linkedDoc: selectedDocName || null,
                files: encodedFiles,
                uploadedAt: new Date().toISOString(),
                uploadedBy: {
                    userId: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    company: user.company,
                },
            };

            await db.documents.add(newDocumentEntry);
            message.success("Document saved successfully!");
            const updatedDocs = await db.getAllDocuments();
            setDocuments(updatedDocs);
            setIsAddModalVisible(false);
            resetForm();
        } catch (error) {
            message.error("Failed to save document.");
            console.error(error);
        }
    };

    const resetForm = () => {
        setDocumentName("");
        setDescription("");
        setMilestone("");
        SetLinkedActivity("");
        setSelectedDocName(null);
        setFiles([]);
    };

    async function saveFileToDisk(file: File, fileId: string) {
        const reader = new FileReader();

        reader.onload = async function () {
            const base64 = reader.result as string;
            const filePath = `documents/${fileId}`;

            const existing = await db.diskStorage.where("path").equals(filePath).first();
            if (!existing) {
                await db.diskStorage.add({ path: filePath, content: base64 });
            } else {
                console.log(`File already exists in diskStorage: ${filePath}`);
            }
        };

        reader.readAsDataURL(file);
    }

    const handleCancelAddedDoc = () => {
        setDocumentName("");
        setDescription("");
        setMilestone("");
        setFiles([]);
        setIsAddModalVisible(false);
    };

    const handleRemoveFile = (indexToRemove: number) => {
        setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
    };

    const handleAddDocument = () => {
        setIsAddModalVisible(true);
    };

    return (
        <>
            <div className="main-doc-container">
                <div className="document-table-container">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px" }}>
                        <p className="table-title">Documents</p>
                        <Button type="primary" className="bg-secondary" size="small" icon={<PlusOutlined />} onClick={handleAddDocument}>
                            Add Document
                        </Button>
                    </div>
                    <Table
                        columns={columns}
                        dataSource={documents}
                        rowKey="id"
                        bordered
                        pagination={false}
                        className="custom-table"
                    />
                </div>
            </div>

            <Modal
                title="Confirm Delete"
                visible={isModalVisible}
                onOk={handleDelete}
                onCancel={handleCancel}
                okText="Delete"
                cancelText="Cancel"
                okType="danger"
            >
                <p>
                    <ExclamationCircleOutlined style={{ color: "red", marginRight: "8px" }} />
                    Are you sure you want to delete this document? This action cannot be undone.
                </p>
            </Modal>

            <Modal title="Create Document" centered className="modal-container" width={"65%"} visible={isAddModalVisible} onCancel={handleCancelAddedDoc} onOk={handleSave} okText="Save" cancelText="Cancel" okButtonProps={{ className: "bg-secondary" }}>
                <Form layout="horizontal" onFinish={handleSave} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} requiredMark={false}>
                    <div className="main-doc-container" style={{ width: "99%" }}>
                        <div className="left-create-document">
                            <div className="main-create-doc-container">
                                <div className="left-create-document-item">
                                    <Form.Item
                                        label={<span style={{ textAlign: "left" }}> Select Milestone </span>}
                                        name="milestone"
                                        rules={[{ required: true, message: "Milestone is required" }]}
                                        labelAlign="left"
                                        colon={false}
                                    >
                                        <Select
                                            placeholder="Select Milestone"
                                            value={milestone}
                                            onChange={(value) => {
                                                setMilestone(value);
                                                const selectedModule = modulesData.find(mod => mod.moduleName === value);
                                                const activities = selectedModule?.activities || [];
                                                setActivities(activities);
                                                SetLinkedActivity("");
                                                setActivityDocs([]);
                                                setSelectedDocName(null);
                                            }}
                                            style={{ marginBottom: "15px" }}
                                        >
                                            {modulesData.map((module, index) => (
                                                <Option key={index} value={module.moduleName}>
                                                    {module.moduleName}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>

                                    <Form.Item
                                        label={<span style={{ textAlign: "left" }}> Linked Activity </span>}
                                        name="linked-activity"
                                        rules={[{ required: true, message: "Linked-Activity is required" }]}
                                        labelAlign="left"
                                        colon={false}
                                    >
                                        <Select
                                            placeholder="Select Linked Activity"
                                            value={linkedActivity}
                                            onChange={(value) => {
                                                SetLinkedActivity(value);
                                                const selectedActivity = activities.find(act => act.activityName === value);
                                                setActivityDocs(selectedActivity?.documents || []);
                                                setSelectedDocName(null);
                                            }}
                                        >
                                            {activities.map((activity, index) => (
                                                <Option key={index} value={activity.activityName}>
                                                    {activity.activityName}
                                                </Option>
                                            ))}
                                        </Select>

                                    </Form.Item>

                                    <Form.Item
                                        label="Document Name"
                                        name="documentname"
                                        labelAlign="left"
                                        colon={false}
                                    >
                                        <Select
                                            placeholder="Select Document Name"
                                            value={selectedDocName}
                                            onChange={setSelectedDocName}
                                            allowClear
                                        >
                                            {activityDocs.map((doc, index) => (
                                                <Option key={index} value={doc}>
                                                    {doc}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>

                                    <Form.Item
                                        label={<span style={{ textAlign: "left" }}> Description </span>}
                                        name="description"
                                        rules={[{ required: true, message: "Description is required" }]}
                                        labelAlign="left"
                                        colon={false}
                                    >
                                        <TextArea
                                            rows={4}
                                            placeholder="Description"
                                            value={description}
                                            style={{ marginBottom: "15px" }}
                                            onChange={(e) => setDescription(e.target.value)}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label={<span style={{ textAlign: "left" }}> Upload Files </span>}
                                        name="files"
                                        // rules={[{ required: files.length === 0, message: "Please upload at least one file" }]}
                                        labelAlign="left"
                                        colon={false}
                                    >
                                        <div
                                            {...getRootProps()}
                                            style={{
                                                border: "2px dashed #d9d9d9",
                                                padding: 16,
                                                textAlign: "center",
                                                borderRadius: 8,
                                                cursor: "pointer",
                                                background: isDragActive ? "#f0f8ff" : "#fafafa",
                                            }}
                                        >
                                            <input {...getInputProps()} />
                                            <UploadOutlined style={{ fontSize: 32, color: "#1890ff" }} />
                                            <Text style={{ display: "block", marginTop: 8 }}>
                                                {isDragActive
                                                    ? "Drop the files here..."
                                                    : "Drag and drop files here, or click to select files"}
                                            </Text>
                                        </div>
                                    </Form.Item>

                                    {files.length > 0 && (
                                        <List
                                            dataSource={files}
                                            renderItem={(file, index) => (
                                                <List.Item
                                                    actions={[
                                                        <CloseCircleOutlined
                                                            key="remove"
                                                            onClick={() => handleRemoveFile(index)}
                                                            style={{ color: "#888" }}
                                                        />,
                                                    ]}
                                                >
                                                    <Text>{file.name}</Text>
                                                </List.Item>
                                            )}
                                        />
                                    )}

                                </div>
                            </div>

                        </div>
                    </div>
                </Form>
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

        </>
    );
};

export default Document;
