import React, { useState } from "react";
import { GoogleMap, LoadScript, DirectionsRenderer } from "@react-google-maps/api";
import "../styles/map-components.css";

const containerStyle = {
    width: "100%",
    height: "500px",
};

const center = {
    lat: 12.9716,
    lng: 77.5946,
};

const GOOGLE_MAPS_API_KEY = "AIzaSyBw5k_EaPbE_33caOOKnqMUfopDVEqN6xg";

const MapComponent: React.FC = () => {
    const [directionsResponse, _setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
    const [distance, _setDistance] = useState<string>("");
    const [duration, _setDuration] = useState<string>("");
    // const [origin, setOrigin] = useState<string>("");
    // const [destination, setDestination] = useState<string>("");

    // const calculateRoute = () => {
    //     if (!origin || !destination) {
    //         alert("Please enter both origin and destination.");
    //         return;
    //     }

    //     const directionsService = new google.maps.DirectionsService();
    //     directionsService.route(
    //         {
    //             origin,
    //             destination,
    //             travelMode: google.maps.TravelMode.DRIVING,
    //         },
    //         (result: any, status: any) => {
    //             if (status === google.maps.DirectionsStatus.OK) {
    //                 setDirectionsResponse(result);
    //                 setDistance(result.routes[0].legs[0].distance.text);
    //                 setDuration(result.routes[0].legs[0].duration.text);
    //             } else {
    //                 console.error(`Error fetching directions: ${status}`);
    //             }
    //         }
    //     );
    // };

    return (
        <div className="map-container">
            {/* <div>
                <div className="map-heading">Maps Visuals</div>
            </div>
            <div className="input-container">
                <input
                    type="text"
                    placeholder="Enter Origin"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Enter Destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                />
                <button onClick={calculateRoute}>Find</button>
            </div> */}
            {distance && duration && (
                <div className="result-container">
                    <h3>Distance: <span>{distance}</span></h3>
                    <h3>Duration: <span>{duration}</span></h3>
                </div>
            )}

            <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
                    {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
                </GoogleMap>
            </LoadScript>
        </div>
    );
};

export default MapComponent;
