import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
} from "@themesberg/react-bootstrap";
import { faUserShield } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { saveAppContent, getPrivacyPolicys } from "../api/ApiServices";

const PrivacyPolicy = () => {
  const [policies, setPolicies] = useState([]);
  const [supportInfo, setSupportInfo] = useState({
    companyName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPolicy, setCurrentPolicy] = useState({ section: "", content: "", id: null });

  // Fetch support info and privacy policy from backend on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPrivacyPolicys();
        console.log("API response:", data);

        // Set support info dynamically
        const payload = data?.payload || {};
        setSupportInfo({
          companyName: payload.companyName || "Ajolink",
          email: payload.email || "support@ajolink.com",
          phone: payload.phone || "+91 98765 43210",
          address: payload.address || "123 Business Street, Bengaluru, India",
        });

        // Get privacy policy text
        const policyText = payload.ai_privacy_policy || payload.privacyPolicy || "";
        if (policyText) {
          const sections = policyText.split("\n\n").map((text, index) => {
            const lines = text.split("\n");
            const firstLine = lines[0] || "";
            const content = lines.slice(1).join("\n");

            return {
              id: index + 1,
              section: firstLine.replace(/^\d+\.\s*/, ""),
              content,
            };
          });
          setPolicies(sections);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleAdd = () => {
    setEditMode(false);
    setCurrentPolicy({ section: "", content: "", id: null });
    setShowModal(true);
  };

  const handleEdit = (policy) => {
    setEditMode(true);
    setCurrentPolicy(policy);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const updated = policies.filter((p) => p.id !== id);
    setPolicies(updated);
  };

  const handleSave = async () => {
    if (!currentPolicy.section || !currentPolicy.content) {
      alert("Section and content are required");
      return;
    }

    let updatedPolicies;
    if (editMode) {
      updatedPolicies = policies.map((p) =>
        p.id === currentPolicy.id ? currentPolicy : p
      );
    } else {
      updatedPolicies = [...policies, { ...currentPolicy, id: policies.length + 1 }];
    }

    setPolicies(updatedPolicies);

    const fullPolicyText = updatedPolicies
      .map((p, idx) => `${idx + 1}. ${p.section}\n${p.content}`)
      .join("\n\n");

    const payload = {
      type: "0", // 0 = privacy policy
      data: fullPolicyText,
    };

    try {
      const response = await saveAppContent(payload);
      if (response?.status) {
        alert("Privacy Policy saved successfully");
      } else {
        alert("Failed to save privacy policy");
      }
    } catch (error) {
      console.error("Error saving policy:", error);
      alert("Error saving policy");
    }

    setShowModal(false);
  };

  return (
    <div>
      <Card border="light" className="shadow-sm mb-4">
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h4 className="mb-0">
            <FontAwesomeIcon icon={faUserShield} className="me-2" />
            Privacy Policy — {supportInfo.companyName}
          </h4>
          <Button variant="primary" onClick={handleAdd}>
            Save
          </Button>
        </div>

        <Card className="p-4 shadow-sm mb-5 mt-5">
          {policies.length > 0 ? (
            policies.map((p, idx) => (
              <div key={p.id} className="mb-4">
                <h4>{idx + 1}. {p.section}</h4>
                <p>{p.content}</p>
              </div>
            ))
          ) : (
            <p>No privacy policy sections found.</p>
          )}

          <h4>Contact Us</h4>
          <ul>
            <li>📧 <strong>Email:</strong> <a href={`mailto:${supportInfo.email}`}>{supportInfo.email}</a></li>
            <li>📞 <strong>Phone:</strong> {supportInfo.phone}</li>
            <li>📍 <strong>Address:</strong> {supportInfo.address}</li>
          </ul>

          <p className="mt-4 text-muted small">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </Card>

        <Card className="p-3 shadow-sm mb-5">
          <h4>Manage Privacy Policy Sections</h4>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Section</th>
                <th>Content</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((p, idx) => (
                <tr key={p.id}>
                  <td>{idx + 1}</td>
                  <td>{p.section}</td>
                  <td>{p.content}</td>
                  <td>
                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(p)}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(p.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
              {policies.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center">No sections found.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      </Card>

      Modal for Add/Edit Section
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Edit Section" : "Add Section"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Section Name</Form.Label>
              <Form.Control
                type="text"
                value={currentPolicy.section}
                onChange={(e) => setCurrentPolicy({ ...currentPolicy, section: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={currentPolicy.content}
                onChange={(e) => setCurrentPolicy({ ...currentPolicy, content: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>{editMode ? "Update" : "Save"}</Button>
        </Modal.Footer>
      </Modal>

      <div className="text-center mt-5">
        <small className="text-muted">
           {new Date().getFullYear()} {supportInfo.companyName}. All rights reserved.
        </small>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
