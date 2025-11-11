import React, { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faSearch } from "@fortawesome/free-solid-svg-icons";
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

// Dummy user data
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
  {
    id: 3,
    name: "Ananya Singh",
    email: "ananya@example.com",
    phone: "+91 9123456780",
    role: "Member",
    kycStatus: "Pending",
    walletBalance: "₹4,000",
    dateJoined: "05 Nov 2025",
    image: profileImg,
    livenessScore: 88,
    idProof: profileImg,
    selfie: profileImg,
    circlesJoined: [{ id: 4, name: "Weekly Savings", role: "Member" }],
    paymentHistory: [
      { id: 1, date: "02 Nov 2025", amount: "₹1,000", circle: "Weekly Savings" },
    ],
  },
  {
    id: 4,
    name: "Rahul Mehta",
    email: "rahul@example.com",
    phone: "+91 9988776655",
    role: "Organizer",
    kycStatus: "Rejected",
    walletBalance: "₹8,750",
    dateJoined: "22 Oct 2025",
    image: profileImg,
    livenessScore: 70,
    idProof: profileImg,
    selfie: profileImg,
    circlesJoined: [{ id: 5, name: "Monthly ROSCA", role: "Organizer" }],
    paymentHistory: [
      { id: 1, date: "10 Oct 2025", amount: "₹2,000", circle: "Monthly ROSCA" },
    ],
  },
  {
    id: 5,
    name: "Sneha Kapoor",
    email: "sneha@example.com",
    phone: "+91 9234567890",
    role: "Member",
    kycStatus: "Pending",
    walletBalance: "₹1,500",
    dateJoined: "01 Nov 2025",
    image: profileImg,
    livenessScore: 80,
    idProof: profileImg,
    selfie: profileImg,
    circlesJoined: [
      { id: 6, name: "Weekly Savings", role: "Member" },
      { id: 7, name: "Monthly ROSCA", role: "Member" },
    ],
    paymentHistory: [
      { id: 1, date: "03 Nov 2025", amount: "₹500", circle: "Weekly Savings" },
      { id: 2, date: "07 Nov 2025", amount: "₹500", circle: "Monthly ROSCA" },
    ],
  },
];

export const PageUserTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // Modal & KYC handling
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setUsers(initialUsers);
      setLoading(false);
    }, 800);
  }, []);

  // Filtered users memoized for performance
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "All" || user.kycStatus === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, filterStatus]);

  // Pagination logic
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
    if (window.confirm(`Approve KYC for ${selectedUser.name}?`)) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, kycStatus: "Verified" } : u
        )
      );
      handleCloseViewModal();
    }
  };

  const handleReject = () => setShowRejectInput(true);
  const submitReject = () => {
    if (!rejectReason) return alert("Please enter a rejection reason.");
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
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const TableRow = (props) => {
    const { id, name, email, phone, role, kycStatus, walletBalance, dateJoined, image, rejectReason } = props;
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
        <td>{role}</td>
        <td>
          {getStatusBadge(kycStatus)}
          {kycStatus === "Rejected" && rejectReason && (
            <span className="text-muted ms-2" title={rejectReason}>
              ❌
            </span>
          )}
        </td>
        <td>{walletBalance}</td>
        <td>{dateJoined}</td>
        <td>
          <Button
            variant="info"
            size="sm"
            className="me-2"
            onClick={() => handleOpenViewModal(props)}
          >
            <FontAwesomeIcon icon={faEye} /> View
          </Button>
        </td>
      </tr>
    );
  };

  return (
    <>
      <Card border="light" className="table-wrapper shadow-sm">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <h5 className="mb-0">👥 All Registered Users</h5>
            <div className="d-flex gap-2 mt-2 mt-sm-0">
              <Form.Select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ width: "180px" }}
              >
                <option value="All">All Status</option>
                <option value="Verified">Verified</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </Form.Select>

              <InputGroup style={{ width: "250px" }}>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <FormControl
                  placeholder="Search by name or email"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </InputGroup>
            </div>
          </div>
        </Card.Header>

        <Card.Body className="pt-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" /> <p>Loading users...</p>
            </div>
          ) : (
            <>
              <Table hover responsive className="align-middle">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>KYC</th>
                    <th>Wallet</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                      <TableRow key={user.id} {...user} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center py-4">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex flex-column align-items-center mt-3">
                  <Pagination>
                    <Pagination.First
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
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
                    <Pagination.Last
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>

                  <div className="text-muted small">
                    Showing {indexOfFirstUser + 1}–
                    {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
                    {filteredUsers.length}
                  </div>
                </div>
              )}
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
                <Image
                  src={selectedUser.image}
                  roundedCircle
                  width={70}
                  height={70}
                />
              </div>
              <p><b>Name:</b> {selectedUser.name}</p>
              <p><b>Email:</b> {selectedUser.email}</p>
              <p><b>Phone:</b> {selectedUser.phone}</p>
              <p><b>Role:</b> {selectedUser.role}</p>
              <p><b>KYC Status:</b> {selectedUser.kycStatus}</p>
              {selectedUser.kycStatus === "Rejected" && selectedUser.rejectReason && (
                <p><b>Rejection Reason:</b> {selectedUser.rejectReason}</p>
              )}
              <p><b>Liveness Score:</b> {selectedUser.livenessScore}%</p>

              <h6 className="mt-3">Circles Joined</h6>
              <ul>
                {selectedUser.circlesJoined.map((c) => (
                  <li key={c.id}>
                    {c.name} ({c.role})
                  </li>
                ))}
              </ul>

              <h6 className="mt-3">Payment History</h6>
              <Table size="sm" bordered hover>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Circle</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedUser.paymentHistory.map((p) => (
                    <tr key={p.id}>
                      <td>{p.date}</td>
                      <td>{p.amount}</td>
                      <td>{p.circle}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {showRejectInput && (
                <Form.Group className="mt-3">
                  <Form.Label>Reason for Rejection</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter reason"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    autoFocus
                  />
                </Form.Group>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {!showRejectInput &&
            selectedUser &&
            selectedUser.kycStatus === "Pending" && (
              <>
                <Button variant="success" onClick={handleApprove}>
                  ✅ Approve
                </Button>
                <Button variant="danger" onClick={handleReject}>
                  ❌ Reject
                </Button>
              </>
            )}
          {showRejectInput && (
            <Button variant="danger" onClick={submitReject}>
              Submit Rejection
            </Button>
          )}
          <Button variant="secondary" onClick={handleCloseViewModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
