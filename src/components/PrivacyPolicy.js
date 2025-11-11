import React, { useState } from "react";
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Row,
  Col,
} from "@themesberg/react-bootstrap";

const supportInfo = {
  companyName: "Ajolink",
  email: "support@ajolink.com",
  phone: "+91 98765 43210",
  address: "123 Business Street, Bengaluru, India",
};

// Initial Privacy Policy sections
const initialPolicies = [
  { id: 1, section: "Information We Collect", content: "We collect personal details such as your name, email, phone number, payment information, and KYC documents to verify your identity and process transactions securely. We may also collect usage data to improve our services." },
  { id: 2, section: "How We Use Your Information", content: "Provide and improve our services, verify your identity (KYC compliance), facilitate secure transactions, and send updates or notifications." },
  { id: 3, section: "Data Security", content: "We implement industry-standard security measures to protect your data from unauthorized access, alteration, disclosure, or destruction." },
];

const PrivacyPolicy = () => {
  const [policies, setPolicies] = useState(initialPolicies);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPolicy, setCurrentPolicy] = useState({ section: "", content: "" });

  const handleAdd = () => {
    setEditMode(false);
    setCurrentPolicy({ section: "", content: "" });
    setShowModal(true);
  };

  const handleEdit = (policy) => {
    setEditMode(true);
    setCurrentPolicy(policy);
    setShowModal(true);
  };

  const handleSave = () => {
    if (editMode) {
      setPolicies(policies.map((p) => (p.id === currentPolicy.id ? currentPolicy : p)));
    } else {
      setPolicies([...policies, { ...currentPolicy, id: policies.length + 1 }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setPolicies(policies.filter((p) => p.id !== id));
  };

  return (
    <div className="container py-5">
      {/* Header Row */}
      <Row className="align-items-center mb-4">
        <Col md={8}>
          <h1 className="mb-3">Privacy Policy — {supportInfo.companyName}</h1>
        </Col>
        <Col md={4} className="text-md-end">
          <Button variant="primary" onClick={handleAdd}>
            Manage Privacy Policy
          </Button>
        </Col>
      </Row>

      {/* Full Policy Display */}
      <Card className="p-4 shadow-sm mb-5">
        {policies.map((p, idx) => (
          <div key={p.id} className="mb-4">
            <h4>{idx + 1}. {p.section}</h4>
            <p>{p.content}</p>
          </div>
        ))}

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

      {/* Table Management */}
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

      {/* Modal for Add/Edit */}
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

      {/* Footer */}
      <div className="text-center mt-5">
        <small className="text-muted">
          © {new Date().getFullYear()} {supportInfo.companyName}. All rights reserved.
        </small>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
