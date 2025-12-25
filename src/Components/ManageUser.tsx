import React, { useEffect, useMemo, useState } from "react";
import "../styles/user-management.css";

import { useNavigate } from "react-router-dom";
import { Button, Col, Form, Input, Modal, Row, Select, Switch, Table, Tooltip } from "antd";
import { ExclamationCircleOutlined, UserAddOutlined } from "@ant-design/icons";

import { getCurrentUser } from "../Utils/moduleStorage";
import { db } from "../Utils/dataStorege.ts";
import { ToastContainer } from "react-toastify";
import { notify } from "../Utils/ToastNotify.tsx";
import { v4 as uuidv4 } from "uuid";

import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";

const { Option } = Select;

interface Module {
  parentModuleCode: string;
}

interface NotificationSettings {
  email: boolean;
  whatsapp: boolean;
  text: boolean;
}

interface User {
  id: number;
  name: string;
  company: string;
  designation?: string;
  mobile: string;
  email: string;
  whatsapp: string;
  registeredOn?: string;
  profilePhoto: string;
  password?: string;
  isTempPassword?: boolean;
  role?: string;
  assignedModules?: {
    moduleCode: string;
    moduleName: string;
    responsibilitiesOnActivities: {
      activityCode: string;
      responsibilities: string[];
    }[];
  }[];
}

interface ManageUserProps {
  options?: {
    isAddMember?: boolean;
    isToolbar?: boolean;
    title?: string;
  };
}

