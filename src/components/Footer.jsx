import { Link } from "react-router-dom";
import { 
  FiInstagram, FiTwitter, FiFacebook, FiMail, 
  FiPhone, FiMapPin, FiSend, FiShield, FiCheckCircle
} from "react-icons/fi";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      {/* Top Trust Strip (Visible in both) */}
      <div className="footer-trust-strip">
        <div className="trust-item"><FiShield /> 100% Verified</div>
        <div className="trust-item"><FiCheckCircle /> Secure Payments</div>
        <div className="trust-item"><FiShield /> Data Privacy</div>
      </div>

      <div className="footer-container">
        {/* Brand Section */}
        <div className="footer-col brand">
          <h2 className="footer-logo">Stay Safe<span>.</span></h2>
          <p className="footer-desc">
            India's leading platform for safe and affordable room rentals. 
            Connecting thousands of students and professionals daily.
          </p>
          <div className="footer-socials">
            <a href="#" className="social-icon"><FiInstagram /></a>
            <a href="#" className="social-icon"><FiTwitter /></a>
            <a href="#" className="social-icon"><FiFacebook /></a>
          </div>
        </div>

        {/* Links Grid */}
        <div className="footer-grid">
          <div className="footer-col">
            <h4>Company</h4>
            <nav className="footer-nav">
              <Link to="/rooms">Browse Rooms</Link>
              <Link to="/register">List Property</Link>
              <Link to="/contact">About Us</Link>
              <Link to="/help">Safety Tips</Link>
            </nav>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <nav className="footer-nav">
              <Link to="/profile">My Profile</Link>
              <Link to="/feedback">Feedback</Link>
              <Link to="/help">Help Center</Link>
              <Link to="/terms">Terms of Service</Link>
            </nav>
          </div>
        </div>

        {/* Contact & Newsletter */}
        <div className="footer-col contact">
          <h4>Newsletter</h4>
          <p className="newsletter-text">Join 5000+ users getting weekly room updates.</p>
          <div className="newsletter-box">
            <input type="email" placeholder="Enter your email" />
            <button><FiSend /></button>
          </div>
          <div className="contact-details">
            <div className="contact-row"><FiMail /> support@staysafe.com</div>
            <div className="contact-row"><FiPhone /> +91 98765 43210</div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p>© 2026 Stay Safe Inc. All Rights Reserved.</p>
          <div className="legal-links">
            <Link to="/privacy">Privacy</Link>
            <span className="dot"></span>
            <Link to="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;