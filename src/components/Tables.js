import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrashAlt, faSearch } from "@fortawesome/free-solid-svg-icons";
import {
  Card,
  Table,
  Button,
  Image,
  Modal,
  Form,
  Spinner,
  Pagination,
  InputGroup,
  FormControl,
  Badge,
} from "@themesberg/react-bootstrap";

import profileImg from "../assets/img/pages/Profile.png";

// Dummy data
const initialUsers = [
  {
    id: 1,
    name: "Priya Sharma",
    email: "priya@example.com",
    phone: "+91 9812345678",
    role: "Organizer",
    kycStatus: "Pending",
    walletBalance: "₹12,450",
    dateJoined: "20 Sep 2025",
    image: profileImg,
    livenessScore: 92,
    idProof: profileImg,
    selfie: profileImg,
    circlesJoined: [
      { id: 1, name: "Weekly Savings", role: "Member" },
      { id: 2, name: "Monthly ROSCA", role: "Organizer" },
    ],
    paymentHistory: [
      { id: 1, date: "01 Oct 2025", amount: "₹1,000", circle: "Weekly Savings" },
      { id: 2, date: "08 Oct 2025", amount: "₹1,000", circle: "Weekly Savings" },
    ],
  },
  {
    id: 2,
    name: "John Doe",
    email: "john@example.com",
    phone: "+91 9876543210",
    role: "Member",
    kycStatus: "Verified",
    walletBalance: "₹2,350",
    dateJoined: "15 Oct 2025",
    image: profileImg,
    livenessScore: 95,
    idProof: profileImg,
    selfie: profileImg,
    circlesJoined: [{ id: 3, name: "Monthly ROSCA", role: "Member" }],
    paymentHistory: [
      { id: 1, date: "01 Oct 2025", amount: "₹500", circle: "Monthly ROSCA" },
    ],
  },

];

export const PageUserTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // Modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Rejection reason
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setUsers(initialUsers);
      setLoading(false);
    }, 800);
  }, []);

  // Filter + Search logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "All" || user.kycStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handleOpenViewModal = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
    setShowRejectInput(false);
    setRejectReason("");
  };
  const handleCloseViewModal = () => setShowViewModal(false);

  const handleApprove = () => {
    if (!selectedUser) return;
    if (window.confirm(`Are you sure you want to approve KYC for ${selectedUser.name}?`)) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, kycStatus: "Verified" } : u
        )
      );
      handleCloseViewModal();
    }
  };

  const handleReject = () => {
    setShowRejectInput(true);
  };

  const submitReject = () => {
    if (!rejectReason) {
      alert("Please enter rejection reason.");
      return;
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? { ...u, kycStatus: "Rejected", rejectReason }
          : u
      )
    );
    handleCloseViewModal();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Verified":
        return <Badge bg="success">{status}</Badge>;
      case "Pending":
        return <Badge bg="warning">{status}</Badge>;
      case "Rejected":
        return <Badge bg="danger">{status}</Badge>;
      case "Suspicious":
        return <Badge bg="secondary">{status}</Badge>;
      default:
        return <Badge bg="light">{status}</Badge>;
    }
  };

  const TableRow = ({ id, name, email, phone, role, kycStatus, walletBalance, dateJoined, image }) => (
    <tr>
      <td>{id}</td>
      <td><Image src={image} roundedCircle width={40} height={40} className="me-2" /></td>
      <td>{name}</td>
      <td>{email}</td>
      <td>{phone}</td>
      <td>{role}</td>
      <td>{getStatusBadge(kycStatus)}</td>
      <td>{walletBalance}</td>
      <td>{dateJoined}</td>
      <td>
        <Button variant="info" size="sm" className="me-2 btn-xs" onClick={() => handleOpenViewModal(users.find(u => u.id === id))}>
          <FontAwesomeIcon icon={faEye} /> View
        </Button>
      </td>
    </tr>
  );

  return (
    <>
      <Card border="light" className="table-wrapper table-responsive shadow-sm">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <h5 className="mb-0">👥 All Registered Users</h5>
            <div className="d-flex gap-2 mt-2 mt-sm-0">
              <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: "180px" }}>
                <option value="All">All Status</option>
                <option value="Verified">Verified</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
                <option value="Suspicious">Suspicious</option>
              </Form.Select>
              <InputGroup style={{ width: "250px" }}>
                <InputGroup.Text><FontAwesomeIcon icon={faSearch} /></InputGroup.Text>
                <FormControl placeholder="Search by name or email" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </InputGroup>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="pt-0">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center p-5">
              <Spinner animation="border" role="status" /><span className="ms-2">Loading...</span>
            </div>
          ) : (
            <>
              <Table hover className="user-table align-items-center">
                <thead>
                  <tr>
                    <th>Sr No.</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>KYC Status</th>
                    <th>Wallet</th>
                    <th>Date Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length > 0 ? currentUsers.map(user => <TableRow key={user.id} {...user} />) : (
                    <tr><td colSpan="10" className="text-center py-4">No users found</td></tr>
                  )}
                </tbody>
              </Table>

              <div className="d-flex justify-content-center mt-3">
                <Pagination>
                  <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
                  {[...Array(totalPages)].map((_, i) => (
                    <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} />
                </Pagination>
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      {/* View Modal */}
      <Modal show={showViewModal} onHide={handleCloseViewModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              <div className="text-center mb-3">
                <Image src={selectedUser.image} roundedCircle width={70} height={70} />
              </div>
              <p><b>Name:</b> {selectedUser.name}</p>
              <p><b>Email:</b> {selectedUser.email}</p>
              <p><b>Phone:</b> {selectedUser.phone}</p>
              <p><b>Role:</b> {selectedUser.role}</p>
              <p><b>KYC Status:</b> {selectedUser.kycStatus}</p>
              <p><b>Liveness Score:</b> {selectedUser.livenessScore}%</p>
              <p><b>Wallet Balance:</b> {selectedUser.walletBalance}</p>
              <p><b>Date Joined:</b> {selectedUser.dateJoined}</p>

              {/* ID Proof & Selfie */}
              <div className="d-flex gap-3 my-2">
                <div>
                  <p><b>ID Proof:</b></p>
                  <Image src={selectedUser.idProof} thumbnail width={100} height={100} />
                </div>
                <div>
                  <p><b>Selfie:</b></p>
                  <Image src={selectedUser.selfie} thumbnail width={100} height={100} />
                </div>
              </div>

              {/* Circles Joined */}
              <p><b>Circles Joined:</b> {selectedUser.circlesJoined.length}</p>
              <ul>
                {selectedUser.circlesJoined.map(c => <li key={c.id}>{c.name} ({c.role})</li>)}
              </ul>

              {/* Payment History */}
              <h6>Payment History</h6>
              <Table size="sm" bordered hover>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Circle</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedUser.paymentHistory.map(p => (
                    <tr key={p.id}>
                      <td>{p.date}</td>
                      <td>{p.amount}</td>
                      <td>{p.circle}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Reject reason input */}
              {showRejectInput && (
                <Form.Group className="mt-2">
                  <Form.Label>Reason for Rejection</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter reason"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </Form.Group>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {!showRejectInput && selectedUser && selectedUser.kycStatus === "Pending" && (
            <>
              <Button variant="success" onClick={handleApprove}>✅ Approve</Button>
              <Button variant="danger" onClick={handleReject}>❌ Reject</Button>
            </>
          )}
          {showRejectInput && <Button variant="danger" onClick={submitReject}>Submit Rejection</Button>}
          <Button variant="secondary" onClick={handleCloseViewModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
