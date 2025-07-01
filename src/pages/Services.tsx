import { motion } from "framer-motion";
import "antd/dist/reset.css";
import "../styles/services.css";
import { useEffect, useState } from "react";
export default function Services() {
    const slogans = [
        "Orchestrating Complex Mining Projects with Precision",
        "Unlock Real-Time Insights Across Your Mining Operations",
        "Transforming Data into Actionable Decisions for Mine Success",
        "Empowering Project Teams with Smart Mining Workflows",
        "Minimize Risks, Maximize Yields — Your Digital Mining Partner",
    ];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState("");
    useEffect(() => {
        let text = slogans[currentIndex];
        let charIndex = 0;
        setDisplayedText("");

        const interval = setInterval(() => {
            setDisplayedText((prev) => prev + text.charAt(charIndex));
            charIndex++;
            if (charIndex > text.length) {
                clearInterval(interval);
                setTimeout(() => {
                    setCurrentIndex((prev) => (prev + 1) % slogans.length);
                }, 2000);
            }
        }, 80);

        return () => clearInterval(interval);
    }, [currentIndex]);
    return (
        <div className="services-container">
            <div className="service-block">
                <img
                    src="/banner2.jpg"
                    alt="banner"
                    className="service-full-image"
                />

                <motion.div
                    className="banner-text-overlay"
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="banner-heading">{displayedText}</h1>
                </motion.div>
            </div>

            <div className="services-header">
                <motion.h1 className="services-title" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    Our Services
                </motion.h1>
            </div>

            <div className="dual-image-section">
                <div className="dual-image-block">
                    <img src="/mining.jpg" alt="Mineral Exploration" />
                    <p>
                        Our mineral exploration services are designed to uncover valuable resources using state-of-the-art geological
                        tools and remote sensing technologies. We conduct extensive surveys and geophysical mapping to identify the most
                        promising sites for mining operations. By leveraging data-driven insights, we minimize risks and improve resource
                        yield. Our exploration team works closely with clients to ensure accurate forecasting and responsible planning.
                    </p>
                </div>
                <div className="dual-image-block">
                    <img src="/mining2.jpg" alt="Resource Assessment" />
                    <p>
                        Through detailed resource assessments, we help you understand the commercial viability of your mining project.
                        Our geologists and analysts perform core sampling, reserve estimation, and 3D modeling to deliver comprehensive
                        reports. These evaluations support critical investment decisions and long-term planning. We ensure all findings
                        are transparent, scientifically validated, and tailored to your business objectives.
                    </p>
                </div>
            </div>

            <div className="dual-image-section service-image-left">
                <img src="/mining3.jpg" alt="Sustainable Mining Solutions" className="service-side-image" />
                <div className="service-side-image">
                    <h2 className="highlight-heading">Sustainable Mining Practices</h2>
                    <p>
                        Sustainability is a cornerstone of our mining philosophy. We implement low-impact mining strategies that prioritize
                        environmental conservation and resource efficiency. Our methods reduce waste generation, optimize water usage,
                        and utilize renewable energy where feasible.
                    </p>
                    <h2 className="highlight-heading">Environmental Impact Analysis</h2>
                    <p>
                        Before any extraction begins, our experts conduct in-depth environmental impact assessments to identify potential
                        ecological disruptions. These evaluations cover biodiversity, water systems, air quality, and land usage. We work
                        with regulatory agencies to ensure full compliance and prepare detailed mitigation plans
                    </p>
                </div>
            </div>

            <div className="services-dynamic">
                {[...Array(3)].map((_, i) => (
                    <div className="service-text-block" key={i}>
                        <h2 className="highlight-heading">
                            {i === 0 && "Operational Consulting"}
                            {i === 1 && "Technology Integration"}
                            {i === 2 && "Regulatory Compliance"}
                        </h2>
                        <p>
                            {i === 0 &&
                                "Our consulting team specializes in optimizing mining operations from exploration through to closure. We help clients reduce costs, enhance productivity, and improve safety across all phases. With hands-on experience and global insights, our consultants identify inefficiencies and propose actionable strategies. We are committed to building resilient operations that stand the test of market fluctuations."}
                            {i === 1 &&
                                "We empower your mining operations with cutting-edge technologies such as AI-driven analytics, GIS mapping, IoT monitoring, and automation. These tools not only increase operational efficiency but also improve accuracy in data collection and reduce human error. We ensure seamless integration of these solutions with your existing infrastructure. Our technology roadmap is tailored to fit your specific operational needs and growth goals."}
                            {i === 2 &&
                                "Navigating the regulatory landscape can be challenging, especially in cross-border projects. Our compliance team stays ahead of regional and international laws to keep your operations legal and ethical. We prepare documentation, perform audits, and offer advisory on environmental, labor, and safety regulations. By ensuring you meet all legal obligations, we help you avoid penalties and build trust with stakeholders."}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
