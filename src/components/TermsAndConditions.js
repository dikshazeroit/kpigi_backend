import React from "react";

const supportInfo = {
  companyName: "Ajolink",
  email: "support@ajolink.com",
  phone: "+91 98765 43210",
  address: "123 Business Street, Bengaluru, India",
};

const TermsAndConditions = () => {
  return (
    <div className="container py-5">
      {/* Page Title and Description */}
      <h1 className="mb-3 text-center">Terms & Conditions — {supportInfo.companyName}</h1>
      <p className="text-muted mb-5 text-center">
        Welcome to {supportInfo.companyName}! These Terms & Conditions govern your access 
        to and use of our platform, services, and features. By using our platform, you 
        agree to comply with these terms. Please read them carefully before proceeding.
      </p>

      {/* Terms Sections */}
      <div className="card p-4 shadow-sm mb-4">
        <h4>1. Acceptance of Terms</h4>
        <p>
          By accessing or using our services, you acknowledge that you have read, 
          understood, and agreed to these Terms & Conditions. If you do not agree, 
          please refrain from using our services.
        </p>

        <h4>2. Use of Services</h4>
        <p>
          You agree to use the platform only for lawful purposes. You shall not engage 
          in activities that could harm, disrupt, or compromise the integrity of our 
          platform or other users.
        </p>

        <h4>3. Account Responsibilities</h4>
        <p>
          You are responsible for maintaining the confidentiality of your account 
          credentials. Any actions taken using your account are deemed to be performed 
          by you. Notify us immediately of unauthorized access or suspicious activity.
        </p>

        <h4>4. Payments and Transactions</h4>
        <p>
          All payments and transactions processed on {supportInfo.companyName} must 
          comply with applicable financial regulations. We reserve the right to suspend 
          or terminate accounts involved in fraudulent activity.
        </p>

        <h4>5. Intellectual Property</h4>
        <p>
          All content, trademarks, and assets on this platform are the intellectual 
          property of {supportInfo.companyName}. Unauthorized copying, modification, 
          or distribution is prohibited.
        </p>

        <h4>6. Limitation of Liability</h4>
        <p>
          {supportInfo.companyName} shall not be liable for any indirect, incidental, 
          or consequential damages arising from your use of the platform. We make no 
          warranties beyond those expressly stated.
        </p>

        <h4>7. Termination</h4>
        <p>
          We may suspend or terminate your account if you violate these terms or 
          engage in unlawful activity. You may terminate your account at any time 
          by contacting support.
        </p>

        <h4>8. Governing Law</h4>
        <p>
          These Terms & Conditions are governed by the laws of India. Any disputes 
          shall be subject to the exclusive jurisdiction of the courts in Bengaluru.
        </p>

        <h4>9. Contact Us</h4>
        <ul>
          <li>
            📧 <strong>Email:</strong>{" "}
            <a href={`mailto:${supportInfo.email}`}>{supportInfo.email}</a>
          </li>
          <li>
            📞 <strong>Phone:</strong> {supportInfo.phone}
          </li>
          <li>
            📍 <strong>Address:</strong> {supportInfo.address}
          </li>
        </ul>

        <p className="mt-4 text-muted small">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Footer */}
      <div className="text-center mt-5">
        <small className="text-muted">
          © {new Date().getFullYear()} {supportInfo.companyName}. All rights reserved.
        </small>
      </div>
    </div>
  );
};

export default TermsAndConditions;
