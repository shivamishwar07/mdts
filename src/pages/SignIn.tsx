import React, { useEffect, useState } from "react";
import "../styles/sign-in.css";
import { useNavigate } from "react-router-dom";
import { db } from "../Utils/dataStorege.ts";
import { ToastContainer } from "react-toastify";
import { notify } from "../Utils/ToastNotify.tsx";
import { v4 as uuidv4 } from 'uuid';
import { Form, Input, Button, Select, Row, Col } from "antd";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { GoogleOutlined, AppleOutlined } from '@ant-design/icons';
const { Option } = Select;
const SignInSignUp: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, _setShowPassword] = useState(false);
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
                                inputStyle={{ width: "100%" }}
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
        <div className="signup-container">
            <div className={isSignUp ? 'signup-left signup-adjust' : 'signup-left signin-adjust'}>
                <div className="vector-image">
                    <img src="/images/auths/signin.png" alt="Mining Management Illustration" />
                </div>

                <div className="promo-text">
                    <h1>Mining Simplified, Productivity Amplified</h1>
                    <p>
                        Manage your mining operations with confidence. Track activities, assign teams, and gain insights — all in one platform built for mining professionals.
                    </p>
                </div>

                <div className="footer-links">
                    <div className="language">
                        <img src="https://flagcdn.com/us.svg" alt="US Flag" width="20" />
                        <span>English</span>
                    </div>
                    <div className="links">
                        <a href="#">Terms</a>
                        <a href="#">Plans</a>
                        <a href="#">Contact Us</a>
                    </div>
                </div>
            </div>


            <div className={isSignUp ? 'signup-right signup-adjust' : 'signup-right signin-adjust'}>
                <div className="form-card">
                    <h2>{isSignUp ? 'Sign up to get started' : 'Sign in to continue'}</h2>
                    {!isSignUp ? (
                        <form>
                            <input className="mb-20" type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                            <input className="mb-20" type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} required />
                            <div className="checkbox">
                                <input type="checkbox" id="terms" required />
                                <label htmlFor="terms">
                                    I accept the <a href="#">Term</a>
                                </label>
                            </div>
                            <button className="submit" onClick={handleLogin}>Login</button>
                        </form>
                    ) : (
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
                    )}
                    <div className="social-buttons">
                        <Button className="google" icon={<GoogleOutlined size={20} />}>Sign In with Google</Button>
                        <Button className="apple" icon={<AppleOutlined size={20} />}>Sign In with Apple</Button>
                    </div>
                    <div className="switch-auth">
                        {isSignUp ? (
                            <p className="signin-link">
                                Already have an account? <a onClick={() => setIsSignUp(false)}>Sign In</a>
                            </p>
                        ) : (<p className="signin-link">
                            New here? ? <a onClick={() => setIsSignUp(true)}>Sign up</a>
                        </p>
                        )}
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default SignInSignUp;
