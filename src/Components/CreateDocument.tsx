import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Accept, useDropzone } from "react-dropzone";
import { UploadOutlined, CloseCircleOutlined } from "@ant-design/icons";
import {
  Typography,
  Input,
  Button,
  Select,
  List,
  Form,
} from "antd";
import { saveDocument, updateDocument, getModules } from "../Utils/moduleStorage";
import "../styles/documents.css"
import ImageContainer from "../Components/ImageContainer";
import { ToastContainer } from "react-toastify";
import { notify } from "../Utils/ToastNotify";
const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface Module {
  moduleName: string;
}

interface DocumentData {
  id: number;
  documentName: string;
  description: string;
  milestone: string;
  files: string[];
  uploadedAt: string;
}

const CreateDocument: React.FC = () => {
  const location = useLocation();
  const documentToEdit = location.state?.documentToEdit as DocumentData | undefined;
  const [documentName, setDocumentName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [milestone, setMilestone] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [milestones, setMilestones] = useState<Module[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedModules = getModules();
    if (Array.isArray(savedModules)) {
      setMilestones(savedModules);
    }
  }, []);

  const onDrop = (acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/*,application/pdf' as unknown as Accept,
    multiple: true,
  });

  const handleSave = () => {
    if (!documentName || !milestone || files.length === 0) {
      notify.error("Please fill all fields and upload files.");
      return;
    }

    const newDocument: DocumentData = {
      id: Math.floor(Math.random() * (100 - 10 + 1) + 10),
      documentName,
      description,
      milestone,
      files: files.map((file) => file.name),
      uploadedAt: documentToEdit ? documentToEdit.uploadedAt : new Date().toISOString(),
    };

    if (documentToEdit) {
      updateDocument(documentToEdit.id, newDocument);
      notify.success("Document updated successfully!");
    } else {
      const isSaved = saveDocument(newDocument);
      if (isSaved) {
        notify.success("Document saved successfully!");
      } else {
        notify.error("Failed to save the document. Please try again.");
      }
    }
    navigate("/document");
  };

  const handleCancel = () => {
    setDocumentName("");
    setDescription("");
    setMilestone("");
    setFiles([]);
    navigate("/documentlibrary");
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  return (
    <>
      <Form layout="horizontal" onFinish={handleSave} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} requiredMark={false}>
        <div className="main-doc-container">
          <div className="left-create-document">
            <div className="card-header bg-secondary create-doc-heading">
              <p style={{ margin: "0px", padding: "0px" }}>Create Document</p>
            </div>
            <div className="main-create-doc-container">
              <div className="left-create-document-item">
                <Form.Item
                  label={<span style={{ textAlign: "left" }}> Document Name </span>}
                  name="documentName"
                  rules={[{ required: true, message: "Document Name is required" }]}
                  labelAlign="left"
                  colon={false}
                >
                  <Input
                    placeholder="Document Name"
                    value={documentName}
                    style={{ marginBottom: "15px" }}
                    onChange={(e) => setDocumentName(e.target.value)}
                  />
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
                  label={<span style={{ textAlign: "left" }}> Select Milestone </span>}
                  name="milestone"
                  rules={[{ required: true, message: "Milestone is required" }]}
                  labelAlign="left"
                  colon={false}
                >
                  <Select
                    placeholder="Select Milestone"
                    value={milestone}
                    onChange={setMilestone}
                    style={{ marginBottom: "15px" }}
                  >
                    {milestones.map((option, index) => (
                      <Option key={index} value={option.moduleName}>
                        {option.moduleName}
                      </Option>
                    ))}
                  </Select>
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
                      marginBottom: "30px",
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
              <hr />
              <div className="action-buttons" style={{ display: "flex", justifyContent: "space-between" }}>
                <Button onClick={handleCancel} className="bg-tertiary" style={{ width: "45%" }}>
                  Cancel
                </Button>
                <Button type="primary" className="bg-secondary" htmlType="submit" style={{ width: "45%" }}>
                  Save
                </Button>
              </div>
            </div>

          </div>
          <div className="right-images image-container">
            <ImageContainer imageUrl="/images/auths/m5.jpg" />
          </div>
        </div>
      </Form>
      <ToastContainer />
    </>
  );
};

export default CreateDocument;
