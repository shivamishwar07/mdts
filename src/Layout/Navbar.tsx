import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Dropdown, Button, Typography, Divider, Modal, Badge, Input } from "antd";
import { BellOutlined, DownOutlined, LogoutOutlined, QuestionCircleOutlined, SettingOutlined } from "@ant-design/icons";
import "../styles/nav-bar.css";
import { userStore } from "../Utils/UserStore";
const { Title } = Typography;
interface NavItem {
    label: string;
    action: string;
    subItems?: NavItem[];
    option?: string;
    name?: string;
    isNull?: boolean;
    view?: boolean;
}

const initialNavLinks: any = [
    // { label: "About", action: "/about" },
    { label: "Dashboard", action: "/dashboard" },
    { label: "Documents", action: "/document" },
    { label: "Knowledge Center", action: "/knowledge-center" },
    {
        label: "Data Master",
        subItems: [
            { label: "Module Library", action: "/create/module-library" },
            { label: "Notification", action: "/create/notification", isNull: true }
        ]
    },
    {
        label: "Create",
        subItems: [
            { label: "Register New Project", action: "/create/register-new-project" },
            { label: "Modules", action: "/modules" },
            { label: "Timeline Builder", action: "/create/timeline-builder" },
            { label: "Project Timeline", action: "/create/project-timeline" },
            { label: "Non-working Days", action: "/create/non-working-days" },
            { label: "DPR Cost Builder", action: "/create/dpr-cost-builder", isNull: true },
            { label: "Cash-Flow Builder", action: "/create/cash-flow-builder", isNull: true },
            { label: "Delay Cost Calculator", action: "/create/delay-cost-calculator", isNull: true },
        ]
    }
];

