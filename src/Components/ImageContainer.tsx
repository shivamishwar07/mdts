import "../styles/image-container.css";
interface ImageContainerProps {
    imageUrl: string | string[];
}

const ImageContainer = ({ imageUrl }: ImageContainerProps) => {
    return (
        <main className="custom-main">
            {Array.isArray(imageUrl) ? (
                <div className="custom-card-container">
                    {imageUrl.map((img, index) => (
                        <div key={index} className="custom-card">
                            <img src={img} alt={`Card ${index}`} />
                            <div className="custom-card-content">
                                <h2>Card Heading {index + 1}</h2>
                                <p>
                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                                    Nesciunt exercitationem iste, voluptatum, quia explicabo
                                    laboriosam rem adipisci voluptates cumque.
                                </p>
                                <a href="#" className="custom-button bg-primary">
                                    Find out more
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="custom-card">
                    <img src={imageUrl} alt="Card" />
                    <div className="custom-card-content">
                        <h2>Card Heading</h2>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                            Nesciunt exercitationem iste, voluptatum, quia explicabo
                            laboriosam rem adipisci voluptates cumque.
                        </p>
                        <a href="#" className="custom-button bg-primary">
                            Find out more
                        </a>
                    </div>
                </div>
            )}
        </main>
    );
};

export default ImageContainer;
