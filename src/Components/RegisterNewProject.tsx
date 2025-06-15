import "../styles/register-new-project.css";
import { useEffect, useState } from "react";
import { Select, Input, Form, Row, Col, Button, DatePicker, Modal, notification, Table, Tooltip, Typography, List } from "antd";
import "../styles/register-new-project.css";
import { CloseCircleOutlined, DownloadOutlined, ExclamationCircleOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
const { Option } = Select;
import { useLocation } from "react-router-dom";
import { saveDocument, updateDocument, getCurrentUser } from "../Utils/moduleStorage";
import { db } from "../Utils/dataStorege.ts";
interface DocumentData {
  id: number;
  documentName: string;
  files: string[];
  uploadedAt: string;
}

import { Accept, useDropzone } from "react-dropzone";
import { message } from "antd";
import "../styles/documents.css"
import MapComponent from "./MapComponent.tsx";
import ImageContainer from "../Components/ImageContainer"; 
const { Text } = Typography;
export const RegisterNewProject: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [allLibrariesName, setAllLibrariesName] = useState<any>([]);
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [mineTypeOptions, setMineTypeOptions] = useState<string[]>([]);
  const initialLibrary = allLibrariesName[0]?.name;
  const [selectedLibrary, setSelectedLibrary] = useState<any>(initialLibrary);
  const [mineTypePopupOpen, setMineTypePopupOpen] = useState<boolean>(false);
  const [newMineType, setNewMineType] = useState<string>("");
  const [shorthandCode, setShorthandCode] = useState<string>("");
  const [options, setOptions] = useState<string[]>([]);
  const steps = [
    { id: 1, title: "Project Parameters" },
    { id: 2, title: "Locations" },
    { id: 3, title: "Contractual Details" },
    { id: 4, title: "Initial Status" },
  ];
  const [formStepsData, setFormStepsData] = useState<any[]>(() => {
    const savedData = localStorage.getItem("projectFormData");
    return savedData ? JSON.parse(savedData) : [];
  });
  const location = useLocation();
  const documentToEdit = location.state?.documentToEdit as DocumentData | undefined;
  const [documentName, setDocumentName] = useState<any>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedItems, setSelectedItems] = useState(
    allLibrariesName.find((lib: any) => lib.name === initialLibrary)?.items || []
  );
  // const requiredFields: { [key: number]: string[] } = {
  //   1: ["companyName", "projectName", "mineral", "typeOfMine", "reserve", "netGeologicalReserve", "extractableReserve", "grade", "stripRatio", "peakCapacity", "mineLife", "totalCoalBlockArea"],
  //   2: ["state", "district", "nearestTown", "nearestAirport", "nearestRailwayStation"],
  //   3: ["mineOwner", "dateOfH1Bidder", "cbdpaDate", "vestingOrderDate", "pbgAmount"],
  //   4: Object.values(allLibrariesName).map((moduleName: any) => moduleName)
  // };

  useEffect(() => {
    setFormData({});
    clearFormData();
    fetchAllLibrary();
    fetchCompanyName();
    fetchMineTypes();
  }, []);

  const fetchMineTypes = async () => {
    try {
      const storedOptions: any = await db.getAllMineTypes();
      setMineTypeOptions(storedOptions);
    } catch (error) {
      console.error("Error fetching mine types:", error);
    }
  };

  const fetchAllLibrary = async () => {
    try {
      const storedLibraries: any = await db.getAllLibraries();
      setAllLibrariesName(storedLibraries);
    } catch (error) {
      console.error("Error fetching libraries:", error);
    }
  }

  const fetchCompanyName = () => {
    const userData = getCurrentUser();
    if (userData) {
      setFormData((prev) => ({ ...prev, companyName: userData.company }));
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setFormData(formStepsData[currentStep - 2] || {});
    }
  };

  const handleChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
  };

  const showConfirmationModal = () => {
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleSubmit = async () => {
    const loggedInUser = getCurrentUser();
    const initialDataVal = { library: selectedLibrary, items: selectedItems };
    if (!loggedInUser.id) {
      notification.error({
        message: "Error",
        description: "No logged-in user found.",
        duration: 3,
      });
      return;
    }
    const finalData = Array.isArray(formStepsData) ? [...formStepsData] : [];
    finalData[currentStep - 1] = { ...formData };
    const newProject = {
      id: Date.now().toString(),
      projectParameters: finalData[0] || {},
      locations: finalData[1] || {},
      contractualDetails: finalData[2] || {},
      initialStatus: initialDataVal || {},
    };
    try {
      await db.addProject(newProject);
    } catch {
      throw new Error("Failed to save library to database.");
    }
    notification.success({
      message: "Project Created Successfully",
      description: "All form data has been saved and cleared.",
      duration: 3,
    });

    setFormStepsData([]);
    setFormData({});
    setCurrentStep(1);
    setIsModalVisible(false);
    clearFormData();
    fetchCompanyName();
    fetchAllLibrary();
  };

  const validateFields = (_step: number): boolean => {
    // let newErrors: { [key: string]: string } = {};
    // requiredFields[step].forEach((field) => {
    //   const fieldValue = formData[field];
    //   if (fieldValue === undefined || fieldValue === null || (typeof fieldValue === 'string' && fieldValue.trim() === "") || (typeof fieldValue === 'number' && isNaN(fieldValue))) {
    //     newErrors[field] = "This field is required.";
    //   }
    // });
    // setErrors(newErrors);
    // return Object.keys(newErrors).length === 0;
    return true;
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      if (!validateFields(currentStep)) {
        notification.error({
          message: "Validation Error",
          description: "Please fill all required fields before proceeding.",
          duration: 3,
        });
        return;
      }
      const updatedData = Array.isArray(formStepsData) ? [...formStepsData] : [];
      updatedData[currentStep - 1] = { ...formData };
      setFormStepsData(updatedData);
      setCurrentStep(currentStep + 1);
      setFormData(updatedData[currentStep] || {});
    }
  };

  const clearFormData = () => {
    setFormData({
      companyName: "",
      projectName: "",
      reserve: "",
      netGeologicalReserve: "",
      extractableReserve: "",
      stripRatio: "",
      peakCapacity: "",
      mineLife: "",
      totalCoalBlockArea: "",
      mineral: "",
      typeOfMine: "",
      grade: "",
      state: "",
      district: "",
      nearestTown: "",
      nearestAirport: "",
      nearestRailwayStation: "",
      mineOwner: "",
      dateOfH1Bidder: null,
      cbdpaDate: null,
      vestingOrderDate: null,
      pbgAmount: "",
      ...(Array.isArray(allLibrariesName) ? allLibrariesName : []).reduce(
        (acc: any, moduleName: any) => {
          if (typeof moduleName === "string") {
            const key = moduleName.replace(/\s+/g, "").toLowerCase();
            acc[key] = undefined;
          }
          return acc;
        },
        {}
      ),
    });
    setErrors({});
  };

  // const handleLibraryChange = (value: string) => {
  //   setSelectedLibrary(value);
  //   const selectedLib: any = allLibrariesName.find((lib: any) => lib.name === value);
  //   setSelectedItems(selectedLib ? selectedLib.items : []);
  // };

  const handleStatusChange = (index: number, value: string) => {
    setSelectedItems((prevItems: any) =>
      prevItems.map((item: any, i: any) => {
        if (i < index) return item;
        if (i === index) return { ...item, status: value === "Yes" ? "Completed" : "Pending" };
        return { ...item, status: "Pending" };
      })
    );
  };

  const columns: any = [
    {
      title: "Module",
      dataIndex: "moduleName",
      key: "moduleName",
      width: "60%",
      align: "left",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: "20%",
      align: "center",
      render: (_: any, record: any, index: number) => {
        const isDisabled = index > 0 && selectedItems[index - 1].status !== "Completed";

        return (
          <Tooltip title={isDisabled ? "Complete the previous module first" : "Mark as Completed"}>
            <Select
              value={record.status === "Completed" ? "Yes" : "No"}
              style={{ width: "100%" }}
              onChange={(value) => handleStatusChange(index, value)}
              disabled={isDisabled}
            >
              <Option value="No">No</Option>
              <Option value="Yes">Yes</Option>
            </Select>
          </Tooltip>
        );
      },
    },
  ];

  const generateShorthand = (input: string): string => {
    return input
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  const handleAddNewMineType = async () => {
    if (newMineType && shorthandCode) {
      try {
        const mineTypeData: any = { type: shorthandCode, description: newMineType };
        const id = await db.addMineType(mineTypeData);
        setOptions([...options, { id, ...mineTypeData }]);
        setNewMineType("");
        setShorthandCode("");
        setMineTypePopupOpen(false);
        fetchMineTypes();
      } catch (error) {
        console.error("Error adding mine type:", error);
      }
    }
  };

  const handleMineTypeChange = (value: string) => {
    setNewMineType(value);
    setShorthandCode(generateShorthand(value));
  };

  const renderStepForm = () => {
    switch (currentStep) {
      case 1:
        return (
          <Form style={{ marginTop: "15px" }} layout="horizontal">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form.Item
                  colon={false}
                  label="Company Name"
                  labelAlign="left"
                  labelCol={{ span: 5 }}
                  wrapperCol={{ span: 19 }}
                  validateStatus={errors.companyName ? "error" : ""}
                  help={errors.companyName ? "Company Name is required" : ""}
                >
                  <div style={{ display: "flex", gap: "10px" }}>
                    <Input
                      type="text"
                      disabled
                      key={formData.companyName} value={formData.companyName || ""}
                      onChange={(e) => handleChange("projectName", e.target.value)}
                    />
                    {/* <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={() => setAddCompanyPopupOpen(true)}
                    /> */}
                  </div>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  colon={false}
                  label="Project Name"
                  labelAlign="left"
                  labelCol={{ span: 5 }}
                  wrapperCol={{ span: 19 }}
                  validateStatus={errors.projectName ? "error" : ""}
                  help={errors.projectName ? "Project Name is required" : ""}
                >
                  <Input
                    type="text"
                    value={formData.projectName || ""}
                    onChange={(e) => handleChange("projectName", e.target.value)}
                  />
                </Form.Item>
              </Col>
              {[
                { label: "Reserve", key: "reserve", type: "number" },
                { label: "Net Geological Reserve", key: "netGeologicalReserve", type: "number" },
                { label: "Extractable Reserve", key: "extractableReserve", type: "number" },
                { label: "Strip Ratio", key: "stripRatio", type: "number" },
                { label: "Peak Capacity", key: "peakCapacity", type: "number" },
                { label: "Mine Life (years)", key: "mineLife", type: "number" },
                { label: "Total Coal Block Area", key: "totalCoalBlockArea", type: "number" },
              ].map(({ label, key, type }, index) => (
                <Col span={12} key={key}>
                  <Form.Item
                    colon={false}
                    label={label}
                    labelAlign="left"
                    labelCol={{ span: 10 }}
                    wrapperCol={{ span: 14 }}
                    validateStatus={errors[key] ? "error" : ""}
                    help={errors[key] ? `${label} is required` : ""}
                  >
                    <Input
                      style={{ marginLeft: index % 2 === 0 ? "4px" : "0", marginRight: index % 2 !== 0 ? "4px" : "0" }}
                      type={type}
                      value={formData[key] || ""}
                      onChange={(e) => handleChange(key, e.target.value)}
                    />
                  </Form.Item>
                </Col>
              ))}
              <Col span={12}>
                <Form.Item
                  colon={false}
                  label="Mineral"
                  labelAlign="left"
                  labelCol={{ span: 10 }}
                  wrapperCol={{ span: 14 }}
                  validateStatus={errors.mineral ? "error" : ""}
                  help={errors.mineral ? "Mineral is required" : ""}
                >
                  <Select value={formData.mineral || ""} onChange={(value) => handleChange("mineral", value)}>
                    {["Coal", "Iron"].map((option) => (
                      <Select.Option key={option} value={option}>
                        {option}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  colon={false}
                  label="Type of Mine"
                  labelAlign="left"
                  labelCol={{ span: 10 }}
                  wrapperCol={{ span: 14 }}
                  validateStatus={errors.typeOfMine ? "error" : ""}
                  help={errors.typeOfMine ? "Type of Mine is required" : ""}
                >
                  <div style={{ display: 'flex', gap: "10px" }}>
                    <Select
                      value={formData.typeOfMine || ""}
                      style={{ marginLeft: "4px" }}
                      onChange={(value) => {
                        handleChange("typeOfMine", value);
                        const updatedLibraries = allLibrariesName.filter((name: any) => name.mineType === value);
                        setAllLibrariesName(updatedLibraries);
                        if (updatedLibraries.length > 0) {
                          setSelectedLibrary(updatedLibraries[0].name);
                          setSelectedItems(updatedLibraries[0].items);
                          
                        } else {
                          setSelectedLibrary(null);
                        }
                      }}
                    >
                      {mineTypeOptions.map((option: any) => (
                        <Select.Option key={option.type} value={option.type}>
                          {option.type}
                        </Select.Option>
                      ))}
                    </Select>
                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => setMineTypePopupOpen(true)}></Button>
                  </div>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  colon={false}
                  label="Grade (in case of Coal)"
                  labelAlign="left"
                  labelCol={{ span: 10 }}
                  wrapperCol={{ span: 14 }}
                  validateStatus={errors.grade ? "error" : ""}
                  help={errors.grade ? "Grade is required" : ""}
                >
                  <Select allowClear={false} value={formData.grade || ""} onChange={(value) => handleChange("grade", value)}>
                    {["Grade A", "Grade B"].map((option) => (
                      <Select.Option key={option} value={option}>
                        {option}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        );
      case 2:
        return (
          <Form style={{ marginTop: "15px" }} layout="horizontal">
            <Row gutter={[16, 16]}>
              <Col span={24} key="mineLocation">
                <Form.Item
                  colon={false}
                  label="Mine Location"
                  labelAlign="left"
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  validateStatus={errors["mineLocation"] ? "error" : ""}
                  help={errors["mineLocation"] ? "Mine Location is required" : ""}
                >
                  <Input
                    value={formData["mineLocation"] || ""}
                    onChange={(e) => handleChange("mineLocation", e.target.value)}
                  />
                </Form.Item>
              </Col>

              {[
                { label: "State", key: "state" },
                { label: "District", key: "district" },
                { label: "Nearest Town", key: "nearestTown" },
                { label: "Nearest Airport", key: "nearestAirport" },
                { label: "Nearest Railway Station", key: "nearestRailwayStation" },
              ].map(({ label, key }) => (
                <Col span={24} key={key}>
                  <Form.Item
                    colon={false}
                    label={label}
                    labelAlign="left"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    validateStatus={errors[key] ? "error" : ""}
                    help={errors[key] ? `${label} is required` : ""}
                  >
                    <Input
                      value={formData[key] || ""}
                      onChange={(e) => handleChange(key, e.target.value)}
                    />
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </Form>
        );
      case 3:
        return (
          <Form style={{ marginTop: "15px" }} layout="horizontal">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form.Item
                  colon={false}
                  label="Mine Owner"
                  labelAlign="left"
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  validateStatus={errors.mineOwner ? "error" : ""}
                  help={errors.mineOwner ? "Mine Owner is required" : ""}
                >
                  <Input value={formData.mineOwner || ""} onChange={(e) => handleChange("mineOwner", e.target.value)} />
                </Form.Item>
              </Col>
              {[
                { label: "Date of H1 Bidder", key: "dateOfH1Bidder" },
                { label: "CBDPA Date", key: "cbdpaDate" },
                { label: "Vesting Order Date", key: "vestingOrderDate" },
              ].map(({ label, key }) => (
                <Col span={24} key={key}>
                  <Form.Item
                    colon={false}
                    label={label}
                    labelAlign="left"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    validateStatus={errors[key] ? "error" : ""}
                    help={errors[key] ? `${label} is required` : ""}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      value={formData[key] || null}
                      onChange={(date) => handleChange(key, date)}
                    />
                  </Form.Item>
                </Col>
              ))}
              <Col span={24}>
                <Form.Item
                  colon={false}
                  label="PBG Amount"
                  labelAlign="left"
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  validateStatus={errors.pbgAmount ? "error" : ""}
                  help={errors.pbgAmount ? "PBG Amount is required" : ""}
                >
                  <Input type="number" value={formData.pbgAmount || ""} onChange={(e) => handleChange("pbgAmount", e.target.value)} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        );
      case 4:
        return (
          <div>
            <Form className="select-module-group" layout="horizontal">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Form.Item
                    colon={false}
                    label="Select Group"
                    labelAlign="left"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    style={{ fontSize: "18px", fontWeight: "400" }}

                  >
                    <Select
                      value={selectedLibrary}
                      onChange={(value) => {
                        setSelectedLibrary(value);
                        const filterdLibrary=allLibrariesName.filter((item:any)=>item.name==value);
                        setSelectedItems(filterdLibrary[0].items)
                      }}
                      allowClear={true}
                    >
                      {allLibrariesName.map((lib: any) => (
                        <Select.Option key={lib.name} value={lib.name}>
                          {lib.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            <Table
              columns={columns}
              dataSource={selectedItems}
              pagination={false}
              rowKey="moduleName"
              className="project-timeline-table"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    setFiles((prevFiles) => {
      const newFiles = acceptedFiles.filter(
        (file) => !prevFiles.some((existingFile) => existingFile.name === file.name)
      );

      if (newFiles.length < acceptedFiles.length) {
        message.warning("Some files were already uploaded and were not added again.");
      }

      return [...prevFiles, ...newFiles];
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/*,application/pdf' as unknown as Accept,
    multiple: true,
  });

  const handleSave = () => {
    if (!documentName || files.length === 0) {
      message.error("Please fill all fields and upload files.");
      return;
    }

    const newDocument: DocumentData = {
      id: Math.floor(Math.random() * (100 - 10 + 1) + 10),
      documentName,
      files: files.map((file) => file.name),
      uploadedAt: documentToEdit ? documentToEdit.uploadedAt : new Date().toISOString(),
    };

    if (documentToEdit) {
      updateDocument(documentToEdit.id, newDocument);
      message.success("Document updated successfully!");
    } else {
      const isSaved = saveDocument(newDocument);
      if (isSaved) {
        message.success("Document saved successfully!");
      } else {
        message.error("Failed to save the document. Please try again.");
      }
    }
  };

  const handleCancel = () => {
    setDocumentName(null);
    setFiles([]);
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleDownloadFile = (file: any) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="registration-container">
        <div className="step-registration-form">
          <div className="page-heading-main bg-secondary">
            <span className="page-heading">Register New Project</span>
          </div>
          <div className="form-container-item-div">
            <div className="form-items">
              <div className="progress-bars">
                <ul>
                  {steps.map((step, index) => (
                    <li
                      key={step.id}
                      className={`step ${currentStep > index + 1 ? "completed" : currentStep === index + 1 ? "active" : ""}`}
                    >
                      <span className="step-title">{step.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="form-container">
                <form>
                  <div className="form-group">{renderStepForm()}</div>
                </form>
              </div>
              <hr className="saparation-line" />
              <div className="form-buttons">
                <Button variant="outlined" onClick={handlePrevious} className="bg-tertiary text-white" disabled={currentStep === 1}>
                  Previous
                </Button>
                <Button className="bg-secondary text-white" onClick={currentStep === steps.length ? showConfirmationModal : handleNext}>
                  {currentStep === steps.length ? "Submit" : "Next"}
                </Button>
              </div>
            </div>
          </div>
        </div>
        {currentStep == 2 ? (
          <div className="maips-data">
            <MapComponent />
          </div>
        ) : currentStep == 3 ? (
          <div className="image-container">
            <div className="bg-secondary create-doc-heading">
              <div style={{ margin: "0px 0px 10px 0px", padding: "5px" }}>Attach Document</div>
            </div>
            <div className="contractual-upload-doc-container">
              <div className="contractual-upload-body">
                <Form.Item
                  label={<span style={{ textAlign: "left" }}> Contractual File Name </span>}
                  name="documentName"
                  rules={[{ required: true, message: "Contractual File Name is required" }]}
                  labelAlign="left"
                  colon={false}
                >
                  <Input
                    placeholder="Enter file name"
                    value={documentName}
                    style={{ marginBottom: "15px" }}
                    onChange={(e) => setDocumentName(e.target.value)}
                  />
                </Form.Item>

                <Form.Item
                  label={<span style={{ textAlign: "left" }}> Upload Files </span>}
                  name="files"
                  rules={[{ required: files.length === 0, message: "Please upload at least one file" }]}
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

                {/* Display Uploaded Files */}
                {files.length > 0 && (
                  <List
                    dataSource={files}
                    renderItem={(file, index) => (
                      <List.Item
                        actions={[
                          <DownloadOutlined
                            key="download"
                            onClick={() => handleDownloadFile(file)}
                            style={{ color: "green", fontSize: "18px", cursor: "pointer" }}
                          />,
                          <CloseCircleOutlined
                            key="remove"
                            onClick={() => handleRemoveFile(index)}
                            style={{ color: "red", fontSize: "18px", cursor: "pointer" }}
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
                  Clear
                </Button>
                <Button type="primary" onClick={handleSave} className="bg-secondary" htmlType="submit" style={{ width: "45%" }}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="image-container">
            <ImageContainer imageUrl={["/images/auths/m5.jpg", "/images/auths/m5.jpg"]} />
          </div>
        )}
      </div>

      <Modal
        title="Confirm Submission"
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleModalCancel}
        okText="Submit"
        cancelText="Cancel"
        okButtonProps={{ className: "bg-secondary" }}
        cancelButtonProps={{ className: "bg-tertiary" }}
        maskClosable={false}
        keyboard={false}
        className="modal-container"
      >
        <p className="modal-body-item-padding">
          <ExclamationCircleOutlined style={{ color: "red", marginRight: 8 }} />
          Are you sure you want to submit the form? Once submitted, all data will be cleared.
        </p>
      </Modal>

      <Modal
        title="Add Mine Type"
        open={mineTypePopupOpen}
        onCancel={() => setMineTypePopupOpen(false)}
        onOk={handleAddNewMineType}
        okButtonProps={{ className: "bg-secondary" }}
        cancelButtonProps={{ className: "bg-tertiary" }}
        maskClosable={false}
        keyboard={false}
        className="modal-container"
      >
        <div className="modal-body-item-padding">
          <Input
            placeholder="Enter Mine Type"
            value={newMineType}
            onChange={(e) => handleMineTypeChange(e.target.value)}
            style={{ marginBottom: "10px" }}
          />

          <Typography>Shorthand Code: <strong>{shorthandCode}</strong></Typography>
        </div>
      </Modal>
    </>
  );
};