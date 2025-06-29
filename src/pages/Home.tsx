import { Typography } from "@mui/material";
import { useState } from "react";
import { Drawer, Button } from "antd";
import { Link, Outlet, useLocation } from "react-router-dom";
import { CloseOutlined } from "@ant-design/icons";
import SignIn from "./SignIn";
import "../styles/home.css";
import Footer from "./Footer";

const Home = () => {
    const [open, setOpen] = useState(false);
    const location = useLocation();

    const isHomeRoute = location.pathname === "/home";

    return (
        <div className="page-containers">
            <div className="content-wrap">
                <div className="home-navbar">
                    <div className="logo-and-text-item">
                        <div className="logo-sections-cant">
                            <Link to="/home">
                                <img
                                    src="/images/logos/main-logo.png"
                                    alt="Logo"
                                    className="logo-image"
                                />
                            </Link>
                        </div>
                        <div>
                            <p>Mine Development</p>
                            <p>Tracking System</p>
                        </div>
                    </div>

                    <div className="tabs">
                        <Link to="/home">
                            <Typography className="tab-items" variant="body1">Home</Typography>
                        </Link>
                        <Link to="/home/services">
                            <Typography className="tab-items" variant="body1">Services</Typography>
                        </Link>
                        <Link to="/home/pricing">
                            <Typography className="tab-items" variant="body1">Pricing</Typography>
                        </Link>
                        <Link to="/home/contacts">
                            <Typography className="tab-items" variant="body1">Contacts</Typography>
                        </Link>
                        <Button
                            type="primary"
                            size="large"
                            onClick={() => setOpen(true)}
                            style={{
                                background: "#fff",
                                color: "#4C585B",
                                border: "none",
                                fontWeight: "bold",
                            }}
                        >
                            Login
                        </Button>
                    </div>
                </div>

                <div style={{ marginTop: "65px" }}>
                    {isHomeRoute ? (
                        <>
                            <div className="hero-wrapper">
                                <Outlet />
                            </div>

                            <div className="what-we-do-section">
                                <div className="content-wrapper">
                                    <div className="image-and-text">
                                        <img
                                            src="mining5.jpg"
                                            alt="Mine Render"
                                            className="mine-image"
                                        />
                                        <div className="text-content">
                                            <Typography variant="h4" className="section-title">What we do</Typography>
                                            <Typography variant="body1" className="section-description">
                                                At MineTrack Innovations, we redefine mining excellence through advanced digital tracking systems tailored for mine development projects. Our platform integrates real-time geospatial intelligence, equipment monitoring, and operational analytics into a seamless interface.
                                            </Typography>
                                            <ul className="feature-list">
                                                <li>⛏ Precision mapping of underground excavation paths</li>
                                                <li>📡 Real-time tracking of vehicles and personnel</li>
                                                <li>⚙️ Automated safety compliance monitoring and alerts</li>
                                                <li>📊 Insightful dashboards for operational decision-making</li>
                                                <li>🌐 Scalable cloud-based architecture for global deployment</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="impacts-section">
                                        <Typography variant="h5" className="section-title">Impacts and Outcomes</Typography>
                                        <Typography variant="body1" className="section-description">
                                            Our innovations have led to measurable increases in efficiency, safety, and transparency across multiple mining operations. We align our solution delivery with your project milestones, ensuring technology adapts to your goals—not the other way around.
                                        </Typography>
                                        <Typography variant="body1" className="section-description">
                                            With over a decade of industry expertise, MineTrack empowers engineers, site managers, and stakeholders to make informed decisions with confidence.
                                        </Typography>
                                    </div>
                                </div>
                            </div>

                            <div className="map-section">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31514.95406536651!2d77.5746717!3d12.9715987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670b2c0a7a3%3A0x206d1f3a8e3c107!2sMining%20Corp!5e0!3m2!1sen!2sin!4v1689925507595!5m2!1sen!2sin"
                                    width="100%"
                                    height="500"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Mining HQ Location"
                                ></iframe>
                            </div>
                        </>
                    ) : (
                        <Outlet />
                    )}
                </div>
            </div>

            <Footer />

            <Drawer
                title={null}
                placement="right"
                onClose={() => setOpen(false)}
                open={open}
                closable={false}
                width="40%"
                bodyStyle={{ padding: "0px", position: "relative" }}
            >
                <Button
                    onClick={() => setOpen(false)}
                    style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        border: "none",
                        fontSize: "18px",
                        zIndex: "2",
                    }}
                >
                    <CloseOutlined />
                </Button>
                <div>
                    <SignIn />
                </div>
            </Drawer>
        </div>
    );
};

export default Home;
