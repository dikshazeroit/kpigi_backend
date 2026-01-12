import React, { useEffect, useState } from "react";
import { Card, Button, Form, Row, Col } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserShield,
  faFileContract,
  faAddressBook,
} from "@fortawesome/free-solid-svg-icons";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import Swal from "sweetalert2";

import { getPrivacyPolicys, saveAppContent } from "../api/ApiServices";

/* Quill toolbar */
const quillModules = {
  toolbar: [
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link"],
    ["clean"],
  ],
};

const quillFormats = [
  "bold",
  "italic",
  "underline",
  "list",
  "bullet",
  "align",
  "link",
];

const AppContentManagement = () => {
  const [privacyPolicy, setPrivacyPolicy] = useState("");
  const [termsConditions, setTermsConditions] = useState("");
  const [contact, setContact] = useState({
    email: "",
    phone: "",
    contact_address: "",
  });

  /* Fetch existing data */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPrivacyPolicys();
        const payload = res?.payload || {};

        setPrivacyPolicy(payload.privacyPolicy || "");
        setTermsConditions(payload.termsConditions || "");
        setContact({
          email: payload.email || "",
          phone: payload.phone || "",
          contact_address: payload.address || "",
        });
      } catch (err) {
        console.error("Error fetching app content:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch app content",
        });
      }
    };

    fetchData();
  }, []);

  /* Save handlers */
  const savePrivacy = async () => {
    try {
      await saveAppContent({ type: "0", data: privacyPolicy });

      Swal.fire({
        icon: "success",
        title: "Saved",
        text: "Privacy Policy saved successfully!",
        confirmButtonText: "OK"
      });

    } catch (err) {
      console.error("Error saving privacy policy:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save Privacy Policy",
      });
    }
  };

  const saveTerms = async () => {
    try {
      await saveAppContent({ type: "1", data: termsConditions });
      Swal.fire({
        icon: "success",
        title: "Saved",
        text: "Terms & Conditions saved successfully!",
        confirmButtonText: "OK"
      });
    } catch (err) {
      console.error("Error saving terms & conditions:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save Terms & Conditions",
      });
    }
  };

  const saveContact = async () => {
    try {
      const payload = {
        type: "2",
        email: contact.email,
        phone: contact.phone,
        contact_address: contact.contact_address,
      };

      console.log("Saving contact:", payload);

      await saveAppContent(payload);
      Swal.fire({
        icon: "success",
        title: "Saved",
        text: "Contact details saved successfully!",
        confirmButtonText: "OK"
      });
    } catch (err) {
      console.error("Error saving contact:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save contact details",
      });
    }
  };

  return (
    <Card border="light" className="shadow-sm p-4">
      {/* Header */}
      <div className="mb-4">
        <h4 className="mb-1">App Content Management</h4>
        <small className="text-muted">
          Manage privacy policy, terms & conditions, and contact details
        </small>
      </div>

      <Row>
        {/* Privacy Policy */}
        <Col md={4}>
          <Card className="shadow-sm h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <FontAwesomeIcon icon={faUserShield} className="me-2" />
                Privacy Policy
              </h6>
              <Button size="sm" variant="dark" onClick={savePrivacy}>
                Save
              </Button>
            </Card.Header>
            <Card.Body>
              <ReactQuill
                theme="snow"
                value={privacyPolicy}
                onChange={setPrivacyPolicy}
                modules={quillModules}
                formats={quillFormats}
                style={{ height: "260px" }}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Terms & Conditions */}
        <Col md={4}>
          <Card className="shadow-sm h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <FontAwesomeIcon icon={faFileContract} className="me-2" />
                Terms & Conditions
              </h6>
              <Button size="sm" variant="dark" onClick={saveTerms}>
                Save
              </Button>
            </Card.Header>
            <Card.Body>
              <ReactQuill
                theme="snow"
                value={termsConditions}
                onChange={setTermsConditions}
                modules={quillModules}
                formats={quillFormats}
                style={{ height: "260px" }}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Contact Details */}
        <Col md={4}>
          <Card className="shadow-sm h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <FontAwesomeIcon icon={faAddressBook} className="me-2" />
                Contact Details
              </h6>
              <Button size="sm" variant="dark" onClick={saveContact}>
                Save
              </Button>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={contact.email}
                  onChange={(e) =>
                    setContact({ ...contact, email: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  value={contact.phone}
                  onChange={(e) =>
                    setContact({ ...contact, phone: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={contact.contact_address}
                  onChange={(e) =>
                    setContact({ ...contact, contact_address: e.target.value })
                  }
                />
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default AppContentManagement;
