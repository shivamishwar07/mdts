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
            user.password
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
                        navigate(isProfileComplete ? "/landing-page" : "/profile");
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
        // <div
        //     style={{
        //         height: "100vh",
        //         display: "flex",
        //         alignItems: "center",
        //     }}
        // >
        //     <div
        //         style={{
        //             width: "100%",
        //             height: "100vh",
        //             borderRadius: 0,
        //             alignItems: "center",
        //             display: "flex",
        //             flexDirection: "column",
        //             justifyContent: "center",
        //             margin: 0,
        //             background: "linear-gradient(135deg, #257180 10%, #4C585B 60%, #92C7CF 80%)",
        //             color: "#e0e0e0",
        //             padding: "20px"
        //         }}
        //     >
        //         <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        //             <Title level={3} style={{ color: "#fff", marginBottom: 24, fontSize: "30px" }}>
        //                 Mine Development Tracking System
        //             </Title>
        //             {!isSignUp ? (
        //                 <>
        //                     <Title level={4} style={{ color: "#fff", marginBottom: 16 }}>
        //                         Sign in to your account
        //                     </Title>

        //                     <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        //                         <Input placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} />
        //                         <Input.Password placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

        //                         <Text style={{ color: "#e0e0e0" }}>
        //                             By signing in, you agree to our <span style={{ color: "#e33b28", cursor: "pointer", textDecoration: "none", transition: "text-decoration 0.3s ease", fontWeight: "bold" }}
        //                                 onMouseOver={(e) => e.currentTarget.style.textDecoration = "underline"} onMouseOut={(e) => e.currentTarget.style.textDecoration = "none"}>Terms & Conditions</span> and
        //                             <span style={{ color: "#e33b28", cursor: "pointer", textDecoration: "none", transition: "text-decoration 0.3s ease", fontWeight: "bold" }}
        //                                 onMouseOver={(e) => e.currentTarget.style.textDecoration = "underline"} onMouseOut={(e) => e.currentTarget.style.textDecoration = "none"}> Privacy Policy</span>
        //                         </Text>

        //                         <Button type="primary" onClick={handleLogin} style={{ backgroundColor: "#258790", color: '#fff', borderRadius: "8px", fontWeight: "bold" }}>
        //                             Login
        //                         </Button>

        //                         <Text style={{ color: "#e0e0e0", cursor: "pointer", textDecoration: "none" }}
        //                             onMouseOver={(e) => e.currentTarget.style.textDecoration = "underline"}
        //                             onMouseOut={(e) => e.currentTarget.style.textDecoration = "none"}>
        //                             Forgot Password?
        //                         </Text>

        //                         <Text style={{ color: "#e0e0e0", cursor: "pointer", textDecoration: "none" }}
        //                             onClick={() => setIsSignUp(true)}
        //                             onMouseOver={(e) => e.currentTarget.style.textDecoration = "underline"}
        //                             onMouseOut={(e) => e.currentTarget.style.textDecoration = "none"}>
        //                             New here? Sign up
        //                         </Text>
        //                     </div>

        //                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 16 }}>
        //                         <div style={{ flex: 1, borderBottom: '1px solid #fff', marginRight: 16 }} />
        //                         <Text style={{ color: "#fff" }}>OR</Text>
        //                         <div style={{ flex: 1, borderBottom: '1px solid #fff', marginLeft: 16 }} />
        //                     </div>
        //                     <div className="button-container">
        //                         <Button type="default" block icon={<GoogleOutlined />} className="auth-button google-btn">
        //                             Google
        //                         </Button>
        //                         <Button type="default" block icon={<WindowsOutlined />} className="auth-button microsoft-btn">
        //                             Microsoft
        //                         </Button>
        //                         <Button type="default" block icon={<KeyOutlined />} className="auth-button otp-btn">
        //                             OTP
        //                         </Button>
        //                     </div>
        //                 </>
        //             ) : (
        //                 <>
        //                     <Title level={4} style={{ color: "#fff", marginBottom: 16 }}>
        //                         Sign up for an account
        //                     </Title>

        //                     <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        //                         <Input placeholder="Enter your work email" value={workEmail} onChange={(e) => setWorkEmail(e.target.value)} />
        //                         <Button type="primary" onClick={handleSignUp} style={{ backgroundColor: "#258790", borderRadius: "8px", fontWeight: "bold" }}>
        //                             Sign Up
        //                         </Button>

        //                         <Text style={{ color: "#e0e0e0", cursor: "pointer", textDecoration: "none" }}
        //                             onClick={() => setIsSignUp(false)}
        //                             onMouseOver={(e) => e.currentTarget.style.textDecoration = "underline"}
        //                             onMouseOut={(e) => e.currentTarget.style.textDecoration = "none"}>
        //                             Already have an account? Sign in
        //                         </Text>
        //                     </div>

        //                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 16 }}>
        //                         <div style={{ flex: 1, borderBottom: '1px solid #fff', marginRight: 16 }} />
        //                         <Text style={{ color: "#fff" }}>OR</Text>
        //                         <div style={{ flex: 1, borderBottom: '1px solid #fff', marginLeft: 16 }} />
        //                     </div>
        // <div className="button-container">
        //     <Button type="default" block icon={<GoogleOutlined />} className="auth-button google-btn">
        //         Google
        //     </Button>
        //     <Button type="default" block icon={<WindowsOutlined />} className="auth-button microsoft-btn">
        //         Microsoft
        //     </Button>
        //     <Button type="default" block icon={<KeyOutlined />} className="auth-button otp-btn">
        //         OTP
        //     </Button>
        // </div>
        //                 </>
        //             )}
        //         </div>
        //     </div>
        // </div>

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
