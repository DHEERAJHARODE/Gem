import React from "react";
import { FiShield, FiLock, FiEye, FiFileText } from "react-icons/fi";
import "./PrivacyPolicy.css";

const PrivacyPolicy = () => {
  return (
    <div className="legal-wrapper">
      <div className="legal-header">
        <h1>Privacy Policy</h1>
        <p>Last Updated: January 2026</p>
      </div>

      <div className="legal-container">
        <aside className="legal-sidebar desktop">
          <nav>
            <a href="#introduction">Introduction</a>
            <a href="#data-collection">Data We Collect</a>
            <a href="#data-usage">How We Use Data</a>
            <a href="#security">Data Security</a>
          </nav>
        </aside>

        <main className="legal-content">
          <section id="introduction">
            <h2><FiShield /> Introduction</h2>
            <p>Welcome to Stay Safe. We value your privacy and are committed to protecting your personal data. This policy outlines how we handle your information when you use our platform.</p>
          </section>

          <section id="data-collection">
            <h2><FiEye /> Data We Collect</h2>
            <p>We collect information that you provide directly to us, such as when you create an account, list a property, or contact us for support.</p>
            <ul>
              <li>Personal identifiers (Name, Email, Phone number)</li>
              <li>Profile images and property photos</li>
              <li>Location data for room searches</li>
            </ul>
          </section>

          <section id="data-usage">
            <h2><FiFileText /> How We Use Data</h2>
            <p>Your data is used to provide and improve our services, including connecting seekers with owners and sending important notifications regarding bookings.</p>
          </section>

          <section id="security">
            <h2><FiLock /> Data Security</h2>
            <p>We implement industry-standard security measures to ensure that your data remains safe and is not accessed by unauthorized parties.</p>
          </section>
        </main>
      </div>
    </div>
  );
};

export default PrivacyPolicy;