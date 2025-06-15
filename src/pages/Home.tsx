import { Typography } from "@mui/material";
import { useState } from "react";
import { Drawer, Button } from 'antd';
import { Link } from "react-router-dom";
import { CloseOutlined } from '@ant-design/icons';
import Hero from "./Hero";
import SignIn from "./SignIn";
import "../styles/home.css";
import ContactUs from "./ContactUs";

const Home = () => {
    const [open, setOpen] = useState(false);

    return (
        <>
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
                    <Link to="/projects">
                        <Typography className="tab-items" variant="body1" color="textPrimary">Home</Typography>
                    </Link>
                    <Link to="/services">
                        <Typography className="tab-items" variant="body1" color="textPrimary">Services</Typography>
                    </Link>
                    <Link to="/reports">
                        <Typography className="tab-items" variant="body1" color="textPrimary">Pricing</Typography>
                    </Link>
                    <Link to="/settings">
                        <Typography className="tab-items" variant="body1" color="textPrimary">Contacts</Typography>
                    </Link>
                    <Button type="primary" size="large" onClick={() => setOpen(true)} style={{ background: '#fff', color: '#4C585B', border: 'none', fontWeight: 'bold' }}>
                        Login
                    </Button>
                </div>
            </div>
            <div style={{marginTop:'65px'}}>
            <Hero />
            </div>
            <div>
                <ContactUs />
            </div>
            <Drawer
                title={null}
                placement="right"
                onClose={() => setOpen(false)}
                open={open}
                closable={false}
                width={"40%"}
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
                        zIndex:'2'
                    }}
                >
                    <CloseOutlined />
                </Button>

                <div>
                    <SignIn />
                </div>
            </Drawer>
        </>
    );
};

export default Home;
