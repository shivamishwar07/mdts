import React, { useEffect, useState } from "react";
import "../styles/sign-in.css";
import { useNavigate } from "react-router-dom";
import { db } from "../Utils/dataStorege.ts";
import { GoogleOutlined, WindowsOutlined, KeyOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { ToastContainer } from "react-toastify";
import { notify } from "../Utils/ToastNotify.tsx";
import { v4 as uuidv4 } from 'uuid';
import { Form, Input, Button, Select, Row, Col } from "antd";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

// const { Title, Text } = Typography;
const { Option } = Select;
const SignInSignUp: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [workEmail, setWorkEmail] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm();
    const stepFieldNames = [
        ["company", "industry", "website", "gstin", "cin", "incorpDate", "employeeCount"],
        ["country", "state", "city", "address1", "zip"],
        ["name", "designation", "email", "mobile", "password", "confirmPassword"]
    ];
    const handleNext = async () => {
        try {
            await form.validateFields(stepFieldNames[currentStep]);
            setCurrentStep(prev => prev + 1);
        } catch (err) {
            notify.error("Please fill in all required fields correctly.");
        }
    };


    const handlePrev = () => setCurrentStep(prev => prev - 1);

    const handleFinish = async (values: any) => {
        const newUser = {
            id: Date.now(),
            guiId: uuidv4(),
            name: values.name,
            company: values.company,
            designation: values.designation,
            mobile: values.mobile,
            email: values.email,
            whatsapp: values.mobile.startsWith('+') ? values.mobile : `+${values.mobile}`,
            address: `${values.address1 ?? ''} ${values.address2 ?? ''}`.trim(),
            city: values.city,
            state: values.state,
            country: values.country,
            zipCode: values.zip,
            password: values.password,
            Password: values.password,
            isTempPassword: false,
            role: "admin",
            userType: "IND",
            companyType: values.industry || "",
            industryType: values.industry || "",
            companyLogo: "",
            registeredOn: new Date().toISOString(),
            ...values,
        };
        await db.addUsers(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
        notify.success("Registration successful!");
        setTimeout(() => navigate("/profile"), 1000);
    };

    const steps = [
        {
            title: "Company Info",
            content: (
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="company" label="Company Name" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="industry" label="Industry Type">
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="website" label="Company Website" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="gstin" label="PAN / GSTIN" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="cin" label="CIN / Registration Number">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="incorpDate" label="Date of Incorporation">
                            <Input type="date" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="employeeCount" label="Number of Employees">
                            <Select>
                                <Option value="1-10">1-10</Option>
                                <Option value="11-50">11-50</Option>
                                <Option value="51-200">51-200</Option>
                                <Option value=">200">200+</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
            )
        },
        {
            title: "Business Address",
            content: (
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="country" label="Country" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="state" label="State / Province" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="city" label="City" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="address1" label="Address Line 1" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="address2" label="Address Line 2">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="zip" label="Postal / ZIP Code" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
            )
        },
        {
            title: "Authorized Representative",
            content: (
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="designation" label="Designation" rules={[{ required: true }]}>
                            <Select placeholder="Select Designation">
                                <Option value="Mining Engineer">Mining Engineer</Option>
                                <Option value="Geologist">Geologist</Option>
                                <Option value="Operations Manager">Operations Manager</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="email" label="Official Email" rules={[{ required: true, type: 'email' }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="mobile" label="Mobile Number" rules={[{ required: true }]}>
                            <PhoneInput
                                country={'in'}
                                value={form.getFieldValue("mobile")}
                                inputStyle={{ width: "100%"}}
                                specialLabel={""}
                                onChange={(phone: string) => form.setFieldsValue({ mobile: `+${phone}` })}
                            />
                        </Form.Item>

                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[
                                {
                                    required: true,
                                    pattern: /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/,
                                    message: "Password must contain at least 1 uppercase, 1 digit, 1 special character, and be 8+ characters"
                                }
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="confirmPassword"
                            label="Confirm Password"
                            dependencies={['password']}
                            rules={[
                                {
                                    required: true,
                                    validator(_, value) {
                                        if (!value || value === form.getFieldValue("password")) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject("Passwords do not match");
                                    }
                                }
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
            )
        }

    ];

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
            <div className={isSignUp ? 'auth-card signup-w' : 'auth-card login-w'}>
                {isSignUp ? (
                    <>
                        <div className="auth-header">
                            <div className="registration-title">
                                <h2>Company Registration</h2>
                                <p>Secure your organization’s access</p>
                            </div>
                            <div></div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="auth-header">
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <img src="/images/logos/main-logo.png" alt="App Logo" className="auth-logo logo-sections" />
                            </div>
                            <h2>Mine Development Tracking System</h2>
                            <p>{isSignUp ? 'Sign up to get started' : 'Sign in to continue'}</p>
                        </div>
                    </>
                )}
                <div className="auth-form">
                    {isSignUp ? (
                        <>
                            {/* <input type="email" placeholder="Work Email" value={workEmail} onChange={(e) => setWorkEmail(e.target.value)} />
                            <button onClick={handleSignUp}>Sign Up</button> */}
                            <div className="form-body">
                                <div className="step-header">
                                    <div className="step-title">
                                        <span className="step-label">{steps[currentStep].title}</span>
                                    </div>
                                    <div className="step-lines">
                                        {steps.map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`step-line ${idx === currentStep ? "active" : ""} ${idx < currentStep ? "completed" : ""}`}
                                            ></div>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-section">
                                    <Form layout="vertical" form={form} onFinish={handleFinish}>
                                        {steps.map((step, idx) => (
                                            <div key={idx} style={{ display: idx === currentStep ? 'block' : 'none' }}>
                                                {step.content}
                                            </div>
                                        ))}

                                        <div className="form-actions">
                                            {currentStep > 0 && <Button onClick={handlePrev}>Prev</Button>}
                                            {currentStep < steps.length - 1 ? (
                                                <Button type="primary" onClick={handleNext}>Next</Button>
                                            ) : (
                                                <Button type="primary" htmlType="submit">Submit</Button>
                                            )}
                                        </div>
                                    </Form>

                                </div>
                            </div>

                        </>
                    ) : (
                        <>
                            <div className="signin-cont">
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
                            </div>
                        </>
                    )}

                    <div className="switch-auth">
                        {isSignUp ? (
                            <p>Already have an account? <span onClick={() => setIsSignUp(false)}>Sign in</span></p>
                        ) : (
                            <p>New here? <span onClick={() => setIsSignUp(true)}>Sign up</span></p>
                        )}
                    </div>

                    {!isSignUp && (
                        <>
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
                        </>
                    )}
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default SignInSignUp;
