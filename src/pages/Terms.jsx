import React from "react";
import { FiCheckSquare, FiAlertCircle, FiUserCheck, FiSlash } from "react-icons/fi";
import "./Terms.css"; 

const Terms = () => {
  return (
    <div className="legal-wrapper">
      <div className="legal-header">
        <h1>Terms & Conditions</h1>
        <p>Last Updated: January 2026</p>
      </div>

      <div className="legal-container">
        <aside className="legal-sidebar desktop">
          <nav>
            <a href="#acceptance">Acceptance</a>
            <a href="#user-account">User Accounts</a>
            <a href="#listings">Property Listings</a>
            <a href="#prohibited">Prohibited Actions</a>
          </nav>
        </aside>

        <main className="legal-content">
          <section id="acceptance">
            <h2><FiCheckSquare /> Acceptance of Terms</h2>
            <p>By accessing and using the Stay Safe platform, you agree to be bound by these Terms and Conditions. These terms govern your use of our website, mobile application, and services. If you do not agree with any part of these terms, please refrain from using our services immediately.</p>
          </section>

          <section id="user-account">
            <h2><FiUserCheck /> User Accounts</h2>
            <p>To access certain features of the platform, you must create an account. You agree to provide accurate, current, and complete information during the registration process. You are solely responsible for safeguarding your account credentials and for any activities or actions under your account.</p>
          </section>

          <section id="listings">
            <h2><FiAlertCircle /> Property Listings</h2>
            <p>Property owners are strictly required to list only genuine properties that they legally own or are authorized to rent. Providing false, misleading, or fraudulent information is a violation of our policy and may result in immediate account suspension and removal of listings.</p>
          </section>

          <section id="prohibited">
            <h2><FiSlash /> Prohibited Actions</h2>
            <p>Users are prohibited from engaging in any fraudulent activities, spamming, or illegal conduct on the platform. Stay Safe reserves the right to monitor user interactions and terminate or block any account without prior notice if we detect suspicious or harmful behavior.</p>
          </section>

          <section id="liability">
            <h2><FiAlertCircle /> Limitation of Liability</h2>
            <p>Stay Safe acts as a marketplace to connect seekers and owners. While we verify listings, we are not responsible for the ultimate legal agreements or disputes between parties. Users are encouraged to conduct their own due diligence before finalizing any rental stay.</p>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Terms;