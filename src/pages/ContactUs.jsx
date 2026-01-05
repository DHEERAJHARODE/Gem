import React from "react";
import { FiMail, FiPhone, FiMapPin, FiMessageSquare } from "react-icons/fi";
import "./ContactUs.css";

const ContactUs = () => {
  return (
    <div className="contact-wrapper">
      <div className="contact-hero">
        <h1>Get in Touch</h1>
        <p>Have questions? We're here to help you find your perfect stay.</p>
      </div>

      <div className="contact-container">
        <div className="contact-info-grid">
          <div className="info-card">
            <FiMail className="info-icon" />
            <h4>Email Us</h4>
            <p>support@staysafe.com</p>
          </div>
          <div className="info-card">
            <FiPhone className="info-icon" />
            <h4>Call Us</h4>
            <p>+91 98765 43210</p>
          </div>
          <div className="info-card">
            <FiMapPin className="info-icon" />
            <h4>Visit Us</h4>
            <p>Sector 62, Noida, UP, India</p>
          </div>
        </div>

        <div className="contact-form-section">
          <div className="form-card">
            <h3><FiMessageSquare /> Send a Message</h3>
            <form>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="John Doe" required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="john@example.com" required />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea rows="5" placeholder="How can we help you?" required></textarea>
              </div>
              <button type="submit" className="submit-btn">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;