const Navbar: React.FC = () => {
    const [_openPopup, setOpenPopup] = useState<string | null>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const [navLinks, setNavLinks] = useState<NavItem[]>(initialNavLinks);
    const [user, setUser] = useState<any>(null);
    const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
    const handlePopupOpen = (name: string) => setOpenPopup(name);
    const isActive = (action: string) => location.pathname.startsWith(action);
    const [selectedDropdownKeys, setSelectedDropdownKeys] = useState<{ [key: string]: string }>({});
    const showLogoutModal = () => {
        setIsLogoutModalVisible(true);
    };
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedNavLinks = localStorage.getItem('navLinks');
        if (storedNavLinks) {
            setNavLinks(JSON.parse(storedNavLinks));
        }
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        const updateUser = () => {
            const updatedUser = userStore.getUser();
            setUser(updatedUser);
        };

        updateUser();

        const unsubscribe = userStore.subscribe(updateUser);

        return () => {
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        const currentPath = location.pathname;
        let foundTab: NavItem | any = null;
        let parentLabel: string | undefined;
        navLinks.forEach((link) => {
            if (link.subItems) {
                const subTab = link.subItems.find((sub) => sub.action === currentPath);
                if (subTab) {
                    foundTab = subTab;
                    parentLabel = link.label;
                }
            } else if (link.action === currentPath) {
                foundTab = link;
            }
        });
        if (foundTab) {
            setSelectedDropdownKeys((prev) => ({
                ...prev,
                [parentLabel || foundTab.label]: foundTab.label,
            }));
        }
    }, [location.pathname, navLinks]);

    const handleLogout = () => {
        setLoading(true);
        localStorage.removeItem("user");
        setLoading(false);
        setUser(null);
        setIsLogoutModalVisible(false);
        navigate("/home");
        window.location.reload();
    };

    const handleDropdownSelect = (menuLabel: string, subItem: any) => {
        setSelectedDropdownKeys((prev) => ({
            ...prev,
            [menuLabel]: subItem.label,
        }));

        if (subItem.option === "popup") {
            handlePopupOpen(subItem.name || "");
        } else {
            if (subItem.view === true) {
                navigate(subItem.action || "", {
                    state: {
                        projectName: subItem.label,
                        additionalData: subItem.label,
                        view: subItem.view
                    },
                });
            } else {
                navigate(subItem.action || "");
            }
        }
    };

    const handleMenuClick = ({ key }: { key: string }) => {
        setSelectedDropdownKeys({})
        if (key === "/profile") {
            navigate("/profile");
        } else if (key === "logout") {
            showLogoutModal();
        }
    };

    const handleSeeAllProfiles = () => {
        navigate("/profile");
    };

    const profileMenu = (
        <Menu className="custom-profile-menu" onClick={handleMenuClick}>
            <div className="user-basic-info">
                <div className="profile-header">
                    <img src={user?.profilePhoto} alt="avatar" className="avatar-large" />
                    <div className="user-name">{user?.name}</div>
                </div>
                <hr />
                <Button onClick={handleSeeAllProfiles} type="text" className="see-profiles-btn">See all profiles</Button>
            </div>
            <Menu.Item key="/settings" icon={<SettingOutlined />}>
                Settings & privacy
            </Menu.Item>
            <Menu.Item key="/support" icon={<QuestionCircleOutlined />}>
                Help & support
            </Menu.Item>
            <Menu.Item key="logout" icon={<LogoutOutlined />}>
                Logout
            </Menu.Item>
        </Menu>
    );

    return (
        <>
            <div className="main-navbar">
                <div className="logo-and-text">
                    <div className="logo-sections">
                        <Link to="/home">
                            <img
                                src="/images/logos/main-logo.png"
                                alt="Logo"
                                className="logo-image"
                            />
                        </Link>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div>
                            <p>Mine Development</p>
                            <p>Tracking System</p>
                        </div>
                    </div>
                </div>
                <div className="nav-tab-items">
                    <Title level={3} style={{ color: "white", flexGrow: 1 }}></Title>
                    {navLinks.map((link, index) => (
                        <div key={index} style={{ margin: "0 5px" }}>
                            {link.subItems ? (
                                <div className="nav-dropdown-cust"
                                    style={{
                                        position: "relative",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                        backgroundColor: isActive(link.subItems[0]?.action || "") ? "#424242" : "transparent",
                                        borderRadius: "4px",
                                    }}
                                >
                                    <Dropdown
                                        overlay={
                                            <Menu selectedKeys={[selectedDropdownKeys[link.label] || ""]} style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                {link.subItems.map((subItem, _subIndex) => (
                                                    <Menu.Item
                                                        key={subItem.label}
                                                        onClick={() => handleDropdownSelect(link.label, subItem)}
                                                    >
                                                        {subItem.label}
                                                    </Menu.Item>
                                                ))}
                                            </Menu>
                                        }
                                    >
                                        <Button type="text">
                                            {link.label} <DownOutlined />
                                        </Button>
                                    </Dropdown>
                                </div>
                            ) : (
                                <Button className={`nav-item ${isActive(link.action) ? "active" : ""}`} type="text">
                                    <Link style={{ color: "inherit", textDecoration: "none" }} to={link.action || "#"} onClick={() => setSelectedDropdownKeys({})}>{link.label}</Link>
                                </Button>

                            )}
                            {index < navLinks.length - 1 && !link.subItems && (
                                <Divider type="vertical" style={{ backgroundColor: "#ddd", height: 20, margin: "0 2px" }} />
                            )}
                        </div>
                    ))}
                </div>
                <div className="user-data">
                    <div className="search-bar-wrapper" style={{ marginRight: "20px", width: "250px" }}>
                        <Input.Search
                            placeholder="Search MDTS..."
                            allowClear
                            enterButton
                        />
                    </div>

                    <span className="notification-icon-wrapper">
                        <Badge count={5} size="small" offset={[-2, 4]}>
                            <BellOutlined className="bell-icon" />
                        </Badge>
                    </span>
                    {user ? (
                        <Dropdown overlay={profileMenu}>
                            <Button
                                type="text"
                                className="custom-dropdown-btn"
                            >
                                <div className="profile-wrapper">
                                    <img src={user?.profilePhoto} alt="avatar" className="avatar-img" />
                                    <DownOutlined className="badge-icon" />
                                </div>
                            </Button>
                        </Dropdown>
                    ) : (
                        <Button className="signin-btn" style={{ marginLeft: "20px" }}>
                            <Link to="/home" style={{ color: "inherit", textDecoration: "none" }}>Login</Link>
                        </Button>
                    )}
                </div>
            </div>
            <Modal
                title="Confirm Logout"
                visible={isLogoutModalVisible}
                onOk={handleLogout}
                onCancel={() => setIsLogoutModalVisible(false)}
                okText={loading ? 'Logging out...' : 'Logout'}
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
            >
                <p>Are you sure you want to logout?</p>
            </Modal>
        </>
    );
};

export default Navbar;