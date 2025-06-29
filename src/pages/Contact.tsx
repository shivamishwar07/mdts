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
  );
};

export default Contact;