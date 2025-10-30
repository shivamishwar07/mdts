import React, { useEffect, useState } from "react";
import { Table, Button, Space, notification, Modal, Form, Input, Select, List } from "antd";
import { DeleteOutlined, ExclamationCircleOutlined, PlusOutlined, UploadOutlined, CloseCircleOutlined, EyeOutlined } from "@ant-design/icons";
import "../styles/documents.css";
import { getAllDocuments, getModules } from "../Utils/moduleStorage";
import { useDropzone, Accept } from "react-dropzone";
import { Typography } from "antd";
import "../styles/documents.css";
import { db } from "../Utils/dataStorege.ts";
import { v4 as uuidv4 } from "uuid";
import { ToastContainer } from "react-toastify";
import { notify } from "../Utils/ToastNotify.tsx";

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface Module {
    moduleName: string;
    activities: any;
}

const Document: React.FC = () => {
    const [documents, setDocuments] = useState<any[]>([]);
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

    const [docTypes, setDocTypes] = useState<any[]>([]);
    const [docType, setDocType] = useState<string | null>(null);
    const [addTypeVisible, setAddTypeVisible] = useState(false);
    const [newTypeName, setNewTypeName] = useState("");

    useEffect(() => {
        db.getAllDocTypes().then(setDocTypes);
    }, []);

    const handleAddType = async () => {
        const name = newTypeName.trim();
        if (!name) {
            notification.warning({ message: "Please enter a type name" });
            return;
        }
        try {
            const id = await db.addDocType(name);
            const list = await db.getAllDocTypes();
            setDocTypes(list);
            const added = await db.docTypes.get(id);
            setDocType(added?.name || null);
            setNewTypeName("");
            setAddTypeVisible(false);
            notification.success({ message: "Type added" });
        } catch (e: any) {
            notification.error({ message: e?.message || "Failed to add type" });
        }
    };

    useEffect(() => {
        const savedDocuments = getAllDocuments();
        setDocuments(savedDocuments);
    }, []);

    useEffect(() => {
        const savedModules = getModules();
        if (Array.isArray(savedModules)) setMilestones(savedModules);
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
                notify.error("File not found in IndexedDB.");
            }
        }
    };

    const columns: any = [
        { title: "Id", dataIndex: "id", key: "id", width: "8%" },
        {
            title: "Document Name",
            dataIndex: "documentName",
            key: "documentName",
            width: "20%",
            align: "left",
            render: (val: string, rec: any) => val || rec?.linkedDoc || "-"
        },
        {
            title: "Type",
            dataIndex: "documentType",
            key: "documentType",
            width: "12%",
            align: "left",
            render: (val: string) => val || "-"
        },
        {
            title: "Milestone",
            dataIndex: "milestone",
            key: "milestone",
            width: "18%",
            align: "left"
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            width: "22%",
            align: "left",
            ellipsis: true
        },
        {
            title: "Uploaded",
            dataIndex: "createdAt",
            key: "createdAt",
            width: "15%",
            align: "left",
            render: (val: string) => (val ? new Date(val).toLocaleString() : "-")
        },
        {
            title: "Actions",
            key: "actions",
            width: "10%",
            render: (_: any, record: any) => (
                <Space size="middle" style={{ display: "flex", gap: "28px", justifyContent: "center" }}>
                    {record.files && record.files.length > 0 && (
                        <Button className="view-btn" icon={<EyeOutlined />} onClick={() => handlePreview(record)} size="small" />
                    )}
                    <Button className="delete-btn" icon={<DeleteOutlined />} onClick={() => showDeleteModal(record.id)} danger size="small" />
                </Space>
            )
        }
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
            notification.success({ message: "Document Deleted", description: "The document has been successfully deleted." });
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
        accept: "image/*,application/pdf" as unknown as Accept,
        multiple: true
    });

    const handleSave = async () => {
        if (!milestone || files.length === 0 || !linkedActivity) {
            notify.error("Please fill all fields and upload files.");
            return;
        }
        if (!docType) {
            notify.error("Please select a Document Type.");
            return;
        }

        const encodedFiles: { docId: string; name: string; path: string }[] = [];

        try {
            for (const file of files) {
                const docId = uuidv4();
                await saveFileToDisk(file, docId);
                encodedFiles.push({ docId, name: file.name, path: `documents/${docId}` });
            }

            const documentGUID = uuidv4();
            const userRaw = localStorage.getItem("user");
            const user = userRaw ? JSON.parse(userRaw) : null;

            if (!user) {
                notify.error("User information is missing in local storage.");
                return;
            }

            const nowIso = new Date().toISOString();

            const newDocumentEntry = {
                guid: documentGUID,
                documentName: selectedDocName || documentName || "",
                documentType: docType,
                description,
                milestone,
                linkedActivity,
                linkedDoc: selectedDocName || null,
                files: encodedFiles,
                uploadedAt: nowIso,
                createdAt: nowIso,
                updatedAt: nowIso,
                uploadedBy: {
                    userId: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    company: user.company
                }
            };

            await db.documents.add(newDocumentEntry);
            notify.success("Document saved successfully!");
            const updatedDocs = await db.getAllDocuments();
            setDocuments(updatedDocs);
            setIsAddModalVisible(false);
            resetForm();
        } catch (error) {
            notify.error("Failed to save document.");
            console.error(error);
        }
    };

    const resetForm = () => {
        setDocumentName("");
        setDescription("");
        setMilestone("");
        SetLinkedActivity("");
        setSelectedDocName(null);
        setDocType(null);
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
        resetForm();
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

            <Modal title="Confirm Delete" open={isModalVisible} onOk={handleDelete} onCancel={handleCancel} okText="Delete" cancelText="Cancel" okType="danger">
                <p>
                    <ExclamationCircleOutlined style={{ color: "red", marginRight: "8px" }} />
                    Are you sure you want to delete this document? This action cannot be undone.
                </p>
            </Modal>

            <Modal open={addTypeVisible} title="Add New Document Type" onCancel={() => setAddTypeVisible(false)} onOk={handleAddType} okText="Add">
                <Input
                    placeholder="e.g., Work Order, Drawing, Permit..."
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    onPressEnter={handleAddType}
                    maxLength={60}
                />
            </Modal>

            <Modal
                title="Create Document"
                centered
                className="modal-container"
                width={"65%"}
                open={isAddModalVisible}
                onCancel={handleCancelAddedDoc}
                onOk={handleSave}
                okText="Save"
                cancelText="Cancel"
                okButtonProps={{ className: "bg-secondary" }}
            >
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
                                                const selectedModule = modulesData.find((mod) => mod.moduleName === value);
                                                const acts = selectedModule?.activities || [];
                                                setActivities(acts);
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
                                                const selectedActivity = activities.find((act) => act.activityName === value);
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

                                    <Form.Item label="Document Name" name="documentname" labelAlign="left" colon={false}>
                                        <Select placeholder="Select Document Name" value={selectedDocName ?? undefined} onChange={setSelectedDocName} allowClear>
                                            {activityDocs.map((doc, index) => (
                                                <Option key={index} value={doc}>
                                                    {doc}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>

                                    {/* If you want to allow manual entry as fallback */}
                                    <Form.Item label="(or) Custom Name" name="customDocName" labelAlign="left" colon={false}>
                                        <Input placeholder="Type a custom name" value={documentName} onChange={(e) => setDocumentName(e.target.value)} />
                                    </Form.Item>

                                    <Form.Item label={<span style={{ textAlign: "left" }}> Document Type </span>} required labelAlign="left" colon={false}>
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <Select
                                                placeholder="Select Document Type"
                                                value={docType ?? undefined}
                                                onChange={setDocType}
                                                style={{ flex: 1, minWidth: 200 }}
                                                showSearch
                                                options={docTypes.map((dt: any) => ({ label: dt.name, value: dt.name }))}
                                                filterOption={(input, option) => String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                                            />
                                            <Button type="dashed" icon={<PlusOutlined />} onClick={() => setAddTypeVisible(true)} />
                                        </div>
                                    </Form.Item>

                                    <Form.Item
                                        label={<span style={{ textAlign: "left" }}> Description </span>}
                                        name="description"
                                        rules={[{ required: true, message: "Description is required" }]}
                                        labelAlign="left"
                                        colon={false}
                                    >
                                        <TextArea rows={4} placeholder="Description" value={description} style={{ marginBottom: "15px" }} onChange={(e) => setDescription(e.target.value)} />
                                    </Form.Item>

                                    <Form.Item label={<span style={{ textAlign: "left" }}> Upload Files </span>} name="files" labelAlign="left" colon={false}>
                                        <div
                                            {...getRootProps()}
                                            style={{
                                                border: "2px dashed #d9d9d9",
                                                padding: 16,
                                                textAlign: "center",
                                                borderRadius: 8,
                                                cursor: "pointer",
                                                background: isDragActive ? "#f0f8ff" : "#fafafa"
                                            }}
                                        >
                                            <input {...getInputProps()} />
                                            <UploadOutlined style={{ fontSize: 32 }} />
                                            <Text style={{ display: "block", marginTop: 8 }}>
                                                {isDragActive ? "Drop the files here..." : "Drag and drop files here, or click to select files"}
                                            </Text>
                                        </div>
                                    </Form.Item>

                                    {files.length > 0 && (
                                        <List
                                            dataSource={files}
                                            renderItem={(file, index) => (
                                                <List.Item
                                                    actions={[
                                                        <CloseCircleOutlined key="remove" onClick={() => handleRemoveFile(index)} style={{ color: "#888" }} />
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

            <Modal open={previewVisible} onCancel={() => setPreviewVisible(false)} footer={null} width="80%" bodyStyle={{ height: "75vh" }} title="Preview Document" className="modal-container">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px", height: "calc(100vh - 180px)" }}>
                    {previewContent?.startsWith("data:application/pdf") ? (
                        <iframe src={previewContent} title="PDF Preview" width="100%" height="100%" style={{ border: "none" }} />
                    ) : previewContent?.startsWith("data:image/") ? (
                        <img src={previewContent} alt="Document Preview" style={{ maxWidth: "100%", maxHeight: "100%" }} />
                    ) : (
                        <div>
                            <p>Preview not available for this file type. Please download to view.</p>
                        </div>
                    )}
                </div>
            </Modal>

            <ToastContainer />
        </>
    );
};

export default Document;