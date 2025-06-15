import LandingPage from "../pages/LandingPage";
import Navbar from "./Navbar";

const MainLayout = () => {
    return (
        <div className="layout-container">
            <main className="main-content">
                <Navbar />
                <LandingPage />
            </main>
        </div>
    );
};

export default MainLayout;