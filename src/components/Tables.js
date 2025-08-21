import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import {
  Card,
  Table,
  Button,
  Image,
  Modal,
  Form,
  Spinner,
  Pagination
} from "@themesberg/react-bootstrap";

import profileImg from "../assets/img/pages/Profile.png";

// Dummy Data (added more users to test pagination)
const initialUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "+91 9876543210",
    image: profileImg
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+91 9123456789",
    image: profileImg
  },
  {
    id: 3,
    name: "Robert Brown",
    email: "robert@example.com",
    phone: "+91 9988776655",
    image: profileImg
  },
];

export const PageUserTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5; // show 5 users per page

  // Modals state
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Selected user
  const [selectedUser, setSelectedUser] = useState(null);

  // Edit form state
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  // Simulate API call
  useEffect(() => {
    setTimeout(() => {
      setUsers(initialUsers);
      setLoading(false);
    }, 1000);
  }, []);

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  // Handlers
  const handleOpenViewModal = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, phone: user.phone });
    setShowEditModal(true);
  };

  const handleCloseViewModal = () => setShowViewModal(false);
  const handleCloseEditModal = () => setShowEditModal(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = () => {
    setShowEditModal(false);
  };

  const handleDelete = (id) => {
    // setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const TableRow = ({ id, name, email, phone, image }) => {
    return (
      <tr>
        <td>{id}</td>
        <td>
          <Image src={image} roundedCircle width={40} height={40} className="me-2" />
        </td>
        <td>{name}</td>
        <td>{email}</td>
        <td>{phone}</td>
        <td>
          <Button
            variant="info"
            size="sm"
            className="me-2 btn-xs"
            onClick={() => handleOpenViewModal({ id, name, email, phone, image })}
          >
            <FontAwesomeIcon icon={faEye} className="me-1" /> View
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="me-2 btn-xs"
            onClick={() => handleOpenEditModal({ id, name, email, phone, image })}
          >
            <FontAwesomeIcon icon={faEdit} className="me-1" /> Edit
          </Button>
          <Button variant="danger" size="sm" className="btn-xs" onClick={() => handleDelete(id)}>
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

          {loading ? (
            <div className="d-flex justify-content-center align-items-center p-5">
              <Spinner animation="border" role="status" />
              <span className="ms-2">Loading...</span>
            </div>
          ) : (
            <>
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
                  {currentUsers.map((user) => (
                    <TableRow key={user.id} {...user} />
                  ))}
                </tbody>
              </Table>

              {/* Pagination */}
              <div className="d-flex justify-content-center mt-3">
                <Pagination>
                  <Pagination.Prev
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  />
                  {[...Array(totalPages)].map((_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={i + 1 === currentPage}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      {/* View Modal */}
      <Modal
        show={showViewModal}
        onHide={handleCloseViewModal}
        centered
        backdrop="static"   // prevents closing on outside click
        keyboard={false}    // disables ESC close
      >
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
      <Modal
        show={showEditModal}
        onHide={handleCloseEditModal}
        centered
        backdrop="static"
        keyboard={false}
      >
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
