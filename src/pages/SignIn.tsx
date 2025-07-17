import React, { useEffect, useState } from "react";
import "../styles/sign-in.css";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { db } from "../Utils/dataStorege.ts";
import { GoogleOutlined, WindowsOutlined, KeyOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { ToastContainer } from "react-toastify";
import { notify } from "../Utils/ToastNotify.tsx";
import { v4 as uuidv4 } from 'uuid';
// const { Title, Text } = Typography;

const SignInSignUp: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [workEmail, setWorkEmail] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
        try {
            validateEmail(email);

            const users = await db.getUsers();
            const user = users.find(
                (user: any) => user.email === email && (user.password === password || user.Password === password)
            );

            if (!user) {
                return notify.error("Invalid email or password. Please try again.");
            }

            localStorage.setItem("user", JSON.stringify(user));
            notify.success("Login Successful!");

            const isProfileComplete = isProfileCompleted(user);
            setTimeout(() => {
                navigate(isProfileComplete ? "/dashboard" : "/profile");
            }, 1000);
        } catch (error: any) {
            if (error.message === "Invalid email format") {
                notify.error("Please enter a valid email address.");
            } else {
                notify.error("An unexpected error occurred during login.");
                console.error(error);
            }
        }
    };


    const handleSignUp = async () => {
        try {
            validateEmail(workEmail);

            const users = await db.getUsers();
            const emailExists = users.some((user: any) => user.email === workEmail);
            if (emailExists) throw new Error("Email already registered");

            const password = workEmail.slice(0, 6);
            const newUser = {
                id: Date.now(),
                guiId: uuidv4(),
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

            await db.addUsers(newUser);
            localStorage.setItem("user", JSON.stringify(newUser));
            notify.success("Sign-up successful! Invite link sent. Please verify your account.");
            setTimeout(() => navigate("/profile"), 1000);
        } catch (error: any) {
            notify.error(error.message);
        }
    };


    const validateEmail = (email: string) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            throw new Error("Invalid email format");
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
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
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                {password && (
                                    <span
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="toggle-password"
                                    >
                                        {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                    </span>
                                )}
                            </div>

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
            <ToastContainer />
        </div>
    );
};

export default SignInSignUp;
