import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { Card, Table, Button, Image, Modal, Form } from "@themesberg/react-bootstrap";

// Dummy Data
const initialUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "+91 9876543210",
    image: "https://via.placeholder.com/50"
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+91 9123456789",
    image: "https://via.placeholder.com/50"
  },
  {
    id: 3,
    name: "Robert Brown",
    email: "robert@example.com",
    phone: "+91 9988776655",
    image: "https://via.placeholder.com/50"
  },
];

export const PageUserTable = () => {
  const [users, setUsers] = useState(initialUsers);

  // Modals state
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Selected user
  const [selectedUser, setSelectedUser] = useState(null);

  // Edit form state
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  // Open View Modal
  const handleOpenViewModal = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, phone: user.phone });
    setShowEditModal(true);
  };

  // Close Modals
  const handleCloseViewModal = () => setShowViewModal(false);
  const handleCloseEditModal = () => setShowEditModal(false);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save Edit (update table data also)
  const handleSaveEdit = () => {
    setShowEditModal(false);
  };

  const TableRow = ({ id, name, email, phone, image }) => {
    return (
      <tr>
        <td>{id}</td>
        <td>
          <Image
            src={image}
            roundedCircle
            width={40}
            height={40}
            className="me-2"
          />
        </td>
        <td>{name}</td>
        <td>{email}</td>
        <td>{phone}</td>
        <td>
          <Button
            variant="info"
            size="sm"
            className="me-2"
            onClick={() => handleOpenViewModal({ id, name, email, phone, image })}
          >
            <FontAwesomeIcon icon={faEye} className="me-1" /> View
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="me-2"
            onClick={() => handleOpenEditModal({ id, name, email, phone, image })}
          >
            <FontAwesomeIcon icon={faEdit} className="me-1" /> Edit
          </Button>
          <Button variant="danger" size="sm">
            <FontAwesomeIcon icon={faTrashAlt} className="me-1" /> Delete
          </Button>
        </td>
      </tr>
    );
  };

  return (
    <>
      <Card border="light" className="table-wrapper table-responsive shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Users List</h5>
        </Card.Header>
        <Card.Body className="pt-0">
          <Table hover className="user-table align-items-center">
            <thead>
              <tr>
                <th className="border-bottom">Sr No.</th>
                <th className="border-bottom">Image</th>
                <th className="border-bottom">Name</th>
                <th className="border-bottom">Email</th>
                <th className="border-bottom">Phone No.</th>
                <th className="border-bottom">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <TableRow key={user.id} {...user} />
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* View Modal */}
      <Modal show={showViewModal} onHide={handleCloseViewModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div className="text-left">
              <h5>{selectedUser.name}</h5>
              <p>Email: {selectedUser.email}</p>
              <p>Phone: {selectedUser.phone}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseViewModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveEdit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
