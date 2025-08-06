import { useState } from "react";
import "../styles/pricing.css";
import { useNavigate } from "react-router-dom";
const monthlyPlans = [
    {
        title: "Explorer",
        price: "$0",
        description: "Per user/month, billed monthly",
        features: [
            "Project & module creation (limited)",
            "Up to 5 activities per module",
            "Basic reporting & dashboards",
            "Community support",
            "Up to 2 team members"
        ],
        button: "Start Free",
        key: "free"
    },
    {
        title: "Miner",
        price: "$149",
        description: "Per user/month, billed monthly",
        features: [
            "Unlimited modules and activities",
            "Advanced reports (CSV, PDF export)",
            "Real-time site tracking",
            "Role-based access control",
            "Up to 10 team members"
        ],
        button: "Get Started with Miner",
        key: "pro"
    },
    {
        title: "Enterprise",
        price: "Custom",
        description: "Tailored pricing for large teams and custom integrations",
        features: [
            "Everything in Miner",
            "Unlimited team members",
            "On-premise or private cloud deployment",
            "Dedicated success manager",
            "API access and integrations (SAP, AutoCAD, etc.)"
        ],
        button: "Contact Sales",
        key: "enterprise"
    }
];

const annualPlans = [
    {
        title: "Explorer",
        price: "$0",
        description: "Per user/month, billed annually",
        features: [
            "Project & module creation (limited)",
            "Up to 5 activities per module",
            "Basic reporting & dashboards",
            "Community support",
            "Up to 2 team members"
        ],
        button: "Start Free",
        key: "free"
    },
    {
        title: "Miner",
        price: "$129",
        description: "Per user/month, billed annually",
        features: [
            "Unlimited modules and activities",
            "Advanced reports (CSV, PDF export)",
            "Real-time site tracking",
            "Role-based access control",
            "Up to 10 team members"
        ],
        button: "Start with Miner",
        key: "pro"
    },
    {
        title: "Enterprise",
        price: "Custom",
        description: "Tailored pricing for large teams and custom integrations",
        features: [
            "Everything in Miner",
            "Unlimited team members",
            "On-premise or private cloud deployment",
            "Dedicated success manager",
            "API access and integrations (SAP, AutoCAD, etc.)"
        ],
        button: "Contact Sales",
        key: "enterprise"
    }
];


const Pricing = () => {
    const [activePlan, setActivePlan] = useState("annual");
    const [selected, setSelected] = useState("pro");
    const navigate = useNavigate();
    const plans = activePlan === "monthly" ? monthlyPlans : annualPlans;

    return (
        <div className="pricing-section">
            <h1 className="title">Plans and Pricing</h1>
            <p className="subtitle"> Maximize the value of your monitoring solution by selecting annual billing and benefit from significant savings. Whether you’re an individual professional, an expanding team, or a large-scale enterprise, we offer plans precisely tailored to your needs. Every plan encompasses indispensable features designed to ensure seamless operational continuity. Optimize your resources, enhance productivity, and scale with confidence through our flexible and strategically crafted pricing options. </p>
            <div className="toggle-section">
                <button
                    className={`toggle-btn ${activePlan === "monthly" ? "active" : ""}`}
                    onClick={() => setActivePlan("monthly")}
                >
                    Monthly
                </button>
                <button
                    className={`toggle-btn ${activePlan === "annual" ? "active" : ""}`}
                    onClick={() => setActivePlan("annual")}
                >
                    Annual <span className="save-tag">Save 35%</span>
                </button>
            </div>

            <div className="cards-container">
                {plans.map((plan, index) => (
                    <div
                        key={index}
                        className={`pricing-card ${plan.key === selected ? "selected-plan" : ""} ${plan.title === "Enterprise" ? "enterprise" : ""}`}
                        onClick={() => setSelected(plan.key)}
                    >
                        <h2
                            className="plan-title"
                            style={{ color: plan.title === "Enterprise" ? "#fff" : "#000" }}
                        >
                            {plan.title} {plan.key === "pro" && <span className="badge">Popular</span>}
                        </h2>

                        <h3 className="plan-price">{plan.price}</h3>
                        <p className="plan-desc">{plan.description}</p>
                        <ul className="plan-features">
                            {plan.features.map((feature, idx) => (
                                <li key={idx}>&#10003; {feature}</li>
                            ))}
                        </ul>
                        <button className="plan-button">{plan.button}</button>
                    </div>
                ))}
            </div>
            <div className="demo-section">
                <p>Need a custom walkthrough? See how we can support your unique needs.</p>
                <button className="demo-button" onClick={() => navigate("/home/contacts")}>
                    Schedule a Demo
                </button>
            </div>
        </div>
    );
};

export default Pricing;