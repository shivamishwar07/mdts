import { useEffect, useState } from "react";
import "../styles/profile.css";
import { Form, Input, Button, Row, Col, Select, Modal } from "antd";
import ManageUser from "../Components/ManageUser";
import { CameraOutlined } from "@ant-design/icons";
import { db } from "../Utils/dataStorege.ts";
import { getCurrentUser, getCurrentUserId } from '../Utils/moduleStorage';
import { userStore } from "../Utils/UserStore.ts";
const { Option } = Select;
import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { ToastContainer } from "react-toastify";
import { notify } from "../Utils/ToastNotify.tsx";
const Profile = () => {

    const [formData, setFormData] = useState<any>({
        id: null as number | null,
        name: null as string | null,
        company: null as string | null,
        designation: null as string | null,
        companyType: null as string | null,
        industryType: null as string | null,
        mobile: null as string | null,
        email: null as string | null,
        whatsapp: null as string | null,
        registeredOn: null as string | null,
        profilePhoto: null as string | null,
        companyLogo: null as string | null,
        password: null as string | null,
        isTempPassword: null as boolean | null,
        role: null as string | null,
        address: null as string | null,
        city: null as string | null,
        state: null as string | null,
        country: null as string | null,
        zipCode: null as string | null,
        assignedModules: [] as {
            moduleCode: string | null;
            moduleName: string | null;
            isApplicableOnModule: boolean | null;
            responsibilitiesOnActivities: {
                activityCode: string | null;
                activityName: string | null;
                responsibilities: string[];
            }[];
        }[]
    });
    const [selectedTab, setSelectedTab] = useState("Profile Information");
    const [image, setImage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [password, setPassword] = useState("");

    useEffect(() => {
        fillUsersData();
    }, []);

    useEffect(() => {
        if (formData.id) {
            const storedImage = formData.profilePhoto;
            if (storedImage) {
                setImage(storedImage);
            }
        }
    }, [formData.id]);

    const fillUsersData = async () => {
        const currentUserId = getCurrentUserId();
        const userData = await db.getUserById(currentUserId);
        if (userData) {
            setFormData({
                id: userData.id || "",
                name: userData.name || "",
                company: userData.company || "",
                designation: userData.designation || "",
                companyType: userData.companyType || "",
                industryType: userData.industryType || "",
                mobile: userData.mobile || "",
                email: userData.email || "",
                whatsapp: userData.whatsapp || "",
                registeredOn: userData.registeredOn || "",
                profilePhoto: userData.profilePhoto || "",
                companyLogo: userData.companyLogo || "",
                address: userData.address,
                city: userData.city,
                state: userData.state,
                country: userData.country,
                zipCode: userData.zipCode || "",
                role: userData.role || "",
                isTempPassword: userData.isTempPassword,
                Password: userData.password || ''
            });
            form.resetFields();
        }

    }

    const isProfileCompleted = () => {
        return (
            formData.name &&
            formData.company &&
            formData.designation &&
            formData.mobile &&
            formData.email &&
            formData.whatsapp &&
            formData.registeredOn &&
            formData.role &&
            formData.profilePhoto
        );
    };

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: any, name: any) => {
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const users = await db.getUsers();
            const currentUser = getCurrentUser();

            if (!currentUser?.email) {
                notify.error("No user found. Please log in again.");
                return;
            }

            if (currentUser?.isTempPassword) {
                setIsModalOpen(true);
            }

            if (currentUser.id) {
                const updatedUser = { ...users[currentUser.id], ...formData, isTempPassword: false };
                await db.updateUsers(updatedUser.id, updatedUser);
                userStore.setUser(updatedUser);

                if (!formData.isTempPassword) {
                    notify.success("Profile information updated successfully!");
                }
            } else {
                notify.error("User not found in database.");
            }
        } catch (error) {
            console.error("Error updating user profile:", error);
            notify.error("An error occurred while updating profile. Please try again.");
        }
    };

    function getInitials(name?: string): string {
        if (!name) return "";
        const parts = name.trim().split(/\s+/);
        return parts.length > 1
            ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
            : parts[0][0]?.toUpperCase() || "";
    }

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = event.target.files?.[0];
            if (!file) {
                notify.error("No file selected.");
                return;
            }

            const reader = new FileReader();
            reader.onload = async (e) => {
                if (!e.target?.result) {
                    notify.error("Error reading file.");
                    return;
                }

                const base64Image = e.target.result as string;
                setImage(base64Image);

                const currentUserId = getCurrentUserId();
                const activeUser = await db.getUserById(currentUserId);
                if (!activeUser) {
                    notify.error("User not found.");
                    return;
                }

                const updatedUser = { ...activeUser, profilePhoto: base64Image };
                await db.updateUsers(currentUserId, updatedUser);

                const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
                const updatedLocalUser = { ...currentUser, profilePhoto: base64Image };
                localStorage.setItem("user", JSON.stringify(updatedLocalUser));
                userStore.setUser(updatedLocalUser);

                notify.success("Profile photo updated successfully!");
                setIsModalOpen(false);
                fillUsersData();
            };

            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Error updating profile photo:", error);
            notify.error("Something went wrong. Please try again.");
        }
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const handlePasswordUpdate = async (values: any) => {
        const currentUser = getCurrentUser();
        if (values.oldPassword == currentUser.password) {
            const users = {
                ...currentUser, password: values.newPassword,
                isTempPassword: false,
            }
            await db.updateUsers(currentUser.id, users);

            localStorage.setItem("user", JSON.stringify({ ...currentUser, password: values.newPassword, isTempPassword: false }));

            notify.success(formData.isTempPassword ? "Profile updated successfully!" : "Password updated successfully!");
            setIsModalOpen(false);
            setTimeout(() => {
                fillUsersData();
            }, 1000)
        }
        else {
            notify.error("Current password is incorrect");
        }

    };

    const renderContent = () => {
        switch (selectedTab) {
            case "Profile Information":
                return (
                    <div style={{ marginTop: "10px" }} className="card">
                        <div className="card-body">
                            <div className="profile-cover" style={{ backgroundColor: '#258790' }}>
                                <div className="profile-item">
                                    <div className="profile-image-container">
                                        <img src={image || "https://via.placeholder.com/100"} alt={getInitials()} className="profile-image" />
                                        <div className="overlay">
                                            <label htmlFor="file-input" className="upload-icon">
                                                <CameraOutlined className="upload-icon" />
                                            </label>
                                            <input
                                                type="file"
                                                id="file-input"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {!formData.isTempPassword && (
                                <div className="change-password-container">
                                    <a onClick={showModal}>Change Password</a>
                                </div>
                            )}
                            <div className="company-registration-form">
                                <Form
                                    className={`employee-professional-form ${isProfileCompleted()
                                        ? "registration-height-without-warning"
                                        : "registration-height-with-warning"
                                        }`}
                                    layout="horizontal"
                                    labelCol={{ span: 6 }}
                                    wrapperCol={{ span: 18 }}
                                    labelAlign="left"
                                >
                                    <Row gutter={[16, 16]} className="form-row">
                                        <Col span={12}>
                                            <Form.Item
                                                label="Company Name"
                                                colon={false}
                                                rules={[{ required: true, message: "Please enter company name" }]}
                                            >
                                                <Input
                                                    name="company"
                                                    value={formData.company}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter Company"
                                                    disabled={formData.role != 'Admin'}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                label="Company Type"
                                                colon={false}
                                                rules={[{ required: true, message: "Please select company type" }]}
                                            >
                                                <Select
                                                    value={formData.companyType}
                                                    onChange={(value) => handleSelectChange(value, "companyType")}
                                                    placeholder="Select Company Type"
                                                    style={{ width: "100%" }}
                                                >
                                                    <Option value="Mining">Mining</Option>
                                                    <Option value="Construction">Construction</Option>
                                                    <Option value="Equipment Supplier">Equipment Supplier</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={[16, 16]} className="form-row">
                                        <Col span={12}>
                                            <Form.Item
                                                label="Industry Type"
                                                colon={false}
                                                rules={[{ required: true, message: "Please select industry type" }]}
                                            >
                                                <Select
                                                    value={formData.industryType}
                                                    onChange={(value) => handleSelectChange(value, "industryType")}
                                                    placeholder="Select Industry Type"
                                                    style={{ width: "100%" }}
                                                >
                                                    <Option value="Coal">Coal</Option>
                                                    <Option value="Iron">Iron</Option>
                                                    <Option value="Gold">Gold</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                label="Designation"
                                                colon={false}
                                                rules={[{ required: true, message: "Please select designation" }]}
                                            >
                                                <Select
                                                    value={formData.designation}
                                                    onChange={(value) => handleSelectChange(value, "designation")}
                                                    placeholder="Select Designation"
                                                    style={{ width: "100%" }}
                                                >
                                                    <Option value="Mining Engineer">Mining Engineer</Option>
                                                    <Option value="Geologist">Geologist</Option>
                                                    <Option value="Operations Manager">Operations Manager</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={[16, 16]} className="form-row">
                                        <Col span={12}>
                                            <Form.Item
                                                label="Full Name"
                                                colon={false}
                                                rules={[{ required: true, message: "Please enter name" }]}
                                            >
                                                <Input
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter Name"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                label="Email"
                                                colon={false}
                                                rules={[{ required: true, message: "Please enter email", type: "email" }]}
                                            >
                                                <Input
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter Email"
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={[16, 16]} className="form-row">
                                        <Col span={12}>
                                            <Form.Item
                                                label="Mobile No"
                                                colon={false}
                                                rules={[{ required: true, message: "Please enter mobile number" }]}
                                            >
                                                <Input
                                                    name="mobile"
                                                    value={formData.mobile}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter Mobile No"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item label="WhatsApp No" colon={false}>
                                                <Input
                                                    name="whatsapp"
                                                    value={formData.whatsapp}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter WhatsApp No"
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={[16, 16]} className="form-row">
                                        <Col span={12}>
                                            <Form.Item
                                                label="Role"
                                                colon={false}
                                                rules={[{ required: true, message: "Please select role" }]}
                                            >
                                                <Select
                                                    value={formData.role}
                                                    onChange={(value) => handleSelectChange(value, "role")}
                                                    disabled
                                                    placeholder="Select Role"
                                                    style={{ width: "100%" }}
                                                >
                                                    <Option value="admin">Admin</Option>
                                                    <Option value="manager">Manager</Option>
                                                    <Option value="worker">Worker</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>

                                        <Col span={12}>
                                            <Form.Item label="City" colon={false}>
                                                <Input
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter City"
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={[16, 16]} className="form-row">
                                        <Col span={12}>
                                            <Form.Item label="Address" colon={false}>
                                                <Input.TextArea
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter Address"
                                                    rows={3}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={[16, 16]} className="form-row">
                                        <Col span={12}>
                                            <Form.Item label="State" colon={false}>
                                                <Input
                                                    name="state"
                                                    value={formData.state}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter State"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item label="Country" colon={false}>
                                                <Input
                                                    name="country"
                                                    value={formData.country}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter Country"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item label="Zip Code" colon={false}>
                                                <Input
                                                    name="zipCode"
                                                    value={formData.zipCode}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter Zip Code"
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Form>
                            </div>


                            <hr />
                            <div className="button-group">
                                <Button
                                    className="bg-secondary save-btn"
                                    onClick={handleSave}
                                    style={{ float: "right" }}
                                >
                                    {formData.isTempPassword ? 'Save' : 'Update'}
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            case "Team Members":
                return <div className=""><ManageUser options={{ isAddMember: true, isToolbar: true, title: "Team Members" }} /></div>;
            case "Projects":
                return <div className="card">Projects Section</div>;
            default:
                return null;
        }
    };

    const getPasswordStrength = (password: string) => {
        if (!password) return "";
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[\W_]/.test(password)) score++;

        if (score <= 2) return "Weak";
        if (score === 3 || score === 4) return "Medium";
        return "Strong";
    };

    const getPasswordValidationStatus = (pwd: any) => {
        return {
            length: pwd.length >= 8,
            uppercase: /[A-Z]/.test(pwd),
            lowercase: /[a-z]/.test(pwd),
            number: /\d/.test(pwd),
            specialChar: /[\W_]/.test(pwd),
        };
    };

    return (
        <>
            <div className="main-profile">
                <div className="sidebar-menu">
                    <div className="basic-info">
                        <div>
                            <img
                                src={image || "../public/images/logos/user-profile.png"}
                                alt="Logo"
                                className="profile-image"
                            />
                        </div>
                        <div className="details">
                            <div style={{ fontSize: "18px" }}>{formData?.name || ""}</div>
                            <div style={{ color: "grey", fontSize: "12px" }}>{formData?.company || ""}</div>
                        </div>
                    </div>

                    {['Profile Information', 'Team Members'].map((tab) => {
                        if (tab === 'Team Members' && formData?.role?.toUpperCase() !== 'ADMIN') {
                            return null;
                        }

                        return (
                            <div
                                key={tab}
                                className={`items ${selectedTab === tab ? 'active-tab' : ''}`}
                                onClick={() => setSelectedTab(tab)}
                            >
                                {tab}
                            </div>
                        );
                    })}
                </div>

                <div style={{ marginBottom: "0px" }} className="items-details">
                    {!isProfileCompleted() && (
                        <div style={{ marginTop: "10px" }} className={`card-header progress-warning create-doc-heading ${isProfileCompleted() ? 'bg-secondary' : ""}`}>
                            <p style={{ margin: "0px", padding: "0px" }}>{isProfileCompleted() ? "Manage Profile" : "Please complete registration"}</p>
                        </div>
                    )}
                    {renderContent()}
                </div>
            </div>

            <div className="modal-container">
                <Modal
                    title={formData.name ? "Name" : "Email"}
                    open={isModalOpen}
                    onCancel={handleCancel}
                    footer={null}
                    className="modal-container"
                >
                    <Form
                        requiredMark={false}
                        form={form}
                        layout="horizontal"
                        onFinish={handlePasswordUpdate}
                        style={{ padding: "10px 10px 0px 10px" }}
                        colon={false}
                    >
                        {!formData?.isTempPassword && (
                            <Form.Item
                                label="Old Password"
                                name="oldPassword"
                                labelCol={{ span: 8, style: { textAlign: "left" } }}
                                wrapperCol={{ span: 16 }}
                                rules={[{ required: true, message: "Please enter your old password!" }]}
                            >
                                <Input.Password placeholder="Enter old password" />
                            </Form.Item>
                        )}
                        {formData.isTempPassword}
                        <Form.Item
                            label={
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    New Password
                                    <Tooltip
                                        title={
                                            (() => {
                                                const status = getPasswordValidationStatus(password);
                                                const getStyle = (pass: any) => ({
                                                    color: pass ? "green" : "red",
                                                    fontWeight: "bold",
                                                });

                                                return (
                                                    <div style={{ lineHeight: 1.6 }}>
                                                        <div style={getStyle(status.length)}>• At least 8 characters</div>
                                                        <div style={getStyle(status.uppercase)}>• One uppercase letter</div>
                                                        <div style={getStyle(status.lowercase)}>• One lowercase letter</div>
                                                        <div style={getStyle(status.number)}>• One number</div>
                                                        <div style={getStyle(status.specialChar)}>• One special character</div>
                                                    </div>
                                                );
                                            })()
                                        }
                                        placement="right"
                                        overlayInnerStyle={{
                                            backgroundColor: "#f9f9f9",
                                            color: "#333",
                                            padding: "10px",
                                            borderRadius: 6,
                                            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                        }}
                                    >
                                        <InfoCircleOutlined style={{ color: "#888", cursor: "pointer" }} />
                                    </Tooltip>

                                </div>
                            }
                            name="newPassword"
                            labelCol={{ span: 8, style: { textAlign: "left" } }}
                            wrapperCol={{ span: 16 }}
                            rules={[
                                { required: true, message: "Please enter a new password!" },
                                {
                                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
                                    message:
                                        "Password must contain uppercase, lowercase, number, special char, and be at least 8 characters."
                                }
                            ]}
                        >
                            <Input.Password placeholder="Enter new password" onChange={(e) => setPassword(e.target.value)} />
                        </Form.Item>

                        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.newPassword !== curr.newPassword}>
                            {({ getFieldValue }) => {
                                const strength = getPasswordStrength(getFieldValue("newPassword"));
                                return strength ? (
                                    <div className="strength-pill-wrapper">
                                        <span className={`strength-pill ${strength.toLowerCase()}`}>{strength}</span>
                                    </div>
                                ) : null;
                            }}
                        </Form.Item>

                        <Form.Item
                            label="Confirm New Password"
                            name="confirmNewPassword"
                            labelCol={{ span: 8, style: { textAlign: "left" } }}
                            wrapperCol={{ span: 16 }}
                            dependencies={["newPassword"]}
                            rules={[
                                { required: true, message: "Please confirm your new password!" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue("newPassword") === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error("Passwords do not match!"));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password placeholder="Confirm new password" />
                        </Form.Item>

                        <Form.Item style={{ display: "flex", justifyContent: "end" }}>
                            <Button type="primary" className="bg-secondary" htmlType="submit">
                                Save
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>

            <ToastContainer />
        </>
    );
};

export default Profile;