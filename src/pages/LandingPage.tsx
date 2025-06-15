import { Outlet } from "react-router-dom";
import "../styles/landing-page.css";

const LandingPage = () => {
    return (
        <>
            <main className="main-content">
                <Outlet />
            </main>
        </>
    );
};

export default LandingPage;