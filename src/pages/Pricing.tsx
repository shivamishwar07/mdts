import { useState } from "react";
import "../styles/pricing.css";

const monthlyPlans = [
    {
        title: "Free",
        price: "$0",
        description: "Per user/month, billed monthly",
        features: [
            "Free e-mail alerts",
            "3-minute checks",
            "Automatic data enrichment",
            "10 monitors",
            "Up to 3 seats"
        ],
        button: "Get started for free",
        key: "free"
    },
    {
        title: "Pro",
        price: "$99",
        description: "Per user/month, billed monthly",
        features: [
            "Unlimited phone calls",
            "30 second checks",
            "Single-user account",
            "20 monitors",
            "Up to 6 seats"
        ],
        button: "Get started with Pro",
        key: "pro"
    },
    {
        title: "Enterprise",
        price: "Custom",
        description: "Per user/month, billed monthly",
        features: [
            "Everything in Pro",
            "Up to 5 team members",
            "100 monitors",
            "15 status pages",
            "200+ integrations"
        ],
        button: "Get started with Enterprise",
        key: "enterprise"
    }
];

const annualPlans = [
    {
        title: "Free",
        price: "$0",
        description: "Per user/month, billed annually",
        features: [
            "Free e-mail alerts",
            "3-minute checks",
            "Automatic data enrichment",
            "10 monitors",
            "Up to 3 seats"
        ],
        button: "Get started for free",
        key: "free"
    },
    {
        title: "Pro",
        price: "$85",
        description: "Per user/month, billed annually",
        features: [
            "Unlimited phone calls",
            "30 second checks",
            "Single-user account",
            "20 monitors",
            "Up to 6 seats"
        ],
        button: "Get started with Pro",
        key: "pro"
    },
    {
        title: "Enterprise",
        price: "Custom",
        description: "Per user/month, billed annually",
        features: [
            "Everything in Pro",
            "Up to 5 team members",
            "100 monitors",
            "15 status pages",
            "200+ integrations"
        ],
        button: "Get started with Enterprise",
        key: "enterprise"
    }
];

const Pricing = () => {
    const [activePlan, setActivePlan] = useState("annual");
    const [selected, setSelected] = useState("pro");

    const plans = activePlan === "monthly" ? monthlyPlans : annualPlans;

    return (
        <div className="pricing-section">
            <h1 className="title">Plans and Pricing</h1>
            <p className="subtitle">
                Receive unlimited credits when you pay yearly, and save on your plan.
            </p>
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
        </div>
    );
};

export default Pricing;