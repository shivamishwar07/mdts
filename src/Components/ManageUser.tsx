import React, { useState, useEffect, ChangeEvent } from "react";
import { Switch, IconButton, Toolbar, Tooltip, } from "@mui/material";
import { getCurrentUser } from "../Utils/moduleStorage";
import { useNavigate } from "react-router-dom";
import "../styles/user-management.css";
import { Button, Col, Form, Input, Modal, Row, Select, Table } from "antd";
import { ExclamationCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { db } from "../Utils/dataStorege.ts";
import { ToastContainer } from "react-toastify";
import { notify } from "../Utils/ToastNotify.tsx";
import { v4 as uuidv4 } from 'uuid';
const { Option } = Select;
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
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
  const [openAlertModal, setOpenAlertModal] = useState<boolean>(false);
  const [openRACIModal, setOpenRACIModal] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [_isEditModalVisible, setEditIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: true,
    whatsapp: true,
    text: true,
  });
  const [form] = Form.useForm();
  const [currentUser, setCurrentUser] = useState<any>({});
  const [dataSource, setDataSource] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      const allUsers = (await db.getUsers()).filter((user: any) => user.orgId == currentUser?.orgId);
      setUsers(allUsers);
      const uniqueModules: any = [];
      allUsers.forEach((user: User) => {
        user.assignedModules?.forEach((module) => {
          if (!uniqueModules.some((m: any) => m.parentModuleCode === module.moduleCode)) {
            uniqueModules.push({
              parentModuleCode: module.moduleCode,
              moduleName: module.moduleName,
            });
          }
        });
      });
      setModules(uniqueModules);
    };

    fetchData();
  }, [currentUser]);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    saveModulesData();
    getAllUsersData();
  }, [])

  useEffect(() => {
    setDataSource(users.map((user: any, index: any) => ({
      ...user,
      key: user.id,
      serialNumber: index + 1,
    })));
  }, [users]);

  const saveModulesData = async () => {
    const savedModules: Module[] = (await db.getModules()).filter((mod: any) => mod.orgId == currentUser?.orgId);
    setModules(savedModules);
  }

  const getAllUsersData = async () => {
    const storedUsers = (await db.getUsers()).filter((user: any) => user.orgId == currentUser?.orgId);
    if (storedUsers) {
      const parsedUsers: User[] = storedUsers.map((user: any) => ({
        id: user.id,
        name: user.name || "N/A",
        company: user.company || "N/A",
        designation: user.designation || "N/A",
        mobile: user.mobile || "N/A",
        email: user.email,
        whatsapp: user.whatsapp || "N/A",
        registeredOn: user.registeredOn || "",
        profilePhoto: user.profilePhoto || "https://via.placeholder.com/120",
        role: user.role || "User",
      }));
      setUsers(parsedUsers);
    }
  }

  const handleRowClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleCloseModal = () => {
    setOpenAlertModal(false);
    setOpenRACIModal(false);
  };

  const handleToggle = (event: ChangeEvent<HTMLInputElement>) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [event.target.name]: event.target.checked,
    }));
  };

  const handleViewUser = (record: any) => {
    setSelectedUser(record);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    if (selectedUser) {
      navigate(`/view-user`, { state: { user: selectedUser } });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  function getInitials(name?: string): string {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0][0]?.toUpperCase() || "";
  }

  const handleSendInvites = async () => {
    try {
      const currentUser = getCurrentUser(); // <-- move this up

      const values = await form.validateFields();
      const { employeeFullName, permissionProfile, emails, mobile, designation } = values;

      const users = (await db.getUsers()).filter((user: any) => user.orgId == currentUser?.orgId);
      const emailExists = users.some((user) => user.email === emails);
      if (emailExists) {
        return notify.error("Email already registered");
      }

      const password = emails.slice(0, 6);
      const guiId = uuidv4();

      let companyDetails = {};
      if (currentUser.orgId) {
        const company = await db.getCompanyByGuiId(currentUser.orgId);
        if (company) {
          companyDetails = {
            company: company.name || "",
            industryType: company.industryType || "",
            companyType: company.companyType || "",
            city: company.city || "",
            state: company.state || "",
            country: company.country || "",
            zipCode: company.zipCode || "",
            address: company.address || ""
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
        password: password,
        isTempPassword: true,
        role: permissionProfile,
        orgId: currentUser.orgId || null,
        addedBy: currentUser.guiId,
        userType: "IND",
        ...companyDetails
      };

      await db.addUsers(newUser);

      if (currentUser.orgId) {
        const company = await db.getCompanyByGuiId(currentUser.orgId);
        if (company) {
          const updatedCompany = {
            ...company,
            userGuiIds: Array.from(new Set([...(company.userGuiIds || []), guiId]))
          };
          await db.updateCompany(company.id, updatedCompany);
        }
      }

      notify.success("Member added successfully!");
      form.resetFields();
      setAddMemberModalVisible(false);
      handleClose();

      const allUsers = (await db.getUsers()).filter((user: any) => user.orgId == currentUser?.orgId);
      setUsers(allUsers);
    } catch (error: any) {
      console.error(error);
      notify.error(error.message || "Error adding member!");
    }
  };


  const handleClose = () => {
    setAddMemberModalVisible(false);
    setEditIsModalVisible(false);
  };

  const handleRemoveUser = () => {
    setIsDeleteModalVisible(true);
  }

  const handleRoleChange = async (userId: any, newRole: any) => {
    try {
      const selectedUser = await db.getUserById(userId);
      const updatedUser = { ...selectedUser, role: newRole };

      await db.updateUsers(userId, updatedUser);
      notify.success("Role updated successfully.");

      setDataSource((prev: any) =>
        prev.map((user: any) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error(error);
      notify.error("Failed to update role.");
    }
  };

  const handleRefresh = async () => {
    const allUsers = (await db.getUsers()).filter((user: any) => user.orgId == currentUser?.orgId);
    setUsers(allUsers);
  };

  const columns: any = [
    {
      title: "S.No",
      dataIndex: "serialNumber",
      key: "serialNumber",
      align: "center",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Company",
      dataIndex: "company",
      key: "company",
      align: "center",
    },
    {
      title: "Designation",
      dataIndex: "designation",
      key: "designation",
      align: "center",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      align: "center",
      render: (role: any, record: any) => (
        <Select
          value={role}
          onChange={(value) => handleRoleChange(record.id, value)}
          style={{ width: 120 }}
          disabled={currentUser?.id === record.id}
        >
          <Option value="admin">Admin</Option>
          <Option value="manager">Manager</Option>
          <Option value="employee">Employee</Option>
        </Select>
      ),
    },
    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
      align: "center",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "center",
    },
    {
      title: "WhatsApp",
      dataIndex: "whatsapp",
      key: "whatsapp",
      align: "center",
      render: (_: any, record: any) => {
        return (record.whatsapp && record.whatsapp !== "N/A")
          ? record.whatsapp
          : (record.mobile && record.mobile !== "N/A" ? record.mobile : "N/A");
      },
    }
  ];

  return (
    <div className="page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div className="holiday-page-heading" style={{ marginLeft: "10px" }}>
            {options?.title || "RACI, Alert & Notification"}
          </div>
          {options?.isAddMember && (
            <Tooltip title="Add new member">
              <Button
                style={{ fontSize: "14px", textTransform: "none", padding: "0px 10px" }}
                size="small"
                onClick={() => setAddMemberModalVisible(true)}
                className="add-member-button bg-secondary"
              >
                Add Member
              </Button>
            </Tooltip>
          )}
        </div>
        {
          options?.isToolbar !== false && (
            <Toolbar className="toolbar" style={{ paddingRight: '5px' }}>
              {[
                // {
                //   title: 'Delete User',
                //   icon: <DeleteOutlined style={{ color: 'red' }} />,
                //   action: () => setIsDeleteModalVisible(true),
                // },
                // {
                //   title: 'Alerts',
                //   icon: <Notifications sx={{ color: '#d32f2f' }} />,
                //   action: () => setOpenAlertModal(true),
                // },
                {
                  title: 'Refresh',
                  icon: <ReloadOutlined style={{ color: '#1890ff' }} />,
                  action: handleRefresh,
                },
              ].map(({ title, icon, action }, index) => (
                <Tooltip key={index} title={title}>
                  <IconButton
                    onClick={action}
                    disabled={!selectedUser && title !== 'Add new member' && title !== 'Refresh'}
                    className={`toolbar-icon ${selectedUser || title === 'Refresh' ? 'enabled' : 'disabled'}`}
                  >
                    {icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Toolbar>
          )}
      </div>
      <hr style={{ marginTop: "5px" }} />
      <Table
        columns={columns}
        dataSource={dataSource}
        rowClassName={(record: any) =>
          selectedUser?.id === record.id ? "selected-row-active" : "selected-row"
        }
        style={{ marginTop: "5px" }}
        onRow={(record) => {
          let clickTimer: NodeJS.Timeout | null = null;
          return {
            onClick: () => {
              if (clickTimer) {
                clearTimeout(clickTimer);
                clickTimer = null;
                handleViewUser(record);
              } else {
                clickTimer = setTimeout(() => {
                  handleRowClick(record);
                  clickTimer = null;
                }, 250);
              }
            },
          };
        }}
        pagination={{ pageSize: 10 }}
        bordered
      />

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
        <div style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          alignItems: "center",
          padding: "10px",
        }}>
          <div>
            <Switch checked={notificationSettings.email} onChange={handleToggle} name="email" /> Email
          </div>
          <div>
            <Switch checked={notificationSettings.whatsapp} onChange={handleToggle} name="whatsapp" /> WhatsApp
          </div>
          <div>
            <Switch checked={notificationSettings.text} onChange={handleToggle} name="text" /> Text
          </div>
        </div>
      </Modal>

      <Modal
        title="RACI Module Assignments"
        open={openRACIModal}
        onCancel={handleCloseModal}
        className="modal-container"
        footer={[
          <Button key="close" onClick={handleCloseModal} className="raci-button raci-close-button">
            Close
          </Button>,
          <Button key="save" type="primary" onClick={handleCloseModal} className="raci-button raci-save-button">
            Save
          </Button>,
        ]}
        width={800}
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
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        centered
        className="custom-user-modal"
        width={800}
        footer={[""]}
      >
        <div className="user-info-main">
          <div className="profile-cover bg-secondary">
            <div className="profile-item">
              <span>{getInitials(selectedUser?.name)}</span>
            </div>
          </div>
          <div className="user-details">
            <Row gutter={[16, 16]} className="form-row" align="middle">
              <Col span={6} style={{ textAlign: 'left' }}>
                <label>Full Name</label>
              </Col>
              <Col span={18}>
                <Input
                  disabled
                  style={{ marginBottom: "10px" }}
                  value={selectedUser?.name}
                />
              </Col>
            </Row>
            <Row gutter={[16, 16]} className="form-row" align="middle">
              <Col span={6} style={{ textAlign: 'left' }}>
                <label>Company</label>
              </Col>
              <Col span={18}>
                <Input
                  disabled
                  style={{ marginBottom: "10px" }}
                  value={selectedUser?.company}
                />
              </Col>
            </Row>
            <Row gutter={[16, 16]} className="form-row" align="middle">
              <Col span={6} style={{ textAlign: 'left' }}>
                <label>Designation</label>
              </Col>
              <Col span={18}>
                <Input
                  disabled
                  style={{ marginBottom: "10px" }}
                  value={selectedUser?.designation}
                />
              </Col>
            </Row>
            <Row gutter={[16, 16]} className="form-row" align="middle">
              <Col span={6} style={{ textAlign: 'left' }}>
                <label>Role</label>
              </Col>
              <Col span={18}>
                <Input
                  disabled
                  style={{ marginBottom: "10px" }}
                  value={selectedUser?.role}
                />
              </Col>
            </Row>
            <Row gutter={[16, 16]} className="form-row" align="middle">
              <Col span={6} style={{ textAlign: 'left' }}>
                <label>Mobile</label>
              </Col>
              <Col span={18}>
                <Input
                  disabled
                  style={{ marginBottom: "10px" }}
                  value={selectedUser?.mobile}
                />
              </Col>
            </Row>
            <Row gutter={[16, 16]} className="form-row" align="middle">
              <Col span={6} style={{ textAlign: 'left' }}>
                <label>Email</label>
              </Col>
              <Col span={18}>
                <Input
                  disabled
                  style={{ marginBottom: "10px" }}
                  value={selectedUser?.email}
                />
              </Col>
            </Row>
            <Row gutter={[16, 16]} className="form-row" align="middle">
              <Col span={6} style={{ textAlign: 'left' }}>
                <label>WhatsApp</label>
              </Col>
              <Col span={18}>
                <Input
                  disabled
                  style={{ marginBottom: "10px" }}
                  value={selectedUser?.whatsapp}
                />
              </Col>
            </Row>
            <Row gutter={[16, 16]} className="form-row" align="middle">
              <Col span={6} style={{ textAlign: 'left' }}>
                <label>Registration Date</label>
              </Col>
              <Col span={18}>
                <Input
                  disabled
                  style={{ marginBottom: "10px" }}
                  value={selectedUser?.registeredOn}
                />
              </Col>
            </Row>
          </div>
        </div>
      </Modal>

      <Modal
        title="Add Member"
        visible={addMemberModalVisible}
        onCancel={handleClose}
        onOk={handleSendInvites}
        okText="Save"
        okButtonProps={{ className: "bg-secondary" }}
        cancelButtonProps={{ className: "bg-tertiary" }}
        width={"50%"}
        className="modal-container"
      >
        <div className="modal-body" style={{ padding: "0px 10px" }}>
          <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item
              name="employeeFullName"
              label="Full Name"
              className="form-item"
              rules={[{ required: true, message: 'Please enter the employee full name!' }]}
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
                {
                  required: true,
                  message: 'Please enter mobile number!',
                },
                {
                  validator: (_, value) => {
                    const numeric = value?.replace(/\D/g, '');
                    if (!numeric || numeric.length < 10) {
                      return Promise.reject('Enter a valid 10-digit mobile number with country code');
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <PhoneInput
                country="in"
                inputStyle={{ width: '100%' }}
                enableSearch
                countryCodeEditable={false}
                inputProps={{
                  name: 'mobile',
                  required: true,
                }}
              />
            </Form.Item>

            <Form.Item
              name="permissionProfile"
              label="Set permission profile"
              rules={[{ required: true, message: 'Please select a permission profile!' }]}
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
        visible={isDeleteModalVisible}
        onOk={handleRemoveUser}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Delete"
        cancelText="Cancel"
        okType="danger"
        width={"45%"}
        className="modal-container"
        centered
      >
        <div style={{ padding: "0px 10px" }}>
          <p>
            <ExclamationCircleOutlined style={{ color: "red", marginRight: "8px" }} />
            Are you sure you want to Remove this user? This action cannot be undone.
          </p>
        </div>
      </Modal >

      <ToastContainer />
    </div >
  );
};

export default ManageUser;
