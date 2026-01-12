import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  Pagination,
  InputGroup,
  FormControl,
  Badge,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faSearch, faDollarSign } from "@fortawesome/free-solid-svg-icons";
import {
  getAllwithdrawal,
  approveWithdrawal,
  rejectWithdrawal,
} from "../api/ApiServices";

const WithdrawalManagement = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

  // Fetch withdrawals
  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const response = await getAllwithdrawal();
      if (response.status) {
        setWithdrawals(response.payload || []);
      } else {
        setWithdrawals([]);
      }
    } catch (err) {
      console.error("Error fetching withdrawals:", err);
      setWithdrawals([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  // Approve withdrawal
  const handleApprove = async (w_uuid) => {
    try {
      await approveWithdrawal(w_uuid); // pass string, not object
      fetchWithdrawals();
    } catch (err) {
      console.error("Error approving withdrawal:", err);
    }
  };


  // Reject withdrawal
  const handleReject = async () => {
    if (!selectedWithdrawal) return;
    try {
      await rejectWithdrawal(selectedWithdrawal.w_uuid, rejectReason); // correct args
      setShowRejectModal(false);
      setRejectReason("");
      setSelectedWithdrawal(null);
      fetchWithdrawals(); // refresh table
    } catch (err) {
      console.error("Error rejecting withdrawal:", err);
    }
  };

  // Pagination & filtering
  const filteredWithdrawals = withdrawals.filter((w) =>
    w.w_account_holder_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage);
  const paginatedWithdrawals = filteredWithdrawals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return <Badge bg="warning">{status}</Badge>;
      case "PROCESSING":
        return <Badge bg="info">{status}</Badge>;
      case "COMPLETED":
        return <Badge bg="success">{status}</Badge>;
      case "REJECTED":
        return <Badge bg="danger">{status}</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-3">
      <Card className="mb-4 shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <FontAwesomeIcon icon={faDollarSign} style={{ fontSize: "1.8rem" }} />
            <h5 className="mb-0 fw-bold">Manage Withdrawals</h5>
          </div>
          <InputGroup style={{ width: "250px" }}>
            <FormControl
              type="text"
              placeholder="Search by account holder..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </InputGroup>
        </Card.Header>
      </Card>

      <Card className="p-3 shadow-sm">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <div className="text-muted fw-semibold">Loading withdrawals...</div>
          </div>
        ) : (
          <>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Sr.No</th>
                  <th>Account Holder</th>
                  <th>Email</th>
                  <th>Amount</th>
                  <th>Account Number</th>
                  <th>IFSC</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>

                </tr>
              </thead>
              <tbody>
                {paginatedWithdrawals.length > 0 ? (
                  paginatedWithdrawals.map((w, idx) => (
                    <tr key={w.w_uuid}>
                      <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>

                      <td>{w.w_account_holder_name || "No Data Found"}</td>


                      <td>{w.user?.uc_email || "No Data Found"}</td>


                      <td>₹ {w.w_amount}</td>

                      <td>{w.w_account_number}</td>

                      <td>{w.w_ifsc_code}</td>

                      <td>{getStatusBadge(w.w_status)}</td>

                      <td>{new Date(w.createdAt).toLocaleDateString()}</td>

                      <td>
                        {(w.w_status === "PENDING" || w.w_status === "PROCESSING") && (
                          <>
                            {w.w_status !== "COMPLETED" && w.w_status !== "REJECTED" && (
                              <Button
                                variant="success"
                                size="sm"
                                className="me-2"
                                onClick={() => handleApprove(w.w_uuid)}
                              >
                                <FontAwesomeIcon icon={faCheck} /> Approve
                              </Button>
                            )}

                            {w.w_status === "PENDING" && (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  setSelectedWithdrawal(w);
                                  setShowRejectModal(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faTimes} /> Reject
                              </Button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>


                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center">
                      No withdrawals found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            {/* Pagination */}
            <div className="d-flex justify-content-center my-3">
              <Pagination>
                <Pagination.First
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                />

                {/* Page numbers */}
                {[...Array(totalPages)].map((_, i) => (
                  <Pagination.Item
                    key={i}
                    active={i + 1 === currentPage}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}

                <Pagination.Next
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>

          </>
        )}
      </Card>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reject Withdrawal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Reason for rejection</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleReject}>
            Reject
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default WithdrawalManagement;
