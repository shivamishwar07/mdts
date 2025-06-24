import React, { useState } from "react";
import "../styles/sign-in.css";
import { Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { db } from "../Utils/dataStorege.ts";
import { GoogleOutlined, WindowsOutlined, KeyOutlined } from '@ant-design/icons';
// const { Title, Text } = Typography;

const SignInSignUp: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [workEmail, setWorkEmail] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);

    const isProfileCompleted = (user: any) => {
        return (
            user.name &&
            user.company &&
            user.mobile &&
            user.designation &&
            user.email &&
            user.whatsapp &&
            user.profilePhoto &&
            user.Password
        );
    };

    const handleLogin = async () => {
        const users = await db.getUsers();
        if (users) {
            const user = users.find((user: any) => user.email === email && (user.password === password || user.Password === password));

            try {
                if (user) {
                    localStorage.setItem("user", JSON.stringify(user));
                    message.success("Login Successful!");
                    const isProfileComplete = isProfileCompleted(user);
                    setTimeout(() => {
                        navigate(isProfileComplete ? "/dashboard" : "/profile");
                    }, 1000);
                } else {
                    message.error("Invalid Email or Password");
                }
            } catch (error: any) {
                message.error(error);
            }
        } else {
            message.error("Error retrieving users");
        }
    };


    const handleSignUp = async () => {
        if (!workEmail) {
            return message.error("Please fill all required fields");
        }
        const users = await db.getUsers();
        const emailExists = users.some((user: any) => user.email === workEmail);

        if (emailExists) {
            return message.error("Email already registered");
        }

        const password = workEmail.slice(0, 6);
        const newUser = {
            id: Date.now(),
            name: "",
            company: "",
            designation: "",
            mobile: "",
            email: workEmail,
            whatsapp: "",
            registeredOn: new Date().toISOString(),
            profilePhoto: "",
            password: password,
            isTempPassword: true,
            role: "Admin"
        };

        users.push(newUser);
        try {
            await db.addUsers(newUser);
        } catch (error: any) {
            message.error(error)
        }
        localStorage.setItem("user", JSON.stringify(newUser));
        message.success("Sign-up successful! Invite link sent. Please verify your account.");
        setTimeout(() => navigate("/profile"), 1000);
    };


    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <img src="/images/logos/main-logo.png" alt="App Logo" className="auth-logo logo-sections" />
                    </div>
                    <h2>Mine Development Tracking System</h2>
                    <p>{isSignUp ? 'Sign up to get started' : 'Sign in to continue'}</p>
                </div>

                <div className="auth-form">
                    {isSignUp ? (
                        <>
                            <input type="email" placeholder="Work Email" value={workEmail} onChange={(e) => setWorkEmail(e.target.value)} />
                            <button onClick={handleSignUp}>Sign Up</button>
                        </>
                    ) : (
                        <>
                            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
                            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            <button onClick={handleLogin}>Login</button>
                        </>
                    )}

                    <div className="switch-auth">
                        {isSignUp ? (
                            <p>Already have an account? <span onClick={() => setIsSignUp(false)}>Sign in</span></p>
                        ) : (
                            <p>New here? <span onClick={() => setIsSignUp(true)}>Sign up</span></p>
                        )}
                    </div>

                    <div className="divider"><span>or continue with</span></div>
                    
                    <div className="social-buttons">
                        <Button type="default" block icon={<GoogleOutlined />} className="google">
                            Google
                        </Button>
                        <Button type="default" block icon={<WindowsOutlined />} className="microsoft">
                            Microsoft
                        </Button>
                        <Button type="default" block icon={<KeyOutlined />} className="otp">
                            OTP
                        </Button>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default SignInSignUp;
