import React, { useEffect, useState } from "react";
import { Card, Spinner, Button, Form } from "@themesberg/react-bootstrap";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getPrivacyPolicys, saveAppContent } from "../api/ApiServices";
import Swal from "sweetalert2";

const TermsAndConditions = () => {
  const [supportInfo, setSupportInfo] = useState({
    companyName: "Ajolink",
    email: "support@ajolink.com",
    phone: "+91 98765 43210",
    address: "123 Business Street, Bengaluru, India",
  });
  const [termsText, setTermsText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch Terms & Conditions from API
  useEffect(() => {
    const fetchTerms = async () => {
      try {
        setLoading(true);
        const response = await getPrivacyPolicys(); // Assuming API returns terms & conditions
        const payload = response?.payload || {};

        setSupportInfo({
          companyName: payload.companyName || "Ajolink",
          email: payload.email || "support@ajolink.com",
          phone: payload.phone || "+91 98765 43210",
          address: payload.address || "123 Business Street, Bengaluru, India",
        });

        setTermsText(payload.terms_and_conditions || payload.terms || "");
      } catch (err) {
        console.error("Failed to fetch terms:", err);
        setTermsText("");
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, []);

  // Save Terms & Conditions to API
  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        type: "1", // 1 = Terms & Conditions
        data: termsText,
      };
      const response = await saveAppContent(payload);

      if (response?.status) {
        Swal.fire({
          icon: "success",
          title: "Saved!",
          text: "Terms & Conditions have been saved successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed!",
          text: response?.message || "Failed to save Terms & Conditions.",
        });
      }
    } catch (err) {
      console.error("Save error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while saving Terms & Conditions.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner animation="border" role="status" />
        <span className="ms-3">Loading Terms & Conditions...</span>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Page Title */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="text-left">
          <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
          Terms & Conditions — {supportInfo.companyName}
        </h4>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "💾 Save"}
        </Button>
      </div>

      {/* Editable Terms Text */}
      <Card className="p-4 shadow-sm mb-4">
        <Form>
          <Form.Group>
            <Form.Control
              as="textarea"
              rows={20}
              value={termsText}
              onChange={(e) => setTermsText(e.target.value)}
              placeholder="Enter Terms & Conditions here..."
            />
          </Form.Group>
        </Form>
      </Card>

      {/* Contact Info */}
      <Card className="p-4 shadow-sm mb-4">
        <h4>Contact Us</h4>
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
      </Card>

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
