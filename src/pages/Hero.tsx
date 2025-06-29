import { useEffect, useState } from "react";
import "../styles/hero.css";
const Hero = () => {
    const [currentIndex, setCurrentIndex] = useState(1);
    const images = [
        '/images/carousels/m1.jpg',
        '/images/carousels/m3.jpg',
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);
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
                                        <h4 className="small-title">Finding Treasures Beneath Every Rock<span></span></h4>
                                        <h1 className="main-heading">Golden Horizons In</h1>
                                        <div className="third-line">
                                            <button className="carousel-button px-5">Explore</button>
                                            <h1 className="minus-heading">Mines</h1>
                                            <p className="least-text">
                                                Attardi, G., Esuli, A., & Simi, M. (2004). Best bets, thousands of queries in search of a client.
                                                In Proceedings of the 13th international conference on World Wide Web, alternate track papers & posters.
                                                New York: ACM Press.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {index === 1 && (
                                    <div className="animated-text-container left-aligned" key={currentIndex}>
                                        <h4 className="small-title">Unearthing Wealth in the Depths<span></span></h4>
                                        <h1 className="main-heading">Dig Deeper Into</h1>
                                        <div className="third-line">
                                            <h1 className="minus-heading">Mines</h1>
                                            <p className="least-text">
                                                Attardi, G., Esuli, A., & Simi, M. (2004). Best bets, thousands of queries in search of a client.
                                                In Proceedings of the 13th international conference on World Wide Web, alternate track papers & posters.
                                                New York: ACM Press.
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
    )
}

export default Hero