import { useState } from "react";
import "../styles/settings-privacy.css";
import { motion } from "framer-motion";
import {
    LockOutlined,
    BellOutlined,
    UserOutlined,
    GlobalOutlined,
    SafetyOutlined,
    ApiOutlined,
} from "@ant-design/icons";
import { Switch } from "antd";

const TABS = [
    { key: "workflow", icon: <ApiOutlined />, title: "Workflow" },
    { key: "profile", icon: <UserOutlined />, title: "Profile" },
    { key: "security", icon: <LockOutlined />, title: "Password & Security" },
    { key: "notifications", icon: <BellOutlined />, title: "Notifications" },
    { key: "privacy", icon: <GlobalOutlined />, title: "Privacy Preferences" },
    { key: "sessions", icon: <SafetyOutlined />, title: "Session & Device History" },
    { key: "api", icon: <ApiOutlined />, title: "Integrations & API" },
];

const SettingsAndPrivacy = () => {
    const [activeTab, setActiveTab] = useState("profile");
    const [notifications, setNotifications] = useState(true);
    const [twoFactorAuth, setTwoFactorAuth] = useState(false);
    const renderContent = () => {
        switch (activeTab) {
            case "profile":
                return (
                    <>
                        <h3>Profile</h3>
                        <p>Update your name, email address, phone number, and profile picture.</p>
                        <ul>
                            <li>View and edit your basic information</li>
                            <li>Change profile image</li>
                            <li>Update timezone and language preferences</li>
                        </ul>
                    </>
                );
            case "security":
                return (
                    <>
                        <h3>Password & Security</h3>
                        <p>Manage your authentication methods and secure your account.</p>
                        <ul>
                            <li>Change your account password</li>
                            <li>Enable or disable Two-Factor Authentication (2FA)</li>
                            <li>View recent login attempts</li>
                        </ul>
                        <div className="toggle-group">
                            <label>Enable Two-Factor Authentication</label>
                            <Switch checked={twoFactorAuth} onChange={setTwoFactorAuth} />
                        </div>
                    </>
                );
            case "notifications":
                return (
                    <>
                        <h3>Notifications</h3>
                        <p>Choose how you get notified for activity and updates.</p>
                        <ul>
                            <li>Email alerts for important updates</li>
                            <li>SMS for critical changes or workflow approvals</li>
                            <li>Manage push/browser notifications</li>
                        </ul>
                        <div className="toggle-group">
                            <label>Email & SMS Alerts</label>
                            <Switch checked={notifications} onChange={setNotifications} />
                        </div>
                    </>
                );
            case "privacy":
                return (
                    <>
                        <h3>Privacy Preferences</h3>
                        <p>Control your data visibility and consent options.</p>
                        <ul>
                            <li>Allow search engines to index your profile</li>
                            <li>Consent to data processing for analytics</li>
                            <li>Download or delete your data</li>
                        </ul>
                    </>
                );
            case "sessions":
                return (
                    <>
                        <h3>Session & Device History</h3>
                        <p>View and manage where your account is logged in.</p>
                        <ul>
                            <li>Current active sessions</li>
                            <li>Terminate sessions from unknown devices</li>
                            <li>Setup session timeout duration</li>
                        </ul>
                    </>
                );
            case "api":
                return (
                    <>
                        <h3>Integrations & API</h3>
                        <p>Configure third-party system access and generate developer keys.</p>
                        <ul>
                            <li>Create or revoke API keys</li>
                            <li>Enable webhook listeners</li>
                            <li>Monitor API usage stats</li>
                        </ul>
                    </>
                );
            case "workflow":
                return (
                    <>
                        <h3>Workflow Settings</h3>
                        <p>Define your operational workflows and approval hierarchies.</p>
                        <ul>
                            <li>Set approval chains for project changes</li>
                            <li>Manage automation triggers and escalation policies</li>
                            <li>Enable/disable module-wise workflow steps</li>
                        </ul>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <motion.div
            className="settings-layout"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="settings-sidebar">
                <h2>Settings</h2>
                {TABS.map((tab) => (
                    <div
                        key={tab.key}
                        className={`settings-tab ${activeTab === tab.key ? "active" : ""}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.icon}
                        <span>{tab.title}</span>
                    </div>
                ))}
            </div>

            <div className="settings-content-panel">
                {renderContent()}
            </div>
        </motion.div>
    );
};

export default SettingsAndPrivacy;