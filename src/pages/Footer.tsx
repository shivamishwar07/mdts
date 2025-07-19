import React from "react";
import "../styles/footer.css";

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="footer-grid">
                <div>
                    <h3 className="footer-title">SYSTEM</h3>
                    <div className="footer-item">📁 Project Tracker v2.1</div>
                    <div className="footer-item">🧩 Modules: Issue Mgmt, Sprint Logs, Time Tracking</div>
                    <div className="footer-item">📅 Last Updated: June 2025</div>
                </div>

                <div>
                    <h3 className="footer-title">RESOURCES</h3>
                    <ul className="footer-links">
                        <li><a href="#">User Guide</a></li>
                        <li><a href="#">API Docs</a></li>
                        <li><a href="#">Developer Wiki</a></li>
                        <li><a href="#">Release Notes</a></li>
                    </ul>
                </div>

                <div>
                    <h3 className="footer-title">SUPPORT</h3>
                    <div className="footer-item">📨 support@tracksys.io</div>
                    <div className="footer-item">📞 DevOps: +91 98765 43210</div>
                    <div className="footer-item">⏱ Support Hours: 10 AM – 7 PM IST</div>
                </div>

                <div>
                    <h3 className="footer-title">SUBSCRIBE</h3>
                    <p style={{ marginBottom: '0.5rem', color: '#ccc', fontSize: '0.875rem' }}>
                        Get notified about major updates & releases.
                    </p>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="footer-input"
                    />
                    <button className="footer-button">Subscribe</button>
                </div>
            </div>

            <div className="footer-note">
                &copy; 2025 TrackSys • Internal DevOps Platform • Confidential
            </div>
        </footer>
    );
};

export default Footer;