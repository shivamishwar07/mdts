import React, { useState, useEffect, ChangeEvent } from "react";
import { Switch, IconButton, Toolbar, Tooltip, } from "@mui/material";
import { getCurrentUser } from "../Utils/moduleStorage";
import { useNavigate } from "react-router-dom";
import "../styles/user-management.css";
import { Notifications, DeleteOutlined } from "@mui/icons-material";
import { Button, Col, Form, Input, message, Modal, Row, Select, Table } from "antd";
import { ExclamationCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { db } from "../Utils/dataStorege.ts";

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
  const [openAlertModal, setOpenAlertModal] = useState<boolean>(false);
  const [openRACIModal, setOpenRACIModal] = useState<boolean>(false);
  const [_isRACIValid, _setIsRACIValid] = useState<boolean>(false);
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
  // const [selectedEmails, setSelectedEmails] = useState<any>([]);
  const [currentUser, setCurrentUser] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      const allUsers = await db.getUsers();
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

    if (openRACIModal) {
      fetchData();
    }
  }, [openRACIModal]);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    saveModulesData();
    getAllUsersData();
  }, [])

  const saveModulesData = async () => {
    const savedModules: Module[] = await db.getModules();
    setModules(savedModules);
  }

  const getAllUsersData = async () => {
    const storedUsers: any = await db.getUsers();
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

  // const invitationSuggestions = [
  //   { name: 'sudhindra rao', role: 'Founder & COO', email: 'sudhindra@simpro.co.in' },
  //   { name: 'amit tiwari', role: 'Manager-Business', email: 'amit.tiwari@simpro.co.in' }
  // ];

  // const handleAddEmail = (email: any) => {
  //   if (!selectedEmails.includes(email)) {
  //     setSelectedEmails([...selectedEmails, email]);
  //   }
  // };

  const handleSendInvites = async () => {
    try {
      const values = await form.validateFields();

      const { employeeFullName, permissionProfile, emails } = values;

      if (!employeeFullName || !permissionProfile || !emails) {
        return message.error("Please fill all required fields");
      }

      const users = await db.getUsers();
      const emailExists = users.some((user) => user.email === emails);
      const currentUser = getCurrentUser();

      if (emailExists) {
        return message.error("Email already registered");
      }

      const password = emails.slice(0, 6);
      const newUser = {
        id: Date.now(),
        name: employeeFullName,
        company: currentUser.company,
        designation: "",
        mobile: "",
        email: emails,
        whatsapp: "",
        registeredOn: new Date().toISOString(),
        profilePhoto: "",
        password: password,
        isTempPassword: true,
        role: permissionProfile,
      };

      await db.addUsers(newUser);

      message.success("Member added successfully!");
      form.resetFields();
      setAddMemberModalVisible(false);
      handleClose();
      const allUsers = await db.getUsers();
      setUsers(allUsers);
    } catch (error: any) {
      console.error(error);
      message.error(error.message || "Error adding member!");
    }
  };

  const handleClose = () => {
    setAddMemberModalVisible(false);
    setEditIsModalVisible(false);
  };

  const handleRemoveUser = () => {
    setIsDeleteModalVisible(true);
  }

  const [dataSource, setDataSource] = useState<any>([]);

  useEffect(() => {
    setDataSource(users.map((user: any, index: any) => ({
      ...user,
      key: user.id,
      serialNumber: index + 1,
    })));
  }, [users]);


  const handleRoleChange = async (userId: any, newRole: any) => {
    try {
      const selectedUser = await db.getUserById(userId);
      const updatedUser = { ...selectedUser, role: newRole };

      await db.updateUsers(userId, updatedUser);
      message.success("Role updated successfully.");

      setDataSource((prev: any) =>
        prev.map((user: any) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error(error);
      message.error("Failed to update role.");
    }
  };

  const handleRefresh = async() => {
    const allUsers = await db.getUsers();
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
    },
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
                {
                  title: 'Delete User',
                  icon: <DeleteOutlined style={{ color: 'red' }} />,
                  action: () => setIsDeleteModalVisible(true),
                },
                {
                  title: 'Alerts',
                  icon: <Notifications sx={{ color: '#d32f2f' }} />,
                  action: () => setOpenAlertModal(true),
                },
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
        visible={addMemberModalVisible}
        onCancel={handleClose}
        onOk={handleSendInvites}
        okText="Save"
        okButtonProps={{ className: "bg-secondary" }}
        cancelButtonProps={{ className: "bg-tertiary" }}
        closable={false}
        width={"50%"}
        className="modal-container"
      >
        <div className="modal-body" style={{ padding: "20px" }}>
          {/* <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Text strong style={{ fontSize: "16px" }}>Invite your Team</Text>
            <Button
              size="small"
              className="bg-secondary"
              style={{ fontSize: "0.75rem", padding: "2px 8px", minWidth: "auto", textTransform: "none" }}
              onClick={() => navigate("/employee-registration")}
            >
              Create Member Manually
            </Button>
          </div> */}

          <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item
              name="employeeFullName"
              label="Full Name"
              rules={[{ required: true, message: 'Please enter the employee full name!' }]}
            >
              <Input placeholder="Enter full name" />
            </Form.Item>

            <Form.Item
              name="permissionProfile"
              label="Set permission profile"
              className="mt-2"
              rules={[{ required: true, message: 'Please select a permission profile!' }]}
            >
              <Select placeholder="Select...">
                <Option value="admin">Admin</Option>
                <Option value="manager">Manager</Option>
                <Option value="employee">Employee</Option>
              </Select>
            </Form.Item>

            <Form.Item name="emails" className="mt-2" label="Enter email addresses">
              <Input placeholder="Enter email address" />
            </Form.Item>
          </Form>

          {/* <div style={{ marginTop: 24 }}>
            <Text strong>Invitation Suggestions</Text>
            <List
              dataSource={invitationSuggestions}
              renderItem={item => (
                <List.Item
                  actions={[<Button onClick={() => handleAddEmail(item.email)}>Add</Button>]}
                >
                  <List.Item.Meta
                    title={item.name}
                    description={`${item.role} | ${item.email}`}
                  />
                </List.Item>
              )}
            />
          </div> */}
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

    </div >
  );
};

export default ManageUser;
