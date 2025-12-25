// Home.tsx
import { Typography } from "@mui/material";
import { Link, Outlet, useLocation } from "react-router-dom";
import "../styles/home.css";
import Footer from "./Footer";

const Home = () => {
  const location = useLocation();
  const isHomeRoute = location.pathname === "/home";

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <div className="page-containers">
      <div className="content-wrap">
        <header className="home-navbar">
          <div className="logo-and-text-item">
            <div className="logo-sections-cant">
              <Link to="/home" aria-label="Go to Home">
                <img
                  src="/images/logos/main-logo.png"
                  alt="Logo"
                  className="logo-image"
                />
              </Link>
            </div>
            <div className="brand-text">
              <p>Mine Development</p>
              <p>Tracking System</p>
            </div>
          </div>

          <nav className="tabs" aria-label="Primary navigation">
            <Link
              className={`tab-link ${isActive("/home") ? "active" : ""}`}
              to="/home"
            >
              <Typography className="tab-items" variant="body1">
                Home
              </Typography>
            </Link>

            <Link
              className={`tab-link ${isActive("/home/services") ? "active" : ""}`}
              to="/home/services"
            >
              <Typography className="tab-items" variant="body1">
                Services
              </Typography>
            </Link>

            <Link
              className={`tab-link ${isActive("/home/pricing") ? "active" : ""}`}
              to="/home/pricing"
            >
              <Typography className="tab-items" variant="body1">
                Pricing
              </Typography>
            </Link>

            <Link
              className={`tab-link ${isActive("/home/contacts") ? "active" : ""}`}
              to="/home/contacts"
            >
              <Typography className="tab-items" variant="body1">
                Contacts
              </Typography>
            </Link>

            <Link
              className={`tab-link ${isActive("/home/login") ? "active" : ""}`}
              to="/home/login"
            >
              <Typography className="tab-items" variant="body1">
                Login
              </Typography>
            </Link>
          </nav>
        </header>

        <div className="page-body">
          {isHomeRoute ? (
            <>
              <div className="hero-wrapper">
                <Outlet />
              </div>

              <section className="what-we-do-section">
                <div className="content-wrapper">
                  <div className="image-and-text">
                    <img
                      src="mining5.jpg"
                      alt="Mine Render"
                      className="mine-image"
                    />

                    <div className="text-content">
                      <Typography variant="h4" className="section-title">
                        What we do
                      </Typography>

                      <Typography variant="body1" className="section-description">
                        At MineTrack Innovations, we redefine mining excellence
                        through advanced digital tracking systems tailored for
                        mine development projects. Our platform integrates
                        real-time geospatial intelligence, equipment monitoring,
                        and operational analytics into a seamless interface.
                      </Typography>

                      <ul className="feature-list">
                        <li>⛏ Precision mapping of underground excavation paths</li>
                        <li>📡 Real-time tracking of vehicles and personnel</li>
                        <li>⚙️ Automated safety compliance monitoring and alerts</li>
                        <li>📊 Insightful dashboards for operational decision-making</li>
                        <li>🌐 Scalable cloud-based architecture for global deployment</li>
                      </ul>
                    </div>
                  </div>

                  <div className="impacts-section">
                    <Typography variant="h5" className="section-title">
                      Impacts and Outcomes
                    </Typography>
                    <Typography variant="body1" className="section-description">
                      Our innovations have led to measurable increases in
                      efficiency, safety, and transparency across multiple
                      mining operations. We align our solution delivery with
                      your project milestones, ensuring technology adapts to
                      your goals—not the other way around.
                    </Typography>
                    <Typography variant="body1" className="section-description">
                      With over a decade of industry expertise, MineTrack
                      empowers engineers, site managers, and stakeholders to
                      make informed decisions with confidence.
                    </Typography>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <Outlet />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;