const ManageUser: React.FC<ManageUserProps> = ({ options }) => {
  const navigate = useNavigate();

  const [_modules, setModules] = useState<Module[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [openAlertModal, setOpenAlertModal] = useState(false);
  const [openRACIModal, setOpenRACIModal] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<any>({});

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: true,
    whatsapp: true,
    text: true,
  });

  const [form] = Form.useForm();

  // -------- helpers ----------
  function getInitials(name?: string): string {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0][0]?.toUpperCase() || "";
  }

  const handleViewUser = (record: User) => {
    setSelectedUser(record);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    if (selectedUser) navigate(`/view-user`, { state: { user: selectedUser } });
  };

  const handleCancelView = () => setIsModalVisible(false);

  const handleCloseModal = () => {
    setOpenAlertModal(false);
    setOpenRACIModal(false);
  };

  const handleSendInvites = async () => {
    try {
      const cu = getCurrentUser();

      const values = await form.validateFields();
      const { employeeFullName, permissionProfile, emails, mobile, designation } = values;

      const existing = (await db.getUsers()).filter((u: any) => u.orgId == cu?.orgId);
      const emailExists = existing.some((u: any) => u.email === emails);
      if (emailExists) return notify.error("Email already registered");

      const password = emails.slice(0, 6);
      const guiId = uuidv4();

      let companyDetails: any = {};
      if (cu.orgId) {
        const company = await db.getCompanyByGuiId(cu.orgId);
        if (company) {
          companyDetails = {
            company: company.name || "",
            industryType: company.industryType || "",
            companyType: company.companyType || "",
            city: company.city || "",
            state: company.state || "",
            country: company.country || "",
            zipCode: company.zipCode || "",
            address: company.address || "",
          };
        }
      }

      const newUser = {
        id: Date.now(),
        guiId,
        name: employeeFullName,
        email: emails,
        mobile: mobile || "N/A",
        whatsapp: "",
        designation: designation || "N/A",
        registeredOn: new Date().toISOString(),
        profilePhoto: "",
        password,
        isTempPassword: true,
        role: permissionProfile,
        orgId: cu.orgId || null,
        addedBy: cu.guiId,
        userType: "IND",
        ...companyDetails,
      };

      await db.addUsers(newUser);

      if (cu.orgId) {
        const company = await db.getCompanyByGuiId(cu.orgId);
        if (company) {
          const updatedCompany = {
            ...company,
            userGuiIds: Array.from(new Set([...(company.userGuiIds || []), guiId])),
          };
          await db.updateCompany(company.id, updatedCompany);
        }
      }

      notify.success("Member added successfully!");
      form.resetFields();
      setAddMemberModalVisible(false);

      const allUsers = (await db.getUsers()).filter((u: any) => u.orgId == cu?.orgId);
      setUsers(allUsers);
    } catch (error: any) {
      console.error(error);
      notify.error(error.message || "Error adding member!");
    }
  };

  const handleRoleChange = async (userId: any, newRole: any) => {
    try {
      const selected = await db.getUserById(userId);
      const updatedUser = { ...selected, role: newRole };
      await db.updateUsers(userId, updatedUser);
      notify.success("Role updated successfully.");

      setUsers((prev: any) => prev.map((u: any) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (error) {
      console.error(error);
      notify.error("Failed to update role.");
    }
  };

  // -------- data load ----------
  useEffect(() => {
    const cu = getCurrentUser();
    setCurrentUser(cu);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const allUsers = (await db.getUsers()).filter((u: any) => u.orgId == currentUser?.orgId);
      setUsers(allUsers);

      const uniqueModules: any[] = [];
      allUsers.forEach((u: User) => {
        u.assignedModules?.forEach((m) => {
          if (!uniqueModules.some((x: any) => x.parentModuleCode === m.moduleCode)) {
            uniqueModules.push({ parentModuleCode: m.moduleCode, moduleName: m.moduleName });
          }
        });
      });
      setModules(uniqueModules);
    };

    if (currentUser?.orgId) fetchData();
  }, [currentUser]);

  const dataSource = useMemo(
    () =>
      users.map((u: any, idx: number) => ({
        ...u,
        key: u.id,
        serialNumber: idx + 1,
      })),
    [users]
  );

  const columns: any[] = [
    { title: "S.No", dataIndex: "serialNumber", key: "serialNumber", align: "center", width: 80 },
    { title: "Name", dataIndex: "name", key: "name", align: "center" },
    { title: "Company", dataIndex: "company", key: "company", align: "center" },
    { title: "Designation", dataIndex: "designation", key: "designation", align: "center" },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      align: "center",
      render: (role: any, record: any) => (
        <Select
          value={role}
          onChange={(value) => handleRoleChange(record.id, value)}
          style={{ width: 140 }}
          disabled={currentUser?.id === record.id}
        >
          <Option value="admin">Admin</Option>
          <Option value="manager">Manager</Option>
          <Option value="employee">Employee</Option>
        </Select>
      ),
    },
    { title: "Mobile", dataIndex: "mobile", key: "mobile", align: "center" },
    { title: "Email", dataIndex: "email", key: "email", align: "center" },
    {
      title: "WhatsApp",
      dataIndex: "whatsapp",
      key: "whatsapp",
      align: "center",
      render: (_: any, record: any) =>
        record.whatsapp && record.whatsapp !== "N/A"
          ? record.whatsapp
          : record.mobile && record.mobile !== "N/A"
            ? record.mobile
            : "N/A",
    },
  ];

  return (
    <>
      <div className="page-container">
        <div className="users-profile-top">
          <div className="title-add-btn">
            <div className="holiday-page-heading" style={{ marginLeft: 10 }}>
              <div>
                <p className="page-heading-title">{options?.title || "RACI, Alert & Notification"}</p>
                <span className="pl-subtitle">Manage your org projects and ownership</span>
              </div>
            </div>

            {options?.isAddMember && (
              <Tooltip title="Add new member">
                <Button
                  icon={<UserAddOutlined />}
                  style={{ fontSize: 14, textTransform: "none"}}
                  size="small"
                  onClick={() => setAddMemberModalVisible(true)}
                  className="add-member-button bg-secondary add-doc-btn"
                >
                  Add Member
                </Button>
              </Tooltip>
            )}
          </div>
        </div>

        <div className="user-profile-body">
          <Table
            columns={columns}
            dataSource={dataSource}
            bordered
            pagination={{ pageSize: 10 }}
            style={{ marginTop: 5 }}
            rowClassName={(record: any) => (selectedUser?.id === record.id ? "selected-row-active" : "selected-row")}
            onRow={(record: User) => ({
              onDoubleClick: () => handleViewUser(record),
            })}
          />
        </div>

        <Modal
          title="Notification Preferences"
          open={openAlertModal}
          onCancel={handleCloseModal}
          centered
          className="modal-container"
          footer={[
            <Button key="close" onClick={handleCloseModal} className="close-button">
              Close
            </Button>,
          ]}
        >
          <div style={{ display: "flex", gap: 16, justifyContent: "center", alignItems: "center", padding: 10 }}>
            <div>
              <Switch
                checked={notificationSettings.email}
                onChange={(checked) => setNotificationSettings((p) => ({ ...p, email: checked }))}
              />{" "}
              Email
            </div>
            <div>
              <Switch
                checked={notificationSettings.whatsapp}
                onChange={(checked) => setNotificationSettings((p) => ({ ...p, whatsapp: checked }))}
              />{" "}
              WhatsApp
            </div>
            <div>
              <Switch
                checked={notificationSettings.text}
                onChange={(checked) => setNotificationSettings((p) => ({ ...p, text: checked }))}
              />{" "}
              Text
            </div>
          </div>
        </Modal>

        <Modal
          title="RACI Module Assignments"
          open={openRACIModal}
          onCancel={handleCloseModal}
          className="modal-container"
          width={800}
          footer={[
            <Button key="close" onClick={handleCloseModal} className="raci-button raci-close-button">
              Close
            </Button>,
            <Button key="save" type="primary" onClick={handleCloseModal} className="raci-button raci-save-button">
              Save
            </Button>,
          ]}
        >
          {selectedUser && (
            <div className="raci-table-container">
              <table className="raci-table">
                <thead>
                  <tr>
                    <th className="raci-table-header">Module</th>
                    <th className="raci-table-header">Activity</th>
                    <th className="raci-table-header">Responsibilities</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedUser.assignedModules?.map((module) =>
                    module.responsibilitiesOnActivities.map((activity) => (
                      <tr key={`${module.moduleCode}-${activity.activityCode}`} className="raci-table-row">
                        <td className="raci-table-cell">{module.moduleName}</td>
                        <td className="raci-table-cell">{activity.activityCode}</td>
                        <td className="raci-table-cell">{activity.responsibilities.join(", ")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Modal>

        <Modal
          title=""
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancelView}
          centered
          className="custom-user-modal"
          width={800}
          footer={null}
        >
          <div className="user-info-main">
            <div className="profile-cover bg-secondary">
              <div className="profile-item">
                <span>{getInitials(selectedUser?.name)}</span>
              </div>
            </div>

            <div className="user-details">
              <Row gutter={[16, 16]} className="form-row" align="middle">
                <Col span={6} style={{ textAlign: "left" }}>
                  <label>Full Name</label>
                </Col>
                <Col span={18}>
                  <Input disabled style={{ marginBottom: 10 }} value={selectedUser?.name} />
                </Col>
              </Row>

              <Row gutter={[16, 16]} className="form-row" align="middle">
                <Col span={6} style={{ textAlign: "left" }}>
                  <label>Company</label>
                </Col>
                <Col span={18}>
                  <Input disabled style={{ marginBottom: 10 }} value={selectedUser?.company} />
                </Col>
              </Row>

              <Row gutter={[16, 16]} className="form-row" align="middle">
                <Col span={6} style={{ textAlign: "left" }}>
                  <label>Designation</label>
                </Col>
                <Col span={18}>
                  <Input disabled style={{ marginBottom: 10 }} value={selectedUser?.designation} />
                </Col>
              </Row>

              <Row gutter={[16, 16]} className="form-row" align="middle">
                <Col span={6} style={{ textAlign: "left" }}>
                  <label>Role</label>
                </Col>
                <Col span={18}>
                  <Input disabled style={{ marginBottom: 10 }} value={selectedUser?.role} />
                </Col>
              </Row>

              <Row gutter={[16, 16]} className="form-row" align="middle">
                <Col span={6} style={{ textAlign: "left" }}>
                  <label>Mobile</label>
                </Col>
                <Col span={18}>
                  <Input disabled style={{ marginBottom: 10 }} value={selectedUser?.mobile} />
                </Col>
              </Row>

              <Row gutter={[16, 16]} className="form-row" align="middle">
                <Col span={6} style={{ textAlign: "left" }}>
                  <label>Email</label>
                </Col>
                <Col span={18}>
                  <Input disabled style={{ marginBottom: 10 }} value={selectedUser?.email} />
                </Col>
              </Row>

              <Row gutter={[16, 16]} className="form-row" align="middle">
                <Col span={6} style={{ textAlign: "left" }}>
                  <label>WhatsApp</label>
                </Col>
                <Col span={18}>
                  <Input disabled style={{ marginBottom: 10 }} value={selectedUser?.whatsapp} />
                </Col>
              </Row>

              <Row gutter={[16, 16]} className="form-row" align="middle">
                <Col span={6} style={{ textAlign: "left" }}>
                  <label>Registration Date</label>
                </Col>
                <Col span={18}>
                  <Input disabled style={{ marginBottom: 10 }} value={selectedUser?.registeredOn} />
                </Col>
              </Row>
            </div>
          </div>
        </Modal>

        <Modal
          title="Add Member"
          open={addMemberModalVisible}
          onCancel={() => setAddMemberModalVisible(false)}
          onOk={handleSendInvites}
          okText="Save"
          okButtonProps={{ className: "bg-secondary" }}
          cancelButtonProps={{ className: "bg-tertiary" }}
          width="50%"
          className="modal-container"
        >
          <div className="modal-body" style={{ padding: "0px 10px" }}>
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
              <Form.Item
                name="employeeFullName"
                label="Full Name"
                className="form-item"
                rules={[{ required: true, message: "Please enter the employee full name!" }]}
              >
                <Input className="form-item" placeholder="Enter full name" />
              </Form.Item>

              <Form.Item
                name="designation"
                label="Designation"
                rules={[{ required: true, message: "Please select designation" }]}
              >
                <Select placeholder="Select Designation">
                  <Option value="Mining Engineer">Mining Engineer</Option>
                  <Option value="Geologist">Geologist</Option>
                  <Option value="Operations Manager">Operations Manager</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="mobile"
                label="Mobile Number"
                rules={[
                  { required: true, message: "Please enter mobile number!" },
                  {
                    validator: (_, value) => {
                      const numeric = value?.replace(/\D/g, "");
                      if (!numeric || numeric.length < 10) {
                        return Promise.reject("Enter a valid 10-digit mobile number with country code");
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <PhoneInput
                  country="in"
                  inputStyle={{ width: "100%" }}
                  enableSearch
                  countryCodeEditable={false}
                  inputProps={{ name: "mobile", required: true }}
                />
              </Form.Item>

              <Form.Item
                name="permissionProfile"
                label="Set permission profile"
                rules={[{ required: true, message: "Please select a permission profile!" }]}
              >
                <Select placeholder="Select...">
                  <Option value="admin">Admin</Option>
                  <Option value="manager">Manager</Option>
                  <Option value="employee">Employee</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="emails"
                label="Email Address"
                rules={[
                  { required: true, message: "Email is required" },
                  {
                    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Enter a valid email address",
                  },
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Form>
          </div>
        </Modal>

        <Modal
          title="Confirm Delete"
          open={isDeleteModalVisible}
          onOk={() => {
            // TODO: implement delete logic
            setIsDeleteModalVisible(false);
          }}
          onCancel={() => setIsDeleteModalVisible(false)}
          okText="Delete"
          cancelText="Cancel"
          okType="danger"
          width="45%"
          className="modal-container"
          centered
        >
          <div style={{ padding: "0px 10px" }}>
            <p>
              <ExclamationCircleOutlined style={{ color: "red", marginRight: 8 }} />
              Are you sure you want to Remove this user? This action cannot be undone.
            </p>
          </div>
        </Modal>

        <ToastContainer />
      </div>
    </>
  );
};

export default ManageUser;
