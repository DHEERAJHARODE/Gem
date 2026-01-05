import { Link } from "react-router-dom";
import { 
  FiInstagram, FiTwitter, FiFacebook, FiMail, 
  FiPhone, FiSend, FiShield, FiCheckCircle
} from "react-icons/fi";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      {/* Desktop Only Trust Strip */}
      <div className="footer-trust-strip desktop-only">
        <div className="trust-item"><FiShield /> 100% Verified Listings</div>
        <div className="trust-item"><FiCheckCircle /> Secure Communication</div>
        <div className="trust-item"><FiShield /> Privacy Protected</div>
      </div>

      <div className="footer-container">
        {/* Brand Section */}
        <div className="footer-col brand">
          <h2 className="footer-logo">Stay Safe<span>.</span></h2>
          <p className="footer-desc">
            The most trusted platform for safe room rentals. 
          </p>
          <div className="footer-socials">
            <a href="#" className="social-icon"><FiInstagram /></a>
            <a href="#" className="social-icon"><FiTwitter /></a>
            <a href="#" className="social-icon"><FiFacebook /></a>
          </div>
        </div>

        {/* Links Grid */}
        <div className="footer-links-grid">
          <div className="footer-col">
            <h4>Explore</h4>
            <nav className="footer-nav">
              <Link to="/rooms">Rooms</Link>
              <Link to="/register">List Room</Link>
              <Link to="/contact">Contact</Link>
            </nav>
          </div>

          <div className="footer-col">
            <h4>Legal</h4>
            <nav className="footer-nav">
              <Link to="/help">Help</Link>
              <Link to="/terms">Terms</Link>
              <Link to="/privacy">Privacy</Link>
            </nav>
          </div>
        </div>

        {/* Newsletter Section - Hidden on Mobile */}
        <div className="footer-col contact desktop-only">
          <h4>Newsletter</h4>
          <div className="newsletter-box">
            <input type="email" placeholder="Your email" />
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
          <p>© 2026 Stay Safe Inc.</p>
          {/* Legal dots only on desktop */}
          <div className="legal-links desktop-only">
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