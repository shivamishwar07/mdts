import { motion } from "framer-motion";
import "antd/dist/reset.css";
import "../styles/services.css";
import { useEffect, useState } from "react";

const serviceData = [
    {
        icon: "fa-solid fa-map-location-dot",
        title: "Mineral Exploration",
        description:
            "Our mineral exploration services are designed to uncover valuable resources using state-of-the-art geological tools and remote sensing technologies. We conduct extensive surveys and geophysical mapping to identify the most promising sites for mining operations. By leveraging data-driven insights, we minimize risks and improve resource yield. Our exploration team works closely with clients to ensure accurate forecasting and responsible planning.",
    },
    {
        icon: "fa-solid fa-chart-line",
        title: "Resource Assessment",
        description:
            "Through detailed resource assessments, we help you understand the commercial viability of your mining project. Our geologists and analysts perform core sampling, reserve estimation, and 3D modeling to deliver comprehensive reports. These evaluations support critical investment decisions and long-term planning. We ensure all findings are transparent, scientifically validated, and tailored to your business objectives.",
    },
    {
        icon: "fa-solid fa-seedling",
        title: "Sustainable Mining Solutions",
        description:
            "Sustainability is a cornerstone of our mining philosophy. We implement low-impact mining strategies that prioritize environmental conservation and resource efficiency. Our methods reduce waste generation, optimize water usage, and utilize renewable energy where feasible.",
    },
    {
        icon: "fa-solid fa-recycle",
        title: "Environmental Impact Analysis",
        description:
            "Before any extraction begins, our experts conduct in-depth environmental impact assessments to identify potential ecological disruptions. These evaluations cover biodiversity, water systems, air quality, and land usage. We work with regulatory agencies to ensure full compliance and prepare detailed mitigation plans.",
    },
];

const mainServices = [
    {
        title: "Operational Consulting",
        description:
            "Our consulting team specializes in optimizing mining operations from exploration through to closure. We help clients reduce costs, enhance productivity, and improve safety across all phases. With hands-on experience and global insights, our consultants identify inefficiencies and propose actionable strategies. We are committed to building resilient operations that stand the test of market fluctuations.",
    },
    {
        title: "Technology Integration",
        description:
            "We empower your mining operations with cutting-edge technologies such as AI-driven analytics, GIS mapping, IoT monitoring, and automation. These tools not only increase operational efficiency but also improve accuracy in data collection and reduce human error. We ensure seamless integration of these solutions with your existing infrastructure. Our technology roadmap is tailored to fit your specific operational needs and growth goals.",
    },
    {
        title: "Regulatory Compliance",
        description:
            "Navigating the regulatory landscape can be challenging, especially in cross-border projects. Our compliance team stays ahead of regional and international laws to keep your operations legal and ethical. We prepare documentation, perform audits, and offer advisory on environmental, labor, and safety regulations. By ensuring you meet all legal obligations, we help you avoid penalties and build trust with stakeholders.",
    },
];

export default function Services() {
    const slogans = [
        "Unlock Real-Time Insights Across Your Mining Operations.",
        "Orchestrating Complex Mining Projects with Precision.",
        "Transforming Data into Actionable Decisions for Mine Success.",
        "Empowering Project Teams with Smart Mining Workflows.",
        "Minimize Risks, Maximize Yields — Your Digital Mining Partner.",
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        let text = slogans[currentIndex];
        let charIndex = -1;
        setDisplayedText("");

        const interval = setInterval(() => {
            if (charIndex < text.length) {
                setDisplayedText((prev) => prev + text.charAt(charIndex));
                charIndex++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    setCurrentIndex((prev) => (prev + 1) % slogans.length);
                }, 3000);
            }
        }, 60);

        return () => clearInterval(interval);
    }, [currentIndex]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div className="services-container">
            <div className="hero-section">
                <img src="/banner2.jpg" alt="mining banner" className="hero-image" />
                <motion.div
                    className="hero-text-overlay"
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="hero-heading">{displayedText}</h1>
                </motion.div>
            </div>

            <motion.div
                className="intro-section"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
            >
                <h2 className="section-title">Our Services</h2>
                <p className="section-subtitle">
                    From exploration to operation, we provide comprehensive solutions that
                    drive efficiency and sustainability.
                </p>
            </motion.div>

            <motion.div
                className="services-grid"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
            >
                {serviceData.map((service, index) => (
                    <motion.div className="service-card" key={index} variants={itemVariants}>
                        <div className="service-icon">
                            <i className={service.icon}></i>
                        </div>
                        <h3 className="card-title">{service.title}</h3>
                        <p className="card-description">{service.description}</p>
                    </motion.div>
                ))}
            </motion.div>

            <div className="image-text-section">
                <motion.div
                    className="image-text-block"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true, amount: 0.5 }}
                >
                    <img src="/mining.jpg" alt="Mineral Exploration" className="block-image" />
                    <div className="text-content">
                        <h3 className="highlight-heading">Comprehensive Mineral Exploration</h3>
                        <p>
                            Our mineral exploration services are designed to uncover valuable resources
                            using state-of-the-art geological tools and remote sensing technologies.
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    className="image-text-block reversed"
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true, amount: 0.5 }}
                >
                    <img src="/mining2.jpg" alt="Resource Assessment" className="block-image" />
                    <div className="text-content">
                        <h3 className="highlight-heading">Detailed Resource Assessment</h3>
                        <p>
                            Through detailed resource assessments, we help you understand the commercial
                            viability of your mining project. Our geologists and analysts perform core
                            sampling, reserve estimation, and 3D modeling.
                        </p>
                    </div>
                </motion.div>
            </div>

            <div className="main-services-section">
                <h2 className="section-title">Key Offerings</h2>
                <motion.div
                    className="main-services-grid"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    {mainServices.map((service, index) => (
                        <motion.div className="main-service-card" key={index} variants={itemVariants}>
                            <h3 className="card-title">{service.title}</h3>
                            <p className="card-description">{service.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}