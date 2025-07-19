import "../styles/contact.css";
import {
  MailOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  FacebookFilled,
  TwitterSquareFilled,
  LinkedinFilled,
  YoutubeFilled,
} from "@ant-design/icons";

const Contact = () => {
  return (
    <>
      <div className="contact-container">
        <div className="contact-info">
          <div className="contact-section">
            <h3><MailOutlined /> Chat to us</h3>
            <p>Our friendly team is here to help.</p>
            <a href="mailto:hi@untitledui.com">hi@untitledui.com</a>
          </div>
          <div className="contact-section">
            <h3><EnvironmentOutlined /> Visit us</h3>
            <p>Come say hello at our office HQ.</p>
            <address>
              100 Smith Street<br />
              Collingwood VIC 3066 AU
            </address>
          </div>
          <div className="contact-section">
            <h3><PhoneOutlined /> Call us</h3>
            <p>Mon–Fri from 8am to 5pm.</p>
            <a href="tel:+15550000000">+1 (555) 000–0000</a>
          </div>
          <div className="social-icons">
            <FacebookFilled className="icon" />
            <TwitterSquareFilled className="icon" />
            <LinkedinFilled className="icon" />
            <YoutubeFilled className="icon" />
          </div>
        </div>

        <div className="contact-form">
          <h1>Got ideas? We’ve got the skills. Let’s team up.</h1>
          <p>Tell us more about yourself and what you’ve got in mind.</p>

          <form>
            <input type="text" placeholder="Name*" required />
            <input type="text" placeholder="Company*" required />
            <input type="email" placeholder="Email*" required />
            <input type="tel" placeholder="Phone*" required />
            <input type="text" placeholder="Country" />
            <textarea placeholder="Message" rows={parseInt('5', 10)} ></textarea>

            <button type="submit">Let’s get started!</button>
          </form>
        </div>
      </div>
      <div className="map-section">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31514.95406536651!2d77.5746717!3d12.9715987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670b2c0a7a3%3A0x206d1f3a8e3c107!2sMining%20Corp!5e0!3m2!1sen!2sin!4v1689925507595!5m2!1sen!2sin"
          width="100%"
          height="500"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Mining HQ Location"
        ></iframe>
      </div>
    </>
  );
};

export default Contact;