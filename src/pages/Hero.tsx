import { useEffect, useState } from "react";
import "../styles/hero.css";

const Hero = () => {
    const [currentIndex, setCurrentIndex] = useState(1);

    const images = ["/images/carousels/m1.jpg", "/images/carousels/m3.jpg"];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <>
            <div className="carousel">
                <div className="carousel-wrapper">
                    <div className="carousel-wrapper">
                        {images.map((image, index) => (
                            <div
                                key={index}
                                className={`carousel-slide ${index === currentIndex ? "active" : ""}`}
                            >
                                <img src={image} alt={`carousel-${index}`} className="carousel-image" />
                                <div className="gradient-overlay"></div>

                                {index === 0 && (
                                    <div className="animated-text-container" key={currentIndex}>
                                        <h4 className="small-title">
                                            Plan • Execute • Govern — All in One View<span></span>
                                        </h4>

                                        <h1 className="main-heading">Real-Time Control For Mine Projects</h1>

                                        <div className="third-line">
                                            {/* <button className="carousel-button px-5">Request Demo</button> */}
                                            <p className="least-text">
                                                Unify development planning, field execution, and compliance with
                                                decision-ready dashboards. Track geospatial progress, crews, equipment,
                                                milestones, and costs—so risks surface early and delivery stays on target.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {index === 1 && (
                                    <div className="animated-text-container left-aligned" key={currentIndex}>
                                        <h4 className="small-title">
                                            Visibility That Drives On-Time Delivery<span></span>
                                        </h4>

                                        <h1 className="main-heading">From Exploration To Sustaining Ops</h1>

                                        <div className="third-line">
                                            <p className="least-text">
                                                Monitor activities and dependencies in real time, get smart alerts for
                                                slippages and cost drift, and keep audit-ready governance trails—so every
                                                stakeholder acts with clarity and accountability.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Hero;
