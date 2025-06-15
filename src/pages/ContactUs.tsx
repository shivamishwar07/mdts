import "../styles/contact-us.css";
import React, { useState } from "react";

const CustomContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for reaching out!");
  };

  return (
    <div className="custom-contact-container">
      <div className="custom-contact-left">
        <img src="/contact-vector.png" alt="Contact Illustration" />
      </div>
      <div className="custom-contact-right">
        <h2>Contact Us</h2>
        <form onSubmit={handleSubmit}>
          <div className="custom-input-group">
            <label>Name*</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="custom-input-row">
            <div className="custom-input-group">
              <label>Email Address*</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="custom-input-group">
              <label>Phone Number*</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
          </div>
          <div className="custom-input-group">
            <label>Company*</label>
            <input type="text" name="company" value={formData.company} onChange={handleChange} required />
          </div>
          <div className="custom-input-group">
            <label>Message*</label>
            <textarea name="message" value={formData.message} onChange={handleChange} required></textarea>
          </div>
          <button type="submit" className="custom-submit-btn">Contact Us</button>
        </form>
      </div>
    </div>
  );
};

export default CustomContactForm;

